const express=require('express');
const aiRouter=express.Router();
const userMiddleware=require('../middleware/userMiddleware');
const solveDoubt=require('../controllers/solveDoubt');
const analyseComplexity=require('../controllers/solveDoubt');
// const userMiddleware = require('../middleware/userMiddleware');

aiRouter.post('/chat',userMiddleware,solveDoubt);
aiRouter.post('/analyse-complexity', userMiddleware, analyseComplexity);
module.exports=aiRouter;