require('dotenv').config()

import mongoose, { Schema , Document, Model } from "mongoose";
import { Extension } from "typescript";

//for the comment replies
interface IComment extends Document{
    user: object;
    comment: string;
    commentReplies?: IComment[];
}
//review for the course
interface IReview extends Document{
    user: object;
    rating: number;
    comment: string;
    commentReplies: IComment[];
}

//link
interface ILink extends Document{
    title:string;
    url: string;
}

//
interface ICourseData extends Document{
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail: object; //from cloudinary so we'll get our desired thing form that "Object"
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: ILink[];
    suggestion: string;
    questions: IComment[];
}

interface ICourse extends Document{
    name:string;
    description?: string;
    price: number;
    estimatedPrice?: number;
    thumbnail: object;
    tags: string;
    level:string;
    demoUrl: string;
    benefits: {title:string[]};
    prerequisites: {title: string[]};
    reviews: IReview[];
    courseData: ICourseData; //ICourseData[]
    ratings?: number;
    purchased?: number;
}

//interfaces done


//the followings are schemas
const rewiewSchema = new Schema<IReview>({
    user: Object,
    rating:{
        type:Number,
        default:0,
    },
    comment:String
})

const linkSchema = new Schema<ILink> ({
    title: String,
    url: String
})

const commentSchema = new Schema<IComment> ({
    user: Object,
    comment:String,
    commentReplies: [Object]
})

const courseDataSchema = new Schema<ICourseData>({
    videoUrl: String,
    title: String,
    description: String,
    // videoThumbnail: Object, 
    videoSection: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema],
})

const courseSchema = new Schema<ICourse>({
    name:{
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatedPrice: {
        type: Number,
        required: true,
    },
    thumbnail: {
        public_id:{
            type: String,
            // required: true,
        },
        url: {
            type: String,
            // required: true,
        },
    },
    tags: {
        type: String,
        required: true,
    },
    level:{
        type: String,
        required: true,
    },
    demoUrl: {
        type: String,
        // required: true,
    },
    benefits: [{title: String}],
    prerequisites: [{title: String}],
    reviews: [rewiewSchema],
    courseData: [courseDataSchema], 
    ratings: {
        type:Number,
        default: 0
    },
    purchased: {
        type: Number,
        default: 0
    }
})

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);

export default CourseModel;