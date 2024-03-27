require("dotenv").config();

import { app } from "./app";
import connectToDB from "./utils/db";



app.listen(process.env.PORT , ()=>{
    console.log(`server is connented with ${process.env.PORT}`);
    connectToDB();

})