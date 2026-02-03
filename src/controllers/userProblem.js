const {getLanguageById,submitBatch,sumitToken}=require('../utils/problemUtility');
const Problem = require('../models/problem');

const createProblem=async(req,res)=>{
    const {title,description,difficulty,tags,visibleTestCases,startCode,referenceSolution,problemCreator}=req.body;

    try{
        for(const{language,completeCode} of referenceSolution){
            const languageId=getLanguageById(language);

            const submissions=visibleTestCases.map((testcases)=>({
                source_code:completeCode,
                language_id:languageId,
                stdin:testcases.input,
                expected_output:testcases.output
            }));
            const sumitResult=await submitBatch(submissions);

            const resultToken=submitResult.map((value)=>value.token);

            const testResult=await  submitToken(resultToken);

            for(const test of testResult){
                if(test.status_id!=3){
                    return res.status(400).send("Error Occured")
                }
    }}

const userProblem=await Problem.create({
    ...req.body,
    probelemCreator:req.result._id
});
res.status(201).send("Problem Created Successfully");
    }
catch(err){
    res.status(400).send("Error: "+ err);
}

}

const updateProblem=async (req,res)=>{
    const {id}=req.params;
const {title,description,difficulty,tags,visibleTestCases,startCode,referenceSolution,problemCreator}=req.body;

    try{
        if(!id){
            return res.status(400).send("Problem ID is Missing");
        }
        const DSAProblem=await Problem.findById(id); 
        if(!DSAProblem){
            return res.status(404).send("ID is not present in server");
        }
 for(const {language,completeCode} of referenceSolution){
         

      // source_code:
      // language_id:
      // stdin: 
      // expectedOutput:

      const languageId = getLanguageById(language);
        // I am creating Batch submission
      const submissions = visibleTestCases.map((testcase)=>({
          source_code:completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output
      }));

       const submitResult = await submitBatch(submissions);
      // console.log(submitResult);

      const resultToken = submitResult.map((value)=> value.token);

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
      
     const testResult = await submitToken(resultToken);
      //  console.log(testResult);

     for(const test of testResult){
      if(test.status_id!=3){
       return res.status(400).send("Error Occured");
      }
     }

}
const newProblem=await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});
res.status(200).send(newProblem);
    }
    catch(err){res.status(500).send("Error: "+ err);}
}

const deleteProblem=async(req,res)=>{
    const {id}=req.params;
    try{
        if(!id){
            return res.status(400).send("ID is missing");
    }
    const deletedProblem=await Problem.findByIdAndDelete(id);
    if(!deletedProblem){
        return res.status(404).send("Problem is Missing");
    }
    res.status(200).send("Problem Deleted Successfully");
}
catch(err){
    res.status(500).send("Error: "+ err);
}
}


const getProblemById=async(req,res)=>{
    const {id}=req.params;
    try{
        if(!id){
            return res.status(400).send("ID is missing");
        }
         const getProblem = await Problem.findById(id);

   if(!getProblem)
    return res.status(404).send("Problem is Missing");


   res.status(200).send(getProblem);
    }
    catch(err){
    res.status(500).send("Error: "+err);
  }
}

const getAllProblem=async(req,res)=>{
    try{
        const getProblem=await Problem.find({});
        if(getProblem.length===0){
            return res.status(500).send("Err"+err);
    }
}
}
module.exports={createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem};