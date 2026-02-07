const express=require('express');
const submitRouter=express.Router();
const userMiddleware=require('../middleware/userMiddleware');
const {submitCode,runcode}=require('../controllers/UserSubmission')

submitRouter.post("/submit/:id",userMiddleware,submitCode);
submitRouter.post("/runcode/:id",userMiddleware,runcode);


module.exports=submitRouter;
  