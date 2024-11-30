const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Import bcrypt
const jwt = require('jsonwebtoken'); // Optional: for creating tokens

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed password
});

// User Model
const User = mongoose.model('User', userSchema);

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://danilodev:091011@cluster0.w65a0yv.mongodb.net/flashcards-app?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Define Flashcard Schema
const flashcardSchema = new mongoose.Schema({
  word: { type: String, required: true },
  iconUrl: { type: String, required: true },
});

// Create Flashcard Model
const Flashcard = mongoose.model('Flashcard', flashcardSchema);


app.get('/', async (req, res) => {
  res.send("Olá mundo!!");
});

// Sign Up Endpoint
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 5); // Salt rounds = 10
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});


// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Optional: Generate a JWT token
    const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Fetch all flashcards
app.get('/flashcards', async (req, res) => {
  try {
    const flashcards = await Flashcard.find();
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Add a new flashcard
app.post('/flashcards', async (req, res) => {
  const { word, iconUrl } = req.body;
  try {
    const newFlashcard = new Flashcard({ word, iconUrl });
    await newFlashcard.save();
    res.status(201).json(newFlashcard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save flashcard' });
  }
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
