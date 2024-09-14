import env from "./config/env";
import express from "express";
import dbConnect from "./db/dbConnect";
import appMiddleware from "./middlewares/app.middleware";

const app = express();

appMiddleware(app);

const start = async () => {
    try {
        await dbConnect();

        app.listen(env.port, () => console.log(`Local server is listening on: http://localhost:${env.port}`));
    } catch (error) {
        console.error("Error connecting to database", error);
    }
};

start();
