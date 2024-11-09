import express from "express";
import { validate } from "../middleware/validate.js";
import { Restaurant, RestaurantSchema } from "../schema/restaurant.js";

const router = express.Router();

router.get("/", validate(RestaurantSchema), async (req, res) => {
    const data = req.body as Restaurant
    res.send(data);
});

export default router;
