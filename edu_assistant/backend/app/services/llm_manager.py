from typing import Dict, List
import openai
import anthropic
import requests
from app.config import Config

class LLMManager:
    def __init__(self):
        self.providers = {
            'openai': self._call_openai,
            'anthropic': self._call_anthropic,
            'ollama': self._call_ollama
        }
    
    def generate_response(
        self,
        provider: str,
        model_identifier: str,
        context: List[Dict],
        query: str,
        learning_level: str
    ) -> Dict:
        """Generate response using specified LLM"""
        
        # Build prompt based on learning level
        system_prompt = self._build_system_prompt(learning_level)
        context_text = "\n\n".join([c['content'] for c in context])
        
        prompt = f"""Context from course materials:
{context_text}

Student Question: {query}

Based on the context provided, answer the student's question."""
        
        # Call appropriate provider
        try:
            if provider not in self.providers:
                raise ValueError(f"Unsupported provider: {provider}")
                
            result = self.providers[provider](
                model_identifier, 
                system_prompt, 
                prompt
            )
            
            # Check for empty or error content in the result
            if not result.get('content') or result.get('content').startswith("Error") or "API Key not configured" in result.get('content'):
                raise ValueError(result.get('content') or "Empty response from provider")
                
            return result
            
        except Exception as e:
            print(f"DEBUG: Primary LLM ({provider}) failed: {str(e)}")
            if provider != 'ollama':
                # Try verified local models if primary fails
                for fallback_model in ['llama3.2', 'mistral']:
                    print(f"DEBUG: Falling back to Ollama with '{fallback_model}'...")
                    try:
                        return self._call_ollama(
                            fallback_model,
                            system_prompt,
                            prompt
                        )
                    except Exception as fallback_e:
                        print(f"DEBUG: Fallback to {fallback_model} failed: {str(fallback_e)}")
                        continue
            
            # Re-raise the exception so the route handler can handle it properly
            raise Exception(f"Failed to generate response: {str(e)}")
    
    def _build_system_prompt(self, learning_level: str) -> str:
        """Build system prompt based on learning level"""
        prompts = {
            'beginner': """You are a patient and supportive educational assistant. 
Explain concepts in simple terms, use analogies, and break down complex ideas 
into easy-to-understand parts. Assume the student is encountering this topic 
for the first time.""",
            
            'intermediate': """You are an educational assistant helping students 
deepen their understanding. Provide clear explanations with relevant examples. 
Connect concepts to build a cohesive understanding. Assume the student has 
basic familiarity with the subject.""",
            
            'advanced': """You are an educational assistant for advanced learners. 
Provide in-depth explanations, discuss nuances, edge cases, and connections 
to related concepts. Include technical details and theoretical foundations. 
Assume the student has solid background knowledge."""
        }
        return prompts.get(learning_level, prompts['intermediate'])
    
    def _call_openai(self, model: str, system_prompt: str, user_prompt: str) -> Dict:
        """Call OpenAI API"""
        if not Config.OPENAI_API_KEY:
            return {'content': 'OpenAI API Key not configured.', 'tokens_used': 0, 'model': model}

        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        return {
            'content': response.choices[0].message.content,
            'tokens_used': response.usage.total_tokens,
            'model': model
        }
    
    def _call_anthropic(self, model: str, system_prompt: str, user_prompt: str) -> Dict:
        """Call Anthropic Claude API"""
        if not Config.ANTHROPIC_API_KEY:
            return {'content': 'Anthropic API Key not configured.', 'tokens_used': 0, 'model': model}

        client = anthropic.Anthropic(api_key=Config.ANTHROPIC_API_KEY)
        
        response = client.messages.create(
            model=model,
            max_tokens=1500,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )
        
        return {
            'content': response.content[0].text,
            'tokens_used': response.usage.input_tokens + response.usage.output_tokens,
            'model': model
        }
    
    def _call_ollama(self, model: str, system_prompt: str, user_prompt: str) -> Dict:
        """Call Ollama local LLM"""
        url = f"{Config.OLLAMA_BASE_URL}/api/generate"
        
        payload = {
            "model": model,
            "prompt": f"{system_prompt}\n\n{user_prompt}",
            "stream": False,
            "options": {
                "temperature": 0.7,
                # Removed num_gpu: 0 to allow GPU acceleration if available
            }
        }
        
        try:
            response = requests.post(url, json=payload, timeout=300) # Increased timeout
            if response.status_code == 200:
                result = response.json()
                return {
                    'content': result.get('response', ''),
                    'tokens_used': result.get('eval_count', 0),
                    'model': model
                }
            else:
                 return {'content': f"Ollama Error: {response.text}", 'tokens_used': 0, 'model': model}

        except requests.exceptions.ConnectionError:
            raise ConnectionError('Could not connect to Ollama. Ensure it is running.')

    def classify_intent(self, query: str, subject_name: str) -> str:
        """
        Classify the intent of the user query.
        Returns: 'SUBJECT_SPECIFIC', 'GENERAL_CONVERSATION', or 'OFF_TOPIC'
        """
        classification_prompt = f"""
        You are an educational assistant for the subject: "{subject_name}".
        Your task is to classify the user's input into one of three categories:
        
        1. SUBJECT_SPECIFIC: The user is asking a question about {subject_name} or related concepts that require course materials to answer.
        2. GENERAL_CONVERSATION: The user is greeting you, asking how you are, or asking about your capabilities as an educational assistant.
        3. OFF_TOPIC: The user is asking about something completely unrelated to {subject_name} or general educational support (e.g., sports, entertainment, or other unrelated subjects).

        User Input: "{query}"

        Instructions:
        - Respond ONLY with the category name: SUBJECT_SPECIFIC, GENERAL_CONVERSATION, or OFF_TOPIC.
        - Do not provide any other text.
        """
        
        try:
            # Try mistral first if available, then llama3.2
            models_to_try = ['llama3.2', 'mistral', 'llama3']
            for model in models_to_try:
                try:
                    classification = self._call_ollama(
                        model,
                        "You are a helpful assistant that classifies user intent.",
                        classification_prompt
                    )
                    raw_intent = classification['content'].strip().upper()
                    print(f"DEBUG: Raw classification from {model}: {raw_intent}")
                    
                    # More robust matching: check for keywords in the response
                    if 'SUBJECT_SPECIFIC' in raw_intent: return 'SUBJECT_SPECIFIC'
                    if 'GENERAL_CONVERSATION' in raw_intent: return 'GENERAL_CONVERSATION'
                    if 'OFF_TOPIC' in raw_intent: return 'OFF_TOPIC'
                    
                except Exception as e:
                    print(f"DEBUG: Classification with {model} failed: {str(e)}")
                    continue
            
            # If all else fails, default to general (allows user to keep talking)
            return 'GENERAL_CONVERSATION'
        except Exception:
            return 'GENERAL_CONVERSATION'
