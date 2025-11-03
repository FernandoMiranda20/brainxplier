// api/openai.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Sólo POST" });
    }

    // si Vercel ya parseó JSON, viene en req.body; si no, lo intentamos leer
    const body = req.body || {};
    const { idea1, idea2 = "" } = body;
    if (!idea1) return res.status(400).json({ error: "Falta idea1" });

    const folderName = process.env.MACHINA_FOLDER_NAME || "La Maquina Universal";
    const basePath = path.join(process.cwd(), folderName);

    // leer archivos de conocimiento
    let conocimiento = "";
    try {
      const archivos = fs.readdirSync(basePath);
      for (const archivo of archivos) {
        if (/\.(txt|md|json|yaml|yml)$/i.test(archivo)) {
          conocimiento += `\n\n=== ${archivo} ===\n`;
          conocimiento += fs.readFileSync(path.join(basePath, archivo), "utf8");
        }
      }
    } catch (e) {
      console.warn("No se pudo leer la carpeta:", basePath, e.message);
    }

    // recorte simple para no pasar de tokens
    const MAX_CHARS = 15000;
    const contexto = (conocimiento || "Sin archivos leídos.").slice(0, MAX_CHARS);

    // llamada a OpenAI
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content:
`Eres La Máquina Universal. Usa este conocimiento interno (resumido):
${contexto}`
          },
          {
            role: "user",
            content:
`Semillas: "${idea1}"${idea2 ? ` y "${idea2}"` : ""}.
Devuelve 3 planes en HTML simple (h3, ul/li), con pasos, riesgos y métricas.`
          }
        ],
        max_tokens: 1200
      }),
    });

    const data = await resp.json();
    const result = data?.choices?.[0]?.message?.content
      || data?.error?.message
      || "Sin respuesta de OpenAI.";

    return res.status(200).json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno en la Máquina Universal." });
  }
}
