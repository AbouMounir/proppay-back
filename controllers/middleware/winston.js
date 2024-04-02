import dotenv from 'dotenv';
import winston from "winston";
import 'winston-daily-rotate-file';
import 'winston-mongodb';

dotenv.config({ path: './config/.env' })

const transport1 = new winston.transports.DailyRotateFile({
    filename: 'log/infos-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    handleExceptions: true,
    maxSize: '20m',
    maxFiles: '14d'
});

const transport2 = new winston.transports.DailyRotateFile({
    level: 'error',
    filename: 'log/errors-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    handleExceptions: true,
    maxSize: '20m',
    maxFiles: '14d'
});

/* const transport3 = new winston.transports.MongoDB({
    db: process.env.MONGODB_URI,
    options: {
        useUnifiedTopology: true
    },
    level: 'error',
    collection: 'errors',
    format: format.combine(format.timestamp(), format.json())
}); */

const logger = winston.createLogger({
    level: "debug",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
    ]
});

const log = (status, method, body, errorMessage) => logger.error({
    status: status,
    request_body: JSON.stringify(body),
    error: errorMessage,
    API_method: method
});

/* if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }))
} */

export default log