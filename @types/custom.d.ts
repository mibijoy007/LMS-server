// import { Request } from "express";
import { IUser } from "../models/user.model";


// The purpose of this declaration is to extend the Request object in Express to include an optional user property. This is commonly used for adding custom properties or augmenting existing Express types to provide additional functionality or data access throughout your application.
declare global {
    namespace Express{
        interface Request{
            user?: IUser 
        }
    }
}