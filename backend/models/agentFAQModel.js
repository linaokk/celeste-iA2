const mongoose = require("mongoose");

const agentFAQSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true },
  questions: [
      {
        question: { type: String, required: true },
        frequency: { type: Number, default: 1 }
      }
    ],
    default: []
  ,
audios: [
    {
      url: { type: String, required: true },
      duration: { type: Number, default: 0 },
      callDate: { type: Date }, 
      from_number : {type : String}
    }
  ],  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AgentFAQ", agentFAQSchema);
