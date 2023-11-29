import mongoose from "mongoose";

require("dotenv").config();

const dbUrl: string = process.env.DB_URL || "";
export const connectDb = async () => {
  try {
    await mongoose.connect(dbUrl).then(() => {
      console.log("db connected");
    });
  } catch (err: any) {
    console.log(err);
    setTimeout(() => connectDb, 5000);
  }
};
