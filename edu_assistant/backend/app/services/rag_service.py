import chromadb
from chromadb.config import Settings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import PyPDF2
from typing import List, Dict
from app.config import Config
import os

class RAGService:
    def __init__(self):
        # Initialize chroma client
        self.client = chromadb.PersistentClient(
            path=Config.CHROMA_PERSIST_DIRECTORY,
            settings=Settings(anonymized_telemetry=False)
        )
        self._embedding_model = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=Config.CHUNK_SIZE,
            chunk_overlap=Config.CHUNK_OVERLAP
        )

    @property
    def embedding_model(self):
        if self._embedding_model is None:
            print("Loading embedding model...")
            self._embedding_model = SentenceTransformer(Config.EMBEDDING_MODEL)
        return self._embedding_model
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text()
        except Exception as e:
            print(f"Error reading PDF {pdf_path}: {e}")
            return ""
        return text
    
    def create_subject_collection(self, subject_id: int) -> str:
        """Create a ChromaDB collection for a subject"""
        collection_name = f"subject_{subject_id}"
        try:
            self.client.get_collection(collection_name)
        except:
            self.client.create_collection(
                name=collection_name,
                metadata={"subject_id": subject_id}
            )
        return collection_name
    
    def add_document_to_collection(
        self, 
        collection_name: str, 
        pdf_path: str, 
        document_id: int
    ):
        """Process PDF and add to vector store"""
        # Extract text
        text = self.extract_text_from_pdf(pdf_path)
        if not text:
            raise ValueError("Empty or unreadable PDF")

        # Split into chunks
        chunks = self.text_splitter.split_text(text)
        
        # Get collection
        try:
            collection = self.client.get_collection(collection_name)
        except:
            # Create if not exists (fallback)
            collection = self.client.create_collection(name=collection_name)
        
        # Generate embeddings and add to collection
        # processing in batches if needed, here simple loop
        embeddings = []
        documents_list = []
        ids = []
        metadatas = []
        
        for i, chunk in enumerate(chunks):
            embedding = self.embedding_model.encode(chunk).tolist()
            
            embeddings.append(embedding)
            documents_list.append(chunk)
            ids.append(f"doc_{document_id}_chunk_{i}")
            metadatas.append({"document_id": document_id, "chunk_index": i})
            
        if ids:
            collection.add(
                embeddings=embeddings,
                documents=documents_list,
                ids=ids,
                metadatas=metadatas
            )
    
    def retrieve_context(
        self, 
        collection_name: str, 
        query: str, 
        top_k: int = 5
    ) -> List[Dict]:
        """Retrieve relevant context for a query"""
        try:
            collection = self.client.get_collection(collection_name)
        except Exception:
            return []
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Query collection
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
            
            context_chunks = []
            if results and results['documents']:
                for i, doc in enumerate(results['documents'][0]):
                    context_chunks.append({
                        'content': doc,
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'distance': results['distances'][0][i] if results['distances'] else None
                    })
            
            return context_chunks
        except Exception as e:
            print(f"Error during RAG query: {str(e)}")
            return []

    def delete_subject_collection(self, subject_id: int):
        """Delete ChromaDB collection for a subject"""
        collection_name = f"subject_{subject_id}"
        try:
            self.client.delete_collection(name=collection_name)
        except Exception as e:
            print(f"Error deleting collection {collection_name}: {e}")
