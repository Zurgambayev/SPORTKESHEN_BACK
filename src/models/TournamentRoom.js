import mongoose from "mongoose";

const tournamentRoomSchema = new mongoose.Schema({
    name: String,
    teamCount : Number,
    gameType: String,
    division: String,
    gameTime: String,
    adminId:{type: mongoose.Schema.Types.ObjectId,ref:'User'},
    tournamentType:{type:String,enum:["на выбывание", "лига"],require:true}, 
    // tournamentAiOr: {type:String, enum:["ИИ", "рандома "]}
},{timestamps:true});

const TournamentRoom =  mongoose.model('TournamentRoom',tournamentRoomSchema);
export default TournamentRoom;




