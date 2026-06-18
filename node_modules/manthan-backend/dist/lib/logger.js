import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
export const logsDirectory = path.resolve(currentDirectory, '../../logs');
const accessLogPath = path.join(logsDirectory, 'requests.log');
const errorLogPath = path.join(logsDirectory, 'errors.log');
function ensureLogsDirectory() {
    fs.mkdirSync(logsDirectory, { recursive: true });
}
export function getAccessLogStream() {
    ensureLogsDirectory();
    return fs.createWriteStream(accessLogPath, { flags: 'a' });
}
export function writeErrorLog(message) {
    ensureLogsDirectory();
    fs.appendFileSync(errorLogPath, `${message}\n`, 'utf8');
}
