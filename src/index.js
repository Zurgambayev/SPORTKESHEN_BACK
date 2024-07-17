import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as UserController from './controllers/UserController.js';
import * as roomControllers from './controllers/roomControllers.js';
import checkAuth from './utils/checkAuth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('DB ok'))
    .catch((err) => {
        console.log('DB err', err);
        process.exit(1);
    });

app.post('/auth/register', UserController.register);
app.post('/auth/login',UserController.login)

app.post('/create-room',checkAuth,roomControllers.createRoom);
app.get('/rooms',roomControllers.getAllRoom);
app.post('/join-room',checkAuth,roomControllers.joinTournament)
app.listen(PORT, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log(`Server running on port ${PORT}`);
});
