require('dotenv').config()

import express, { NextFunction, Request, Response } from "express"
export const app = express()

import cors from "cors"
import cookieParser from "cookie-parser"
import { ErrorMiddleware } from "./middleware/error"
import userRouter from "./routes/user.routes"
import courseRouter from "./routes/course.routers"
import orderRouter from "./routes/order.routes"



// Configure Express to use the express.json middleware with a payload size limit of 50 megabytes.
app.use(express.json({limit:"50mb"}))



app.use(cookieParser())

//securing the API endpoint using cors()
app.use(cors({
    origin: process.env.ORIGIN,
}))

//test our api
app.get('/test',(req : Request,res : Response,next : NextFunction) => {
    res.status(200).json({
        success: true,
        message: "Backend is working"
    })
})

//blocking unknown route
// app.all('*',(req : Request,res : Response,next : NextFunction) => {
//      const err = new Error(`Request for ${req.originalUrl} not found`) as any
//      err.statusCode=404;
//      next(err)
// })


//error middleware

app.use(ErrorMiddleware) //not 'ErrorHandler'



//routes
app.use("/api/v1",userRouter)

app.use("/api/v1",courseRouter)

app.use("/api/v1",orderRouter)