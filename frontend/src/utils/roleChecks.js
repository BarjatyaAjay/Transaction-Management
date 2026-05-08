export const canEditTransaction = (userRole) => {
  return userRole === 'admin' || userRole === 'user';
};

export const canViewTransactions = (userRole) => {
  return true; // All roles can view
};

export const canAccessAdminPanel = (userRole) => {
  return userRole === 'admin';
};

export const canDeleteTransaction = (userRole) => {
  return userRole === 'admin' || userRole === 'user';
};

export const hasReadOnlyAccess = (userRole) => {
  return userRole === 'read-only';
};
