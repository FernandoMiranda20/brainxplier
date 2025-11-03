// ===============================
// BACKEND - /api/openai.js
// ===============================
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Solo POST permitido." });
    }

    // 🧩 1. Leer la entrada del usuario
    const { idea1 } = req.body || {};
    if (!idea1) {
      return res.status(400).json({ error: "Falta la semilla (idea1)" });
    }

    // 🧠 2. Leer conocimiento base desde la carpeta
    const basePath = path.join(process.cwd(), "La-Maquina-Universal");
    let conocimiento = "";

    try {
      const archivos = fs.readdirSync(basePath);
      for (const archivo of archivos) {
        if (/\.(txt|md|json)$/i.test(archivo) && archivo !== "capas.json") {
          conocimiento += `\n\n=== ${archivo} ===\n`;
          conocimiento += fs.readFileSync(path.join(basePath, archivo), "utf8");
        }
      }
    } catch (error) {
      console.error("Error leyendo carpeta:", error);
      conocimiento = "Sin conocimiento base disponible.";
    }

    // ⚙️ 3. Leer las capas desde capas.json
    let capas = [];
    try {
      const capasData = fs.readFileSync(path.join(basePath, "capas.json"), "utf8");
      capas = JSON.parse(capasData).capas;
    } catch (e) {
      console.error("Error leyendo capas.json:", e);
      capas = [
        { nombre: "gramatica", n: 10 },
        { nombre: "semantica", n: 10 },
        { nombre: "ontologia", n: 10 },
        { nombre: "deontologia", n: 10 },
        { nombre: "epistemologia", n: 10 }
      ];
    }

    // 🔁 4. Llamar al modelo capa por capa
    const derivaciones = {};
    for (const capa of capas) {
      const prompt = `
        Genera ${capa.n} derivaciones de tipo "${capa.nombre}" 
        a partir de la semilla "${idea1}".
        Usa el conocimiento interno:
        ${conocimiento.slice(0, 5000)}
      `;

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Eres La Máquina Universal Metafísica." },
            { role: "user", content: prompt },
          ],
          max_tokens: 800,
        }),
      });

      const data = await resp.json();
      const texto = data?.choices?.[0]?.message?.content || "";
      derivaciones[capa.nombre] = texto.split("\n").filter(Boolean).slice(0, capa.n);
    }

    // 🧮 5. Crear combinaciones simples (muestra)
    const combinaciones = [];
    for (let i = 0; i < 20; i++) {
      const g = derivaciones.gramatica[i % derivaciones.gramatica.length] || "";
      const s = derivaciones.semantica[i % derivaciones.semantica.length] || "";
      const o = derivaciones.ontologia[i % derivaciones.ontologia.length] || "";
      const d = derivaciones.deontologia[i % derivaciones.deontologia.length] || "";
      const e = derivaciones.epistemologia[i % derivaciones.epistemologia.length] || "";

      combinaciones.push({
        id: i + 1,
        gramatica: g,
        semantica: s,
        ontologia: o,
        deontologia: d,
        epistemologia: e,
      });
    }

    // 🪶 6. Formatear salida en HTML
    let html = "<h2>Resultados de La Máquina Universal</h2>";
    for (const c of combinaciones) {
      html += `
        <div style="margin-bottom:20px;">
          <h3>Proyecto ${c.id}</h3>
          <ul>
            <li><b>Gramática:</b> ${c.gramatica}</li>
            <li><b>Semántica:</b> ${c.semantica}</li>
            <li><b>Ontología:</b> ${c.ontologia}</li>
            <li><b>Deontología:</b> ${c.deontologia}</li>
            <li><b>Epistemología:</b> ${c.epistemologia}</li>
          </ul>
        </div>
      `;
    }

    res.status(200).json({ result: html });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno en la Máquina Universal." });
  }
}
// ===============================
