import axios from "axios";
import { CREATE_AGENT_ENDPOINT } from "../constants/api.js";

export const createAgent = async (user) => {
  const agentBody = {
    name: user.companyName,
    language: "en",
  };
  const agentResponse = await axios.post(CREATE_AGENT_ENDPOINT, agentBody, {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.X_API_KEY,
    },
  });
  const agent = agentResponse.data;
  return agent;
};
