const express = require('express')
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require('./routes/userAuth');


app.use(express.json());
app.use(cookieParser());
app.use('/user', authRouter);



main()
.then(async ()=>{
    app.listen(process.env.PORT, ()=>{
        console.log("Server listening at port number: "+ process.env.PORT);
    })
})
.catch(err=> console.log("Error Occurred: "+err));
