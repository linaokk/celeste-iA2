const User = require("../models/userModel");

const createTestUser = async (req, res) => {
  try {
    const { agentId, companyName, email } = req.body;

    if (!agentId) {
      return res.status(400).json({ message: "agentId requis" });
    }

    // éviter les doublons
    let existing = await User.findOne({ agentId });
    if (existing) {
      return res.status(400).json({ message: "Cet agent existe déjà" });
    }

    const newUser = await User.create({
      agentId,
      companyName,
      email,
    });

    res.status(201).json({ message: "✅ User créé avec succès", user: newUser });
  } catch (err) {
    console.error("❌ Erreur création user:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { createTestUser };
