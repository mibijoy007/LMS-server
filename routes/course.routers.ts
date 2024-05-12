import express from 'express'
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, updateAccessToken, updateProfilePicture, updateUserInfo, updateUserPassword } from '../controllers/user.controller';
import { authRoles, isAuthenticated } from '../middleware/auth';
import { addQuestion, addReply, addReplyToReview, addReview, editCourse, getAllCourses, getAllCoursesUnpurchased, getCourseByUser, getSingleCourse, uploadCourse } from '../controllers/course.controller';
import { ADDRCONFIG } from 'dns';

const courseRouter = express.Router();

courseRouter.post('/create-course', isAuthenticated, authRoles("admin") , uploadCourse)

courseRouter.put('/edit-course/:id', isAuthenticated, authRoles("admin") , editCourse)

courseRouter.get('/get-course-unpurchased/:id', getSingleCourse)

courseRouter.get('/get-all-courses-unpurchased', getAllCoursesUnpurchased)

courseRouter.get('/get-course-content-purchased/:id',isAuthenticated, getCourseByUser)

courseRouter.put('/add-question',isAuthenticated, addQuestion)

courseRouter.put('/add-reply-to-question',isAuthenticated, addReply)

courseRouter.put('/add-review/:id',isAuthenticated, addReview)

courseRouter.put('/add-reply-to-review',isAuthenticated,authRoles("admin"), addReplyToReview)

//get all courses (both purchased and unpurchased) ((admin only))
courseRouter.get('/get-all-courses',isAuthenticated,authRoles("admin"), getAllCourses)



export default courseRouter;