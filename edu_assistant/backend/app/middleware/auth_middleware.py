from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request
from functools import wraps

def jwt_optional_with_error_handling(fn):
    """JWT middleware with error handling"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request(optional=True)
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Authentication failed', 'details': str(e)}), 401
    return wrapper
