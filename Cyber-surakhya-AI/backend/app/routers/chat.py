import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
import io
from datetime import datetime


from app.schemas import ChatMessageRequest, ChatMessageResponse, FraudReportSchema
from app.database import sessions_collection, reports_collection
from app.services.llm import generate_chat_reply, extract_structured_report
from app.services.pdf_parser import extract_text_from_pdf
from app.services.pdf_gen import generate_report_pdf

router = APIRouter(prefix="/api/chat", tags=["Cyber Chat Engine"])

# Create a local static directory to serve generated reports for simple local testing
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

@router.post("", response_model=ChatMessageResponse)
def chat_exchange(payload: ChatMessageRequest):
    """
    Core conversational endpoint. Maintains context memory in MongoDB (or fallback memory)
    and queries Groq Llama 3.3 for high-speed assistance.
    """
    session_id = payload.session_id
    user_msg = payload.message
    
    # 1. Fetch preceding history or initialize
    session = sessions_collection.find_one({"session_id": session_id})
    if not session:
        history = []
    else:
        history = session.get("messages", [])
        
    # 2. Append new user message to history
    history.append({"role": "user", "content": user_msg})
    
    # Fetch last extracted report to pass as context (highly token efficient!)
    from app.database import reports_collection
    last_report = reports_collection.find_one({"session_id": session_id}, sort=[("generated_at", -1)])
    extracted_dict = last_report.get("report_data", {}) if last_report else {}

    # 3. Generate response using Groq Service
    ai_reply = generate_chat_reply(history, extracted_dict)
    
    # 4. Append assistant reply to history
    history.append({"role": "assistant", "content": ai_reply})
    
    # 5. Persist updated history back to database
    sessions_collection.update_one(
        {"session_id": session_id},
        {"$set": {"messages": history}},
        upsert=True
    )
    
    return ChatMessageResponse(reply=ai_reply, session_id=session_id)

@router.post("/upload")
async def upload_evidence_pdf(
    session_id: str = Form(..., description="Active session ID for the chat context."),
    file: UploadFile = File(..., description="User statement or transaction PDF receipt.")
):
    """
    Receives PDF uploads, parses the characters using PyPDF, injects the document text 
    directly into the session context history, and returns a contextual reply from Groq.
    """
    # 1. Check file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF receipts or statements are currently supported.")
        
    try:
        # 2. Read bytes and run PDF parser
        file_bytes = await file.read()
        extracted_text = extract_text_from_pdf(file_bytes)
        
        # 3. Fetch current chat logs
        session = sessions_collection.find_one({"session_id": session_id})
        history = session.get("messages", []) if session else []
        
        # 4. Inject document parser details as context into the logs
        doc_injection_msg = (
            f"[SYSTEM NOTE: The user successfully uploaded a document named '{file.filename}'. "
            f"Extracted content follows:\n{extracted_text}]"
        )
        history.append({"role": "user", "content": doc_injection_msg})
        
        # 5. Let Groq process the new text context and reply to the user
        from app.database import reports_collection
        last_report = reports_collection.find_one({"session_id": session_id}, sort=[("generated_at", -1)])
        extracted_dict = last_report.get("report_data", {}) if last_report else {}
        ai_reply = generate_chat_reply(history, extracted_dict)
        
        # 6. Save final transaction context to logs
        history.append({"role": "assistant", "content": ai_reply})
        sessions_collection.update_one(
            {"session_id": session_id},
            {"$set": {"messages": history}},
            upsert=True
        )
        
        return {
            "status": "success",
            "filename": file.filename,
            "ai_reply": ai_reply,
            "text_preview": extracted_text[:300] + "..." if len(extracted_text) > 300 else extracted_text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process uploaded file: {str(e)}")

@router.post("/extract")
def extract_logs_and_compile_pdf(payload: dict):
    """
    Processes a complete chat session:
    1. Extracts structured JSON parameters (Pydantic schema validation).
    2. Dynamically generates a professional incident report PDF using ReportLab.
    3. Saves a local copy and returns a static download URL + JSON metadata.
    """
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing required 'session_id' parameter.")
        
    # 1. Fetch full chat transcript
    session = sessions_collection.find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="No conversation history found for this session ID.")
        
    history = session.get("messages", [])
    if not history:
        raise HTTPException(status_code=400, detail="The conversation transcript is empty.")
        
    # 2. Extract structured JSON using Groq
    report_schema: FraudReportSchema = extract_structured_report(history)
    report_dict = report_schema.model_dump()
    
    # 3. Generate professional PDF bytes
    pdf_bytes = generate_report_pdf(report_dict, history)
    
    # 4. Save file locally inside our reports static folder
    filename = f"report_{session_id}_{int(datetime.now().timestamp())}.pdf"
    file_path = os.path.join(REPORTS_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(pdf_bytes)
        
    # 5. Save metadata + file path to Reports database
    reports_collection.insert_one({
        "session_id": session_id,
        "report_filename": filename,
        "report_path": file_path,
        "report_data": report_dict,
        "generated_at": str(datetime.now())
    })
    
    # Return local static path for download along with the extracted JSON variables
    static_download_url = f"/static/reports/{filename}"
    
    return {
        "status": "success",
        "extracted_data": report_dict,
        "report_url": static_download_url
    }

@router.get("/sessions/{session_id}")
def fetch_session_logs(session_id: str):
    """
    Fetch raw message history logs for a session. Useful for rendering past chats.
    """
    session = sessions_collection.find_one({"session_id": session_id})
    if not session:
        return {"session_id": session_id, "messages": []}
    return {"session_id": session_id, "messages": session.get("messages", [])}

@router.get("/reports")
def list_all_reports():
    """
    Retrieve list of all compiled fraud reports.
    """
    try:
        reports = list(reports_collection.find())
        serialized_reports = []
        for r in reports:
            serialized = {
                "session_id": r.get("session_id"),
                "report_filename": r.get("report_filename"),
                "report_url": f"/static/reports/{r.get('report_filename')}",
                "report_data": r.get("report_data"),
                "generated_at": r.get("generated_at")
            }
            serialized_reports.append(serialized)
        
        # Sort by generated_at descending (latest first)
        serialized_reports.sort(key=lambda x: x.get("generated_at", ""), reverse=True)
        return {"status": "success", "reports": serialized_reports}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve reports: {str(e)}")
