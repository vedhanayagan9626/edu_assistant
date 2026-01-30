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
    
    # Link to departments if provided
    if 'department_ids' in data and isinstance(data['department_ids'], list):
        for dept_id in data['department_ids']:
            if data['role'] == 'staff':
                mapping = StaffDepartment(staff_id=user.id, department_id=dept_id)
                db.session.add(mapping)
            elif data['role'] == 'student':
                # Student only in one department
                if not StudentDepartment.query.filter_by(student_id=user.id).first():
                    mapping = StudentDepartment(student_id=user.id, department_id=dept_id)
                    db.session.add(mapping)
        db.session.commit()
    elif 'department_id' in data and data['department_id']:
        if data['role'] == 'staff':
            db.session.add(StaffDepartment(staff_id=user.id, department_id=data['department_id']))
        elif data['role'] == 'student':
            db.session.add(StudentDepartment(student_id=user.id, department_id=data['department_id']))
        db.session.commit()
    
    return jsonify(user.to_dict()), 201

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    """Update existing user and their department mappings"""
    data = request.get_json()
    user = User.query.get_or_404(user_id)
    
    if 'email' in data:
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user_id:
            return jsonify({'error': 'Email already in use'}), 400
        user.email = data['email']
    
    if 'full_name' in data:
        user.full_name = data['full_name']
    
    if 'password' in data and data['password']:
        user.set_password(data['password'])
        
    if 'is_active' in data:
        user.is_active = data['is_active']

    if 'department_ids' in data and isinstance(data['department_ids'], list):
        if user.role == 'staff':
            StaffDepartment.query.filter_by(staff_id=user.id).delete()
            for d_id in data['department_ids']:
                db.session.add(StaffDepartment(staff_id=user.id, department_id=d_id))
        elif user.role == 'student':
            StudentDepartment.query.filter_by(student_id=user.id).delete()
            if data['department_ids']:
                db.session.add(StudentDepartment(student_id=user.id, department_id=data['department_ids'][0]))

    db.session.commit()
    return jsonify(user.to_dict()), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Delete user and cleanup mappings"""
    user = User.query.get_or_404(user_id)
    StaffDepartment.query.filter_by(staff_id=user_id).delete()
    StudentDepartment.query.filter_by(student_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users with their department IDs"""
    role = request.args.get('role')
    users = User.query.filter_by(role=role).all() if role else User.query.all()
    
    output = []
    for u in users:
        d = u.to_dict()
        if u.role == 'staff':
            d['department_ids'] = [m.department_id for m in StaffDepartment.query.filter_by(staff_id=u.id).all()]
        elif u.role == 'student':
            mapping = StudentDepartment.query.filter_by(student_id=u.id).first()
            d['department_ids'] = [mapping.department_id] if mapping else []
        output.append(d)
    
    return jsonify(output), 200

@admin_bp.route('/departments', methods=['POST'])
@jwt_required()
@admin_required
def create_department():
    data = request.get_json()
    if Department.query.filter_by(code=data['code']).first():
        return jsonify({'error': 'Code exists'}), 409
    
    dept = Department(
        name=data['name'],
        code=data['code'],
        description=data.get('description'),
        created_by=get_jwt_identity()
    )
    db.session.add(dept)
    db.session.commit()
    return jsonify(dept.to_dict()), 201

@admin_bp.route('/departments/<int:dept_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_department(dept_id):
    data = request.get_json()
    dept = Department.query.get_or_404(dept_id)
    
    if 'code' in data:
        existing = Department.query.filter_by(code=data['code']).first()
        if existing and existing.id != dept_id:
            return jsonify({'error': 'Code in use'}), 400
        dept.code = data['code']
    
    dept.name = data.get('name', dept.name)
    dept.description = data.get('description', dept.description)
    
    db.session.commit()
    return jsonify(dept.to_dict()), 200

@admin_bp.route('/departments/<int:dept_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_department(dept_id):
    dept = Department.query.get_or_404(dept_id)
    # Check for subjects
    from app.models.subject import Subject
    if Subject.query.filter_by(department_id=dept_id).first():
        return jsonify({'error': 'Cannot delete department with active subjects'}), 400
    
    StaffDepartment.query.filter_by(department_id=dept_id).delete()
    StudentDepartment.query.filter_by(department_id=dept_id).delete()
    db.session.delete(dept)
    db.session.commit()
    return jsonify({'message': 'Department deleted'}), 200

@admin_bp.route('/departments', methods=['GET'])
@jwt_required()
@admin_required
def get_departments():
    departments = Department.query.all()
    return jsonify([d.to_dict() for d in departments]), 200
