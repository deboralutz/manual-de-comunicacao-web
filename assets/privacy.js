"use strict";
document.getElementById("clear-manual-data").addEventListener("click", function () {
  if (!window.confirm("Apagar as aulas marcadas e a aparência salva neste endereço? Essa ação não pode ser desfeita.")) return;
  const status = document.getElementById("privacy-status");
  try {
    localStorage.removeItem("manual.finished");
    localStorage.removeItem("manual.theme");
    status.textContent = "Marcações de leitura e preferência de aparência apagadas deste endereço. Recarregue outras abas do Manual para ver a atualização.";
  } catch (error) {
    status.textContent = "Não foi possível acessar o armazenamento. Use as configurações de privacidade do navegador para apagar os dados deste site.";
  }
});
