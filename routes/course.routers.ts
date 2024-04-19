import express from 'express'
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, updateAccessToken, updateProfilePicture, updateUserInfo, updateUserPassword } from '../controllers/user.controller';
import { authRoles, isAuthenticated } from '../middleware/auth';
import { uploadCourse } from '../controllers/course.controller';

const courseRouter = express.Router();

courseRouter.post('/create-course', isAuthenticated, authRoles("admin") , uploadCourse)



export default courseRouter;