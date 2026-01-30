from app import db
from datetime import datetime

class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'))
    learning_level = db.Column(db.String(20)) # beginner, intermediate, advanced
    llm_model_id = db.Column(db.Integer, db.ForeignKey('llm_models.id'))
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'subject_id': self.subject_id,
            'learning_level': self.learning_level,
            'started_at': self.started_at.isoformat(),
            'is_active': self.is_active
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'))
    message_type = db.Column(db.String(20)) # user, assistant
    content = db.Column(db.Text, nullable=False)
    retrieved_context = db.Column(db.Text)
    model_used = db.Column(db.String(100))
    tokens_used = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.message_type,
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }
