import { Router } from "express";
import {
  getTransactions,
  postTransactions,
} from "../controllers/transactions.controller.js";
import { authValidation } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validateSchema.middlewares.js";
import { transactionsSchemas } from "../schemas/transactions.schema.js";

const transactionsRouter = Router();

transactionsRouter.post("/transactions",authValidation, validateSchema(transactionsSchemas) , postTransactions);
transactionsRouter.get("/transactions",authValidation, getTransactions);

export default transactionsRouter;
