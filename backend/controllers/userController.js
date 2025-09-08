import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
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
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export { loginUser, signupUser };
