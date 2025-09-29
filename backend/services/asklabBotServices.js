import axios from "axios";
//const asklabConfig = require("./asklab/config.js");
import { asklab } from "./asklab/config.js";
import User from "../models/userModel.js";

import {
  ALL_BOTS_URL,
  BASE_TEMPLATE_BOT_URL,
  CREATE_BOT_URL,
  GET_EVENT_BY_BOT,
  GET_STATES_BY_BOT_URL,
} from "../constants/asklabApis.js";

const asklabClient = axios.create({
  baseURL: asklab.baseUrl,
  headers: { "xi-api-key": process.env.ASKLAB_API_KEY },
});

export const getBaseTemplate = async () => {
  const response = await asklabClient.get(BASE_TEMPLATE_BOT_URL);
  console.log(response.data);
  return response.data;
};

export const createBot = async (user) => {
  const botTemplate = await getBaseTemplate();

  const newBot = {
    ...botTemplate,
    botId: undefined,
    botName: user.companyName,
  };
  return await asklabClient.post(CREATE_BOT_URL, newBot);
};

export const getAllBots = async () => {
  const result = await asklabClient.get(ALL_BOTS_URL);
  console.log("allBots", result.data);
};

export const getEventByBot = async (botId) => {
  try {
    botId = "68ca6bb62a86bf0dce309052";
    //const user = await User.findOne({botId});
    // TODO:: 
       // - startDate : date de creation createdAt 
       // - endDate : date actuelle new Date()
    //if(!user) throw Error("user does not found with this botID"+botId)
    const calleeId = '68ca6e652a86bf0dce309055';
    const events = await asklabClient.post(`/events/byCalleeIdAndDateRange/${calleeId}`, {
      startDate: "2025-09-27T00:10",
      endDate: "2025-09-29T11:00",
    });
    console.log("events.data", events.data);
    return events.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getStatesByBot = async (botId) => {
  try {
    botId = "68ca6bb62a86bf0dce309052";
    //const user = await User.findOne({botId});
    //accedate a ctratedAt for dates filters
    //if(!user) throw Error("user does not found with this botID"+botId)
    const states = await asklabClient.post(
      `${GET_STATES_BY_BOT_URL}/${botId}/stats`,
      {
        startDate: "2025-09-18T00:10",
        endDate: "2025-09-29T11:00",
      }
    );

    console.log("states", states.data);
  } catch (error) {
    console.log(error);
  }
};

export const getCallById =()=>{

}
export const getUseCaseById = async ()=>{
  try{
  const response = await asklabClient.get(`/call/${'673396c9c4559112349a17e7'}/recording`)
  console.log(response);
    
  }catch(error){
    console.log(error)
  }
}


// all useres to see why  Error: user does not found with this botID68d28ef42a86bf0dce309f2d

export const getAllUsers = async () => {
  const result = await User.find();
  console.log(result);
};

