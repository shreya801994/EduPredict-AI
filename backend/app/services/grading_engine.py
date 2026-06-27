# backend/app/services/grading_engine.py
import json
import re
from rapidfuzz import fuzz
from typing import Dict, Any, List

from app.utils.llm_client import llm_client
from app.models.quiz import QuizQuestion
from app.schemas.attempt import AnswerSubmission

class GradingEngineService:
    
    LETTER_TO_INDEX = {"A": 0, "B": 1, "C": 2, "D": 3}

    @staticmethod
    def grade_answer(question: QuizQuestion, submission: AnswerSubmission) -> Dict[str, Any]:
        """Routes student entries cleanly based on database question formatting configurations."""
        q_type = (question.question_type or "").upper()
        
        if q_type == "MCQ":
            return GradingEngineService._grade_mcq(question, submission)
        elif q_type == "SHORT_ANSWER":
            return GradingEngineService._grade_short_answer(question, submission)
        elif q_type == "LONG_ANSWER":
            return GradingEngineService._grade_long_answer(question, submission)
        else:
            return {
                "is_correct": False, 
                "grading_score": 0.0, 
                "ai_feedback": f"Unhandled question type footprint encountered: '{q_type}'"
            }

    @staticmethod
    def _normalize_text(text: str) -> str:
        """
        Hardened Option Stripper: Safely eliminates drift variations like 'A.', 'A -', 
        or '(A)' to allow precise text-to-text comparison.
        """
        clean = text.strip()
        # Catches (A), A., A - with or without trailing spaces case-insensitively
        clean = re.sub(r"^\(?[A-D]\)?[\.\-\)]?\s*", "", clean, flags=re.IGNORECASE)
        return clean.strip().lower()

    @staticmethod
    def _grade_mcq(question: QuizQuestion, submission: AnswerSubmission) -> Dict[str, Any]:
        """Tier 1: Text-to-Text Array Index Evaluation matching actual database parameters."""
        student_letter = (submission.selected_option or "").strip().upper()
        
        if student_letter not in GradingEngineService.LETTER_TO_INDEX or not question.options:
            return {
                "is_correct": False,
                "grading_score": 0.0,
                "ai_feedback": f"Invalid option selected choice: '{student_letter}'."
            }

        # Safe verification mapping for list conversions
        if isinstance(question.options, str):
            try:
                options_list = json.loads(question.options)
            except Exception:
                options_list = []
        else:
            options_list = question.options

        try:
            target_index = GradingEngineService.LETTER_TO_INDEX[student_letter]
            selected_option_text = options_list[target_index]
            
            # Run text-to-text validation using the hardened option stripper
            student_clean = GradingEngineService._normalize_text(selected_option_text)
            correct_clean = GradingEngineService._normalize_text(question.correct_answer or "")
            
            is_match = student_clean == correct_clean
            
            return {
                "is_correct": is_match,
                "grading_score": 1.0 if is_match else 0.0,
                "ai_feedback": "Correct option selected." if is_match else f"Incorrect. The correct answer was: {question.correct_answer}"
            }
        except (IndexError, TypeError):
            return {
                "is_correct": False,
                "grading_score": 0.0,
                "ai_feedback": "Selected option choice falls outside index limits."
            }

    @staticmethod
    def _grade_short_answer(question: QuizQuestion, submission: AnswerSubmission) -> Dict[str, Any]:
        """Tier 2: RapidFuzz with human-lenient credit bands to protect semantic drift."""
        student_text = (submission.provided_text or "")[:4000].strip()
        correct_text = (question.correct_answer or "")[:4000].strip()
        
        if not student_text:
            return {"is_correct": False, "grading_score": 0.0, "ai_feedback": "No response provided."}
            
        similarity = fuzz.token_set_ratio(student_text, correct_text)
        
        # Score-band mapping rules
        if similarity >= 90.0:
            return {"is_correct": True, "grading_score": 1.0, "ai_feedback": "Perfect conceptual agreement with the answer key."}
        elif similarity >= 80.0:
            return {"is_correct": True, "grading_score": 0.85, "ai_feedback": "Highly accurate response with negligible phrasing changes."}
        elif similarity < 40.0:
            return {"is_correct": False, "grading_score": 0.0, "ai_feedback": "Incorrect response."}
            
        # AI Escalation Window [40.0 - 79.9]: Hand borderline edge cases to the fallback chain
        return GradingEngineService._call_llm_grader(question.question_text, correct_text, student_text, "short_answer")

    @staticmethod
    def _grade_long_answer(question: QuizQuestion, submission: AnswerSubmission) -> Dict[str, Any]:
        """Tier 3: Full Cognitive Evaluation loop leveraging the vendor redundancy pipeline."""
        student_text = (submission.provided_text or "")[:4000].strip()
        correct_text = (question.correct_answer or "")[:4000].strip()
        
        if not student_text:
            return {"is_correct": False, "grading_score": 0.0, "ai_feedback": "No response provided."}
            
        return GradingEngineService._call_llm_grader(question.question_text, correct_text, student_text, "long_answer")

    @staticmethod
    def _call_llm_grader(question_text: str, reference_answer: str, student_answer: str, rubric_type: str) -> Dict[str, Any]:
        """Dispatches prompts cleanly through the global client infrastructure."""
        try:
            system_instruction = "You are a rigid JSON-only academic grading machine that outputs evaluation diagnostics."
            prompt = f"""
            Evaluate this student's response for a {rubric_type}.
            
            Question: "{question_text}"
            Reference Key: "{reference_answer}"
            Student Input: "{student_answer}"
            
            Assign a grading_score metric between 0.0 and 1.0. If grading_score >= 0.70, set is_correct to true. Otherwise, set it to false.
            Provide brief, specific educational feedback targeting what they handled well or missed.
            
            Return response strictly inside this JSON structure:
            {{
              "is_correct": true,
              "grading_score": 0.85,
              "feedback": "Analysis text here..."
            }}
            """
            # Triggers non-destructive method path safely
            response_text = llm_client.generate_structured_response(system_instruction, prompt)
            eval_data = json.loads(response_text)
            clamped_score = max(0.0, min(1.0, float(eval_data.get("grading_score", 0.0))))
            
            return {
                "is_correct": bool(eval_data.get("is_correct", clamped_score >= 0.70)),
                "grading_score": clamped_score,
                "ai_feedback": str(eval_data.get("feedback", "Evaluation step finalized successfully."))
            }
        except Exception as err:
            return {"is_correct": False, "grading_score": 0.0, "ai_feedback": f"Grading task disruption: {str(err)}"}