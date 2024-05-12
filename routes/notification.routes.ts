import express from "express"
import { authRoles, isAuthenticated } from "../middleware/auth"
import { getAllNotifications, updateNotifications } from "../controllers/notification.controller"

const notificationRouter = express.Router()

notificationRouter.get("/get-all-notifications",isAuthenticated,getAllNotifications)

notificationRouter.put("/update-notifications/:id", isAuthenticated, authRoles("admin") ,updateNotifications)

export default notificationRouter;