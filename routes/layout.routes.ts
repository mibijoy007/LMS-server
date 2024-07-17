import express from "express";
import { authRoles, isAuthenticated } from "../middleware/auth";
import { createLayout, editLayout, getLayoutData } from "../controllers/layout.controller";

const layoutRouter = express.Router();

layoutRouter.post("/create-layout",isAuthenticated,authRoles('admin'),createLayout)

layoutRouter.put("/edit-layout",isAuthenticated,authRoles('admin'),editLayout)

// this is for all to show all layout data
layoutRouter.get("/get-layout",isAuthenticated, getLayoutData)

export default layoutRouter;