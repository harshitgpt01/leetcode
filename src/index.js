const express = require('express')
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require('./routes/userAuth');
const ProblemRouter=require('./routes/ProblemCreator')
const redisClient=require('./config/redis')
const submitRouter=require("./routes/submit")
const cors = require('cors')

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());
app.use('/user', authRouter);
app.use('/problem',ProblemRouter)
app.use('/submission',submitRouter)




const InitalizeConnection=async()=>{
    try{
        await Promise.all([ main(),redisClient.connect() ]);
        console.log("Connected to DB");
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+ process.env.PORT);
        })}
        catch(err){
        console.log("Error Occurred: "+ err);
    }
}
InitalizeConnection();









// main()
// .then(async ()=>{
//     app.listen(process.env.PORT, ()=>{
//         console.log("Server listening at port number: "+ process.env.PORT);
//     })
// })
// .catch(err=> console.log("Error Occurred: "+err));
