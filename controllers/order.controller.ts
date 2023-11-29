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
import OrderModel, { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import { newOrder } from "../services/order.services";
import sendMail from "../utils/sendmail";
import NotificationModel from "../models/notification.model";

// create order
export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.body as IOrder;

      const userDoc = await userModel.findById(req.user?._id);

      const courseExistInUser = userDoc?.courses.some(
        (course: any) => course._id.toString() === courseId
      );

      if (courseExistInUser) {
        return next(new ErrorHandler("You already purchased this course", 500));
      }

      const courseDoc = await CourseModel.findById(courseId);

      if (!courseDoc) {
        return next(new ErrorHandler("Course not found", 500));
      }

      const data: any = {
        courseId: courseDoc._id,
        userId: userDoc?._id,
      };

      const mailData = {
        order: {
          _id: courseDoc.id.slice(0, 6),
          name: courseDoc.name,
          price: courseDoc.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      try {
        if (userDoc?.email) {
          await sendMail({
            email: userDoc?.email,
            subject: "Order confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
      }

      userDoc?.courses.push(courseDoc._id);

      await userDoc?.save();

      await NotificationModel.create({
        userId: userDoc?._id,
        title: "New Order",
        message: `You have a new Order from ${courseDoc.name}`,
      });

      if (courseDoc.purchased !== undefined) {
        courseDoc.purchased += 1;
      }

      await courseDoc.save();

      newOrder(data, res, next); // why we need to send res
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

export const getAllOrders = CatchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const orderDocs = await OrderModel.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, orderDocs });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);
