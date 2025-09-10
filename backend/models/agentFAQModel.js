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
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AgentFAQ", agentFAQSchema);
