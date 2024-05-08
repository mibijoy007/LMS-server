import mongoose, { Model, Schema } from "mongoose";


interface IOrder extends Document{
    userId: string;
    courseId: string;
    payment_info: object;
}

// const orderSchema = new Schema<IOrder>() //this one is recommended for mongoose
// const orderSchema:IOrder = new Schema()
const orderSchema = new Schema<IOrder>({
    userId:{
        type: String,
        required: true,
    },
    courseId:{
        type:String,
        required: true,
    },
    payment_info:{
        type: Object,
        // required: true, // we'll initiate this in production
    }
},
{timestamps: true})

const OrderModel: Model<IOrder> = mongoose.model("Order",orderSchema);
export default OrderModel;