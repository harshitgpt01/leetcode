const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');

// ✅ Correct destructured import
const { solveDoubt, analyseComplexity } = require('../controllers/solveDoubt');

aiRouter.post('/chat', userMiddleware, solveDoubt);
aiRouter.post('/analyse-complexity', userMiddleware, analyseComplexity);

module.exports = aiRouter;