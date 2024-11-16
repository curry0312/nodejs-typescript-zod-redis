import express, { type Request, Response } from "express";
import { validate } from "../middleware/validate.js";
import { Restaurant, RestaurantSchema } from "../schema/restaurant.js";
import { getRedisClient } from "../utils/client.js";
import { nanoid } from "nanoid";
import { getRestaurantKeyById } from "../utils/keys.js";
import { successResponse } from "../utils/response.js";
import { checkRestaurantIdInRedis } from "../middleware/checkRestaurantIdInRedis.js";

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
