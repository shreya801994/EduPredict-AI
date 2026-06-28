import os
import json
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load local .env when running locally.
# On Render, environment variables are injected automatically.
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)


class LLMClient:
    """
    Gemini-powered LLM client for production.

    Features:
    - Automatic retry on temporary Gemini failures.
    - Strict JSON validation.
    - No Ollama dependency in production.
    """

    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = os.getenv(
            "GEMINI_MODEL",
            "gemini-2.5-flash",
        )

        if not self.gemini_key:
            raise RuntimeError(
                "GEMINI_API_KEY environment variable is not configured."
            )

        self.gemini_client = genai.Client(api_key=self.gemini_key)

    def generate_quiz_json(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        """
        Generates structured JSON from Gemini.

        Retries automatically if Gemini is temporarily unavailable.
        """

        last_error = None

        for attempt in range(3):
            try:
                print(f"🚀 Gemini attempt {attempt + 1}/3")

                raw_response = self._call_gemini(
                    system_prompt,
                    user_prompt,
                )

                self._validate_json_response(raw_response)

                return raw_response

            except Exception as e:
                last_error = e

                print(
                    f"⚠️ Gemini attempt {attempt + 1} failed:\n{e}"
                )

                if attempt < 2:
                    print("⏳ Waiting 2 seconds before retry...")
                    time.sleep(2)

        raise RuntimeError(
            f"Gemini service is temporarily unavailable.\n\n{last_error}"
        )

    def _call_gemini(
        self,
        system: str,
        user: str,
    ) -> str:

        print(
            f"📡 Using Gemini model: {self.gemini_model}"
        )

        response = self.gemini_client.models.generate_content(
            model=self.gemini_model,
            contents=user,
            config=types.GenerateContentConfig(
                system_instruction=system,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )

        if not response.text:
            raise RuntimeError(
                "Gemini returned an empty response."
            )

        return response.text.strip()

    def _validate_json_response(self, raw_text: str):

        try:
            json.loads(raw_text)

        except json.JSONDecodeError as e:

            print("\n❌ Invalid JSON returned by Gemini:")
            print(raw_text)

            raise RuntimeError(
                f"Gemini returned malformed JSON.\n{e}"
            )

    def generate_structured_response(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        return self.generate_quiz_json(
            system_prompt,
            user_prompt,
        )


llm_client = LLMClient()