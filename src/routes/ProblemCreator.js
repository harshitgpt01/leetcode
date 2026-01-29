const express=require('express');
const { getMaxListeners } = require('../models/user');
const ProblemRouter=express.Router();


ProblemRouter.post("/create",problemCreate);
ProblemRouter.patch("/:id",problemUpdate);
ProblemRouter.delete('/:id',problemDelete);

ProblemRouter.get("/:id",problemFetch);
ProblemRouter.get("/",getAllProblem);
ProblemRouter.get("/user",solvedProblem)
