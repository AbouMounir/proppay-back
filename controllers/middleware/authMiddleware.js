import jwt from "jsonwebtoken";

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId;
    } catch (error) {
        return null; // Le token est invalide ou a expiré
    }
};


export const authMiddleware = async (req, res, next) => {
    const token = req.headers.security || req.headers.authorization;
    // console.log(token);
    if (!token) {
        return res.status(401).json({ message: " auth Unauthorized" });
    }
    const userId = verifyToken(token);
    if (!userId) {
        return res.status(401).json({ message: "auth Unauthorized" });
    }
    req.userId = userId;
    next();
};