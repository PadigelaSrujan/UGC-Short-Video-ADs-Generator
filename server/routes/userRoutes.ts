import express, { Express } from "express";
import { getAllProjects, getProjectById, getUserCredits, toggleProjectPublic } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";


const userRouter=express.Router();
userRouter.get("/credits",protect,getUserCredits);
userRouter.get("/projects",protect,getAllProjects);
userRouter.get("/projects/:id",protect,getProjectById);
userRouter.post("/projects/:id/toggle-public",protect,toggleProjectPublic);

export default userRouter;