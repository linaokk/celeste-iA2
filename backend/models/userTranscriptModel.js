const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserTranscriptSchema = new Schema({
  call_date: { type: Date, required: true },
  call_id: { type: String, required: true, unique: true },
  transcripts: [{ type: String, required: true }],
  month: { type: Number, required: true },
  year: { type: Number, required: true }, 
  createdAt: { type: Date, default: Date.now },
  agentId : {type :String, required : true}   
}, { timestamps: true });

// index pour filtrer rapidement par mois/année
UserTranscriptSchema.index({ year: 1, month: 1 });

module.exports = mongoose.model("UserCallTranscript", UserTranscriptSchema);
