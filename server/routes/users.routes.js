import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  changePassword,
} from "../controllers/user.controller.js";
import authorize from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.use(authorize);

userRouter.get("/profile", authorize, getUserProfile);
userRouter.put("/profile", authorize, updateUserProfile);
userRouter.delete("/", authorize, deleteUserAccount);
userRouter.put("/password", authorize, changePassword);

export default userRouter;
