import { AuthService } from "../services/auth.js";
import { UnauthorizedError } from "../utils/errors.js";
import { config } from "../config/index.js";

const publicRoutes = [
  { method: 'POST', path: '/api/v1/users/register' },
  { method: 'POST', path: '/api/v1/login' }
];

const tokenRoutes = [
  { method: 'POST', path: '/api/v1/incidents' },
  { method: 'POST', path: '/api/v1/notifications'}
];

export const AuthMiddleware = async (req, res, next) => {
  const isPublic = publicRoutes.some(
    route => route.method === req.method && req.path === route.path
  )

  if(isPublic){
    return next();
  }

  const isTokenRoute = tokenRoutes.some(
    route => route.method === req.method && req.path === route.path
  );

  if(isTokenRoute){
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Token ")) {
      throw new UnauthorizedError("Token not provided.");
    }

    const token = authHeader.split(" ")[1];

    if(config.TOKEN_API !== token){
      throw new UnauthorizedError("Invalid API token.");
    }

    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token not provided.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedUser = await AuthService.verifyToken(token);
    req.user = decodedUser; // usuário disponível em qualquer controller
    next();
  } catch (error) {
    throw new UnauthorizedError(error.message);
  }
};
