import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export default function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'User not authenticated', success: false });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.id = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token', success: false });
    }
}