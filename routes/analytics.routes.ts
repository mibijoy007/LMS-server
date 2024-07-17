import express from "express";
import { authRoles, isAuthenticated } from "../middleware/auth";
import { getCoursesAnalytics, getOrdersAnalytics, getUserAnalytics } from "../controllers/analytics.controller";

const analyticsRouter = express.Router();

analyticsRouter.get("/get-user-analytics",isAuthenticated,authRoles('admin'),getUserAnalytics)

analyticsRouter.get("/get-courses-analytics",isAuthenticated,authRoles('admin'),getCoursesAnalytics)

analyticsRouter.get("/get-orders-analytics",isAuthenticated,authRoles('admin'),getOrdersAnalytics)

export default analyticsRouter;