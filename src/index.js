import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as UserController from './controllers/UserController.js';
import * as roomControllers from './controllers/roomControllers.js';
import checkAuth from './utils/checkAuth.js';
import cors from 'cors'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors())
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
app.get('/tournaments/name/:name/participants',roomControllers.getTournamentParticipantsByName)
// app.get('/tournaments/:roomId/participants',roomControllers.getTournamentParticipants)
app.post('/assigncaptain',checkAuth, roomControllers.assignTeamCaptain)
app.post('/set-team-count', checkAuth, roomControllers.setTeamCount); 
app.post('/create-team',checkAuth,roomControllers.createTeam)
app.post('/add-player',checkAuth,roomControllers.addPlayerToTeam);
app.listen(PORT, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log(`Server running on port ${PORT}`);
});
