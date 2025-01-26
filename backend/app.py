#import libraries
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from transformers import pipeline
from fuzzywuzzy import fuzz

app = FastAPI()

# Activer CORS pour éviter les erreurs liées aux requêtes cross-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charger le fichier JSON
with open("dataset.json", "r", encoding="utf-8") as file:
    faq_data = json.load(file)["dataset"]

# Charger le modèle local pour la génération de texte
model = pipeline("text-generation", model="openai-gpt")

class QuestionRequest(BaseModel):
    question: str

class QuestionResponse(BaseModel):
    question: str
    answer: str

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur le chatbot FAQ"}

def find_best_match(question):
    best_match = None
    highest_score = 0
    for item in faq_data:
        score = fuzz.ratio(question.lower(), item["question"].lower())
        if score > highest_score and score > 5:  # Seuil de similarité
            highest_score = score
            best_match = item
    return best_match

def generate_response(question):
    try:
        # Générer une réponse avec le modèle
        response = model(question, max_length=50, num_return_sequences=1, temperature=0.7, top_p=0.9)
        answer = response[0]["generated_text"]
        
        # Nettoyer la réponse pour éviter les répétitions ou les phrases inutiles
        if "that was the end of that" in answer or "i had no intention" in answer:
            answer = "Désolé, je n'ai pas de réponse."
        return answer
    except Exception as e:
        return "Désolé, je n'ai pas de réponse."

@app.post("/ask/", response_model=QuestionResponse)
def ask_question(request: QuestionRequest):
    question = request.question.lower().strip()
    
    # Trouver la meilleure correspondance dans le dataset
    match = find_best_match(question)
    if match:
        return {"question": question, "answer": match["answer"]}
    
    # Si la question n'est pas trouvée, utiliser le modèle de génération de texte
    answer = generate_response(question)
    return {"question": question, "answer": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)