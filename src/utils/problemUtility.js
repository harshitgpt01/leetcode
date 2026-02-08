const axios=require('axios');

const getLanguageById=(lang)=>{
    const language={
        "c++":54,
        "java":62,
        "javascript":63,
    }
    return language[lang.toLowerCase()];
}

const submitBatch=async(submissions)=>{
      
const options = {
method: 'POST',
  url: 'https://judge029.p.rapidapi.com/submissions',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': '02c035aacfmsh51a0d0e4deda78bp19ff3cjsn97e42028db6d',
    'x-rapidapi-host': 'judge029.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData(){
    try{
    const response=await axios.request(options);
    return response.data;
    }
    catch(error){
        console.error(error);
    }
}
return await fetchData();
}

const waiting = async(timer)=>{
  setTimeout(()=>{
    return 1;
  },timer);
}


const sumitToken=async(resultToken)=>{
  const options={
    method: 'GET',
  url: 'https://judge029.p.rapidapi.com/submissions/1df59684-e5e7-4ce1-9975-ff732823e37e',
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': '02c035aacfmsh51a0d0e4deda78bp19ff3cjsn97e42028db6d',
    'x-rapidapi-host': 'judge029.p.rapidapi.com'
  }
};

  async function fetchData(){
    try{
      const response=await axios.request(options);
      return response.data;
    }
    catch(error){
      console.error(error);
    }
  }

  while(true){
    const result=await fetchData();
    const IsResultObtained=result.submissions.every((r)=>r.status_id>2);
    if(IsResultObtained){
      return result.submissions;
    }
    await waiting(1000);
  }
} 

module.exports={getLanguageById,submitBatch,sumitToken}