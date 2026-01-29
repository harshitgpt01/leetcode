const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req,res,next)=>{

    try{
        const {token}=req.cookies;
        if(!token)
            throw new Error("Token not found");

        const payload=jwt.verify(token,process.env.JWT_KEY);
        const {_id}=payload;
        if(!_id){
            throw new Error("Invaild Token");
        }
        const result=await User.findById(_id);
        if(payload.role != 'admin'){
            throw new Error("Invaild Token");
        }
        if(!result){
            throw new Error("USer not found");
        }

        const IsBlocked=await redisClient.exists(`token:${token}`);
        if(IsBlocked){
            throw new Error("Invaild Token");

        }
        req.result=result;
        next();

    }
    catch(err){
        res.status(401).send("Error: "+ err.message)
    }

}


module.exports = adminMiddleware;
