# backend/app/utils/llm_client.py
import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Robust absolute path mapping: Moves up 2 parent directories (utils -> app -> backend) to target .env precisely
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

class LLMClient:
    """
    Vendor-agnostic communication bridge for quiz generation.
    Orchestrates an automated dual-tier fallback sequence:
    Tier 1 (Primary): Native Google Gemini Cloud API(when available)
    Tier 2 (Fallback): Local Ollama Engine Node
    """
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/api/chat")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "mistral")
        
        self.gemini_client = None
        if self.gemini_key:
            self.gemini_client = genai.Client(api_key=self.gemini_key)

    def generate_quiz_json(self, system_prompt: str, user_prompt: str) -> str:
        """
        Dispatches prompts down the redundancy chain. Enforces and validates 
        strict raw JSON response strings before returning them to the caller.
        """
        raw_response = None
        
        # TIER 1: Native Google Gemini Cloud Execution
        if self.gemini_client:
            try:
                raw_response = self._call_gemini(system_prompt, user_prompt)
            except Exception as cloud_err:
                print(f"⚠️ Tier 1 (Gemini Cloud) Fault Encountered: {cloud_err}")
                print("🔄 Automatically cascading down to Tier 2 (Local Edge Fallback)...")

        # TIER 2: Local Host Engine Execution (Offline Local Fail-safe)
        if not raw_response:
            raw_response = self._call_ollama(system_prompt, user_prompt)

        self._validate_json_response(raw_response)
        return raw_response

    def _call_gemini(self, system: str, user: str) -> str:
        print(f"📡 Provider Routing: [ TIER 1 - NATIVE GOOGLE GEMINI CLOUD API ({self.gemini_model}) ]")
        
        response = self.gemini_client.models.generate_content(
            model=self.gemini_model,
            contents=user,
            config=types.GenerateContentConfig(
                system_instruction=system,
                temperature=0.2,       
                response_mime_type="application/json"  
            ),
        )
        if not response.text:
            raise ValueError("Received an empty content return block from Gemini.")
        return response.text.strip()

    def _call_ollama(self, system: str, user: str) -> str:
        print(f"📡 Provider Routing: [ TIER 2 - LOCAL OLLAMA EDGE NODE ({self.ollama_model}) ]")
        payload = {
            "model": self.ollama_model,
            "format": "json",    
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            "options": {"temperature": 0.2},
            "stream": False
        }
        try:
            response = requests.post(self.ollama_url, json=payload, timeout=60)
            response.raise_for_status()
            return response.json()["message"]["content"].strip()
        except Exception as err:
            raise RuntimeError(f"Local Ollama environment is unavailable or model is unpulled: {str(err)}")

    def _validate_json_response(self, raw_text: str) -> None:
        try:
            json.loads(raw_text)
        except json.JSONDecodeError as decode_err:
            print("\n❌ CRITICAL PARSING ERROR: Malformed execution block returned from LLM pipeline:")
            print(raw_text)
            print("="*50)
            raise RuntimeError(f"Structural validation failure: Output is not valid JSON. Details: {decode_err}")
    
    def generate_structured_response(self, system_prompt: str, user_prompt: str) -> str:
        """
        Exposed entrypoint for the evaluation grading engine. 
        Reuses your established, internal dual-tier fallback execution chain seamlessly.
        """

        return self.generate_quiz_json(system_prompt, user_prompt)

llm_client = LLMClient()