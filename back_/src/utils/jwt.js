import jwt from "jsonwebtoken";
import { env } from "../../env.js";

// Helper function to parse time spans like '15m' or '7d' into seconds
function parseTimeSpanToSeconds(timeSpan) {
    if (!timeSpan) return undefined;

    const unit = timeSpan.slice(-1);
    const value = parseInt(timeSpan.slice(0, -1), 10);

    if (isNaN(value)) return undefined;

    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 60 * 60 * 24;
        default: return undefined; // Unknown unit
    }
}

export function signAccessToken(payload) {
    console.log(env)
    return jwt.sign(
        payload, env.accessSecret,
        {
            expiresIn: parseTimeSpanToSeconds(env.accessTtl)

        });
}
export function signRefreshToken(payload) {
    return jwt.sign(
        payload, env.refreshSecret,
        {
            expiresIn: parseTimeSpanToSeconds(env.refreshTtl)

        });
}
export function verifyAccess(token) {
    return jwt.verify(token, env.accessSecret);
}
export function verifyRefresh(token) {
    return jwt.verify(token, env.refreshSecret);
}

export function getToken(token) {
    const tokenWithoutBearer = token.slice("Bearer ".length);
    return jwt.decode(tokenWithoutBearer);
}