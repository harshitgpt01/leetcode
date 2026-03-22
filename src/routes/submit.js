const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { submitCode, runCode, getAllSubmissions } = require('../controllers/UserSubmission');

submitRouter.post("/submit/:id",        userMiddleware, submitCode);
submitRouter.post("/runcode/:id",       userMiddleware, runCode);
submitRouter.get("/getAllSubmissions",   userMiddleware, getAllSubmissions); // ✅ NEW

module.exports = submitRouter;
