import mongoose, { Model, Schema } from "mongoose";

interface INotification extends Document{
    title: string;
    message: string;
    status: string;
    userId: string;
}

const notificaitonSchema = new Schema<INotification>({
    title:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true,
    },
    status:{
        type: String,
        required: true,
        default: "unread"
    },
    userId:{
        type: String,
        required: true,
    },
},{timestamps: true})


const NotificationModel: Model<INotification> = mongoose.model("Notification", notificaitonSchema);
export default NotificationModel;