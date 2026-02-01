const {getLanguageById,submitBatch,sumitToken}=require('../utils/problemUtility')

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

module.exports={createProblem};