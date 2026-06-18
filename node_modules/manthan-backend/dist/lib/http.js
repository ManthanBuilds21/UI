export class ApiError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
export function asyncHandler(handler) {
    return (request, response, next) => {
        void handler(request, response, next).catch(next);
    };
}
export function sendSuccess(response, data, statusCode = 200) {
    return response.status(statusCode).json({
        success: true,
        data,
    });
}
