import { NextFunction, Request, Response } from "express";

export const CatchAsyncError = (CatchAsyncErrorfunc: any ) => (req:Request, res:Response, next:NextFunction) =>{
    Promise.resolve(CatchAsyncErrorfunc(req,res,next)).catch(next)
}