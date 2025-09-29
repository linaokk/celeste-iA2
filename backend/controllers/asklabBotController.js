import { getEventByBot } from "../services/asklabBotServices.js";
import { parseAskLabDate } from "../utils/parsAsklabDate.js";


  export const getBotKpis = async (req, res) => {
    try {
      const botId = '68ca6bb62a86bf0dce309052';
      //const botId = req.query.botId; 
      const eventsBot = await getEventByBot(botId);

      const callsMap = {};
      const sessionCount = {};
      
      eventsBot.forEach((ev) => {
        const key = `${ev.calleeId}_${ev.botCsId}`;

        if (!sessionCount[key]) sessionCount[key] = 0;
        if (!callsMap[key]) callsMap[key] = [];

        if (ev.eventCode === 140) { // Début de session
          sessionCount[key]++;
          callsMap[key].push({
            session: sessionCount[key],
            events: [ev],
          });
        } else {
          const lastSession = callsMap[key][callsMap[key].length - 1];
          if (lastSession) lastSession.events.push(ev);
        }
      });

      const successfulCalls = [];

      Object.values(callsMap).forEach(sessions => {
        sessions.forEach(session => {
          // Vérifier si la connexion s'est établie (code 160)
          const hasConnected = session.events.some(e => e.eventCode === 160);
          
          if (hasConnected) {
            // DÉBUT DE CONVERSATION : Quand l'agent/bot commence à traiter (103 ou 160)
            const conversationStartEvent = session.events.find(e => e.eventCode === 103 || e.eventCode === 160);
            
            // FIN DE CONVERSATION : Dernière réponse du bot (200 ou 203) ou fin de traitement (161/151)
            const conversationEndEvents = session.events.filter(e => [200, 203, 161, 151].includes(e.eventCode));
            const conversationEndEvent = conversationEndEvents[conversationEndEvents.length - 1] || session.events[session.events.length - 1];
            
            // Calculer la durée de conversation active seulement si on a les deux événements
            let conversationDurationSec = 0;
            if (conversationStartEvent && conversationEndEvent) {
              const startTime = parseAskLabDate(conversationStartEvent.timeStamp);
              const endTime = parseAskLabDate(conversationEndEvent.timeStamp);
              conversationDurationSec = Math.round((endTime - startTime) / 1000);
            }

            // Analyser la qualité de l'appel
            const hasSuccessfulResponse = session.events.some(e => e.eventCode === 200);
            const hasAlternativeResponse = session.events.some(e => e.eventCode === 203);
            
            let callStatus = 'unknown';
            if (hasSuccessfulResponse) callStatus = 'successful';
            else if (hasAlternativeResponse) callStatus = 'partial_success';
            else if (session.events.some(e => [161, 151].includes(e.eventCode))) callStatus = 'completed';

            successfulCalls.push({
              calleeId: conversationStartEvent?.calleeId,
              botCsId: conversationStartEvent?.botCsId,
              conversationDurationSec, // Temps de conversation active
              eventsCount: session.events.length,
              eventsCodes: session.events.map(e => e.eventCode),
              callStatus,
              conversationStart: {
                code: conversationStartEvent?.eventCode,
                timestamp: conversationStartEvent?.timeStamp
              },
              conversationEnd: {
                code: conversationEndEvent?.eventCode,
                timestamp: conversationEndEvent?.timeStamp
              }

            });
          }
        });
      });
      const costPerMinute = 0.19; 
      const totalDurationCallsBot = successfulCalls.reduce((sum, item) => sum + item.conversationDurationSec, 0);
      const totalCost = ((totalDurationCallsBot / 60) * costPerMinute).toFixed(2);
      const averageCost = totalCost / successfulCalls.length
      const response = {
        averageDuration : totalDurationCallsBot/ successfulCalls.length, 
        callsCount : successfulCalls.length,
        averageCost : 0, 
        callsThisMonthCount: 0,
        totalCost,  
        averageCost, 
      }
      res.status(200).json(response);

    } catch (error) {
      console.error('Error in getBotKpis:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

export const getRecordCallsByBot = async(req , res) =>{
return 
}

export const  getEventsByBot = async (req, res) => {
  try {
    const botId = req.query.botId;
    const eventsBot = await getEventByBot(botId);
    res.status(200).json(eventsBot);
    }catch (error) {
    console.error('Error in getEventsByBot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }}

