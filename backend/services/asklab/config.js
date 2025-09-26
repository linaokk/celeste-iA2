import "dotenv/config";

  export const asklab= {
    baseUrl: "https://api.asklabai.com",
    apiKey: process.env.ASKLAB_API_KEY,
    templateBotId: process.env.ASKLAB_TEMPLATE_BOT_ID,
    defaults: {
      language: "fr",
      voiceId: "laura",
      active: true,
      replicas: 1,
      maxCallPerCallee: 5,
      hoursToNextCall: 6,
      callsPerSecond: 2,
      reengageDelayMs: 0,
      noiseReductionMode: "near",
    },
  
};
