export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRATION || '7d',
};

