import os
from sentence_transformers import SentenceTransformer

def download_model():
    model_name = 'sentence-transformers/all-MiniLM-L6-v2'
    output_path = os.path.join(os.getcwd(), 'models', 'all-MiniLM-L6-v2')
    
    if os.path.exists(output_path) and os.listdir(output_path):
        print(f"Model already exists at {output_path}")
        return

    print(f"Downloading model {model_name} to {output_path}...")
    os.makedirs(output_path, exist_ok=True)
    
    # helper to download
    model = SentenceTransformer(model_name)
    model.save(output_path)
    print("Model downloaded successfully.")

if __name__ == "__main__":
    download_model()
