import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";

// export const getRoutes = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//     } catch (err: any) {
//       return next(new ErrorHandler(err.message, 500));
//     }
//   }
// );

import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { createCourse } from "../services/course.service";
import CourseModel, { IReview } from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import sendMail from "../utils/sendmail";
import NotificationModel from "../models/notification.model";

//upload course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      createCourse(data, res, next);
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

//edit course
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const thumbnail = data.thumbnail;
      const courseId = req.params.id;
      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );

      res.status(201).json({ success: true, course });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

//get single course -- without purchasing

export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCacheExist = await redis.get(courseId);
      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        return res.status(200).json({
          success: true,
          course,
        });
      }
      const course = await CourseModel.findById(req.params.id).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );
      await redis.set(courseId, JSON.stringify(course));
      return res.status(200).json({ success: true, course });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// get all courses without purchasing

export const getAllCourses = CatchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExist = await redis.get("allCourses");
      if (isCacheExist) {
        const courses = JSON.parse(isCacheExist);
        return res.status(200).json({
          success: true,
          courses,
        });
      }
      const courses = await CourseModel.find().select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );
      await redis.set("allCourses", JSON.stringify(courses));
      return res.status(200).json({ success: true, courses });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

//get course content --for valid user

export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      const isCourseDoc = await userCourseList?.find(
        (course: any) => course._id.toString() === courseId
      );

      if (!isCourseDoc) {
        return next(
          new ErrorHandler("Not eligible to access this course", 404)
        );
      }

      const courseDoc = await CourseModel.findById(courseId);
      const content = courseDoc?.courseData;
      return res.status(200).json({ status: true, content });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}
export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId, courseId, question } = req.body as IAddQuestionData;
      const courseDoc = await CourseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }
      const courseContent = courseDoc?.courseData.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      //create a new question
      const newQuestion: any = {
        user: req?.user,
        question,
        questionReplies: [],
      };

      //add this question to our course content
      courseContent.questions.push(newQuestion);

      await NotificationModel.create({
        userId: req.user?._id,
        title: "New Question",
        message: `You have a new question from ${courseContent.title}`,
      });

      //save the updated course
      await courseDoc?.save();

      res.status(200).json({
        success: true,
        courseDoc,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// add answer in course question
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, contentId, courseId, questionId } =
        req.body as IAddAnswerData;

      const courseDoc = await CourseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }
      const courseContent = courseDoc?.courseData.find((item: any) =>
        item._id.equals(contentId)
      );

      const question = courseContent?.questions.find((item: any) =>
        item._id.equals(questionId)
      );

      if (!question) {
        return next(new ErrorHandler("Invalid question id", 400));
      }

      // create answer
      const newAns: any = {
        user: req.user,
        answer,
      };

      question.questionReplies.push(newAns);
      await courseDoc?.save();

      if (req?.user?._id === question.user._id) {
        //create notification
        await NotificationModel.create({
          userId: req.user?._id,
          title: "New Question reply received",
          message: `You have a new question reply from ${courseContent?.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent?.title,
        };

        try {
          await sendMail({
            email: question.user.email,
            subject: "Question reply",
            template: "question-reply.ejs",
            data,
          });
        } catch (err) {}
      }
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// add review in course
interface IAddReviewData {
  review: string;
  courseId: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      //check if course id already exist in user course list
      const courseExists = userCourseList?.some(
        (course: any) => course._id.toString === courseId.toString()
      );

      if (!courseExists) {
        return next(new ErrorHandler("You are not eligible this course", 500));
      }

      const courseDoc = await CourseModel.findById(courseId);

      const { review, rating } = req.body as IAddReviewData;
      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };

      courseDoc?.reviews.push(reviewData);
      let avg = 0;
      courseDoc?.reviews.forEach((rev: IReview) => {
        avg += rev.rating;
      });

      if (courseDoc) {
        courseDoc.ratings = avg / courseDoc.reviews.length;
      }

      await courseDoc?.save();

      // const notification = {
      //   title: "new review received",
      //   message: `${req?.user.name} has given you a review in ${courseDoc?.name}`,
      // };

      //create notification

      return res.status(200).json({ success: true, courseDoc });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// add reply in review
interface IReplyReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}

export const addReplyReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IReplyReviewData;

      const courseDoc = await CourseModel.findById(courseId);

      if (!courseDoc) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const review = courseDoc.reviews.find(
        (rev: any) => rev._id.toString === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }
      review.commentReplies.push(replyData);

      await courseDoc?.save();

      res.status(200).json({ success: true, courseDoc });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);
