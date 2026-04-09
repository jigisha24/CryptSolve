/**
 * solver.js
 * CryptSolve Backend Logic
 */

function parsePuzzle(raw) {
  const cleaned = raw.toUpperCase().replace(/\s+/g, '');

  // Split at '='
  const eqParts = cleaned.split('=');
  if (eqParts.length !== 2) throw new Error('Exactly one "=" required.');
  const resultWord = eqParts[1].trim();
  if (!/^[A-Z]+$/.test(resultWord)) throw new Error('Result must contain only letters.');

  // Split left side at + or -
  const lhsRaw = eqParts[0];
  const lhsTokens = lhsRaw.split(/(?=[+\-])/); // split keeping delimiter
  const operands = [];
  const ops = [];

  lhsTokens.forEach((tok, i) => {
    if (i === 0) {
      if (!/^[A-Z]+$/.test(tok)) throw new Error('Each operand must be letters only.');
      operands.push(tok);
    } else {
      const op  = tok[0];     // '+' or '-'
      const word = tok.slice(1);
      if (!/^[+\-]$/.test(op) || !/^[A-Z]+$/.test(word))
        throw new Error('Invalid operand format.');
      ops.push(op);
      operands.push(word);
    }
  });

  if (operands.length < 2) throw new Error('Need at least two operands.');

  // Collect unique letters
  const allWords = [...operands, resultWord];
  const letterSet = new Set(allWords.join(''));
  const letters = [...letterSet];

  if (letters.length > 10) throw new Error('Too many unique letters (max 10).');

  // Leading letters cannot be 0
  const leading = new Set();
  allWords.forEach(w => leading.add(w[0]));

  return { operands, ops, result: resultWord, letters, leading: Array.from(leading) };
}

function solvePuzzle_CSP(puzzle) {
  puzzle.leading = new Set(puzzle.leading); // restore Set from array since JSON doesn't support Sets
  
  const solverStats = { nodes: 0, backtracks: 0, startTime: performance.now() };
  const logBuffer = [];
  
  function appendLog(type, message) {
    if (logBuffer.length < 200) {
      logBuffer.push({ type, message });
    }
  }

  function backtrack(assignment, letters, depth, domains) {
    if (depth === letters.length) {
      solverStats.nodes++;
      if (isValid(assignment, puzzle)) {
        appendLog('ok', `✓ Solution found!`);
        return { ...assignment };
      }
      return null;
    }

    const letter = letters[depth];
    const domain = [...domains[letter]];
    const usedDigits = new Set(Object.values(assignment));

    for (const digit of domain) {
      if (usedDigits.has(digit)) continue;
      if (digit === 0 && puzzle.leading.has(letter)) continue;

      solverStats.nodes++;
      assignment[letter] = digit;

      appendLog('assign', `Assign ${letter} = ${digit} (depth ${depth})`);

      if (forwardCheck(assignment, puzzle, letters)) {
        const result = backtrack(assignment, letters, depth + 1, domains);
        if (result) return result;
      } else {
        appendLog('fail', `Forward check failed for ${letter}=${digit}`);
      }

      delete assignment[letter];
      solverStats.backtracks++;
    }

    return null;
  }

  function forwardCheck(assignment, puzzle, letters) {
    const assigned = new Set(Object.keys(assignment));
    const allAssigned = letters.every(l => assigned.has(l));

    if (allAssigned) {
      return isValid(assignment, puzzle);
    }

    const usedDigits = Object.values(assignment);
    const uniqueDigits = new Set(usedDigits);
    return uniqueDigits.size === usedDigits.length;
  }

  function isValid(assignment, puzzle) {
    const { operands, ops, result } = puzzle;

    function wordToNum(word) {
      let num = 0;
      for (const ch of word) {
        num = num * 10 + assignment[ch];
      }
      return num;
    }

    let lhsValue = wordToNum(operands[0]);
    for (let i = 0; i < ops.length; i++) {
      const val = wordToNum(operands[i + 1]);
      lhsValue = ops[i] === '+' ? lhsValue + val : lhsValue - val;
    }

    return lhsValue === wordToNum(result);
  }

  const assignment = {};
  const domains = {};
  puzzle.letters.forEach(l => {
    domains[l] = puzzle.leading.has(l) ? [1,2,3,4,5,6,7,8,9] : [0,1,2,3,4,5,6,7,8,9];
  });

  const solution = backtrack(assignment, puzzle.letters, 0, domains);
  const elapsed = (performance.now() - solverStats.startTime).toFixed(1);

  return { solution, stats: { ...solverStats, elapsed }, logs: logBuffer };
}

module.exports = { parsePuzzle, solvePuzzle_CSP };
