const express=require('express');
const ProblemRouter=express.Router();
const adminMiddleware=require('../middleware/adminMiddleware');
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem}=require('../controllers/userProblem')
const userMiddleware=require('../middleware/userMiddleware');

ProblemRouter.post("/create",adminMiddleware,createProblem);
ProblemRouter.patch("/update/:id",adminMiddleware,updateProblem);
ProblemRouter.delete('/delete/:id',adminMiddleware,deleteProblem);

ProblemRouter.get("/ProblemById/:id",userMiddleware,getProblemById);
ProblemRouter.get("/getAllProblem",userMiddleware,getAllProblem);
// ProblemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblembyUser);