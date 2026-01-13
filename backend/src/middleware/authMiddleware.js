import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  let token;
  // 1. Check for token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. If not in header, check for token in query parameters
  else if (req.query.token) {
    token = req.query.token;
  }

  // 3. If no token is found in either place, reject
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  try {
    // 4. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
export default authMiddleware;