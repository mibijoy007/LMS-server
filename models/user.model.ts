require('dotenv').config()

import mongoose, { Schema , Document, Model } from "mongoose";
import bcrypt from 'bcryptjs'
import { Scheduler } from "timers/promises";
import { timeStamp } from "console";
import jwt from "jsonwebtoken";



//email checking for validity
const emailRegexPettern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//custom interface from 'Document' type
export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    avatar:{
        public_id: string;
        url: string;
    },
    role: string;
    isVerified: boolean;
    courses: Array<{courseID:string}>;
    comparePassword: (password: string) => Promise<boolean>;
    SignInOutAccessToken: () => string;
    SignInOutRefreashToken: () => string;

}

//the userModle "Schema"
const userSchema : Schema<IUser> = new mongoose.Schema({
    name:{
        type: String,
        required: [true,"Please enter your name"]
    },
    email:{
        type: String,
        required: [true,"Please enter your email"],
        validate: {
            validator: (value:string) =>{
                return emailRegexPettern.test(value)
            },
            message: "Please enter a valid email"
        },
        unique: true
    },
    password:{
        type: String,
        required: [true,"Please enter your password"],
        minlength:[6,"Password must be at least 6 characters"],
        select: false
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role:{
        type:String,
        default: 'user'
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    courses: [
        {
            courseID: String
        }
    ]
},
{timestamps: true}
);

//hashing
userSchema.pre<IUser>('save', async function (next) {
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})


//sign in out access token(short time expried - 5min)
userSchema.methods.SignInOutAccessToken = function () {
    return jwt.sign({id: this._id}, process.env.SIGN_IN_OUT_ACCESS_TOKEN || '',
    {
        expiresIn:"5m"
    })
}

//sign in out refreash token(long time expried(3 days) - it helps generate "Access_token")
userSchema.methods.SignInOutRefreashToken = function(){
    return jwt.sign({id: this._id}, process.env.SIGN_IN_OUT_REFREASH_TOKEN || '',
    {
        expiresIn:"3d"
    })
}


//comparing passwords
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean>{
    return await bcrypt.compare(enteredPassword, this.password);
}



const userModel: Model<IUser> = mongoose.model("User",userSchema)
export default userModel;