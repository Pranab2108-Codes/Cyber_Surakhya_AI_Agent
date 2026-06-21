import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

class Settings:
    PROJECT_NAME: str = "Cyber Suraksha AI Backend"
    VERSION: str = "1.0.0"
    
    # Credentials
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/cyber_suraksha")
    
    # Model configuration
    # Llama 3.3 70B Versatile is currently the state-of-the-art model for text context & reasoning on Groq
    GROQ_MODEL: str = "llama-3.3-70b-versatile"


settings = Settings()
