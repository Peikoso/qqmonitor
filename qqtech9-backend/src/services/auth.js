import { admin } from "../config/firebase.js";
import { UnauthorizedError } from "../utils/errors.js";
import { UsersRepository } from '../repositories/users.js';
import { ForbiddenError } from '../utils/errors.js';

export const AuthService = {
  verifyToken: async (idToken) => {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error("Error verifying Firebase token:", error.message);
      throw new UnauthorizedError("Invalid or expired token.");
    }
  },

  requireAdmin: async (firebaseUid) => {
    const currentUser = await UsersRepository.findByFirebaseId(firebaseUid);

    if (!currentUser) {
      throw new UnauthorizedError('User not found.');
    }

    if (currentUser.profile !== 'admin') {
      throw new ForbiddenError('Insufficient permissions');
    }
    
  },

  requireOperatorAndRole: async (user, rolesId) => {    
    if (user.profile === 'admin') {
      return;
    }

    if (user.profile === 'viewer') {
      throw new ForbiddenError('Insufficient permissions');
    }

    const hasRole = user.roles.some(userRole =>
      rolesId.some(roleId => roleId === userRole.id)
    );

    if (!hasRole) {
      throw new ForbiddenError('Insufficient permissions');
    }
    
  },

  requireRole: async (user, rolesId) => {    
    if (user.profile === 'admin') {
      return;
    }

    const hasRole = user.roles.some(userRole =>
      rolesId.some(roleId => roleId === userRole.id)
    );

    if (!hasRole) {
      throw new ForbiddenError('Insufficient permissions');
    }
    
  },
    
};