import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware";
import { Token, User } from "../models";
import { TOKEN_TYPE } from "../types/token";
import { generateAuthTokens, verifyToken } from "../services/token.service";
import responseHandler from "../utils/responseHandler";
import { CONFLICT, NOT_FOUND, OK, UNAUTHORIZED } from "http-status";
import { DbUser } from "../types/user";
import logger from "../config/logger";

// POST /register
const register = asyncHandler(async (req: Request, res: Response) => {
    const isUserExist = await User.isUserExist(req.body.email, req.body.username, req.body.address);

    if (isUserExist) {
        const response = {
            success: false,
            message: "REGISTER: User already exists",
            data: {},
            status: CONFLICT,
        };

        return responseHandler(response, res);
    }

    const user = await User.create(req.body);
    const tokens = await generateAuthTokens(user);

    const response = {
        success: true,
        message: "REGISTER: Registered successfully",
        data: { user, tokens },
        status: OK,
    };

    logger.info(`User registered successfully with email: ${user.email}`);
    return responseHandler(response, res);
});

// POST /login
const login = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user || !(await user.isPasswordMatch(req.body.password))) {
        const response = {
            success: false,
            message: "LOGIN: Invalid credentials",
            data: {},
            status: UNAUTHORIZED,
        };

        return responseHandler(response, res);
    }

    const tokens = await generateAuthTokens(user as DbUser);
    const response = {
        success: true,
        message: "LOGIN: Logged in successfully",
        data: { user, tokens },
        status: OK,
    };

    logger.info(`User logged in successfully with email: ${user.email}`);
    return responseHandler(response, res);
});

// POST /logout
const logout = asyncHandler(async (req: Request, res: Response) => {
    const tokenDoc = await Token.findOne({
        token: req.body.refreshToken,
        type: TOKEN_TYPE.REFRESH,
    });

    if (!tokenDoc) {
        const response = {
            success: false,
            message: "LOGOUT: Token Not found",
            data: {},
            status: NOT_FOUND,
        };

        return responseHandler(response, res);
    }

    await tokenDoc.deleteOne();
    const response = {
        success: true,
        message: "LOGOUT: Logged out successfully",
        data: {},
        status: OK,
    };

    return responseHandler(response, res);
});

// POST /refresh-auth
const refreshAuth = asyncHandler(async (req: Request, res: Response) => {
    const tokenDoc = await verifyToken(req.body.refreshToken, TOKEN_TYPE.REFRESH);
    if (!tokenDoc) {
        const response = {
            success: false,
            message: "REFRESH AUTH: Invalid token",
            data: {},
            status: UNAUTHORIZED,
        };

        return responseHandler(response, res);
    }

    const user = await User.findById(tokenDoc.user);
    if (!user) {
        const response = {
            success: false,
            message: "REFRESH AUTH: User not found",
            data: {},
            status: NOT_FOUND,
        };

        return responseHandler(response, res);
    }

    await tokenDoc.deleteOne();
    const tokens = await generateAuthTokens(user);
    const response = {
        success: false,
        message: "REFRESH AUTH: Auth refreshed",
        data: tokens,
        status: NOT_FOUND,
    };

    logger.info(`Auth refreshed for user with email: ${user.email}`);
    return responseHandler(response, res);
});

export { register, login, logout, refreshAuth };
