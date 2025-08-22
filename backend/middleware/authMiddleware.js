import { db } from '../../db.js';

export const requireAdmin = (req, res, next) => {
    // This is insecure and for demonstration only.
    // In a real app, user identity should come from a secure source like a decoded JWT.
    const adminId = req.headers['x-admin-id'];
    
    if (!adminId) {
        return res.status(401).json({ message: 'Authentication required for admin access.' });
    }

    const user = db.data.users.find(u => u.id === adminId);

    if (user && user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ message: 'Admin access required.' });
    }
};