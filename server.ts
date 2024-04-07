require("dotenv").config();

import { app } from "./app";
import {v2 as cloudinary} from 'cloudinary';
import connectToDB from "./utils/db";

          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME as string, 
  api_key: process.env.API_KEY as string, 
  api_secret: process.env.API_SECRET  as string
});

app.listen(process.env.PORT , ()=>{
    console.log(`server is connented with ${process.env.PORT}`);
    connectToDB();

})