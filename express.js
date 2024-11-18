const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB database
mongoose.connect('mongodb+srv://vladdidyk1985:jfabQFIuJjdDwSli@cluster0.pggz4.mongodb.net/')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB:', error);
    });

// Define a schema for the User collection
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

// Create a User model based on the schema
const User = mongoose.model('User', userSchema);

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware for JWT validation
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
};

// Route to register a new user
app.post('/api/register', async (req, res) => {
    try {
        // Validate request body
        if (!req.body.username || !req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'All fields (username, email, password) are required' });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to my User Registration and Login API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
