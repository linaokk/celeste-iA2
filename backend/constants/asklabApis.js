import { asklab } from "../services/asklab/config.js";

export const BASE_TEMPLATE_BOT_URL = `/botCs/${asklab.templateBotId}`; 
export const CREATE_BOT_URL = `${asklab.baseUrl}/botCs`; 
export const ALL_BOTS_URL= '/botCs'; 
export const GET_EVENT_BY_BOT = `/events/byBotCsId/`
export const GET_STATES_BY_BOT_URL = "/events/byBotCsId"

