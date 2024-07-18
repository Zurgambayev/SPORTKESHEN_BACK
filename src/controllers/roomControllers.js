import RoomParticipant from "../models/RoomParticipant.js";
import TournamentRoom from "../models/TournamentRoom.js";
import Team from "../models/Team.js";
import User from "../models/User.js";

export const createRoom = async (req, res) => {
    const { name, gameType,gameTime,tournamentType,tournamentAiOr,formatPlay} = req.body;
    // const { name, gameType, division, gameTime, tournamentType, tournamentAiOr } = req.body;

    if (!req.user || !req.user._id) {
        return res.status(403).json({ message: 'Необходима аутентификация пользователя' });
    }


    const room = new TournamentRoom({
        name,
        // teamsCount,
        gameType,
        // division,
        gameTime,
        admin_id: req.user._id,
        tournamentType,
        tournamentAiOr,
        formatPlay
    });

    try {
        await room.save();
        if(tournamentType === "ИИ"){
            await createTeamsWithAI(room._id)
        }
        res.status(200).json({ message: 'комната для турнира успешно создана', room });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const createTeamsWithAI = async (roomId,req,res) => {
    try{
        // const plears = 
        const participants = await RoomParticipant.find({ roomId });

    }catch(err){

    }
}


export const setTeamCount = async (req,res) => {
    const {roomId,teamsCount} = req.body

    if (!req.user || !req.user._id) {
        return res.status(403).json({ message: 'Необходима аутентификация пользователя' });
    }
    try{
        const room = await TournamentRoom.findById(roomId)
        if(!room){
            return res.status(404).json({ message: 'Турнир не найден' });
        }

        if(room.admin_id.toString() !== req.user._id.toString()){
            return res.status(403).json({ message: 'У вас нет прав для выполнения этого действия' });
        }
        
        room.teamCount = teamsCount
        await room.save()
        res.status(200).json({ message: 'Количество команд успешно установлено', room });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
} 


export const getAllRoom = async (req, res) => {
    const rooms = await TournamentRoom.find();
    res.status(200).json({ rooms });
}

export const joinTournament = async (req, res) => {
    const { name, position, foot, bestSkill, heightWeight } = req.body;

    try {
        const room = await TournamentRoom.findOne({ name });

        if (!room) {
            return res.status(404).json({ error: 'турнир не найден' });
        }

        const participant = new RoomParticipant({
            userId: req.user._id,
            roomId: room._id,
            position,
            foot,
            bestSkill,
            heightWeight,
        });

        await participant.save();

        res.status(200).json({ message: 'Пользователь успешно зашел в турнир', participant });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getTournamentParticipantsByName = async (req, res) => {
    const { name } = req.params;
    try {
        // Найдите комнату по имени
        const room = await TournamentRoom.findOne({ name }).populate('admin_id', 'firstName lastName email');

        if (!room) {
            return res.status(404).json({ message: 'Турнир не найден' });
        }

        // Найдите всех участников по roomId
        const participants = await RoomParticipant.find({ roomId: room._id }).populate('userId', 'name email'); // Укажите нужные поля

        if (!participants.length) {
            return res.status(404).json({ message: 'Участники для этого турнира не найдены' });
        }

        res.status(200).json({
            admin: {
                firstName: room.admin_id.firstName,
                lastName: room.admin_id.lastName,
                email: room.admin_id.email
            },
            participants
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const assignTeamCaptain = async (req,res)=> { 
    const {roomId,userId} = req.body
    // console.log("happy")
    try{
        const room = await TournamentRoom.findById(roomId)
        if(!room){
            return res.status(404).json({ message: 'Турнир не найден' });
        }

        if(room.admin_id.toString() !== req.user._id.toString()){
            return res.status(403).json({ message: 'У вас нет прав для выполнения этого действия' });
        }
        
        const participant = await RoomParticipant.findOne({roomId,userId})
        if (!participant) {
            return res.status(404).json({ message: 'Участник не найден' });
        }

        participant.isCaptain = true;
        await participant.save();
        res.status(200).json({ message: 'Капитан команды успешно назначен', participant });
    }catch(err){
        res.status(500).json({ error: error.message });
    }
}


export const createTeam = async (req,res) => {
    const {roomId,teamName,maxPlayers} = req.body; 

    if(!req.user || !req.user._id){
        return res.status(403).json({ message: 'Необходима аутентификация пользователя' });
    }

    try{
        const room = await TournamentRoom.findById(roomId)
        if(!room){
            return res.status(404).json({ message: 'Турнир не найден' });
        }

        const captain = await RoomParticipant.findOne({ roomId, userId: req.user._id, isCaptain: true });
        if (!captain) {
            return res.status(403).json({ message: 'Только капитан может создавать команду' });
        }
        const team = new Team({
            roomId,
            captainId: req.user._id,
            teamName,
            maxPlayers,
            players: []
        });
        await team.save();

        res.status(200).json({ message: 'Команда успешно создана', team });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const addPlayerToTeam = async (req, res) => {
    const { teamId, participantId } = req.body;

    if (!req.user || !req.user._id) {
        return res.status(403).json({ message: 'Необходима аутентификация пользователя' });
    }

    try {
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Команда не найдена' });
        }

        const captain = await RoomParticipant.findOne({ roomId: team.roomId, userId: req.user._id, isCaptain: true });
        if (!captain) {
            return res.status(403).json({ message: 'Только капитан может добавлять игроков в команду' });
        }

        if (team.players.length >= team.maxPlayers) {
            return res.status(400).json({ message: 'Команда уже заполнена' });
        }

        const participant = await RoomParticipant.findById(participantId);
        if (!participant || participant.roomId.toString() !== team.roomId.toString()) {
            return res.status(404).json({ message: 'Участник не найден или не принадлежит этому турниру' });
        }

        team.players.push(participantId);
        await team.save();

        res.status(200).json({ message: 'Игрок успешно добавлен в команду', team });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Другие методы ...

// export const chooseTeamMember = async (req, res) => {
//     const { roomId, participantId, teamNumber } = req.body;

//     if (!req.user || !req.user._id) {
//         return res.status(403).json({ message: 'Необходима аутентификация пользователя' });
//     }
    

//     try {
//         // const room = await TournamentRoom.findById(roomId);
//         const room = await TournamentRoom.findById(roomId);
//         if (!room) {
//             return res.status(404).json({ message: 'Турнир не найден' });
//         }

//         const captain = await RoomParticipant.findOne({ roomId, userId: req.user._id, isCaptain: true });
//         if (!captain) {
//             return res.status(403).json({ message: 'Только капитан может выбирать участников' });
//         }

//         const participant = await RoomParticipant.findById(participantId);
//         if (!participant || participant.roomId.toString() !== roomId) {
//             return res.status(404).json({ message: 'Участник не найден или не принадлежит этому турниру' });
//         }

//         participant.teamNumber = teamNumber;
//         await participant.save();

//         res.status(200).json({ message: 'Участник успешно выбран в команду', participant });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// export const createTeam = async(res,req) => {

// }


// export const getTournamentParticipants = async (req, res) => {
//     const { roomId } = req.params;

//     try {
//         const participants = await RoomParticipant.find({ roomId }).populate('userId', 'name email'); // Укажите нужные поля

//         if (!participants.length) {
//             return res.status(404).json({ message: 'Участники для этого турнира не найдены' });
//         }

//         res.status(200).json({ participants });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };