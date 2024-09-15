import passport from "passport";
import { UNAUTHORIZED } from "http-status";
import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorhandler.middleware";
import { DbUser } from "../types/user";

// Verify callback
const verifyCallback =
    (req: Request, resolve: (value?: unknown) => void, reject: (reason?: unknown) => void) =>
    async (err: Error | null, user: DbUser | false, info: unknown) => {
        if (err || info || !user) {
            return reject(new AppError(UNAUTHORIZED, "AUTH: Please authenticate"));
        }

        req.user = user;
        resolve();
    };

// Auth middleware
const auth = async (req: Request, res: Response, next: NextFunction) =>
    new Promise((resolve, reject) => {
        passport.authenticate("jwt", { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
    })
        .then(() => next())
        .catch((err) => next(err));

export default auth;
