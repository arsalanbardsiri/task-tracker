// Require necessary npm packages
const express = require('express');         // Express is our web server
const fs = require('fs');                   // fs (file system) for reading and writing to files
const path = require('path');               // path is used for file path operations

const app = express();                      // Initialize express
const PORT = process.env.PORT || 3000;      // Set the port for the server. Use either the environment's port or 3000

// Middleware setup
app.use(express.json());                     // Recognize incoming request objects as JSON objects
app.use(express.urlencoded({ extended: true }));  // Recognize incoming request objects as strings or arrays
app.use('/assets', express.static(path.join(__dirname, './public/assets'))); // Serve static assets from the /assets folder

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// Route to serve the notes.html file
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

// API route to retrieve all notes
app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the db.json file:", err);
            return res.status(500).json(err);  // Return a 500 Internal Server Error if there's an issue
        }
        // Return the notes as a JSON
        return res.json(JSON.parse(data));
    });
});

// API route to save a new note
app.post('/api/notes', (req, res) => {
    const newNote = req.body;  // New note data will be in req.body

    // Read the existing notes
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the db.json file:", err);
            return res.status(500).json(err);
        }
        const notes = JSON.parse(data);  // Convert the file data into a JavaScript object
        newNote.id = Date.now();  // Assign a new unique id to the note (using the current timestamp as a unique id for simplicity)
        notes.push(newNote);     // Push the new note to our array of notes

        // Save the updated notes array back to the file
        fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error("Error writing to the db.json file:", err);
                return res.status(500).json(err);
            }
            res.json(newNote);  // Respond with the new note
        });
    });
});

// API route to delete a note based on its unique id
app.delete('/api/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id); // Get the id of the note to be deleted

    // Read the existing notes
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the db.json file:", err);
            return res.status(500).json(err);
        }
        const notes = JSON.parse(data);

        // Filter out the note with the given id
        const newNotesList = notes.filter(note => note.id !== noteId);

        // Save the filtered notes back to the file
        fs.writeFile('./db/db.json', JSON.stringify(newNotesList, null, 2), (err) => {
            if (err) {
                console.error("Error writing to the db.json file:", err);
                return res.status(500).json(err);
            }
            res.json({ message: `Note with id ${noteId} deleted.` }); // Send a success response
        });
    });
});

// Start the server on the specified port
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
