const cron = require("node-cron");
const { monthlyFAQBatch } = require("../batches/monthlyReportBatch");

cron.schedule("0 0 0 28-31 * *", async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (tomorrow.getDate() === 1) {
    console.log("📅 [Cron] Lancement du batch mensuel...");
    await monthlyFAQBatch();
  }
});
