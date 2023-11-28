import express from "express";
import {
  activateUser,
  changePassword,
  getAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registrationUser,
  socialAuth,
  updateAccessToken,
  updateAvatar,
  updateUserRole,
} from "../controllers/user.controllers";
import { authRoles, isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/refresh-token", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth);
userRouter.put("/update-user", isAuthenticated, socialAuth);
userRouter.put("/change-password", isAuthenticated, changePassword);
userRouter.put("/update-avatar", isAuthenticated, updateAvatar);
userRouter.put("/get-users", isAuthenticated, authRoles("admin"), getAllUsers);
userRouter.put(
  "/update-user-role",
  isAuthenticated,
  authRoles("admin"),
  updateUserRole
);
export default userRouter;
