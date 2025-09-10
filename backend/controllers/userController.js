import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { CREATE_AGENT_ENDPOINT } from '../constants/api.js';
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
}

//Login user
const loginUser = async (req, res) => {
    const {email, password}= req.body;  
 try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.status(200).json({email,token , userRole: user.role, userCompanyName: user.companyName, agentId: user.agentId});
    }catch (error) {
              if (error.errors) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(400).json({ error: error.message });
    }
}
//Signup user

const signupUser = async (req, res) => {
  const { email, password, phoneNumber, companyName } = req.body;

  try {
    // 1) create user in your DB
    const user = await User.signup(email, password, phoneNumber, companyName);

    // 2) create agent in Rounded
    const agentBody = {
  name: companyName,
  language: "en"
};
    const agentResponse = await axios.post(
      CREATE_AGENT_ENDPOINT,
        agentBody,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": process.env.X_API_KEY, 
        },
      }
    );

    // 3) récupérer agent_id
    const agent = agentResponse.data;

    // 4) sauvegarder agent_id dans le user (DB)
    user.agentId = agent.data.id;
    await user.save();
    // 5) créer token et répondre
    const token = createToken(user._id);
    res.status(200).json({
      email,
      token,
      userRole: user.role,
      userCompanyName: user.companyName,
      agentId: user.agentId
    });

  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
const createTestUser = async (req, res) => {
  try {
    const { agentId, companyName, email, password, phoneNumber } = req.body;

    if (!agentId) {
      return res.status(400).json({ message: "agentId requis" });
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Chercher si l'user existe déjà
    let user = await User.findOne({ agentId });

    if (user) {
      // Mise à jour
      user.email = email;
      user.password = hashedPassword;
      user.phoneNumber = phoneNumber;
      user.companyName = companyName;

      await user.save();
      return res.status(200).json({ message: "✅ User mis à jour avec succès", user });
    }

    // Sinon, création
    user = await User.create({
      agentId,
      email,
      password: hashedPassword,
      phoneNumber,
      companyName,
    });

    res.status(201).json({ message: "✅ User créé avec succès", user });
  } catch (err) {
    console.error("❌ Erreur création/mise à jour user:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export { loginUser, signupUser, createTestUser };
