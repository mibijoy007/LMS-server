class ErrorHandler extends Error{
    statusCode:number;
    // status: string
    constructor(message:any,statusCode:number){
        super(message)
            this.statusCode = statusCode
            //the line below is used in a middleware
            // this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'

            Error.captureStackTrace(this,this.constructor)
    }
}

export default ErrorHandler;