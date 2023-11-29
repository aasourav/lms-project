import express from "express";
import { authRoles, isAuthenticated } from "../middleware/auth";
import {
  createLayout,
  editLayout,
  getLayoutByType,
} from "../controllers/layout.controller";
const layoutRouter = express.Router();

layoutRouter.post(
  "/create-layout",
  isAuthenticated,
  authRoles("admin"),
  createLayout
);

layoutRouter.put(
  "/edit-layout",
  isAuthenticated,
  authRoles("admin"),
  editLayout
);

layoutRouter.post("/get-layout", getLayoutByType);
export default layoutRouter;
