import express from "express"
import { authRoles, isAuthenticated } from "../middleware/auth";
import { createOrder, getAllOrders } from "../controllers/order.controller";
const orderRouter = express.Router();

orderRouter.post('/create-order', isAuthenticated,createOrder)

//get all orders ((admin only))
orderRouter.get('/get-all-orders',isAuthenticated,authRoles("admin"), getAllOrders)



export default orderRouter;