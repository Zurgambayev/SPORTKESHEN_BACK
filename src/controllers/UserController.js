import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
// import { message } from 'antd';

export const register = async (req,res ) => {
    try{
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password,salt)
        
        const doc = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.username,
            password: hash,
        })
        const user  = await doc.save()

        const token  = jwt.sign(
            {
                _id : user._id
            },
            "secret123",
            {
                expiresIn:'30d'
            }
        )
        res.json(user)
    }catch(err){
        console.log(err)
        res.status(500).json({
            message:'не удалось зарегестрироваться'
        })
    }
};

export const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: "неверный логин либо поро",
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user.password); // замените user._doc.passwordHash на user.password, если это правильное имя поля

        if (!isValidPass) {
            return res.status(404).json({
                message: "неверный логин либо пороль",
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            "secret123",
            {
                expiresIn: '30d',
            }
        );

        res.json({
            token,
            user,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'не удалось войти',
        });
    }
};

export const getMe = async (req, res) => {
    try {
        console.log("User ID from request:", req.userId); // Лог для проверки userId
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "пользователь не нашелся",
            });
        }

        const { passwordHash, ...userData } = user._doc;
        // console.log("User data to return:", userData); // Лог для проверки userData
        res.json(userData);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'нет доступа',
        });
    }
};

