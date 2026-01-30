from app import create_app, db
from app.models.user import User
from app.models.llm import LLMModel
import os

app = create_app()

@app.cli.command()
def init_db():
    """Initialize database with tables"""
    with app.app_context():
        db.create_all()
        print("Database initialized!")

@app.cli.command()
def seed_data():
    """Seed initial data"""
    try:
        # Create admin user
        if not User.query.filter_by(email='admin@edu.com').first():
            admin = User(
                email='admin@edu.com',
                full_name='System Administrator',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
        
        # Create sample LLM models
        models_data = [
            {
                'name': 'GPT-4 Turbo', 'provider': 'openai', 
                'model_identifier': 'gpt-4-turbo-preview',
                'is_active': False  # Disabled by default (requires API key)
            },
            {
                'name': 'Claude 3 Opus', 'provider': 'anthropic', 
                'model_identifier': 'claude-3-opus-20240229',
                'is_active': False  # Disabled by default (requires API key)
            },
            {
                'name': 'Llama 3.2 (Ollama)', 'provider': 'ollama', 
                'model_identifier': 'llama3.2',
                'is_active': True  # Active by default (free, local)
            },
            {
                'name': 'Mistral (Ollama)', 'provider': 'ollama', 
                'model_identifier': 'mistral',
                'is_active': True  # Active by default (free, local)
            }
        ]
        
        for m_data in models_data:
            if not LLMModel.query.filter_by(model_identifier=m_data['model_identifier']).first():
                model = LLMModel(**m_data)
                db.session.add(model)
        
        db.session.commit()
        print("Database seeded with initial data!")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.session.rollback()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
