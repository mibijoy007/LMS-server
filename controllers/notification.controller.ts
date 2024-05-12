import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import NotificationModel from "../models/notification.model";
import cron from 'node-cron'

export const getAllNotifications = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const notifications = await NotificationModel.find().sort({createdAt:-1})

        res.status(201).json({
            success: true,
            notifications
        })
        
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})


// update notification
export const updateNotifications =  CatchAsyncError(async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const notification = await NotificationModel.findById(req.params.id);
        if(!notification){
            return next(new ErrorHandler("Notification not found", 404));
        }
        else{
            notification.status ? notification.status = 'read' : notification?.status
        }

        await notification.save()
        
        const notifications = await NotificationModel.find().sort({createdAt:-1})

        res.status(201).json({
            success: true,
            notifications
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})



//delayed notification (delete 'read' notification with 'node cron')
cron.schedule('0 0 0 * * *', async() =>  {   //daily midnight the 'delete' process will happen
    const thirtyDayAgoDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 )   //  30 * 24 * 60 * 60 * 1000  => 30 days
    await NotificationModel.deleteMany({status:"read", createdAt:{$lt : thirtyDayAgoDate}}) //  $lt  => less than

    console.log("Deleted 'read' notifications")
})

