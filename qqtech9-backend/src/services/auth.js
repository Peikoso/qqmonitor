import { admin } from "../config/firebase.js";
import { UnauthorizedError } from "../utils/errors.js";
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

  isSuperadmin: (user) => {
    if(user.profile === 'admin'){
      const isSuperAdmin = user.roles.some(role => role.isSuperadmin === true);
      return isSuperAdmin;
    }

    return false;
  },

  requireSuperAdmin: async (user) => {
    if(!AuthService.isSuperadmin(user)){
      throw new ForbiddenError('Insufficient permissions');
    }

  },

  requireAdmin: async (user) => {
    if (user.profile !== 'admin') {
      throw new ForbiddenError('Insufficient permissions');
    }
    
  },

  requireOperator: async (user) => {
    if (user.profile !== 'admin' && user.profile !== 'operator') {
      throw new ForbiddenError('Insufficient permissions');
    }
  },

  requireOperatorAndRole: async (user, rolesId) => {    
    if (AuthService.isSuperadmin(user)) {
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

  verifyRoles: async (user, rolesId) => {    
    if (AuthService.isSuperadmin(user)) {
      return;
    }

    const userRolesId = user.roles.map(role => role.id);

    const hasInvalidRole = rolesId.some(roleId => !userRolesId.includes(roleId));

    if (hasInvalidRole) {
      throw new ForbiddenError('Insufficient permissions');
    }
  },

  requireRole: async (user, rolesId) => {    
    if (AuthService.isSuperadmin(user)) {
      return;
    }

    const hasRole = user.roles.some(userRole =>
      rolesId.some(roleId => roleId === userRole.id)
    );

    if (!hasRole) {
      throw new ForbiddenError('Insufficient permissions');
    }
    
  },

  editRoles: async (user, oldRolesIds, newRolesIds) => {
    if(AuthService.isSuperadmin(user)){
      return;
    }

    if(user.profile !== 'admin' ){
      const sameLength = oldRolesIds.length === newRolesIds.length;

      const sameRoles = oldRolesIds.every(roleId => newRolesIds.includes(roleId));
      
      if(!sameLength || !sameRoles){
        throw new ForbiddenError('Insufficient permissions');
      }
    }

    const addedRoles = newRolesIds.filter(roleId => !oldRolesIds.includes(roleId));

    const removedRoles = oldRolesIds.filter(roleId => !newRolesIds.includes(roleId));

    if(removedRoles.length > 0)
      await AuthService.verifyRoles(user, removedRoles);

    if(addedRoles.length > 0)
      await AuthService.verifyRoles(user, addedRoles);

  },

    
};