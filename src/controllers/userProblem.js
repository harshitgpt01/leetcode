const {getLanguageById,submitBatch}=require('../utils/problemUtility')

const createProblem=async(req,res)=>{
    const {title,description,difficulty,tags,visibleTestCases,startCode,referenceSolution,problemCreator}=req.body;

    try{
        for(const{language,completeCode} of referenceSolution){
            const languageId=getLanguageById(language);

            const submissions=
}
    }