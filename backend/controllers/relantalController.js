const { ALL_CALLS_ENDPOINT, ROUNDED_API } = require('../constants/api');
const { ROUNDED_API_ERROR } = require('../constants/errors');
const UserCallTranscript = require("../models/userTranscriptModel.js"); 
const getKpis = async (req, res) => {
  const agentId = req.query.agentId;
  try {
    const calls = await getCalls(agentId);
    // Filtrer les appels pour le mois en cours
    const callsThisMonth = await getCallsThisMonth(calls);
    // Average duration
    const totalDuration = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
    const averageDurationSeconds = calls.length ? totalDuration / calls.length : 0;

    // Average cost (10DH = ~€1)
    const costPerMinute = 0.19; 
    const totalCost = calls.reduce((sum, c) => {
      const minutes = (c.duration_seconds || 0) / 60;
      return sum + minutes * costPerMinute;
    }, 0);
    const averageCost = calls.length ? totalCost / calls.length : 0;

    res.status(200).json({
      averageDurationSeconds,
      averageDurationMinutes: averageDurationSeconds / 60,
      callsThisMonthCount: callsThisMonth.length,
      callsCount: calls.length,
      totalCost,
      averageCost
    });

  } catch (error) {
    console.error(ROUNDED_API_ERROR, error);
    res.status(500).json({ error: ROUNDED_API_ERROR });
  }
};
// const getTreequestionsFrequencyThisMonth = async () =>{
//   try {

//     // step 2
//     const calls = await getCalls();
//     const callsThisMonth = await getCallsThisMonth(calls); // a revoir
//     const detailsCallsPromises = callsThisMonth.map(c => getCallDetails(c.id));
//     const detailsCalls = await Promise.all(detailsCallsPromises); 
//    const callsWithTranscript = detailsCalls.filter(call =>  call.transcript.length > 0);
//     if(callsWithTranscript.length > 0){
//       await UserCallTranscript.deleteMany({}); 
//       await saveCallsTranscription(callsWithTranscript);
//     }
// // step 1
//     const today = new Date();
//     let  currentMonth = today.getMonth() 
//     let  currentYear = today.getFullYear();
//     if (currentMonth === 0){
//       currentMonth = 12; // Décembre
//       currentYear -= 1;
//     }
//     const pipeline = [
//       {
//         $project: {
//           agentId: 1,
//           // filtrer les messages qui contiennent le rôle "user"
//           transcripts: {
//             $filter: {
//               input: "$transcripts",
//               as: "msg",
//               cond: { $regexMatch: { input: "$$msg", regex: /^user:/ } } 
//             }
//           }
//         }
//       },
//       {
//         $group: {
//           _id: "$agentId",
//           transcripts: { $push: "$transcripts" } 
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           agentId: "$_id",
//           // aplatir les tableaux imbriqués
//           transcripts: { $reduce: { input: "$transcripts", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } }
//         }
//       }
//     ];
//   const result = await UserCallTranscript.aggregate(pipeline);
    
//   }catch (error) {
//     console.error(ROUNDED_API_ERROR, error);
//     // res.status(500).json({ error: ROUNDED_API_ERROR });
//   }
// }
async function getCalls(agentId = null) {
  const options = {
    method: 'GET',
    headers: { 'X-Api-Key': process.env.X_API_KEY }
  };

  const response = await fetch(ALL_CALLS_ENDPOINT, options);
  const data = await response.json();
  let calls = data.data || [];

  // filtrer par agent si agentId fourni
  if (agentId) {
    calls = calls.filter(call => call.agent_id === agentId);
  }
  return calls;
}
const getCallDetails = async (callId) => {
  const options = {
    method: 'GET',
    headers: { 'X-Api-Key': process.env.X_API_KEY }
  };

  const response = await fetch(`${ROUNDED_API}/calls/${callId}`, options);
  const data = await response.json();

  // ici on normalise : tjrs un tableau
  if (data && data.data) {return data.data;}
  return [];
};
module.exports = { getKpis, getCallDetails , getCalls};

/*================ functions to be implemented later ===================*/

const getCallsThisMonth = async (callsArray) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
      const callsThisMonth = callsArray.filter(call => {
      const callDate = new Date(call.start_time);
      return (
        callDate.getMonth() === currentMonth &&
        callDate.getFullYear() === currentYear
      );
    });
    return callsThisMonth;
}

async function saveCallsTranscription(callsWithTranscript) {
  for (const call of callsWithTranscript) {
    const callDate = new Date(call.start_time);

    const newTranscript = new UserCallTranscript({
      call_date: callDate,
      call_id: call.id,
      transcripts: call.transcript.map(t => `${t.role}: ${t.content || ""}`), // convert object → string
      month: callDate.getMonth() + 1,
      year: callDate.getFullYear(),
      agentId: call.agent_id
    });

    await newTranscript.save();
    console.log(`Saved transcript for call ${call.id}`);
  }
}

