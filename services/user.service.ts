import { Response } from "express";
import userModel from "../models/user.model"
import { redis } from "../utils/redis";


//get user by id
export const getUserById = async (id:string, res:Response) => {
    //we'll get the info from redis not mongo
    // const user = await userModel.findById(id);
    const userInJson = await redis.get(id)

    if(userInJson){
        const user = await JSON.parse(userInJson)
        // console.log('uuuuuuuuu==>',user);
        
        return res.status(200).json({
            success: true,
            user,
        })
    }
}