import "./configs/instrument.mjs"
import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import clerkwebhook from "./controllers/clerk.js";
import * as Sentry from "@sentry/node";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";



const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkwebhook)
app.use(express.json());
app.use(clerkMiddleware())

const port = process.env.PORT || 5000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});

app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

Sentry.setupExpressErrorHandler(app);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});