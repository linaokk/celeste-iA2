const { ALL_CALLS_ENDPOINT } = require('../constants/api');
const { ROUNDED_API_ERROR } = require('../constants/errors');
const getKpis = async (req, res) => {
  const agentId = req.query.agentId;
  try {
    const options = {
      method: 'GET',
      headers: { 'X-Api-Key': process.env.X_API_KEY }
    };

    const response = await fetch(ALL_CALLS_ENDPOINT, options);
    const data = await response.json();
    let calls = data.data || [];
    if (agentId) {
        calls = calls.filter(call => call.agent_id === agentId);
      } 
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calls this month
    const callsThisMonth = calls.filter(call => {
      const callDate = new Date(call.start_time);
      return (
        callDate.getMonth() === currentMonth &&
        callDate.getFullYear() === currentYear
      );
    });

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

module.exports = { getKpis };

/*================ functions to be implemented later ===================*/


//module.exports = {  getCallsThisMonth , getAverageCallDuration , getAverageCallCost };
