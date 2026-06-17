import { verifyAuthToken } from '../lib/auth.js';
import { ApiError } from '../lib/http.js';
function getBearerToken(request) {
    const authorization = request.header('authorization');
    if (!authorization?.startsWith('Bearer ')) {
        throw new ApiError(401, 'Authentication required.');
    }
    return authorization.slice('Bearer '.length).trim();
}
export function authenticate(request, _response, next) {
    try {
        const token = getBearerToken(request);
        request.auth = verifyAuthToken(token);
        next();
    }
    catch (error) {
        next(error);
    }
}
export function requireRole(role) {
    return (request, _response, next) => {
        if (!request.auth) {
            next(new ApiError(401, 'Authentication required.'));
            return;
        }
        if (request.auth.role !== role) {
            next(new ApiError(403, 'You do not have permission to access this resource.'));
            return;
        }
        next();
    };
}
