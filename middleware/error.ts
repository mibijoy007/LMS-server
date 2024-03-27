import { model } from "mongoose";
import ErrorHandler from "../utils/ErrorHandler";
import { NextFunction, Request, Response } from "express";

export const ErrorMiddleware = (err:any , req:Request, res:Response , next:NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message ||'Internal server error'

     //jwt token error
     if(err.name === 'JsonWebTokenError'){
        const message = `Json web token is invalid, try again`
        err = new ErrorHandler(message, 400)
     }

     //mongodb error
     if(err.name === 'CastError'){
        const message = `Resource not found. Invalid: ${err.path}`
        err = new ErrorHandler(message, 400)
     }

     //duplicate key error
     if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValues)} entered`
        err = new ErrorHandler(message, 400)
     }

     //jwt experied
     if(err.name === 'TokenExperiedError'){
        const message = `Json web token is experied, try again`
        err = new ErrorHandler(message,400)
     }

     res.status(err.statusCode).json({
        success: false,
        message: err.message
     })

}