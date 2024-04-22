import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import {v2 as cloudinary} from 'cloudinary';
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import { title } from "process";
import path from "path";
import ejs from "ejs"
import sendMail from "../utils/sendMail";

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



// add question (after purchasing)
interface IAddQuestionData {
    question:string;
    courseId:string;
    contentId:string;
}
//courseId - for all
//contentId - for purchased only
export const addQuestion =  CatchAsyncError(async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const {question, courseId,contentId}:IAddQuestionData =req.body;
        const course = await CourseModel.findById(courseId)

        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler("Invalid content id",400))
        }

        const courseContent = course?.courseData?.find((item:any) => item._id.toString() === contentId)
        // console.log('jjjjj',courseContent);
        
        if(!courseContent){
            return next(new ErrorHandler("Invalid content access for question",400))
        }

        //create a new quesiton
        const newQuestion:any ={
            user:req.user,
            question,
            quesitonReplies:[]
        }

        //add this to our course content
        courseContent.questions.push(newQuestion);

        //save the updated course
        await course?.save();

        res.status(200).json({
            success:true,
            course
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})



//add replies

interface IAddReplyData {
    reply:string;
    courseId:string;
    contentId:string;
    questionId:string;
}
//courseId - for all
//contentId - for purchased only
export const addReply =  CatchAsyncError(async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const {reply, courseId,contentId,questionId}:IAddReplyData =req.body;
        const course = await CourseModel.findById(courseId)

        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler("Invalid content id",400))
        }

        const courseContent = course?.courseData?.find((item:any) => item._id.toString() === contentId)
        // console.log('jjjjj',courseContent);
        
        if(!courseContent){
            return next(new ErrorHandler("Invalid content access for question",400))
        }

        const question = courseContent?.questions?.find((item:any) => item._id.toString() === questionId)
        if(!question){
            return next(new ErrorHandler("Invalid for question",400))
        }

        //create a new reply
        const newReply:any ={
            user:req.user,
            reply,
            
        }

        //add this to our question object
        question.questionReplies.push(newReply);

        //save the updated course
        await course?.save();


        //notificaiton
        if(req.user?._id === question.user._id.toString()){
            //we'll do a notification to the admin dashboard
            // console.log("self question-answer");
            
        }
        else{
            //we'll send an email to the user who asked the question

            const data ={
                name: question.user.name,
                title: courseContent.title,
            }

            const html = await ejs.renderFile(path.join(__dirname,"../emails/question-reply.ejs"),data)

            //we'll need to do another try-catch
            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Reply to your question",
                    template: "question-reply.ejs",
                    data,
                })
                // console.log("user question and instructor answer to :",question.user.email);


            } catch (error:any) {
                return next(new ErrorHandler(error.message,500))
            }
        }


        res.status(200).json({
            success:true,
            course
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})
