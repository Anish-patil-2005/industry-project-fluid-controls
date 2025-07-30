import jwt from 'jsonwebtoken'
import { User } from '../models/user.models.js';

export const isAuth = async (req,res,next)=>{
    try {

        const token =req.headers.token

        if(!token)
        {
            res.status(403).json({
                message:"Please login",
            })
        };

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decodedData._id);

        next();
        
    } catch (error) {
        res.status(400).json({
            message:error.message
        })
    }
};

export const isAdmin = async(req,res,next)=>{
    try {

        if(req.user.role !== 'admin')
        {
            return res.status(403).json({
                message:"You are not an admin, limits the access"
            })
        }

        next()
        
    } catch (error) {
        res.status(400).json({
            message:error.message
        })
    }
}

export const isSupervisor = async(req,res,next)=>{
    try {

        if(req.user.role !== 'supervisor')
        {
            return res.status(403).json({
                message:"You are not an supervisor, limited access"
            })
        }

        next()
        
    } catch (error) {
        res.status(400).json({
            message:error.message
        })
    }
}


