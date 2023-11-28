import express from "express";
import {
  addAnswer,
  addQuestion,
  addReview,
  deleteCourse,
  editCourse,
  getAllCourses,
  getAllCoursesAdmin,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/coursae.controllers";
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
  editCourse
);

courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourses);

//test why do we need isAuth ,
//note bofore isAuth is shows you are not eligible
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser);

courseRouter.put("/add-question", isAuthenticated, addQuestion);

courseRouter.put("/add-answer", isAuthenticated, addAnswer);
courseRouter.put("/add-review/:id", isAuthenticated, addReview);
courseRouter.put("/add-reply", isAuthenticated, authRoles("admin"), addReview);
courseRouter.get(
  "/get-all-courses-admin",
  isAuthenticated,
  authRoles("admin"),
  getAllCoursesAdmin
);
courseRouter.delete(
  "/delete-course",
  isAuthenticated,
  authRoles("admin"),
  deleteCourse
);
export default courseRouter;
