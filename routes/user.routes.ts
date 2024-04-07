import express from 'express'
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, updateAccessToken, updateProfilePicture, updateUserInfo, updateUserPassword } from '../controllers/user.controller';
import { authRoles, isAuthenticated } from '../middleware/auth';

const userRouter = express.Router();

userRouter.post('/registration', registrationUser);

userRouter.post('/activate-user', activateUser )

userRouter.post('/login-user', loginUser)

userRouter.get('/logout-user', isAuthenticated, logoutUser)

userRouter.get('/update-token',updateAccessToken)

//this one is for getting user info
userRouter.get('/me', isAuthenticated, getUserInfo)


userRouter.put('/update-user-info', isAuthenticated, updateUserInfo)

userRouter.put('/update-user-password', isAuthenticated, updateUserPassword)

userRouter.put('/update-user-avatar', isAuthenticated, updateProfilePicture)

export default userRouter;