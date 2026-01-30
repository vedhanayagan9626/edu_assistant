from app import db
from datetime import datetime

class SubjectDocument(db.Model):
    __tablename__ = 'subject_documents'
    
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'))
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False, unique=True)
    file_size = db.Column(db.BigInteger)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    is_processed = db.Column(db.Boolean, default=False)
    chroma_collection_name = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'subject_id': self.subject_id,
            'file_name': self.file_name,
            'is_processed': self.is_processed,
            'upload_date': self.upload_date.isoformat()
        }
