import express from "express";
import * as controller from "../controller/user.js";
import authMiddleware from "../middleware/userMiddleware.js";

export const userRouter = express.Router();

// User Routes
userRouter.post('/signup', controller.signup);
userRouter.post('/signin', controller.signin);
userRouter.put('/markspam/:number', authMiddleware, controller.markAsSpam);
userRouter.get('/search-by-name/:search', authMiddleware, controller.searchByName);
userRouter.get('/search-by-number/:search', authMiddleware, controller.searchByNumber);