import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import {v2 as cloudinary} from 'cloudinary';
import { createCourse } from "../services/course.service";


export const uploadCourse = CatchAsyncError(async(req:Request, res:Response, next: NextFunction) =>{
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if(thumbnail){
            const myColud = await cloudinary.uploader.upload(thumbnail,{
                folder:"courses"
            })
            data.thumbnail ={
                public_id: myColud.public_id,
                url:myColud.secure_url
            }
        }
        createCourse(data,res,next)


    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
})