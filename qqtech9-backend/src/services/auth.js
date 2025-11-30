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

  requireAdminOrRole: async (firebaseUid, roles) => {
    const currentUser = await UsersRepository.findByFirebaseId(firebaseUid);

    if (!currentUser) {
      throw new UnauthorizedError('User not found.');
    }

    if (currentUser.profile === 'admin') {
      return;
    }

    const hasRole = currentUser.roles.some(userRole =>
      roles.some(role => role.id === userRole.id)
    );

    if (!hasRole) {
      throw new ForbiddenError('Insufficient permissions');
    }
    
  }
};