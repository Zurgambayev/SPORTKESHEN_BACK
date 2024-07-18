import mongoose from "mongoose";

// import { type } from "os";

const roomParticipantSchema = new mongoose.Schema({
    userId : {type:mongoose.Schema.Types.ObjectId, ref: 'User'},
    roomId : {type:mongoose.Schema.Types.ObjectId, ref: 'TournamentRoom'},
    position: String,
    foot: String,
    bestSkill: String,
    heightWeight: String,
    isCaptain: {type: Boolean, default:false},
    teamNumber: { type: Number, default:null}  

},{timestamps:true})

const RoomParticipant = mongoose.model('RoomParticipant', roomParticipantSchema);
export default RoomParticipant;
