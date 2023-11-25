import express from "express";
import { uploadCourse } from "../controllers/coursae.controllers";
import { authRoles, isAuthenticated } from "../middleware/auth";
const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAuthenticated,
  authRoles("admin"),
  uploadCourse
);

courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authRoles("admin"),
  uploadCourse
);
export default courseRouter;
