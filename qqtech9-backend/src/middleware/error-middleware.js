import { redact } from "../utils/redact.js";

export const ErrorMiddleware = (err, req, res, next) => {
    const status = err.status || 500;
    let message = err.message || 'Unexpected Error.';

    if(status === 500){
        console.error(redact(err));
        message = 'Internal Server Error.';
    }

    return res.status(status).json({ error: message });
}