const express=require('express');
const submitRouter=express.Router();
const userMiddleware=require('../middleware/userMiddleware');
const SubmitCode=require('../controllers/UserSubmission')


submitRouter.post("/submit/:id",userMiddleware,SubmitCode);

  