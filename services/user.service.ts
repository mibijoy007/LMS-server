import { Response } from "express";
import userModel from "../models/user.model"


//get user by id
export const getUserById = async (id:string, res:Response) => {
    const user = await userModel.findById(id);
    // console.log('uuuuuuuuu==>',user);
    
    return res.status(200).json({
        success: true,
        user,
    })
}