import os
from datetime import timedelta

class Config:
    # Base directory of the backend (edu_assistant/backend)
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    # Database
    # Default to SQLite if DATABASE_URL is not set
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 
        f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'dev.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # File Upload - Force absolute path relative to BASE_DIR
    env_upload = os.getenv('UPLOAD_FOLDER', 'uploads')
    if os.path.isabs(env_upload):
        UPLOAD_FOLDER = env_upload
    else:
        UPLOAD_FOLDER = os.path.abspath(os.path.join(BASE_DIR, env_upload))
        
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size
    
    # ChromaDB - Force absolute path relative to BASE_DIR
    env_chroma = os.getenv('CHROMA_PERSIST_DIR', 'chroma_db')
    if os.path.isabs(env_chroma):
        CHROMA_PERSIST_DIRECTORY = env_chroma
    else:
        CHROMA_PERSIST_DIRECTORY = os.path.abspath(os.path.join(BASE_DIR, env_chroma))
    
    # LLM Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
    OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
    
    # Embedding Model - Force absolute path relative to BASE_DIR
    EMBEDDING_MODEL = os.path.abspath(os.path.join(BASE_DIR, 'models', 'all-MiniLM-L6-v2'))
    
    # RAG Configuration
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    TOP_K_RETRIEVAL = 5

    # Ensure upload and chroma directories exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(CHROMA_PERSIST_DIRECTORY, exist_ok=True)
    # Ensure instance directory exists for sqlite
    os.makedirs(os.path.join(BASE_DIR, 'instance'), exist_ok=True)
