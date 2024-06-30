const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const { spawn, execSync } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Middleware pour gérer les requêtes CORS
app.use(cors());

// Connexion à MongoDB
const mongoURI = "mongodb+srv://tgatienne:AnnZn0N3K4pSs1yB@gatiennekoliiibritalki.entrtwn.mongodb.net/?retryWrites=true&w=majority&appName=gatiennekoliiibritalki";
mongoose.connect(mongoURI).then(
    () => { console.log("Connected to MongoDB"); },
    err => { console.error(`Error connecting to MongoDB: ${err.message}`); }
);

// Fonction pour installer les dépendances Python
function installPythonDependencies() {
    const dependencies = ['transformers', 'torch', "sacremoses", "sentencepiece,"];
    dependencies.forEach(dep => {
        console.log(`Installing ${dep}...`);
        execSync(`pip install ${dep}`, { stdio: 'inherit' });
    });
}

// Installer les dépendances Python
installPythonDependencies();

// Route pour la racine de l'application
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Définir les questions du quiz
const quizQuestions = [
    {
        category: 'Dental Hygiene',
        question: 'How often should you brush your teeth?',
        choices: ['Once a day', 'Twice a day', 'Three times a day', 'Once a week'],
        correctAnswer: 'Twice a day',
    },
    {
        category: 'Dental Hygiene',
        question: 'What is the main cause of tooth decay?',
        choices: ['Sugar', 'Plaque', 'Germs', 'Acid'],
        correctAnswer: 'Plaque',
    },
    {
        category: 'Math for Kids',
        question: 'What is 5 + 3?',
        choices: ['6', '7', '8', '9'],
        correctAnswer: '8',
    },
    {
        category: 'Math for Kids',
        question: 'What is 10 - 4?',
        choices: ['5', '6', '7', '8'],
        correctAnswer: '6',
    }
];

// Route pour démarrer le quiz et récupérer les questions
app.get('/quiz', (req, res) => {
    res.json(quizQuestions);
});

// Route pour soumettre une réponse au quiz et obtenir les résultats
app.post('/quiz', (req, res) => {
    const { question, answer } = req.body;
    const quizQuestion = quizQuestions.find(q => q.question === question);
    if (!quizQuestion) {
        return res.status(400).json({ error: 'Invalid question' });
    }

    const isCorrect = answer.trim().toLowerCase() === quizQuestion.correctAnswer.trim().toLowerCase();
    res.json({ correctAnswer: quizQuestion.correctAnswer, isCorrect });
});

// Route pour le chat
app.post('/chat', async (req, res) => {
    const { text, sourceLang } = req.body;
    const targetLang = 'de'; // Traduire en allemand

    console.log('Received chat request:', { text, sourceLang });

    try {
        // Traduire le message de l'utilisateur en allemand
        const userTranslation = await translateText(text, sourceLang, targetLang);
        console.log('User translation:', userTranslation);

        // Utiliser BlenderBot pour générer une réponse dans la langue de l'utilisateur
        const botResponse = await getBotResponse(text);
        console.log('Bot response:', botResponse);

        // Traduire la réponse du bot en allemand
        const botTranslation = await translateText(botResponse, sourceLang, targetLang);
        console.log('Bot translation:', botTranslation);

        res.json({
            userMessage: text,
            userTranslation,
            botResponse,
            botTranslation
        });
    } catch (error) {
        console.error('Error handling chat request:', error);
        res.status(500).send('Error handling chat request: ' + error.toString());
    }
});

// Fonction pour traduire le texte en utilisant translate.py
async function translateText(text, sourceLang, targetLang) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [path.join(__dirname, 'translate.py')]);

        pythonProcess.stdin.write(JSON.stringify({ text, source_lang: sourceLang, target_lang: targetLang }));
        pythonProcess.stdin.end();

        let dataBuffer = '';
        pythonProcess.stdout.on('data', (data) => {
            dataBuffer += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error('Error during translation:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const translation = JSON.parse(dataBuffer).translation;
                    resolve(translation);
                } catch (err) {
                    reject('Error parsing translation response: ' + err.toString());
                }
            } else {
                reject('Translation script exited with code ' + code);
            }
        });
    });
}

// Fonction pour obtenir la réponse de BlenderBot
async function getBotResponse(inputText) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [path.join(__dirname, 'blenderbot.py')]);

        pythonProcess.stdin.write(JSON.stringify({ text: inputText }));
        pythonProcess.stdin.end();

        let dataBuffer = '';
        pythonProcess.stdout.on('data', (data) => {
            dataBuffer += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error('Error during BlenderBot processing:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const response = JSON.parse(dataBuffer).response;
                    resolve(response);
                } catch (err) {
                    reject('Error parsing BlenderBot response: ' + err.toString());
                }
            } else {
                reject('BlenderBot script exited with code ' + code);
            }
        });
    });
}

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
