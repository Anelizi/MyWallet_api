import { Router } from "express";
import transactionsRouter from "./transactions.routes.js";
import userRouter from "./user.routes.js";

const router = Router();

router.use(transactionsRouter);
router.use(userRouter);

export default router;
