from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt

def role_required(required_role):
    """Decorator to check user role"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            if claims.get('role') != required_role:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def admin_required(fn):
    """Decorator for admin-only routes"""
    return role_required('admin')(fn)

def staff_required(fn):
    """Decorator for staff-only routes"""
    return role_required('staff')(fn)

def student_required(fn):
    """Decorator for student-only routes"""
    return role_required('student')(fn)
