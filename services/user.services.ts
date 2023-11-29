import { Response } from "express";
import { redis } from "../utils/redis";

// get user by id
export const getUserById = async (id: string, res: Response) => {
  const user = await redis.get(id);
  if (user) {
    res.status(200).json({
      status: "success",
      user: JSON.parse(user),
    });
  }
};
