const PDFDocument = require("pdfkit");

// Générer le PDF en mémoire
function generatePDFBuffer(agentId, companyName, questions, totalCalls) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.fontSize(20).text(`Rapport Mensuel - ${companyName}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Agent: ${companyName} `);
    doc.text(`Nombre de calls ce mois: ${totalCalls}`);
    doc.moveDown();
    doc.text("Top 5 questions fréquentes:");
    questions.forEach((q, i) => doc.text(`${i + 1}. ${q}`));

    doc.end();
  });
}
module.exports = { generatePDFBuffer };