import { TOKEN_TYPE } from "../types/token";
import moment from "moment";
import jwt from "jsonwebtoken";
import { Token } from "../models";
import { DbUser } from "../types/user";
import env from "../config/env";
import { IToken, ObjectId } from "../types/common";
import { NOT_FOUND } from "http-status";
import { AppError } from "../middlewares/errorhandler.middleware";

// Generate token with user data and expiry
const generateToken = (user: Partial<DbUser>, expires: moment.Moment, type: TOKEN_TYPE, secret = env.jwt.secret) => {
    const payload: IToken = {
        sub: user,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret as string);
};

// Generate auth tokens - access and refresh
const generateAuthTokens = async (user: DbUser) => {
    const userId = user._id;

    const accessTokenExpires = moment().add(60, "minutes");
    const accessToken = generateToken({ _id: userId }, accessTokenExpires, TOKEN_TYPE.ACCESS);

    const refreshTokenExpires = moment().add(2, "days");
    const refreshToken = generateToken({ _id: userId }, refreshTokenExpires, TOKEN_TYPE.REFRESH);

    await saveToken(refreshToken, userId, refreshTokenExpires, TOKEN_TYPE.REFRESH);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

// Save token to database
const saveToken = async (token: string, userId: ObjectId, expires: moment.Moment, type: TOKEN_TYPE) => {
    const tokenDoc = await Token.create({
        token,
        user: userId,
        expires: expires.toDate(),
        type,
    });

    return tokenDoc;
};

// Verify token from database
const verifyToken = async (token: string, type: TOKEN_TYPE) => {
    const payload = jwt.verify(token, env.jwt.secret);

    const tokenDoc = await Token.findOne({
        token,
        type,
        user: payload.sub,
    });

    if (!tokenDoc) {
        throw new AppError(NOT_FOUND, "Token not found");
    }

    return tokenDoc;
};

export { generateAuthTokens, saveToken, verifyToken };
