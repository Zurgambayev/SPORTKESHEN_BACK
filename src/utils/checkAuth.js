import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const checkAuth = (req, res, next) => {
     // Изменено на req.headers
     const token = (req.headers.authorization || '').replace(/Bearer\s?/, ''); 

    if (token) {
        try {
            const decoded = jwt.verify(token, 'secret123');
            req.userId = decoded._id;
            req.user = decoded; // Устанавливаем req.user
            next();
        } catch (e) {
            return res.status(403).json({
                message: 'нет доступа'
            });
        }
    } else {
        return res.status(403).json({
            message: 'нет доступа'
        });  
    }
};

export default checkAuth;
