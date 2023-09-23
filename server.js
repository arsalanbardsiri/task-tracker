const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs

const path = require('path');



app.use(express.static('public')); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


// API routes

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
       if (err) throw err;
       res.json(JSON.parse(data));
    });
 });
 
 app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    newNote.id = uuidv4();
 
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
       if (err) throw err;
       const notes = JSON.parse(data);
       notes.push(newNote);
 
       fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
          if (err) throw err;
          res.json(newNote);
       });
    });
 });
 
 // Bonus: DELETE route
 app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
 
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
       if (err) throw err;
       const notes = JSON.parse(data);
       const updatedNotes = notes.filter(note => note.id !== noteId);
 
       fs.writeFile('./db/db.json', JSON.stringify(updatedNotes, null, 2), (err) => {
          if (err) throw err;
          res.json({ success: true });
       });
    });
 });


//Set up routes
app.get('/notes', (req, res) => {
   res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(PORT, () => {
   console.log(`Server is listening on port ${PORT}`);
});
