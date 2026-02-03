const express=require('express');
const ProblemRouter=express.Router();


ProblemRouter.post("/create",adminMiddleware,problemCreate);
ProblemRouter.patch("/update/:id",updateProblem);
ProblemRouter.delete('/delete/:id',deleteProblem);

ProblemRouter.get("/ProblemById/:id",getProblemById);
ProblemRouter.get("/getAllProblem",getAllProblem);
ProblemRouter.get("/user",solvedAllProblembyUser);
