const skipValidateBody = [
  { method: 'PATCH', path: '/api/v1/users/me/picture' },
];

export const ValidateBodyMiddleware = (req, res, next) => {
    const isSkip = skipValidateBody.some(
        route => route.method === req.method && req.path === route.path
    )

    if(isSkip){
        return next();
    }

    if (
        (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') &&
        (req.body === undefined || req.body === null || Object.keys(req.body).length === 0)
    ) {
        return res.status(400).json({ error: 'Request body is required.' });
    }

    next();
};