import express, { type Request, Response } from "express";
import { validate } from "../middleware/validate.js";
import { Restaurant, RestaurantSchema } from "../schema/restaurant.js";
import { getRedisClient } from "../utils/client.js";
import { nanoid } from "nanoid";
import {
  getRestaurantKeyById,
  getRestaurantReviewsKeyById,
  getReviewDetailKeyById,
} from "../utils/keys.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { checkRestaurantIdInRedis } from "../middleware/checkRestaurantIdInRedis.js";
import { Review, ReviewSchema } from "../schema/review.js";

const router = express.Router();

router.post("/", validate(RestaurantSchema), async (req, res, next) => {
  const data = req.body as Restaurant;
  try {
    const client = await getRedisClient();
    const id = nanoid();
    const restaurantKey = getRestaurantKeyById(id);
    const hashData = {
      id: id,
      name: data.name,
      location: data.location,
      // cuisines: data.cuisines,
    };
    const addedResult = await client.hSet(restaurantKey, hashData);
    console.log(`addedResult to redis: ${addedResult}`);
    return successResponse(res, hashData, "Success");
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:restaurantId/reviews",
  checkRestaurantIdInRedis,
  validate(ReviewSchema),
  async (req: Request<{ restaurantId: string }>, res, next) => {
    const { restaurantId } = req.params;
    const data = req.body as Review;
    try {
      const client = await getRedisClient();
      //用req.params裡的restaurantId生成RestaurantReviewsKey，代表該餐廳的所有reviews的key
      const restaurantReviewsKey = getRestaurantReviewsKeyById(restaurantId);
      //為要新增的review隨機生成一個id
      const newRestaurantReviewId = nanoid();
      const newRestaurantReviewDetailKey = getReviewDetailKeyById(
        newRestaurantReviewId
      );
      const reviewHashData = {
        id: newRestaurantReviewId,
        rating: data.rating,
        review: data.review,
        restaurantId: restaurantId,
        timeStamp: Date.now(),
      };
      const result = await Promise.all([
        client.lPush(restaurantReviewsKey, newRestaurantReviewId),
        client.hSet(newRestaurantReviewDetailKey, reviewHashData),
      ]);
      return successResponse(res, result, "Success");
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:restaurantId/reviews",
  checkRestaurantIdInRedis,
  async (req: Request<{ restaurantId: string }>, res, next) => {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    try {
      const client = await getRedisClient();
      const restaurantReviewsKey = getRestaurantReviewsKeyById(restaurantId);
      const start = (Number(page) - 1) * Number(limit);
      const end = start + Number(limit) - 1;
      const existedRestaurantReviewsIds = await client.lRange(
        restaurantReviewsKey,
        start,
        end
      );
      const restaurantReviewDetails = await Promise.all(
        existedRestaurantReviewsIds.map((id) => {
          const restaurantReviewDetailKey = getReviewDetailKeyById(id);
          return client.hGetAll(restaurantReviewDetailKey);
        })
      );
      return successResponse(res, restaurantReviewDetails, "Success");
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:restaurantId/reviews/:reviewId",
  checkRestaurantIdInRedis,
  async (
    req: Request<{ restaurantId: string; reviewId: string }>,
    res,
    next
  ) => {
    const { restaurantId, reviewId } = req.params;
    try {
      const client = await getRedisClient();
      const restaurantKey = getRestaurantKeyById(restaurantId);
      const restaurantReviewDetailKey = getReviewDetailKeyById(reviewId);
      const [removed, deleted] = await Promise.all([
        client.lRem(restaurantReviewDetailKey, 0, reviewId),
        client.del(restaurantKey),
      ]);
      if(removed === 0) {
        errorResponse(res, 404, "No review found");
      }
      if (deleted === 0) {
        errorResponse(res, 404, "No review detail found");
      }
      return successResponse(res, { removed, deleted, reviewId }, "Success");
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:restaurantId",
  checkRestaurantIdInRedis,
  async (req: Request<{ restaurantId: string }>, res, next) => {
    const { restaurantId } = req.params;
    try {
      const client = await getRedisClient();
      const restaurantKey = getRestaurantKeyById(restaurantId);
      const [restaurant, views] = await Promise.all([
        client.hGetAll(restaurantKey),
        client.hIncrBy(restaurantKey, "views", 1),
      ]);
      return successResponse(res, { ...restaurant, views }, "Success");
    } catch (error) {
      next(error);
    }
  }
);

export default router;
