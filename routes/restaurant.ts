import express from "express";
import { validate } from "../middleware/validate.js";
import { Restaurant, RestaurantSchema } from "../schema/restaurant.js";
import { getRedisClient } from "../utils/client.js";

const router = express.Router();

router.post("/", validate(RestaurantSchema), async (req, res) => {
    const data = req.body as Restaurant
    const client = await getRedisClient();
    res.send(data);
});

export default router;
