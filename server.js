const express = require('express');
const cors = require('cors');
const path = require('path');
const { parsePuzzle, solvePuzzle_CSP } = require('./solver');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/solve', (req, res) => {
  try {
    const { puzzleString } = req.body;
    if (!puzzleString) {
      return res.status(400).json({ error: 'puzzleString is required' });
    }

    const puzzle = parsePuzzle(puzzleString);
    const result = solvePuzzle_CSP(puzzle);
    
    // We send back the parsed puzzle along with the result so the frontend has letters/operands
    res.json({ puzzle, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
