import express from 'express'
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, updateAccessToken, updateProfilePicture, updateUserInfo, updateUserPassword } from '../controllers/user.controller';
import { authRoles, isAuthenticated } from '../middleware/auth';
import { editCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from '../controllers/course.controller';

const courseRouter = express.Router();

courseRouter.post('/create-course', isAuthenticated, authRoles("admin") , uploadCourse)
courseRouter.put('/edit-course/:id', isAuthenticated, authRoles("admin") , editCourse)

courseRouter.get('/get-course-unpurchased/:id', getSingleCourse)

courseRouter.get('/get-all-courses-unpurchased', getAllCourses)

courseRouter.get('/get-course-content-purchased/:id',isAuthenticated, getCourseByUser)



export default courseRouter;