// export const getRoutes = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//     } catch (err: any) {
//       return next(new ErrorHandler(err.message, 500));
//     }
//   }
// );

import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import NotificationModel from "../models/notification.model";

// get all notification  -- only admin
export const getNotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationDocs = await NotificationModel.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        notificationDocs,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

export const updateNoification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationDoc = await NotificationModel.findById(req.params.id);

      if (!notificationDoc) {
        return next(new ErrorHandler("notification not found", 500));
      }
      notificationDoc.status = "read";
      notificationDoc.save();

      const notificationDocs = NotificationModel.find().sort({
        createdAt: -1,
      });

      return res.status(200).json({ success: true, notificationDocs });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);
