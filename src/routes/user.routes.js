import { Router } from "express";
import { getUp, postIn, postUp } from "../controllers/user.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middlewares.js";
import { userSchemas } from "../schemas/user.schema.js"

const userRouter = Router();

userRouter.post("/sign-up", validateSchema(userSchemas), postUp);
userRouter.post("/sign-in", postIn);
userRouter.get("/sign-up", getUp);

export default userRouter;
