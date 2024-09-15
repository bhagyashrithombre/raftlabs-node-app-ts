import { GraphQLNonNull, GraphQLString } from "graphql";
import { Token, User } from "../../models";
import { DbUser, getUserType, LogoutArgs, RefreshAuthArgs, userType } from "../../types/user";
import { AppError } from "../../middlewares/errorhandler.middleware";
import { CONFLICT, NOT_FOUND } from "http-status";
import { generateAuthTokens, verifyToken } from "../../services/token.service";
import { TOKEN_TYPE } from "../../types/token";
import logger from "../../config/logger";
import { verifyAuth } from "../../utils/fn";
import { AuthContext } from "../../types/common";

// Register resolver function
export const Register = {
    type: userType,
    args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_root: unknown, args: { [argName: string]: any }) => {
        const { firstName, lastName, email, password } = args as Pick<
            DbUser,
            "firstName" | "lastName" | "email" | "password"
        >;

        const isUserExist = await User.isUserExist(email);
        if (isUserExist) {
            throw new AppError(CONFLICT, "User already exists");
        }

        try {
            const user = await User.create({ firstName, lastName, email, password });
            const tokens = await generateAuthTokens(user);

            const response = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                tokens,
            };

            logger.info(`User registered successfully: ${user.email}`);
            return response;
        } catch (error: any) {
            logger.error("Error registering user:", error);
            throw new AppError(error.statusCode, error.message);
        }
    },
};

// Login resolver function
export const Login = {
    type: userType,
    args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_root: unknown, args: { [argName: string]: any }) => {
        const { email, password } = args as Pick<DbUser, "email" | "password">;

        try {
            const user = await User.findOne({ email });
            if (!user || !(await user.isPasswordMatch(password))) {
                throw new AppError(CONFLICT, "Invalid credentials");
            }

            const tokens = await generateAuthTokens(user);

            const response = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                tokens,
            };

            logger.info(`User logged in successfully: ${user.email}`);
            return response;
        } catch (error: any) {
            logger.error("Error logging in user:", error);
            throw new AppError(error.statusCode, error.message);
        }
    },
};

// Logout resolver function
export const Logout = {
    type: userType,
    args: {
        refreshToken: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_root: unknown, args: { [argName: string]: any }) => {
        const { refreshToken } = args as LogoutArgs;

        try {
            const tokenDoc = await Token.findOne({
                token: refreshToken,
                type: TOKEN_TYPE.REFRESH,
            });
            if (!tokenDoc) {
                throw new AppError(NOT_FOUND, "Token not found");
            }
            await tokenDoc.deleteOne();

            return {
                _id: "",
                firstName: "",
                lastName: "",
                email: "",
                tokens: {
                    access: { token: "", expires: "" },
                    refresh: { token: "", expires: "" },
                },
            };
        } catch (error: any) {
            logger.error("Error logging out user:", error);
            throw new AppError(error.statusCode, error.message);
        }
    },
};

// RefreshAuth resolver function
export const RefreshAuth = {
    type: userType,
    args: {
        refreshToken: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_root: unknown, args: { [argName: string]: any }) => {
        const { refreshToken } = args as RefreshAuthArgs;

        try {
            const tokenDoc = await verifyToken(refreshToken, TOKEN_TYPE.REFRESH);
            const user = await User.findById(tokenDoc.user);
            if (!user) {
                throw new AppError(NOT_FOUND, "User not found");
            }

            await tokenDoc.deleteOne();
            const tokens = await generateAuthTokens(user);
            const response = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                tokens,
            };

            logger.info(`User auth tokens refreshed successfully: ${user.email}`);
            return response;
        } catch (error: any) {
            logger.error("Error refreshing auth tokens:", error);
            throw new AppError(error.statusCode, error.message);
        }
    },
};

// GetUser resolver function - get user details from the access token
export const GetUser = {
    type: getUserType,
    args: {},
    resolve: async (_root: unknown, _args: unknown, context: unknown) => {
        try {
            const user = await verifyAuth(context as AuthContext);
            return user;
        } catch (error: any) {
            logger.error("Error getting user:", error);
            throw new AppError(error.statusCode, error.message);
        }
    },
};
