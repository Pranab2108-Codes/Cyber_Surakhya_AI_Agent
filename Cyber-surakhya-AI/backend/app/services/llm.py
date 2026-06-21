import json
from groq import Groq
from app.config import settings
from app.schemas import FraudReportSchema

import os

# Dynamically pop all proxy-related environment variables (case-insensitive) to prevent HTTPX/Groq Client crash
popped_proxies = {}
proxy_keys = [k for k in os.environ if k.lower().endswith("proxy")]
for k in proxy_keys:
    popped_proxies[k] = os.environ.pop(k, None)

try:
    groq_client = Groq(api_key=settings.GROQ_API_KEY)
except Exception as e:
    print(f"WARNING: Groq client failed to initialize: {e}")
    groq_client = None
finally:
    # Safely restore all proxy environment variables
    for k, v in popped_proxies.items():
        if v is not None:
            os.environ[k] = v



# System prompt directing the AI how to act as Cyber Suraksha AI
# System prompt directing the AI how to act as Cyber Suraksha AI
SYSTEM_CONVERSATIONAL_PROMPT = """
You are "Cyber Suraksha AI", a professional, elite Cybercrime Investigator.
Your goal is to think like a real investigator, reconstruct the entire timeline of the fraud, identify the modus operandi, and automatically compile a secure, government-standard I4C Complaint Report.

STRICT SEQUENCE OF THE 6 GATED PHASES:
PHASE 1: GENERIC VICTIM DETAILS - Collect Name, Phone, Alt Phone, Email, Aadhaar, Gender, DOB, Complete Address, Pincode. (Ask 1-2 at a time. Do not ask for fields listed in the CURRENTLY EXTRACTED DETAILS).
PHASE 2: INCIDENT SUMMARY & CATEGORIZATION - Ask user to describe "what happened". Categorize into one of 8 classes: UPI Fraud, Banking Fraud, Credit/Debit Card Fraud, Investment Scam, Online Shopping Fraud, Job & Employment Scam, Social Media & Account Hacking, Other Cyber Frauds. Announce the category and outline the next steps.
PHASE 3: DETAILED FRAUD-TYPE INVESTIGATION - Probing questions based on categorized scam type (ask 1-2 at a time):
- UPI: contact method, purpose, dates, platform (WhatsApp/Telegram/website), scanner/payment link/UPI PIN shared?
- Banking: bank name, account type, KYC/account block threats, remote apps, details shared (PIN/OTP/CVV/net banking)?
- Card: card type, issuing bank, last 4 digits, last legitimate use, fake transactions/merchant details, physical card with you, blocked status?
- Investment: platform/app name, URL, app accessibility, promised returns, WhatsApp/Telegram groups, initial/additional investment amounts, withdrawal releases?
- Online Shopping: item name, URL, review status, order date/amount, nature of scam (no delivery/wrong item/blocked)?
- Job: position, company name, recruitment method, offer letters, registration/laptop fees paid?
- Social Media: compromised platform, username/email, reset alerts, suspicious link clicked, money requests sent to contacts?
- Other: narrative details, phone/email/links, remote access, files downloaded, money lost.
PHASE 4: TIMELINE RECONSTRUCTION - Probe chronology: "What happened first?", "What happened next?", "After that?".
PHASE 5: LOSS & BANK RESPONSE - Ask amount lost, bank/UPI details, transaction IDs. Confirm if they froze accounts and called helpline 1930.
PHASE 6: SUMMARY & I4C PDF - Summarize findings and direct them to download the dual-column "Download Gov-Standard PDF" report.

RULES:
- Do NOT repeat back, summarize, or echo collected data (it is already visible on their dashboard).
- Be concise, professional, and secure. Ask only 1-2 missing details per turn.
"""

SYSTEM_EXTRACTION_PROMPT = """
You are an expert data extraction engine.
You will be provided with a full chat history transcript between a cyber crime victim and the "Cyber Suraksha AI" assistant.
Your task is to analyze the conversation and extract the structured variables into a JSON object matching the requested schema.

The JSON schema output MUST contain:
{
  "victim_name": "string or null",
  "victim_phone": "string or null",
  "victim_alternate_phone": "string or null",
  "victim_email": "string or null",
  "victim_aadhaar": "string or null",
  "victim_gender": "string or null",
  "victim_dob": "string or null",
  "victim_address": "string or null",
  "victim_city": "string or null",
  "victim_state": "string or null",
  "victim_pincode": "string or null",
  
  "date_of_fraud": "string or null",
  "time_of_fraud": "string or null",
  "scam_category": "string or null",
  "incident_description": "string or null",
  "amount_lost": float or null,
  "was_money_deducted": "string or null",
  
  "fraudster_phone": "string or null",
  "fraudster_email": "string or null",
  "fraudster_description": "string or null",
  "website_link": "string or null",
  "social_media_account": "string or null",
  "whatsapp_number": "string or null",
  "telegram_id": "string or null",
  
  "bank_name": "string or null",
  "account_number": "string or null",
  "upi_id": "string or null",
  "payment_app_used": "string or null",
  "transaction_id": "string or null",
  "transaction_date": "string or null",
  "transaction_amount": float or null,
  "receiver_upi_id": "string or null",
  
  "device_mobile_number": "string or null",
  "device_type": "string or null",
  "device_brand_model": "string or null",
  "device_ip": "string or null",
  "installed_suspicious_app": "string or null",
  "any_remote_access_app": "string or null",
  
  "reported_to_bank": "string or null",
  "bank_reference_no": "string or null",
  "called_1930": "string or null",
  "ticket_1930_id": "string or null",
  "complaint_submitted_i4c": "string or null",
  
  "timeline_events": ["list of strings representing the chronological timeline events reconstructed from the conversation"],
  
  "scammer_identifiers": ["list of extracted scanner UPIs, bank accounts, or phone numbers"],
  "is_complete": boolean (true if victim_name, victim_phone, amount_lost, scam_category, and date_of_fraud are successfully found),
  "missing_fields": ["list of core parameters still missing in the conversation logs"]
}

Rules:
1. Maintain extreme data accuracy. Do not guess values not explicitly mentioned.
2. Classify the "scam_category" field STRICTLY into one of the following 8 official categories:
   - "UPI Fraud"
   - "Banking Fraud"
   - "Credit/Debit Card Fraud"
   - "Investment Scam"
   - "Online Shopping Fraud"
   - "Job & Employment Scam"
   - "Social Media & Account Hacking"
   - "Other Cyber Frauds"
   Do not use any other category names. Choose the one that best fits the details in the chat transcript.
3. Return ONLY a valid JSON object. Do not wrap it in markdown code blocks like ```json ... ``` or add any conversational introduction/conclusion.
"""

def has_scam_details(messages_history: list, extracted_data: dict = None) -> bool:
    """
    Scans the conversation history and extracted variables to check if the user has described a scam yet.
    """
    if extracted_data:
        if extracted_data.get("scam_category") or (
            extracted_data.get("incident_description") and 
            extracted_data.get("incident_description") != "No data extracted."
        ):
            return True
            
    user_messages = [m["content"].lower() for m in messages_history if m["role"] == "user"]
    if not user_messages:
        return False
    
    total_length = sum(len(msg) for msg in user_messages)
    if total_length > 40:
        return True
        
    keywords = [
        "scam", "fraud", "upi", "bank", "money", "deduct", "lost", "pay", 
        "transaction", "hack", "cheat", "call", "message", "steal", 
        "card", "account", "phonepe", "gpay", "paytm", "invest", "loss",
        "rupee", "inr", "rs", "stolen", "withdraw", "transfer", "threat", "blackmail"
    ]
    for msg in user_messages:
        for kw in keywords:
            if kw in msg:
                return True
    return False


def generate_chat_reply(messages_history: list, extracted_data: dict = None) -> str:
    """
    Sends a sliding context window of messages along with extracted data context to Groq
    to generate highly token-efficient, robust, low-latency replies.
    """
    if not groq_client:
        return "I'm sorry, my AI processing module is offline. Please check your GROQ_API_KEY environment variable configuration."

    try:
        # 1. Determine Phase Prompt based on context
        is_scam = has_scam_details(messages_history, extracted_data)
        if not is_scam:
            system_prompt = """
You are "Cyber Suraksha AI", a professional, elite Cybercrime Investigator.
The user is initiating their cybercrime reporting process.
Your ONLY task in this phase (Phase 1) is to collect the victim's generic registration details:
1. Full Name
2. Phone Number
3. Alternate Phone Number (or note if none)
4. Email ID
5. Aadhaar Card Number (CRITICAL for government reporting verification!)
6. Gender
7. Date of Birth (DD/MM/YYYY)
8. Complete Address, City, State, and Pincode

CRITICAL RULES:
- Before asking about the fraud incident, you MUST collect these basic victim registration details first.
- Ask for only one or two fields at a time.
- Do NOT offer premature condolences.
- Once gathered, ask them to describe the incident: "Now that your victim registration details are secure, please describe exactly what happened in your own words so we can begin the cyber crime investigation."
- Do NOT repeat back or list details already collected. Keep it concise.
"""
        else:
            system_prompt = SYSTEM_CONVERSATIONAL_PROMPT

        # 2. Inject currently extracted variables to ensure perfect contextual memory and prevent repeating questions
        if extracted_data:
            non_null = {k: v for k, v in extracted_data.items() if v is not None and v != [] and v != "" and v != "No data extracted."}
            if non_null:
                system_prompt += f"\n\nCURRENTLY EXTRACTED DETAILS (DO NOT ASK FOR THESE AGAIN):\n{json.dumps(non_null, indent=1)}"

        # 3. Context sliding window: Keep the very first assistant greeting + last 7 turns (max 8 messages total)
        # This reduces Groq token usage by up to 75% on long chats and completely solves 429 errors!
        if len(messages_history) > 8:
            payload_messages = [messages_history[0]] + messages_history[-7:]
        else:
            payload_messages = messages_history

        payload = [{"role": "system", "content": system_prompt}]
        payload.extend(payload_messages)

        chat_completion = groq_client.chat.completions.create(
            messages=payload,
            model=settings.GROQ_MODEL,
            temperature=0.7,
            max_tokens=512,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during Groq chat completion: {e}")
        err_msg = str(e).lower()
        if "rate limit" in err_msg or "429" in err_msg:
            return "I am currently experiencing a high volume of requests (Groq API Rate Limit reached). Please wait a few moments or upgrade your API tier before sending your message again."
        return "I encountered a processing issue. Could you please repeat that?"

def extract_structured_report(messages_history: list) -> FraudReportSchema:
    """
    Analyzes full conversation logs and extracts structured JSON parameters using Llama 3.3.
    """
    default_empty = FraudReportSchema(
        victim_name=None,
        victim_phone=None,
        amount_lost=None,
        date_of_fraud=None,
        scam_category=None,
        scammer_identifiers=[],
        incident_description="No data extracted.",
        is_complete=False,
        missing_fields=["victim_name", "amount_lost", "scam_category", "date_of_fraud"]
    )

    if not groq_client:
        return default_empty

    try:
        # Format the chat history into a readable text script for the extractor
        transcript = ""
        for msg in messages_history:
            role_label = "User" if msg["role"] == "user" else "Assistant"
            transcript += f"{role_label}: {msg['content']}\n"

        payload = [
            {"role": "system", "content": SYSTEM_EXTRACTION_PROMPT},
            {"role": "user", "content": f"Here is the chat history transcript:\n\n{transcript}"}
        ]

        # Use Groq's native JSON mode
        chat_completion = groq_client.chat.completions.create(
            messages=payload,
            model=settings.GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=0.1,  # Low temperature for highly precise factual extraction
            max_tokens=1024,
        )
        
        raw_json = chat_completion.choices[0].message.content.strip()
        data = json.loads(raw_json)
        
        # Build and validate using Pydantic
        return FraudReportSchema(**data)
        
    except Exception as e:
        print(f"Error during Groq structured extraction: {e}")
        return default_empty
