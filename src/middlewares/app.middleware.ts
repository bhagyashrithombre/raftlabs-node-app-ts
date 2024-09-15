import express, { Express } from "express";
import cors from "cors";
import { errorLogger, errorResponder, invalidPathHandler, requestLogger } from "./errorhandler.middleware";
import passport from "passport";
import { jwtStrategy } from "../config/passport";
import routes from "../routes";
import env from "../config/env";
import authLimiter from "./ratelimiter.middleware";
import { graphqlHTTP } from "express-graphql";
import schema from "../graphql/schema";

// App middleware
const appMiddleware = (app: Express) => {
    // parse json request body
    app.use(express.json());

    // parse urlencoded request body
    app.use(express.urlencoded({ extended: true }));

    // enable cors
    app.use(cors());
    app.options("*", cors());

    // jwt authentication
    app.use(passport.initialize());
    passport.use("jwt", jwtStrategy);

    app.use(requestLogger);

    // graphql api
    app.use(
        "/graphql",
        graphqlHTTP({
            schema: schema,
            graphiql: true,
        }),
    );

    // limit repeated failed requests to auth endpoints
    if (env.nodeEnv === "production") {
        app.use("/v1/auth", authLimiter);
    }

    // api routes
    app.use("/v1", routes);

    app.use(errorLogger);
    app.use(errorResponder);
    app.use(invalidPathHandler);
};

export default appMiddleware;
