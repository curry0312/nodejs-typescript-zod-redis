import express from "express";
import 'dotenv/config'
import restaurantRouter from "./routes/restaurant.js";
import cuisinesRouter from "./routes/cuisines.js";
import { errorHandler } from "./middleware/errorHandler.js";

const PORT = process.env.PORT

const app = express();

app.use(express.json());

app.use("/cuisines", cuisinesRouter);
app.use("/restaurants", restaurantRouter);

app.use(errorHandler);

app
  .listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error(err);
    throw new Error(err.message);
  });
