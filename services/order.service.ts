import { NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel from "../models/order.model";

export const newOrderService = CatchAsyncError(async(data:any,next:NextFunction)=>{
    const order = await OrderModel.create(data)
    next(order)
})