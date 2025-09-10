require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');
const rentalRoutes = require('./routes/relantalRoute.js');
const faqRoutes = require('./routes/faqQuestionRoute.js');
const historyRoutes = require('./routes/historyRoute.js');
//const  createTestUser  = require('./controllers/userController.js');
const app = express();

//const { monthlyFAQBatch } = require("./batches/monthlyReportBatch.js");
const AgentMonthlyReports = require("./models/agentReportModel.js");
const { weeklyFAQBatch } = require('./batches/weeklyFAQBatch.js');

app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/agentReports',historyRoutes );
app.use('/api/faq', faqRoutes);
//app.use('/user', createTestUser)
async function startServer() {
  try {
    await mongoose.connect(
      "mongodb+srv://nabilberji_db_user:Password123@cluster0.wbiidtb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("✅ Connected to MongoDB");
    const agentReport = await AgentMonthlyReports.findOne({ agentId: "bc119fc8-b41b-4f90-a2b8-6a63e29edac3" });
    console.log("agentReport", agentReport);
    //await monthlyFAQBatch();
    // await weeklyFAQBatch();
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
    require("./crons/monthlyReportCron");
    require("./crons/weeklyFAQCron");
  } catch (err) {
    console.error("❌ Error starting server:", err);
  }
} 
startServer();
