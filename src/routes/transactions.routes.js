import { Router } from "express";
import {
  getTransactions,
  postTransactions,
} from "../controllers/transactions.controller.js";

const transactionsRouter = Router();

transactionsRouter.post("/transactions", postTransactions);
transactionsRouter.get("/transactions", getTransactions);

export default transactionsRouter;
