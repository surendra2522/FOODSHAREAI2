import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_1234567890');
    
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    if (req.user.isActive === false || req.user.isSuspended === true) {
      return res.status(403).json({ message: 'Your account is deactivated or suspended. Please contact support.' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token authorization failed' });
  }
};

// Restrict routes to specific user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to perform this action`,
      });
    }
    next();
  };
};
