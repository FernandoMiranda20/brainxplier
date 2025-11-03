document.getElementById("ideaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const idea1 = e.target.querySelector("input").value;
  const output = document.getElementById("output");
  output.textContent = "⏳ Procesando...";

  try {
    const resp = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea1 }),
    });
    const data = await resp.json();
    output.innerHTML = data.result || data.error || "Sin respuesta.";
  } catch (err) {
    output.textContent = "❌ Error de conexión con la Máquina Universal.";
  }
});
