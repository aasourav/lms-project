import express, { NextFunction, Request, Response } from "express";
export const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import ErrorMiddleware from "./middleware/error";

//body parser
app.use(express.json({ limit: "50mb" }));
//cookies parser
app.use(cookieParser());
// cors origin
app.use(cors({ origin: process.env.ORIGIN }));

//testing api
app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Api is working well",
  });
});

//unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
