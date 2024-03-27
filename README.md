This is an Express app with Typescript

## Getting Started

First, setup the .env file:

```bash

PORT=3000

ORIGIN = ['http://localhost:3000']


# this can be (produciton or development or others)
NODE_ENV = 

MONGODB_CONNECTION_STRING=

CLOUDINARY_URL=

REDIS_URL = 


#jwt
ACTIVATION_SECRET= 

#email smtp
SMTP_HOST = 
SMTP_PORT = 
SMTP_SERVICE = 
SMTP_MAIL = 
SMTP_PASSWORD = 

#login or logout user(just some random ones)
SIGN_IN_OUT_ACCESS_TOKEN=
SIGN_IN_OUT_REFREASH_TOKEN=

#session
SIGN_IN_OUT_ACCESS_TOKEN_EXPIRE=
SIGN_IN_OUT_REFREASH_TOKEN_EXPIRE=
```


Second, run the development server:

#We used the "ts-node-dev" to run our server

```bash
npm run dev
# or
yarn dev

```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app.ts`. The page auto-updates as you edit the file.



## Try this and let me know.



