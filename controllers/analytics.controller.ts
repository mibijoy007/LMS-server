

// get users analytics ( admin only)

import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { generateLast12MonthsData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import OrderModel from "../models/order.model";


// how many users were created?
export const getUserAnalytics = CatchAsyncError(async(req:Request,res:Response,next:NextFunction) =>{
try {
    const usersLast12MonthsData = await generateLast12MonthsData(userModel);
    res.status(200).json({
        success: true,
        usersLast12MonthsData
    })
} catch (error:any) {
    return next(new ErrorHandler(error.message,500))
}
})


// how many  courses were made?
export const getCoursesAnalytics = CatchAsyncError(async(req:Request,res:Response,next:NextFunction) =>{
    try {
        const coursesLast12MonthsData = await generateLast12MonthsData(CourseModel);
        res.status(200).json({
            success: true,
            coursesLast12MonthsData
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
    })


    // how many  orders were made?
export const getOrdersAnalytics = CatchAsyncError(async(req:Request,res:Response,next:NextFunction) =>{
    try {
        const ordersLast12MonthsData = await generateLast12MonthsData(OrderModel);
        res.status(200).json({
            success: true,
            ordersLast12MonthsData
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
    })