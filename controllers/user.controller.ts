require('dotenv').config();

import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import  jwt, { JwtPayload, Secret }  from "jsonwebtoken";
import ejs from 'ejs'
import path from "path";
import sendMail from "../utils/sendMail";
import { accessTokenOptions, refreashTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { decode } from "punycode";
import { getUserById } from "../services/user.service";
import { log } from "console";

interface IRegistrationBody{
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

//register user
export const registrationUser = CatchAsyncError(async(req: Request, res: Response, next:NextFunction)=> {
    try {
        const {name,email,password} = req.body;

        const isEmailExist = await userModel.findOne({email});
        if(isEmailExist){
            return next(new ErrorHandler("Email already exist",400))
        }

        const user: IRegistrationBody ={
            name,
            email,
            password
        }

        const activationToken = createActivationToken(user)
        
        const activationCode = activationToken.activationCode;

        const data = {user:{name:user.name},activationCode};

        //setting the mail format from file ' '
        const html = await ejs.renderFile(path.join(__dirname,"../emails/activation-email.ejs"), data)

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-email.ejs",
                data
            })

            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token
            })
        } catch (error:any) {
            return next(new ErrorHandler(error.message,400))
        }


    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
})

//activation token
interface IActivationToken{
    token: string;
    activationCode: string
}

export const createActivationToken= (user:any) :IActivationToken =>{
    
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString() ;

    const token = jwt.sign({
        user,
        activationCode
    },
    process.env.ACTIVATION_SECRET as Secret,
    {expiresIn:"5m"});

    return {token, activationCode}
}

//Activate User
interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

export const activateUser = CatchAsyncError(async(req:Request,res:Response,next:NextFunction) =>{
    try {
        const {activation_token, activation_code} = req.body as IActivationRequest;

        const newUser:{user: IUser; activationCode:string} = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as {user: IUser; activationCode:string}

        if(newUser.activationCode !== activation_code){
            return next(new ErrorHandler("Invalid activation code", 400))
        }

        const {name , email, password} = newUser.user

        const exitUser = await userModel.findOne({email})

        if(exitUser){
            return next(new ErrorHandler("Email already exist",400))
        }

        const newUserData = await userModel.create({
            name,
            email,
            password
        })

        res.status(201).json({
            success: true,
            message: "New user created"
        })



    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


//login user
interface ILoginRequest {
    email: string;
    password: string;
}

export const loginUser = CatchAsyncError(async(req:Request, res:Response,next: NextFunction) =>{
    try {
        const {email, password} = req.body as ILoginRequest

        if(!email || !password){
            return next(new ErrorHandler("Please enter both email & password",400))
        }

        const loginUser = await userModel.findOne({email}).select("+password")
        if(!loginUser){
            return next(new ErrorHandler("Invalid email or password",400))
        }

        const isPasswordMatch = await loginUser.comparePassword(password)
        if(!isPasswordMatch){
            return next(new ErrorHandler("Incorrect password. Please enter correct password",400))
        }

        sendToken(loginUser,200,res)

    } catch (error: any) {
        return next(new ErrorHandler(error.message,400))
    }
})


//Logout user
export const logoutUser = CatchAsyncError(async(req:Request, res:Response, next: NextFunction) => {
    try {
         res.cookie("access_token","",{maxAge: 1})
         res.cookie("refreash_token","",{maxAge: 1})
         
         //now delete the user form redis
        //  console.log(req.user);
         

             redis.del(req.user?._id)


         res.status(200).json({
            success: true,
            message: "Logged out seccessfully"
         })
        
    } catch (error : any) {
        return next(new ErrorHandler(error.message,400))
    }
})


//update access token & refreash token using (refreash_token)
export const updateAccessToken = CatchAsyncError(async(req:Request, res:Response, next: NextFunction) => {
    try {
        const refreash_token = req.cookies.refreash_token as string //here we have to say 'as string'
        const decoded = jwt.verify(refreash_token,process.env.SIGN_IN_OUT_REFREASH_TOKEN as string) as JwtPayload

        if(!decoded){
            return next(new ErrorHandler(`Couldn't refreash token`,400))
        }

        const session = await redis.get(decoded.id as string) //this also needed
        if(!session){
            return next(new ErrorHandler(`Couldn't refreash token`,400))
        }

        const user = JSON.parse(session)

        req.user = user
        
        const accessToken =jwt.sign({id:user._id},process.env.SIGN_IN_OUT_ACCESS_TOKEN as string,
            {
             expiresIn:"5m"
        })

        //now we'll update the refreash token too. get a new one.
        const refreashToken = jwt.sign({id:user._id},process.env.SIGN_IN_OUT_REFREASH_TOKEN as string,
            {
                expiresIn:"3d"
            }) 

        // updating cookies
        res.cookie("access_token",accessToken,accessTokenOptions)
        res.cookie("refreash_token",refreashToken,refreashTokenOptions)


        res.status(200).json({
            success: true,
            accessToken,
            refreashToken
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
})


//get user info
export const getUserInfo = CatchAsyncError(async(req:Request,res:Response, next:NextFunction) => {
    try {
        const userId = await req.user?._id
        if(!userId){
            return next(new ErrorHandler('Could not get user id',400))
        }
        
         getUserById(userId,res) //exported

    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
})


//social auth (get name,mail,image(avatar) form the socials using nextAuth)then we'll create the user
interface ISocialAuth {
    name:string;
    email: string;
    avatar: string;
}


export const socialAuth = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const {email,name,avatar} = req.body as ISocialAuth
        const user = await userModel.findOne({email});
        if(!user){
            const newUser = await userModel.create({email,name,avatar})
            sendToken(newUser,200,res)
        }

    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
})



//update user info
 interface IUpdateUserInfo{
    name?: string;
    email?: string;
 }

 export const updateUserInfo = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
   try {
    const {name, email} = req.body as IUpdateUserInfo

    const userId =  req.user?._id; //req.user not req.body
    console.log('req.user=====>',req.user);
    
    const user = await userModel.findById(userId)
    console.log('user=====>',user);
    // const user = req.user //this is not used as we need to make sure we are not forgetting about mongoose!!

    if(email && user){
        const isEmailExist = await userModel.findOne({email})
        if(isEmailExist){
            return next(new ErrorHandler("Email already exist",400))
        }
        user.email = email;
    }
    if(name && user){
        const isNameExist = await userModel.findOne({name})
        if(isNameExist){
            return next(new ErrorHandler("Name already exist",400))
        }
        user.name = name;
    }

    // now save this on mongoose
    await user?.save();

    // update it on redis
    await redis.set(userId,JSON.stringify(user));
    
    console.log('useron redis=====>',user);

    res.status(201).json({
        success: true,
        user
    })

   } catch (error:any) {
    return next(new ErrorHandler(error.message,400))
   }

 })


 //update password
 interface IUpdateUserPassword{
    oldPassword: string;
    newPassword: string;
 }

 export const updateUserPassword = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {oldPassword,newPassword} = req.body as IUpdateUserPassword;

        //no black field
        if(!oldPassword || !newPassword){
            return next(new ErrorHandler("Enter both old and new password",400))
        }
        // // we won't get user like this
        // const user = req.user

        // // we'll get it from redis
        // const user = await redis.get(req.user?_id)

        //either of the above is not working (user)
        //so we'll try this
        //here we didn't use the redis on as the password has to de decrypted we used "bcrypt" and we used it in our "mongo" schem/model that's why we are no using (redis) one
        const user = await userModel?.findById(req.user?._id).select("+password")
        // console.log("========>",user);

        //this is writen so that user is not undefined
        if(user?.password === undefined){
            return next(new ErrorHandler("Invalid user",400))
        }

        const isPasswordMatch = await user?.comparePassword(oldPassword)
        if(!isPasswordMatch){
            return next(new ErrorHandler("Invalid old password",400))
        }

        //set the user password
        user.password = newPassword //showing undefined so we had to go 5 lines up

        //save the user to 'mongoDB'
        await user.save();

        //Also update this on redis
        await redis.set(req.user?._id, JSON.stringify(user))

        //provide the response
        res.status(201).json({
            success: true,
            user
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
 })


 //update profile picture or avatar
 //we'll store it in cloudinary
 interface IUpdateProfilePicture{
    avatar:string;
 }

 export const updateProfilePicture = CatchAsyncError(async(req:Request, res:Response,next:NextFunction) =>{
    try {

        
    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
 })