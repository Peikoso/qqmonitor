import dotenv from "dotenv";
import process from 'process';

dotenv.config();

export const config = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    DEFAULT_PASSWORD: process.env.DEFAULT_PASSWORD,
    SERVICE_PATH: process.env.SERVICE_PATH,
    ENABLE_RUNNER_WORKER: process.env.ENABLE_RUNNER_WORKER,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    TOKEN_API: process.env.TOKEN_API,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    METRICS_API_URL: process.env.METRICS_API_URL,
};

