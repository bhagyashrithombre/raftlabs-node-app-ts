import passport from "passport";
import { UNAUTHORIZED } from "http-status";
import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorhandler.middleware";
import { DbUser } from "../types/user";

const verifyCallback =
    (req: Request, resolve: (value?: unknown) => void, reject: (reason?: any) => void) =>
    async (err: any, user: DbUser, info: any) => {
        if (err || info || !user) {
            return reject(new AppError(UNAUTHORIZED, "AUTH: Please authenticate"));
        }

        req.user = user;
        resolve();
    };

const auth = () => async (req: Request, res: Response, next: NextFunction) =>
    new Promise((resolve, reject) => {
        passport.authenticate("jwt", { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
    })
        .then(() => next())
        .catch((err) => next(err));

export default auth;
