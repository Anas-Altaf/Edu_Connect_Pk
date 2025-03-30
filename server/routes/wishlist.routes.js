import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  getFilteredWishlist,
  getWishlistCount,
} from "../controllers/wishlist.controller.js";
import authorize, { authorizeRoles } from "../middleware/auth.middleware.js";

const wishlistRouter = Router();

// All wishlist routes require student role
wishlistRouter.use(authorize);
wishlistRouter.use(authorizeRoles("student"));

wishlistRouter.post("/", addToWishlist);
wishlistRouter.get("/", getWishlist);
wishlistRouter.delete("/:tutorId", removeFromWishlist);
wishlistRouter.get("/filtered", getFilteredWishlist);
wishlistRouter.get("/count", getWishlistCount);

export default wishlistRouter;
