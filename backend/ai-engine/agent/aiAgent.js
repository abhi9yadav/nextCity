const { GoogleGenAI } = require("@google/genai");

const { getComplaintStats } = require("../tools/complaintTools");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const complaintStatsTool = {
  type: "function",
  name: "get_complaint_stats",

  description:
    "Get complaint statistics available to the currently authenticated user.",

  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
};

const runAgent = async ({ message, user }) => {
  const tools = [complaintStatsTool];

  let interaction = await ai.interactions.create({
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",

    input: message,

    tools,
  });

  while (true) {
    const functionCalls = interaction.steps.filter(
      (step) => step.type === "function_call",
    );

    if (functionCalls.length === 0) {
      return interaction.output_text;
    }

    const results = [];

    for (const call of functionCalls) {
      let result;

      switch (call.name) {
        case "get_complaint_stats":
          result = await getComplaintStats({ user });
          break;

        default:
          throw new Error(`Unknown AI tool: ${call.name}`);
      }

      results.push({
        type: "function_result",
        name: call.name,
        call_id: call.id,
        result: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      });
    }

    interaction = await ai.interactions.create({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",

      previous_interaction_id: interaction.id,

      tools,

      input: results,
    });
  }
};

module.exports = {
  runAgent,
};
