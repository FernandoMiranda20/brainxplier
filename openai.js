import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { entrada } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres el Brain Multiplier, un sistema de expansión mental y creatividad infinita." },
        { role: "user", content: entrada || "Hola, Brain Multiplier." },
      ],
    });

    res.status(200).json({ respuesta: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

