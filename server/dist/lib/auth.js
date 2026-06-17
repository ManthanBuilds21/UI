import jwt from 'jsonwebtoken';
import { config } from '../config.js';
export function signAuthToken(user) {
    return jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
    }, config.jwtSecret, { expiresIn: '7d' });
}
export function verifyAuthToken(token) {
    return jwt.verify(token, config.jwtSecret);
}
export function toClientRole(role) {
    return role === 'ADMIN' ? 'admin' : 'user';
}
