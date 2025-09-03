require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');
const app = express();
app.use(express.json()); // permet de lire le JSON envoyé dans req.body
app.use(cors()); 
app.use('/api/users', userRoutes);
mongoose.connect(process.env.MONGO_URL , { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});