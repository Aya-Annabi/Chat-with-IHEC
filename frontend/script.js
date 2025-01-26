// Données locales des questions/réponses
const faqData = [
    {
        question: "Quelle est la mission de notre établissement ?",
        answer: "Notre mission est de fournir une éducation de qualité, accessible à tous, et de promouvoir l'innovation et la recherche."
    },
    {
        question: "Combien d'étudiants sont inscrits cette année ?",
        answer: "Cette année, nous avons 10 000 étudiants inscrits."
    }
];

// Fonction pour afficher/masquer la fenêtre de chat
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
}

// Fonction pour poser une question suggérée
function askSuggestedQuestion(question) {
    const answer = faqData.find(item => item.question === question)?.answer || "Je n'ai pas de réponse à cette question.";
    displayMessage(question, answer);
}

// Fonction pour afficher un message dans la fenêtre de chat
function displayMessage(question, answer) {
    const chatMessages = document.getElementById('chat-messages');

    // Ajouter la question de l'utilisateur
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.innerText = question;
    chatMessages.appendChild(userMessage);

    // Ajouter la réponse du chatbot
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot-message';
    botMessage.innerText = answer;
    chatMessages.appendChild(botMessage);

    // Faire défiler vers le bas
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fonction pour poser une question
async function askQuestion() {
    const question = document.getElementById('question').value;
    if (!question) return;

    // Afficher la question de l'utilisateur
    displayMessage(question, "Je cherche la réponse...");

    // Effacer le champ de saisie
    document.getElementById('question').value = '';

    try {
        // Envoyer la question au backend
        const response = await fetch('http://localhost:8000/ask/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: question }),
        });

        if (!response.ok) {
            throw new Error("Le backend ne répond pas.");
        }

        const data = await response.json();
        displayMessage(question, data.answer);
    } catch (error) {
        // Si le backend ne répond pas, utiliser les données locales
        const localAnswer = faqData.find(item => item.question.toLowerCase().includes(question.toLowerCase()))?.answer || "Je n'ai pas de réponse à cette question.";
        displayMessage(question, localAnswer);
    }
}