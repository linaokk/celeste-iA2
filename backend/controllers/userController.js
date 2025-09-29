const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const { createBot } = require("../services/asklabBotServices");
const { createAgent } = require("../services/roundedAgentServices.js");
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

//Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({
      email,
      token,
      userRole: user.role,
      userCompanyName: user.companyName,
      botId: user?.botId,
      asklabOrRounded: user.asklabOrRounded,
      agentId: user?.agnetId,
    });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};
//Signup user

const signupUser = async (req, res) => {
  const { email, password, phoneNumber, companyName } = req.body;

  try {
    const user = await User.signup(email, password, phoneNumber, companyName);
    if (user.asklabOrRounded === "asklab") {
      console.log("user.asklabOrRounded", user.asklabOrRounded);

      const newBotForTheUser = await createBot(user);
      user.botId = newBotForTheUser.data;
      user.agnetId = undefined;
      await user.save();
      const token = createToken(user._id);
      res.status(200).json({
        email,
        token,
        userRole: user.role,
        userCompanyName: user.companyName,
        asklabOrRounded: user.asklabOrRounded,
        botId: user.botId,
      });
    }else if (user.asklabOrRounded === 'rounded'){
        const newAgentForTheUser = await createAgent(user);
          user.agentId = newAgentForTheUser.data.id;
          user.botId = undefined;
          await user.save();
          const token = createToken(user._id);
          res.status(200).json({
            email,
            token,
            userRole: user.role,
            userCompanyName: user.companyName,
            asklabOrRounded: user.asklabOrRounded,
            agentId: user.agentId,
          });
    }
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
module.exports = { loginUser, signupUser };
