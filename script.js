const form = document.querySelector("form");
const outputBox = document.createElement("div");
outputBox.classList.add("output");
document.body.appendChild(outputBox);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const idea1 = form.querySelectorAll("input")[0].value;
  const idea2 = form.querySelectorAll("input")[1].value;

  outputBox.innerHTML = "<p>Procesando ideas...</p>";

  const response = await fetch("/api/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea1, idea2 })
  });

  const data = await response.json();
  outputBox.innerHTML = `<div class="resultado">${data.result}</div>`;
});
