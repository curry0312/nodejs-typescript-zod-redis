import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { errorResponse } from "../utils/response.js";

export const validate =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 400, parsed.error.message);
    }
    next();
  };
