from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.utils.llm_client import llm_client

import requests

router = APIRouter()
security = HTTPBearer()


class ChatRequest(BaseModel):
    message: str


@router.post("/query")
def ask_ai_tutor(
    payload: ChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:

        system_prompt = """
        You are Gyaan Saathi, an AI tutor for Computer Science students.

        When explaining concepts:

        - Start with a simple definition.
        - Then explain intuition.
        - Then provide an example.
        - Then provide interview insights if relevant.
        - Use markdown formatting.
        - Use bullet points.
        - Use code blocks when discussing programming.

        Keep answers concise unless the user explicitly asks for detail.
        """

        # ==========================
        # TIER 1 : GEMINI
        # ==========================

        try:
            if llm_client.gemini_client:

                response = llm_client.gemini_client.models.generate_content(
                    model=llm_client.gemini_model,
                    contents=payload.message,
                )

                if response.text:
                    return {
                        "response": response.text.strip(),
                        "provider": "gemini"
                    }

        except Exception as gemini_error:
            print(f"Gemini failed: {gemini_error}")
            print("Falling back to Ollama...")

        # ==========================
        # TIER 2 : OLLAMA FALLBACK
        # ==========================

        ollama_payload = {
            "model": llm_client.ollama_model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": payload.message
                }
            ],
            "stream": False
        }

        ollama_response = requests.post(
            llm_client.ollama_url,
            json=ollama_payload,
            timeout=120
        )

        ollama_response.raise_for_status()

        ollama_text = (
            ollama_response.json()
            .get("message", {})
            .get("content", "")
            .strip()
        )

        return {
            "response": ollama_text,
            "provider": "ollama"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Tutor Error: {str(e)}"
        )