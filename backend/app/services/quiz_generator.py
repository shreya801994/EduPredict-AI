# backend/app/services/quiz_generator.py
import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.material import StudyMaterial
from app.models.quiz import Quiz, QuizQuestion
from app.schemas.quiz import QuizGenerationRequest, LLMQuizPayloadFormat
from app.utils.llm_client import llm_client

class QuizGeneratorService:
    @staticmethod
    def generate_quiz_from_material(db: Session, request_dto: QuizGenerationRequest) -> Quiz:
        material = db.query(StudyMaterial).filter(StudyMaterial.id == request_dto.material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail="Target study material record does not exist.")
            
        if not material.extracted_text or len(material.extracted_text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Target study material contains insufficient text.")

        MAX_CONTEXT_CHARS = 15000
        safe_context = material.extracted_text[:MAX_CONTEXT_CHARS]

        
        system_prompt = (
            "You are an expert academic curriculum engineer building a comprehensive evaluation quiz.\n"
            "Analyze the provided text to extract core topics, milestones, and important architectural/scientific points.\n"
            "You must return your complete output as a single, valid JSON object matching this schema:\n\n"
            "{\n"
            '  "quiz_title": "String contextual name representing overall material contents",\n'
            '  "questions": [\n'
            "    {\n"
            '      "question_text": "The conceptual clear question body",\n'
            '      "question_type": "MCQ" or "SHORT_ANSWER" or "LONG_ANSWER",\n'
            '      "options": ["Option A", "Option B", "Option C", "Option D"] or null if short/long answer,\n'
            '      "correct_answer": "Exact text string of the correct choice or full multi-point grading rubric for long text queries",\n'
            '      "difficulty": "easy" or "medium" or "hard",\n'
            '      "topic": "Short string representing the specific chapter, sub-section, or concept name",\n'
            '      "source_excerpt": "Exact string snippet copied out of source text context matching answer basis"\n'
            "    }\n"
            "  ]\n"
            "}\n\n"
            "CRITICAL CONSTRAINTS:\n"
            "- If question_type is 'MCQ', the 'options' list MUST contain exactly 4 options.\n"
            "- If question_type is 'SHORT_ANSWER' or 'LONG_ANSWER', the 'options' field MUST be null.\n"
            "- Provide a varied mix of question types across your output data matrix.\n"
            "- Output raw JSON text directly without markdown wrappers."
        )

        user_prompt = (
            f"Please generate a complete quiz covering all critical concepts based on these parameters:\n"
            f"- Total Questions Required: {request_dto.num_questions}\n"
            f"- Target Difficulty Level: {request_dto.target_difficulty}\n\n"
            f"--- START DOCUMENT CONTEXT ---\n{safe_context}\n--- END DOCUMENT CONTEXT ---"
        )

        raw_json_string = llm_client.generate_quiz_json(system_prompt, user_prompt)

        try:
            parsed_dict = json.loads(raw_json_string)
            validated_payload = LLMQuizPayloadFormat(**parsed_dict)
        except Exception as validation_err:
            raise HTTPException(status_code=422, detail=f"LLM output failed DTO validation: {str(validation_err)}")

        if len(validated_payload.questions) == 0:
            raise HTTPException(status_code=422, detail="The AI model generated zero question records.")

        if len(validated_payload.questions) != request_dto.num_questions:
            print(f"⚠️ Warning: Requested {request_dto.num_questions} questions, but got {len(validated_payload.questions)}.")

        try:
            new_quiz = Quiz(material_id=material.id, title=validated_payload.quiz_title)
            db.add(new_quiz)
            db.flush()  

            for target_q in validated_payload.questions:
                db_question = QuizQuestion(
                    quiz_id=new_quiz.id,
                    question_text=target_q.question_text,
                    question_type=target_q.question_type,
                    options=target_q.options,
                    correct_answer=target_q.correct_answer,
                    difficulty=target_q.difficulty,
                    topic=target_q.topic,
                    source_excerpt=target_q.source_excerpt
                )
                db.add(db_question)

            db.commit()
            db.refresh(new_quiz)
            return new_quiz
        except Exception as db_fault:
            db.rollback() 
            raise HTTPException(status_code=500, detail=f"Database sync transaction aborted: {str(db_fault)}")