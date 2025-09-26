import jsonwebtoken from 'jsonwebtoken';
import {config} from "../config.js";

export const validateAuthToken = (allowedUserTypes = []) => {
  return (req, res, next) => {
    try {
        const { authToken } = req.cookies;
        if(!authToken){
            return res.json({message: "No cookies found"});
        }

    const decoded = jsonwebtoken.verify(authToken, config.JWT.secret);
    req.user = decoded;

    if(!allowedUserTypes.includes(decoded.userType))
        return res.json({message: "Access Denied"});

    next();
     
    } 


    catch (error) {
        console.log("error" + error);
    }
  }
  }