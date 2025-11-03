// api/openai.js
export default async function handler(req, res) {
  const { idea1, idea2 } = await req.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres La Máquina Universal, un multiplicador de ideas metafísicas, creativas y aplicadas."
        },
        {
          role: "user",
          content: `Multiplica y desarrolla nuevas ideas a partir de: "${idea1}" y "${idea2}".`
        }
      ],
    }),
  });

  const data = await response.json();
  res.status(200).json({ result: data.choices[0].message.content });
}
