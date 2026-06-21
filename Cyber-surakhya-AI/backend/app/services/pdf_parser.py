import io
from pypdf import PdfReader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text characters directly from a digital PDF byte-stream.
    This works for digital statements, receipts, and bank files.
    """
    try:
        # Wrap bytes in a file-like stream
        pdf_stream = io.BytesIO(file_bytes)
        
        # Initialize PyPDF Reader
        reader = PdfReader(pdf_stream)
        
        text_content = []
        for index, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
                
        full_text = "\n".join(text_content).strip()
        
        if not full_text:
            return "[No text found. This may be a scanned image or photo PDF. Please provide a digital statement or enter details manually.]"
            
        return full_text
        
    except Exception as e:
        print(f"Error during PDF text parsing: {e}")
        return f"[Failed to parse PDF document: {str(e)}]"
