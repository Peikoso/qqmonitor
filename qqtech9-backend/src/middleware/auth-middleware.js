import { AuthService } from "../services/auth.js";
import { UnauthorizedError } from "../utils/errors.js";

const publicRoutes = [
  { method: 'POST', path: '/api/v1/users/register' },
  { method: 'POST', path: '/api/v1/login' },
  { method: 'GET', path: '/api/v1/health' }
];

export const AuthMiddleware = async (req, res, next) => {
  const isPublic = publicRoutes.some(
    route => route.method === req.method && req.originalUrl.startsWith(route.path)
  )

  if(isPublic){
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
