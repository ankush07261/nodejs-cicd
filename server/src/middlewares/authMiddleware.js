const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  // Accept only "Bearer <token>" — reject raw tokens
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization header must use Bearer scheme.',
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Empty token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[authMiddleware.verifyToken] JWT_SECRET is not set');
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    
    // Check if user still exists in database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed token.',
    });
  }
};

module.exports = { verifyToken };
