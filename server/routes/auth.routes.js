import { Router } from "express";
import {
  getUserData,
  signIn,
  signOut,
  signUp,
  verifyRole,
} from "../controllers/auth.controller.js";
import authorize from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", authorize, signOut);
authRouter.get("/me", authorize, getUserData);
authRouter.get("/verify-role", authorize, verifyRole);

export default authRouter;
