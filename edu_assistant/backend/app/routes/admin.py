from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.department import Department, StaffDepartment, StudentDepartment
from app.utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    """Create new user (staff or student)"""
    data = request.get_json()
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        email=data['email'],
        full_name=data['full_name'],
        role=data['role']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Link to department if provided
    if 'department_id' in data and data['department_id']:
        if data['role'] == 'staff':
            mapping = StaffDepartment(
                staff_id=user.id,
                department_id=data['department_id']
            )
            db.session.add(mapping)
        elif data['role'] == 'student':
            mapping = StudentDepartment(
                student_id=user.id,
                department_id=data['department_id']
            )
            db.session.add(mapping)
        db.session.commit()
    
    return jsonify(user.to_dict()), 201

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users, optionally filtered by role"""
    role = request.args.get('role')
    if role:
        users = User.query.filter_by(role=role).all()
    else:
        users = User.query.all()
    
    return jsonify([u.to_dict() for u in users]), 200

@admin_bp.route('/departments', methods=['POST'])
@jwt_required()
@admin_required
def create_department():
    """Create new department"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        required_fields = ['name', 'code']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 422

        user_id = get_jwt_identity()
        
        # Check uniqueness
        if Department.query.filter_by(code=data['code']).first():
            return jsonify({'error': 'Department code already exists'}), 409
        
        department = Department(
            name=data['name'],
            code=data['code'],
            description=data.get('description'),
            created_by=user_id
        )
        
        db.session.add(department)
        db.session.commit()
        
        return jsonify(department.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/departments', methods=['GET'])
@jwt_required()
@admin_required
def get_departments():
    """Get all departments"""
    departments = Department.query.all()
    return jsonify([d.to_dict() for d in departments]), 200
