import { Request, Response, NextFunction } from "express";

type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;

// Async handler middleware
const asyncHandler = (func: ExpressMiddleware) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(func(req, res, next)).catch((err) => {
        next(err);
    });
};

export default asyncHandler;
