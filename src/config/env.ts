import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid("production", "development", "test").required(),
        PORT: Joi.number().default(4000),
        MONGO_URI: Joi.string().required().description("Mongo DB url"),
        JWT_SECRET: Joi.string().required().description("JWT secret key"),
    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: "key" } }).validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export default {
    nodeEnv: envVars.NODE_ENV,
    port: envVars.PORT,
    mongoose: {
        url: envVars.MONGO_URI + (envVars.NODE_ENV === "test" ? "-test" : ""),
    },
    jwt: {
        secret: envVars.JWT_SECRET,
    },
};
