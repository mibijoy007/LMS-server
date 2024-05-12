import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import { newOrderService } from "../services/order.service";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import OrderModel from "../models/order.model";

export const createOrder = CatchAsyncError(async(req:Request, res:Response, next: NextFunction) =>{
    try {
        const {courseId, payment_info} = req.body

        //let's check if the user has it
        const user = await userModel.findById(req.user?._id)
         
        const courseExistsInUser = user?.courses.some((course:any) => course._id.toString() === courseId)

        if(courseExistsInUser){
            return next(new ErrorHandler("You have already purchased this course",400))
        }

        //let's give it to the user
        const course = await CourseModel.findById(courseId);

        if(!course){
            return next(new ErrorHandler("Course not found", 404))
        }

        //data that we'll send
        const data : any ={
            courseId: course._id,
            userId: user?._id
        }


        //let's send a mail to the user
        const mailData ={
            user: {
                name:user?.name
            },
            order:{
                _id: course._id.toString().slice(0,6),
                name: course.name,
                price: course.price,
                // date: new Date().toLocaleDateString() //just the date but i need the date and "local time too"
                date: new Date().toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'long' })
            }
        }

        const html = await ejs.renderFile(path.join(__dirname,'../emails/order-confirmation-email.ejs',),mailData)

        //let's do a try-catch to be safe about the email
        try {
            if(user){
                await sendMail({
                    email: user.email,
                    subject: "Order is confirmed",
                    template: "order-confirmation-email.ejs",
                    data: mailData
                })
            }
        } catch (error:any) {
            return next(new ErrorHandler(error.message,500))
        }

        user?.courses.push(course._id)

        user?.save();

        //let's notify the course-creator "admin"
        await NotificationModel.create({
            title: `New Order`,
            message: `Your have a new order created for ${course.name}`,  
            userId: user?._id
        })

        
            if(course) {
                course.purchased! += 1   // used "!" to avoid the undefined problem as it's default 0.
            }
        //update the purchased course number
        // course.purchased ? course.purchased +=1 : course.purchased ;

        // console.log("course.purchased======>",course.purchased);
        
        await course.save() 

        //putting the newOrder in the mongoBD
        // newOrderService(data,res,next)
        const order = await OrderModel.create(data)
        // next(order) 
        res.status(201).json({
            success: true,
            order
        })
        
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500)) 
    }
})