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
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const layoutDoc = await LayoutModel.findOne({ type });
      if (layoutDoc) {
        return next(new ErrorHandler(`You already have ${type}`, 400));
      }

      if (type === "banner") {
        const { image, title, subtitle } = req.body;
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });
        const banner = {
          image: {
            publicId: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subtitle,
        };
        await LayoutModel.create({ banner });
      }
      if (type === "faq") {
        const { faq } = req.body;
        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );
        await LayoutModel.create({ type: "faq", faq: faqItems });
      }
      if (type === "categories") {
        const { categories } = req.body;
        const categoriesItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.create({ type, categories: categoriesItems });
      }

      return res
        .status(201)
        .json({ success: true, message: "Layout created successfully" });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);
