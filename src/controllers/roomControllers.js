import RoomParticipant from "../models/RoomParticipant.js";
import TournamentRoom from "../models/TournamentRoom.js";

export const createRoom = async (req, res) => {
    const { name, teamsCount, gameType, division, gameTime } = req.body;

    if (!req.user || !req.user._id) {
        return res.status(403).json({ message: 'Необходима аутентификация пользователя' });
    }

    const room = new TournamentRoom({
        name,
        teamsCount,
        gameType,
        division,
        gameTime,
        adminId: req.user._id
    });

    try {
        await room.save();
        res.status(200).json({ message: 'комната для турнира успешно создана', room });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
