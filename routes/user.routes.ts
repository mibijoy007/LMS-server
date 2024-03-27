import express from 'express'
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, updateAccessToken } from '../controllers/user.controller';
import { authRoles, isAuthenticated } from '../middleware/auth';

const userRouter = express.Router();

userRouter.post('/registration', registrationUser);

userRouter.post('/activate-user', activateUser )

userRouter.post('/login-user', loginUser)

userRouter.get('/logout-user', isAuthenticated, logoutUser)

userRouter.get('/update-token',updateAccessToken)

//this one is for getting user info
userRouter.get('/me', isAuthenticated, getUserInfo)

export default userRouter;