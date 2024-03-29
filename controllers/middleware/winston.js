/* import dotenv from 'dotenv';
import winston from "winston";
import 'winston-daily-rotate-file';

dotenv.config({ path: './../../config/.env' })

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

const logger = winston.createLogger({
    level: "debug",
    format: winston.format.json(),
    transports: [
        transport1,
        transport2,
        new winston.transports.Console(),
    ]
});

/* if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }))
} */

/*export default logger */