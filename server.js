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
    
    // Convert the Set back to an array to avoid Vercel serialization errors
    if (puzzle.leading instanceof Set) {
      puzzle.leading = Array.from(puzzle.leading);
    }

    // We send back the parsed puzzle along with the result so the frontend has letters/operands
    res.status(200).json({ puzzle, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Export for Vercel Serverless
module.exports = app;

// Only listen locally, Vercel handles the port mapping natively
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
