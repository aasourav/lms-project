import express from "express";
import { authRoles, isAuthenticated } from "../middleware/auth";
import { createOrder } from "../controllers/order.controller";
import {
  getNotifications,
  updateNoification,
} from "../controllers/notification.controller";
const notificationRouter = express.Router();

notificationRouter.post("/create-order", isAuthenticated, createOrder);

notificationRouter.get(
  "/get-all-notifications",
  isAuthenticated,
  authRoles("admin"),
  getNotifications
);

notificationRouter.get(
  "/update-notifications/:id",
  isAuthenticated,
  authRoles("admin"),
  updateNoification
);

export default notificationRouter;
