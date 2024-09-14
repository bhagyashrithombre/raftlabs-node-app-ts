import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../models";
import env from "./env";
import { BAD_REQUEST } from "http-status";
import { IToken } from "../types/common";
import { TOKEN_TYPE } from "../types/token";
import { AppError } from "../middlewares/errorhandler.middleware";

const jwtOptions = {
    secretOrKey: env.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload: IToken, done: any) => {
    try {
        if (payload.type !== TOKEN_TYPE.ACCESS) {
            throw new AppError(BAD_REQUEST, "Invalid token type");
        }

        const user = await User.findById(payload.sub);
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error, false);
    }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export { jwtStrategy };
