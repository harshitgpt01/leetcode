const { getLanguageById, submitBatch, sumitToken } = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submissions");
const SolutionVideo = require("../models/solutionVideo");

const createProblem = async (req, res) => {
  const {
    title, description, difficulty, tags,
    visibleTestCases, hiddenTestCases, startCode,
    referenceSolution
  } = req.body;

  try {
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await sumitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id !== 3) {
          return res.status(400).send("Reference solution failed on visible test cases");
        }
      }
    }

    // FIX: Explicitly set problemCreator from authenticated user, not from req.body
    await Problem.create({
      title, description, difficulty, tags,
      visibleTestCases, hiddenTestCases, startCode,
      referenceSolution,
      problemCreator: req.result._id,
    });

    res.status(201).send("Problem Saved Successfully");
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title, description, difficulty, tags,
    visibleTestCases, hiddenTestCases, startCode,
    referenceSolution
  } = req.body;

  try {
    if (!id) {
      return res.status(400).send("Missing ID Field");
    }

    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) {
      return res.status(404).send("Problem not found");
    }

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);

      // FIX: was wrongly calling submitToken (undefined) — use the imported sumitToken
      const testResult = await sumitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id !== 3) {
          return res.status(400).send("Reference solution failed on visible test cases");
        }
      }
    }

    // FIX: Whitelist fields instead of spreading entire req.body (prevents overwriting problemCreator etc.)
    const newProblem = await Problem.findByIdAndUpdate(
      id,
      { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution },
      { runValidators: true, new: true }
    );

    res.status(200).send(newProblem);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).send("ID is Missing");

    const deletedProblem = await Problem.findByIdAndDelete(id);
    if (!deletedProblem) return res.status(404).send("Problem not found");

    res.status(200).send("Successfully Deleted");
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).send("ID is Missing");

    // FIX: Removed referenceSolution from select — it's sensitive and should not be sent to regular users
    const getProblem = await Problem.findById(id)
      .select("_id title description difficulty tags visibleTestCases startCode")
      .lean(); // lean() returns a plain JS object so we can freely add properties

    if (!getProblem) return res.status(404).send("Problem not found");

    const videos = await SolutionVideo.findOne({ problemId: id });

    if (videos) {
      // FIX: Properly destructure from the videos document
      const { secureUrl, cloudinaryPublicId, thumbnailUrl, duration } = videos;
      getProblem.secureUrl = videos.secureUrl;
      getProblem.thumbnailUrl = videos.thumbnailUrl;
      getProblem.duration = videos.duration;
    }

    // FIX: Response is always sent — previously hung if videos was null
    res.status(200).send(getProblem);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const getAllProblem = async (req, res) => {
  try {
    const getProblem = await Problem.find({}).select("_id title difficulty tags");

    if (getProblem.length === 0) return res.status(404).send("No problems found");

    res.status(200).send(getProblem);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.result._id;

    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags",
    });

    res.status(200).send(user.problemSolved);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = await Submission.find({ userId, problemId });

    // FIX: Added return so the second res.send() is not also called
    if (ans.length === 0) return res.status(200).send("No submissions found");

    res.status(200).send(ans);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblembyUser,
  submittedProblem,
};


// const {getLanguageById,submitBatch,sumitToken} = require("../utils/problemUtility");
// const Problem = require("../models/problem");
// const User = require("../models/user");
// const Submission = require("../models/submissions");
// const SolutionVideo = require("../models/solutionVideo")

// const createProblem = async (req,res)=>{
   
//   // API request to authenticate user:
//     const {title,description,difficulty,tags,
//         visibleTestCases,hiddenTestCases,startCode,
//         referenceSolution, problemCreator
//     } = req.body;


//     try{
       
//       for(const {language,completeCode} of referenceSolution){
         

//         // source_code:
//         // language_id:
//         // stdin: 
//         // expectedOutput:

//         const languageId = getLanguageById(language);
          
//         // I am creating Batch submission
//         const submissions = visibleTestCases.map((testcase)=>({
//             source_code:completeCode,
//             language_id: languageId,
//             stdin: testcase.input,
//             expected_output: testcase.output
//         }));


//         const submitResult = await submitBatch(submissions);
//         // console.log(submitResult);

//         const resultToken = submitResult.map((value)=> value.token);

//         // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
        
//        const testResult = await sumitToken(resultToken);


//        console.log(testResult);

//        for(const test of testResult){
//         if(test.status_id!=3){
//          return res.status(400).send("Error Occured");
//         }
//        }

//       }


//       // We can store it in our DB

//     const userProblem =  await Problem.create({
//         ...req.body,
//         problemCreator: req.result._id
//       });

//       res.status(201).send("Problem Saved Successfully");
//     }
//     catch(err){
//         res.status(400).send("Error: "+err);
//     }
// }

// const updateProblem = async (req,res)=>{
    
//   const {id} = req.params;
//   const {title,description,difficulty,tags,
//     visibleTestCases,hiddenTestCases,startCode,
//     referenceSolution, problemCreator
//    } = req.body;

//   try{

//      if(!id){
//       return res.status(400).send("Missing ID Field");
//      }

//     const DsaProblem =  await Problem.findById(id);
//     if(!DsaProblem)
//     {
//       return res.status(404).send("ID is not persent in server");
//     }
      
//     for(const {language,completeCode} of referenceSolution){
         

//       // source_code:
//       // language_id:
//       // stdin: 
//       // expectedOutput:

//       const languageId = getLanguageById(language);
        
//       // I am creating Batch submission
//       const submissions = visibleTestCases.map((testcase)=>({
//           source_code:completeCode,
//           language_id: languageId,
//           stdin: testcase.input,
//           expected_output: testcase.output
//       }));


//       const submitResult = await submitBatch(submissions);
//       // console.log(submitResult);

//       const resultToken = submitResult.map((value)=> value.token);

//       // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
      
//      const testResult = await submitToken(resultToken);

//     //  console.log(testResult);

//      for(const test of testResult){
//       if(test.status_id!=3){
//        return res.status(400).send("Error Occured");
//       }
//      }

//     }


//   const newProblem = await Problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
   
//   res.status(200).send(newProblem);
//   }
//   catch(err){
//       res.status(500).send("Error: "+err);
//   }
// }

// const deleteProblem = async(req,res)=>{

//   const {id} = req.params;
//   try{
     
//     if(!id)
//       return res.status(400).send("ID is Missing");

//    const deletedProblem = await Problem.findByIdAndDelete(id);

//    if(!deletedProblem)
//     return res.status(404).send("Problem is Missing");


//    res.status(200).send("Successfully Deleted");
//   }
//   catch(err){
     
//     res.status(500).send("Error: "+err);
//   }
// }


// const getProblemById = async(req,res)=>{

//   const {id} = req.params;
//   try{
     
//     if(!id)
//       return res.status(400).send("ID is Missing");

//     const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ');
   
//    if(!getProblem)
//     return res.status(404).send("Problem is Missing");

//    const videos=await SolutionVideo.findOne({problemId:id});

//    if(videos){
//     getProblem.secureUrl=secureUrl;
//     getProblem.cloudinaryPublicId=cloudinaryPublicId;
//     getProblem.thumbnailUrl=thumbnailUrl;
//     getProblem.duration=duration;
    
//     res.status(200).send(getProblem);
//    }

//   }
//   catch(err){
//     res.status(500).send("Error: "+err);
//   }
// }

// const getAllProblem = async(req,res)=>{

//   try{
     
//     const getProblem = await Problem.find({}).select('_id title difficulty tags');

//    if(getProblem.length==0)
//     return res.status(404).send("Problem is Missing");


//    res.status(200).send(getProblem);
//   }
//   catch(err){
//     res.status(500).send("Error: "+err);
//   }
// }


// const solvedAllProblembyUser =  async(req,res)=>{
   
//     try{
       
//       const userId = req.result._id;

//       const user =  await User.findById(userId).populate({
//         path:"problemSolved",
//         select:"_id title difficulty tags"
//       });
      
//       res.status(200).send(user.problemSolved);

//     }
//     catch(err){
//       res.status(500).send("Server Error");
//     }
// }

// const submittedProblem = async(req,res)=>{

//   try{
     
//     const userId = req.result._id;
//     const problemId = req.params.pid;

//    const ans = await Submission.find({userId,problemId});
  
//   if(ans.length==0)
//     res.status(200).send("No Submission is persent");

//   res.status(200).send(ans);

//   }
//   catch(err){
//      res.status(500).send("Internal Server Error");
//   }
// }



// module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};


