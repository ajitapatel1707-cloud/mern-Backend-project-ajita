const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
// Port binding for Render
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
// IMPORTANT: Replace <db_password> with your actual password
const MONGO_URI = "mongodb+srv://ajitapatel1707_db_user:ajita2006@cluster0studentmanagerd.ylkyuce.mongodb.net/notesDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected... ✅'))
    .catch(err => console.log('Connection Error: ', err));

// --- MONGODB MODEL ---
const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// --- API ROUTES ---

app.get('/api/notes', async (req, res) => {
    try {
        const allNotes = await Note.find();
        res.json(allNotes);
    } catch (err) {
        res.status(500).json({ message: "Error fetching notes", error: err });
    }
});

app.post('/api/notes', async (req, res) => {
    try {
        const newNote = new Note({
            title: req.body.title,
            content: req.body.content
        });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(400).json({ message: "Error creating note", error: err });
    }
});

app.put('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true });
        if (updatedNote) {
            res.json({ message: "Note updated successfully!", updatedNote });
        } else {
            res.status(404).json({ message: "Note not found" });
        }
    } catch (err) {
        res.status(400).json({ message: "Error updating note", error: err });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNote = await Note.findByIdAndDelete(id);
        if (deletedNote) {
            res.json({ message: "Note deleted successfully!" });
        } else {
            res.status(404).json({ message: "Note not found" });
        }
    } catch (err) {
        res.status(400).json({ message: "Error deleting note", error: err });
    }
});

// --- SERVING FRONTEND (BASED ON YOUR FOLDERS) ---

// This path points to: Fronted -> user-form-app -> build
const buildPath = path.resolve();
app.use(express.static(buildPath));

// Serve index.html for any request that doesn't match an API route
app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});