import { Document, model, Schema } from "mongoose";


export interface FaqItem extends Document{
    question: string;
    answer: string;
}

export interface Category extends Document{
    title: string;
}

interface BannerImage extends Document{
    public_id:string;
    url:string;
}

interface Layout extends Document{
    type: string;
    faq: FaqItem[];
    category: Category[];
    banner:{
        image: BannerImage;
        title: string;
        subTitle: string;
    }
}


// now the Schemas
const FaqSchema = new Schema<FaqItem>({
    question:{type:String},
    answer:{type:String},
})

const CategorySchema = new Schema<Category>({
    title:{type: String}
})

const BannerImageSchema = new Schema<BannerImage>({
    public_id:{type: String},
    url:{type: String},
})

const LayoutSchema = new Schema<Layout>({
    type:{type: String},
    faq: [FaqSchema],
    category: [CategorySchema],
    banner:{
        image: BannerImageSchema,
        title: {type: String},
        subTitle: {type: String}
    }
})


// the model for layout
const LayoutModel = model<Layout>('Layout',LayoutSchema);

export default LayoutModel;