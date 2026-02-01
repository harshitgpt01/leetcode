const {getLanguageById,submitBatch}=require('../utils/problemUtility')

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
    }}
catch(err){
}

}