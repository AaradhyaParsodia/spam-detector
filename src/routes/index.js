import express from "express";
import { userRouter } from "./user.js";

export const rootRouter = express.Router();

// index route handler for user routes
rootRouter.use('/user', userRouter);