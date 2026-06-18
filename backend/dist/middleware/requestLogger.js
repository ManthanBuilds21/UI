import morgan from 'morgan';
import { config } from '../config.js';
import { getAccessLogStream } from '../lib/logger.js';
const noopRequestLogger = (_request, _response, next) => {
    next();
};
const accessLogStream = config.nodeEnv === 'test' ? null : getAccessLogStream();
export const requestLogger = config.nodeEnv === 'test'
    ? noopRequestLogger
    : morgan('combined', {
        stream: accessLogStream,
    });
export const devRequestLogger = config.nodeEnv === 'production' || config.nodeEnv === 'test' ? null : morgan('dev');
