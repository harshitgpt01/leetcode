const express=require('express');
const ProblemRouter=express.Router();


ProblemRouter.post("/create",adminMiddleware,problemCreate);
ProblemRouter.patch("/:id",updateProblem);
ProblemRouter.delete('/:id',deleteProblem);

ProblemRouter.get("/:id",getProblemById);
ProblemRouter.get("/",getAllProblem);
ProblemRouter.get("/user",solvedAllProblembyUser);
