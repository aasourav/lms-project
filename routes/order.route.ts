import express from "express";
import { authRoles, isAuthenticated } from "../middleware/auth";
import { createOrder } from "../controllers/order.controller";
const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.post(
  "/get-orders",
  isAuthenticated,
  authRoles("admin"),
  createOrder
);
export default orderRouter;
