from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from app import db
from app.models.subject import Subject
from app.models.document import SubjectDocument
from app.models.department import StaffDepartment
from app.services.rag_service import RAGService
from app.utils.decorators import staff_required
from app.config import Config

staff_bp = Blueprint('staff', __name__)
# rag_service will be initialized lazily or per request if needed, but safe here
rag_service = RAGService()

@staff_bp.route('/subjects', methods=['POST'])
@jwt_required()
@staff_required
def create_subject():
    """Create new subject"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Verify staff belongs to department
    mapping = StaffDepartment.query.filter_by(
        staff_id=user_id,
        department_id=data['department_id']
    ).first()
    
    if not mapping:
        return jsonify({'error': 'Not authorized for this department'}), 403
    
    subject = Subject(
        name=data['name'],
        code=data['code'],
        description=data.get('description'),
        department_id=data['department_id'],
        created_by=user_id
    )
    
    db.session.add(subject)
    db.session.commit()
    
    # Create ChromaDB collection for this subject
    _ = rag_service.create_subject_collection(subject.id)
    
    return jsonify(subject.to_dict()), 201

@staff_bp.route('/subjects/<int:subject_id>/upload', methods=['POST'])
@jwt_required()
@staff_required
def upload_document(subject_id):
    """Upload PDF document to subject"""
    user_id = get_jwt_identity()
    # subject_id comes from route param
    
    # Verify access
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404
    
    mapping = StaffDepartment.query.filter_by(
        staff_id=user_id,
        department_id=subject.department_id
    ).first()
    
    if not mapping:
        return jsonify({'error': 'Not authorized'}), 403
    
    # Handle file upload
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files allowed'}), 400
    
    # Save file
    filename = secure_filename(file.filename)
    upload_path = os.path.join(Config.UPLOAD_FOLDER, f"subject_{subject_id}")
    os.makedirs(upload_path, exist_ok=True)
    
    file_path = os.path.join(upload_path, filename)
    file.save(file_path)
    
    # Create document record
    document = SubjectDocument(
        subject_id=subject_id,
        file_name=filename,
        file_path=file_path,
        file_size=os.path.getsize(file_path),
        uploaded_by=user_id
    )
    
    db.session.add(document)
    db.session.commit()
    
    # Process document and add to vector store
    try:
        print(f"DEBUG: Starting RAG processing for document {document.id}")
        collection_name = f"subject_{subject_id}"
        rag_service.add_document_to_collection(
            collection_name,
            file_path,
            document.id
        )
        
        document.is_processed = True
        document.chroma_collection_name = collection_name
        db.session.commit()
        print(f"DEBUG: RAG processing completed for document {document.id}")
        
        return jsonify({
            'message': 'Document uploaded and processed successfully',
            'document': document.to_dict()
        }), 201
        
    except Exception as e:
        import traceback
        print(f"ERROR: Processing failed for document {document.id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@staff_bp.route('/subjects/<int:subject_id>/documents', methods=['GET'])
@jwt_required()
@staff_required
def get_subject_documents(subject_id):
    """Get all documents for a subject"""
    user_id = get_jwt_identity()
    
    # Verify access - staff must be associated with the subject's department
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404
        
    mapping = StaffDepartment.query.filter_by(
        staff_id=user_id,
        department_id=subject.department_id
    ).first()
    
    if not mapping:
        return jsonify({'error': 'Not authorized'}), 403
        
    documents = SubjectDocument.query.filter_by(subject_id=subject_id).all()
    return jsonify([d.to_dict() for d in documents]), 200

@staff_bp.route('/subjects', methods=['GET'])
@jwt_required()
@staff_required
def get_my_subjects():
    """Get subjects for staff's departments"""
    user_id = get_jwt_identity()
    
    dept_mappings = StaffDepartment.query.filter_by(staff_id=user_id).all()
    dept_ids = [m.department_id for m in dept_mappings]
    
    if not dept_ids:
        return jsonify([]), 200

    subjects = Subject.query.filter(Subject.department_id.in_(dept_ids)).all()
    return jsonify([s.to_dict() for s in subjects]), 200
