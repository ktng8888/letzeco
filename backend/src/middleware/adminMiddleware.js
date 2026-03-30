const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    // Attach admin info to request
    req.admin = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyAdmin;