import type { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../utils/client.js";
import { getRestaurantKeyById } from "../utils/keys.js";
import { errorResponse } from "../utils/response.js";

export const checkRestaurantIdInRedis = async (
  req: Request<{ restaurantId: string }>,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.restaurantId;
  if (!id) {
    errorResponse(res, 400, "restaurantId is required");
  }
  const client = await getRedisClient();
  const restaurantKey = getRestaurantKeyById(id);
  const result = await client.exists(restaurantKey);
  if (!result) {
    errorResponse(res, 404, "No restaurant found");
  }
  next();
};
