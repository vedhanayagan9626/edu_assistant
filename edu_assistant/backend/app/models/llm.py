from app import db
from datetime import datetime

class LLMModel(db.Model):
    __tablename__ = 'llm_models'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    provider = db.Column(db.String(50), nullable=False) # 'openai', 'anthropic', 'ollama'
    model_identifier = db.Column(db.String(100), nullable=False)
    api_endpoint = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    max_tokens = db.Column(db.Integer, default=4000)
    temperature = db.Column(db.Numeric(3,2), default=0.7)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'provider': self.provider,
            'model': self.model_identifier,
            'is_active': self.is_active
        }
