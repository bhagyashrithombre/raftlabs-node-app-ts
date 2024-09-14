import { createLogger, format, transports } from "winston";

const { combine, timestamp, label, printf, colorize } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
    level: "info",
    format: combine(colorize(), label({ label: "MyApp" }), timestamp(), customFormat),
    transports: [new transports.Console(), new transports.File({ filename: "app.log" })],
});

export default logger;
