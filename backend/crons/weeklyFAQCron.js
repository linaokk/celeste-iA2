const cron = require("node-cron");
const { weeklyFAQBatch } = require("../batches/weeklyFAQBatch");

cron.schedule("0 10 * * 6", async () => { 
  try {
    await weeklyFAQBatch();
  } catch (err) {
    console.error("Erreur batch FAQ :", err);
  }
});