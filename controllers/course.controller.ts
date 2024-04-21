import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import {v2 as cloudinary} from 'cloudinary';
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";

//create course
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


//edit-course
export const editCourse = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;

        //delete the previous one
        if(thumbnail){
            await cloudinary.uploader.destroy(thumbnail.public_id)

            //now upload
            const  myColud = await cloudinary.uploader.upload(thumbnail,{
                folder:"courses"
            })
            data.thumbnail ={
                public_id: myColud.public_id,
                url:myColud.secure_url
            }
        }

        //we'll get the id from the url bar that's why (params) 
        //and url will be like ("/courses/:id") in the routes
        const courseId = req.params.id; 
        const course = await CourseModel.findByIdAndUpdate(courseId,
            {$set: data}, // to set the fields of the document to the values specified in the data object
            {new:true} // it tells Mongoose to return the modified document rather than the original document
        )

        res.status(201).json({
            success: true,
            course
        })
        
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})


//get single course access ( without purchasing ) - no videos.
//'/get-course-unpurchased/:id'
export const getSingleCourse = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const courseId = req.params.id;
        //redis
        const doesCacheExist = await redis.get(courseId)
        if(doesCacheExist){
            const course = await JSON.parse(doesCacheExist);
            console.log("redis hhhh");

            res.status(200).json({
                success: true,
                // doesCacheExist, //to see the shape
                course
            })
        }
        else{
                //full course form DB and we'll restrict certain contants
            const course = await CourseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")
            // console.log("mongo hhhh");
            
            const jsonToCourse = JSON.stringify(course) 
            await redis.set(courseId,jsonToCourse)

            res.status(200).json({
                success: true,
                course
            })
        }
       

    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})


//get all courses
export const getAllCourses =  CatchAsyncError(async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const doesCacheExist = await redis.get("allCourses")
        if(doesCacheExist){
            const allCourses = JSON.parse(doesCacheExist)
                console.log("redis hhhh allCourses");

            res.status(200).json({
                success: true,
                allCourses
            })
            
        }
        else{
            //full course form DB and we'll restrict certain contants
        const allCourses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")

        await redis.set("allCourses",JSON.stringify(allCourses))
        console.log("mongo hhhh allCourses");

        res.status(200).json({
            success: true,
            allCourses
        })
        }

    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})


//get course content (only those who purched) they will be given (id) if purchased.
export const getCourseByUser =  CatchAsyncError(async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const userCourseList = req.user?.courses  //an array
        const courseId = req.params.id;
        
        const courseExistsForUser = userCourseList?.find( (course:any) => course._id === courseId)
        if(!courseExistsForUser){
            return next(new ErrorHandler("You are not allowed to access the course",404))
        }

        
        const course = await CourseModel.findById(courseId)
        const courseContent = course?.courseData;
        res.status(200).json({
            success: true,
            courseContent
        })


    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})