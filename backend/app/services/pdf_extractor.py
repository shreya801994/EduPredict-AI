# backend/app/services/pdf_extractor.py
from pathlib import Path
import pdfplumber

def extract_text_from_pdf(file_path: Path) -> str | None:
    """
    Opens a localized PDF artifact, cycles page-by-page, extracts structured text characters,
    and returns a unified string representation. Returns None if parsing completely fails.
    """
    extracted_text_accumulator = []
    
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text_accumulator.append(page_text)
                    
        return "\n\n--- PAGE BREAK ---\n\n".join(extracted_text_accumulator) if extracted_text_accumulator else None
        
    except Exception as extraction_err:
        # Logging warning safely to the terminal process context
        print(f" Service Layer Text Extraction Interrupted: {str(extraction_err)}")
        return None