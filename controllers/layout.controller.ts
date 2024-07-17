import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import {v2 as cloudinary} from 'cloudinary';
import LayoutModel, { Category, FaqItem } from "../models/layout.model";



// creating layout
export const createLayout = CatchAsyncError(async(req:Request,res:Response,next:NextFunction) =>{
    try {
        const {type} = req.body;    

        //let's see if some already exists then we'll show error you can edit then but for now you can't make them again
        const istypeExist = await LayoutModel.findOne({type});
        // console.log("istypeExist======> ",istypeExist, type);
        if(istypeExist){
            return next(new ErrorHandler(`${type} already exists`,400))
        }


        //banner
        if(type === "Banner"){
            const {image,title,subTitle} = req.body;
            const myCloudLayoutBannerImage = await cloudinary.uploader.upload(image,{
                folder:"layout",
            });

        const banner = {
            image: {
                public_id: myCloudLayoutBannerImage.public_id,
                url : myCloudLayoutBannerImage.secure_url
            },
            title,
            subTitle
            }
        await LayoutModel.create(banner)
        }

        //faq
        if(type === 'FAQ'){
            const {faq} = req.body;
            // const {question,answer} = req.body;  //faq is an array not an object
    
        //faq is an array so we have to write code according to that
        const faqItems = await Promise.all(
            faq.map(async(item : FaqItem) => {
                return {
                    question: item.question,
                    answer : item.answer
                }
            })
        )
        await LayoutModel.create({type:"FAQ", faq : faqItems})
        }


        //categories
        if(type === 'Categories'){
            const {categories}:{categories:Category[] } = req.body;
            const categoriesItems =await Promise.all(
                categories.map(async(item : Category) => {
                    return {
                        title: item.title
                    }
                })
            )
            // console.log(categoriesItems);
            
            await LayoutModel.create({ type: "Categories" , category: categoriesItems}); //see in the layoutschema 'category' not 'categories
        }
        

        res.status(201).json({
            success:true,
            message:`${type} in Layout created successfully`
        })


    } catch (error:any) {
        // return next(new ErrorHandler(`haha ${error.messge}`,500))
        return next(new ErrorHandler(error.message,500))
    }
})





// edit layout
export const editLayout = CatchAsyncError(async(req:Request,res:Response,next:NextFunction) =>{
    try {
        const {type} = req.body;    

        //banner
        if(type === "Banner"){
            //let's delete the previous one first
            const bannerData : any  = await LayoutModel.findOne({type : "Banner"})
            // console.log("bannerData====>  ",bannerData);
            
            if(bannerData){
                await cloudinary.uploader.destroy(bannerData.image.public_id) //this is in ''image' folder in cloudinary
            }

            //now upload it again
            const {image,title,subTitle} = req.body;
            const myCloudLayoutBannerImage = await cloudinary.uploader.upload(image,{
                folder:"layout",
            });

        const banner = {
            image: {
                public_id: myCloudLayoutBannerImage.public_id,
                url : myCloudLayoutBannerImage.secure_url
            },
            title,
            subTitle
            }

            //put it in mongo
            await LayoutModel.findByIdAndUpdate( bannerData._id   , banner)
        }


        //faq
        if(type === 'FAQ'){

            //previous data
            const faqData : any = await LayoutModel.findOne({type : 'FAQ'})

            const {faq}:{faq:FaqItem[] }  = req.body;
            // const {question,answer} = req.body;  //faq is an array not an object
    
        //faq is an array so we have to write code according to that
        const faqItems = await Promise.all(
            faq.map(async(item : FaqItem) => {
                return {
                    question: item.question,
                    answer : item.answer
                }
            })
        )

        // console.log("faqData=====> ",faqData);   
        
        //save it in mongo
        if(faqData){
            await LayoutModel.findByIdAndUpdate(faqData?._id, {type:"FAQ", faq : faqItems})
        }

        }



        //categories
        if(type === "Categories"){
            //previous data
            const categoryData : any = await LayoutModel.findOne({type : "Categories"})

            const {categories}:{categories:Category[] } = req.body;
            const categoriesItems =await Promise.all(
                categories.map(async(item : Category) => {
                    return {
                        title: item.title
                    }
                })
            )
            // console.log(categoryData);
            
            await LayoutModel.findByIdAndUpdate(categoryData?._id,{ type: "Categories" , category: categoriesItems}); //see in the layoutschema 'category' not 'categories
        }
        

        res.status(201).json({
            success:true,
            message:`${type} in Layout updated successfully`
        })


    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})



//get layout data by 'type' > ( FAQ, Banner, Categories )

export const getLayoutData = CatchAsyncError(async(req:Request,res:Response,next:NextFunction) =>{
 try {
    const {type} = req.body;
    const LayoutData = await LayoutModel.findOne({type})

    res.status(201).json({
        success: true,
        LayoutData
    })
    
 } catch (error:any) {
    return next(new ErrorHandler(error.message,500))
 }
})