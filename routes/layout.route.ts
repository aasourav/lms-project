import express from "express";
import { authRoles, isAuthenticated } from "../middleware/auth";
import { createLayout } from "../controllers/layout.controller";
const layoutRouter = express.Router();

layoutRouter.post(
  "/create-layout",
  isAuthenticated,
  authRoles("admin"),
  createLayout
);
export default layoutRouter;
