/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // Ensure the API key is set
});

export async function POST(req: Request) {
  const body = await req.json();
  const { prompt } = body;

  if (!prompt || typeof prompt !== "string") {
    return new Response("Prompt is required and must be a string.", {
      status: 400,
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or 'gpt-4' for better results
      messages: [{ role: "user", content: prompt }],
    });

    const aiResponse =
      response.choices[0]?.message?.content || "No response received.";

    return Response.json({ response: aiResponse });
  } catch (error: any) {
    console.error("Error communicating with OpenAI:", error);
    return new Response("An error occurred while processing your request.", {
      status: 500,
    });
  }
}