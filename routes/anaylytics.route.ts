import express from "express";
import { authRoles, isAuthenticated } from "../middleware/auth";
import {
  getOrderAnalytics,
  getUserAnalytics,
} from "../controllers/analytics.controller";
const analyticsRoute = express.Router();

analyticsRoute.get(
  "/get-users-analytics",
  isAuthenticated,
  authRoles("admin"),
  getUserAnalytics
);
analyticsRoute.get(
  "/get-order-analytics",
  isAuthenticated,
  authRoles("admin"),
  getOrderAnalytics
);
analyticsRoute.get(
  "/get-course-analytics",
  isAuthenticated,
  authRoles("admin"),
  getUserAnalytics
);
export default analyticsRoute;
