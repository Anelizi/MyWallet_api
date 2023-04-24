import { Router } from "express";
import { getUp, postIn, postUp } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/sign-up", postUp);
userRouter.post("/sign-in", postIn);
userRouter.get("/sign-up", getUp);

export default userRouter;
