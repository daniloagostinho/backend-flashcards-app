const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://danilodev:091011@cluster0.w65a0yv.mongodb.net/flashcards-app?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));


// Definir o esquema do flashcard
const flashcardSchema = new mongoose.Schema({
  word: { type: String, required: true },
  imageUrl: { type: String, required: true }, // Renomeado para imageUrl
});

// Criar modelo de flashcard
const Flashcard = mongoose.model('Flashcard', flashcardSchema);

// Endpoint raiz
app.get('/', async (req, res) => {
  res.send('Olá mundo!!');
});

// Buscar todos os flashcards
app.get('/flashcards', async (req, res) => {
  try {
    const flashcards = await Flashcard.find();
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Adicionar um novo flashcard
app.post('/flashcards', async (req, res) => {
  const { word, imageUrl } = req.body; // Atualizado para imageUrl
  try {
    const newFlashcard = new Flashcard({ word, imageUrl }); // Usar imageUrl aqui
    await newFlashcard.save();
    res.status(201).json(newFlashcard);
  } catch (err) {
    res.status(500).json({ error: 'Falha ao salvar flashcard' });
  }
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
