document.getElementById("ideaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const [i1, i2] = e.target.querySelectorAll("input");
  const output = document.getElementById("output");
  output.textContent = "✨ Procesando...";

  try {
    const resp = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea1: i1.value, idea2: i2.value || "" }),
    });
    const data = await resp.json();
    // El modelo devuelve HTML simple en data.result
    output.innerHTML = data.result || data.error || "Sin respuesta.";
  } catch {
    output.textContent = "Error de conexión.";
  }
});
