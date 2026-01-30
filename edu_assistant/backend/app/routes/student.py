from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.subject import Subject
from app.models.department import StudentDepartment
from app.models.chat import ChatSession, ChatMessage
from app.models.llm import LLMModel
from app.services.rag_service import RAGService
from app.services.llm_manager import LLMManager
from app.utils.decorators import student_required

student_bp = Blueprint('student', __name__)
rag_service = RAGService()
llm_manager = LLMManager()

@student_bp.route('/test', methods=['GET'])
def test_route():
    return jsonify({'message': 'student route test success'}), 200

@student_bp.route('/subjects', methods=['GET'])
@jwt_required()
@student_required
def get_available_subjects():
    """Get subjects available to student"""
    user_id = get_jwt_identity()
    
    dept_mapping = StudentDepartment.query.filter_by(student_id=user_id).first()
    if not dept_mapping:
        return jsonify([]), 200
    
    subjects = Subject.query.filter_by(
        department_id=dept_mapping.department_id
    ).all()
    
    return jsonify([s.to_dict() for s in subjects]), 200

@student_bp.route('/chat/start', methods=['POST'])
@jwt_required()
@student_required
def start_chat_session():
    """Start new chat session"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Validate subject access
    subject = Subject.query.get(data['subject_id'])
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404
    
    dept_mapping = StudentDepartment.query.filter_by(
        student_id=user_id,
        department_id=subject.department_id
    ).first()
    
    if not dept_mapping:
        return jsonify({'error': 'Not authorized for this subject'}), 403
    
    # Create chat session
    session = ChatSession(
        student_id=user_id,
        subject_id=data['subject_id'],
        learning_level=data.get('learning_level', 'intermediate'),
        llm_model_id=data.get('llm_model_id')
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify(session.to_dict()), 201

@student_bp.route('/chat/<int:session_id>/message', methods=['POST'])
@jwt_required()
@student_required
def send_message(session_id):
    """Send message and get AI response"""
    data = request.get_json()
    user_id = get_jwt_identity()
    # session_id from url arg
    
    # Verify session ownership
    print(f"DEBUG: Looking for session {session_id} for user {user_id} (type: {type(user_id)})")
    session = ChatSession.query.get(session_id)
    if not session:
        print(f"DEBUG: Session {session_id} not found in database")
        return jsonify({'error': 'Session not found'}), 404
    
    print(f"DEBUG: Session found. session.student_id={session.student_id} (type: {type(session.student_id)}), user_id={user_id} (type: {type(user_id)})")
    
    # Convert both to int for comparison (JWT might return string)
    if int(session.student_id) != int(user_id):
        print(f"DEBUG: Session {session_id} belongs to user {session.student_id}, but requested by {user_id} - UNAUTHORIZED")
        return jsonify({'error': 'Not authorized for this session'}), 403
    
    print(f"DEBUG: Authorization successful for session {session_id}")
    
    # Save user message
    print(f"DEBUG: Saving user message for session {session_id}")
    user_message = ChatMessage(
        session_id=session_id,
        message_type='user',
        content=data['message']
    )
    db.session.add(user_message)
    db.session.commit()
    
    # Get subject for classification
    subject = Subject.query.get(session.subject_id)
    subject_name = subject.name if subject else "General Subject"

    try:
        # Classify intent
        print(f"DEBUG: Classifying intent for: {data['message']}")
        intent = llm_manager.classify_intent(data['message'], subject_name)
        print(f"DEBUG: Detected intent: {intent}")

        context = []
        if intent == 'SUBJECT_SPECIFIC':
            # Retrieve context using RAG
            collection_name = f"subject_{session.subject_id}"
            print(f"DEBUG: Retrieving context for session {session_id}, subject {session.subject_id}")
            context = rag_service.retrieve_context(
                collection_name,
                data['message'],
                top_k=5
            )
            print(f"DEBUG: Retrieved {len(context)} context chunks")
            
            prompt_query = data['message']
        elif intent == 'GENERAL_CONVERSATION':
            # No RAG needed for general conversation
            print("DEBUG: General conversation detected, bypassing RAG")
            prompt_query = f"Greeting/General question from student: {data['message']}. Please respond as a helpful educational assistant."
        else: # OFF_TOPIC
            print("DEBUG: Off-topic query detected")
            return jsonify({
                'message': {
                    'content': f"I'm sorry, I'm here to help you with {subject_name} and general educational queries. That question seems outside our current scope. How can I help you with your studies?",
                    'message_type': 'assistant',
                    'session_id': session_id
                },
                'context_used': 0
            }), 200

        # Get LLM model details
        llm_model = LLMModel.query.get(session.llm_model_id)
        if not llm_model:
            llm_model = LLMModel.query.filter_by(is_active=True).first()
        
        if not llm_model:
             print("ERROR: No active LLM models found")
             return jsonify({'error': 'No active LLM models found'}), 500

        # Generate response
        print(f"DEBUG: Generating response with level: {session.learning_level}")
        response = llm_manager.generate_response(
            provider=llm_model.provider,
            model_identifier=llm_model.model_identifier,
            context=context,
            query=prompt_query,
            learning_level=session.learning_level
        )
        print("DEBUG: Response generated successfully")
        
        # Save assistant message
        assistant_message = ChatMessage(
            session_id=session_id,
            message_type='assistant',
            content=response['content'],
            retrieved_context=str(context) if context else None,
            model_used=response['model'],
            tokens_used=response['tokens_used']
        )
        
        db.session.add(assistant_message)
        db.session.commit()
        
        return jsonify({
            'message': assistant_message.to_dict(),
            'context_used': len(context)
        }), 200
        
    except Exception as e:
        import traceback
        print(f"ERROR: Failed to generate response for session {session_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Failed to generate response: {str(e)}'}), 500

@student_bp.route('/chat/<int:session_id>/history', methods=['GET'])
@jwt_required()
@student_required
def get_chat_history(session_id):
    """Get chat history for session"""
    user_id = get_jwt_identity()
    
    session = ChatSession.query.get(session_id)
    if not session or session.student_id != user_id:
        return jsonify({'error': 'Session not found'}), 404
    
    messages = ChatMessage.query.filter_by(
        session_id=session_id
    ).order_by(ChatMessage.created_at).all()
    
    return jsonify([m.to_dict() for m in messages]), 200

@student_bp.route('/llm-models', methods=['GET'])
@jwt_required()
def get_available_models():
    """Get available LLM models"""
    models = LLMModel.query.filter_by(is_active=True).all()
    return jsonify([m.to_dict() for m in models]), 200
