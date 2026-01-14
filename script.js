const v = (id) => document.getElementById(id).value || "";
const formatD = (d) => d ? d.split("-").reverse().join("/") : ".................";
const font = "helvetica";

window.onload = () => {
    document.getElementById('faita').value = "Perpignan";
    document.getElementById('dateSignature').value = new Date().toISOString().split('T')[0];
};

function toggleProf(isAutre) { document.getElementById('profession_autre').disabled = !isAutre; }
function toggleConjoint() {
    const sit = document.getElementById("matrimoniale").value;
    document.getElementById("conjoint").disabled = (sit === "Célibataire");
}

function getProf() {
    const radios = document.getElementsByName('prof_type');
    for (const r of radios) if (r.checked) return r.value === "autre" ? v("profession_autre") : r.value;
    return "";
}

function getSituationComplete() {
    const sit = v("matrimoniale");
    const conj = v("conjoint");
    if (conj && sit !== "Célibataire") return (sit === "Marié(e)") ? `${sit} à ${conj}` : `${sit} de ${conj}`;
    return sit;
}

function dessinerCadre(pdf) {
    pdf.setDrawColor(26, 90, 143); pdf.setLineWidth(0.8); pdf.rect(5, 5, 200, 287);
    pdf.setLineWidth(0.2); pdf.rect(6.5, 6.5, 197, 284);
    pdf.setFont(font, "bold"); pdf.setTextColor(34, 155, 76); pdf.setFontSize(11);
    pdf.text("POMPES FUNEBRES SOLIDAIRE PERPIGNAN", 105, 15, { align: "center" });
    pdf.setTextColor(0); pdf.setFontSize(8); pdf.setFont(font, "normal");
    pdf.text("32 boulevard Léon Jean Grégory Thuir - TEL : 0755182777", 105, 20, { align: "center" });
    pdf.text("HABILITATION N° : 23-66-0205 | SIRET : 53927029800042", 105, 24, { align: "center" });
}

function helperLignePropre(pdf, txt, val, x, y, dotStart, dotEnd = 185) {
    pdf.setFont(font, "bold"); pdf.text(txt, x, y);
    pdf.setFont(font, "normal");
    let curX = dotStart || (x + pdf.getTextWidth(txt) + 5);
    pdf.text(" : ", curX - 5, y);
    while (curX < dotEnd) { pdf.text(".", curX, y); curX += 1.5; }
    if (val) {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(dotStart + 2, y - 4, pdf.getTextWidth(val) + 2, 5, 'F');
        pdf.setFont(font, "bold"); pdf.text(val, dotStart + 3, y);
    }
}

function genererPouvoir() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    dessinerCadre(pdf);
    pdf.setFontSize(22); pdf.setTextColor(180, 0, 0); pdf.setFont(font, "bold");
    pdf.text("POUVOIR", 105, 42, { align: "center" });
    helperLignePropre(pdf, "Je soussigné", v("soussigne"), 20, 55, 60);
    helperLignePropre(pdf, "Demeurant", v("demeurant"), 20, 65, 60);
    helperLignePropre(pdf, "Lien de parenté", v("lien"), 20, 75, 60);
    pdf.setFont(font, "bold"); pdf.text("Ayant qualité pour pouvoir aux funérailles de :", 20, 85);
    
    const detailPrestation = v("prestation").toUpperCase() + " prévue le " + formatD(v("date_prestation")) + " à " + v("lieu_prestation");
    const data = [
        ["PRESTATION", detailPrestation],
        ["Nom d'usage", v("nom")], 
        ["Prénoms", v("prenom")], 
        ["Sexe", v("sexe")],
        ["Né(le)", formatD(v("date_naiss"))], 
        ["À (Lieu naiss.)", v("lieu_naiss")], 
        ["Décédé(e) le", formatD(v("date_deces"))], 
        ["À (Lieu décès)", v("lieu_deces")],
        ["Nationalité", v("nationalite")], 
        ["Domicile", v("adresse_fr")], 
        ["Situation", getSituationComplete()], 
        ["Profession", getProf()]
    ];
    let yT = 90;
    data.forEach(row => {
        pdf.setFillColor(230, 240, 255); pdf.rect(15, yT, 55, 7, 'F');
        pdf.setDrawColor(0); pdf.rect(15, yT, 55, 7); pdf.rect(70, yT, 125, 7);
        pdf.setFont(font, "normal"); pdf.setFontSize(8.5); pdf.text(row[0], 17, yT + 5);
        pdf.setFont(font, "bold"); pdf.text(row[1], 72, yT + 5); 
        yT += 7;
    });
    pdf.text(`Fait à ${v("faita")}, le ${formatD(v("dateSignature"))}`, 120, 240);
    pdf.text("Signature du mandant", 120, 250);
    pdf.save(`Pouvoir_${v("nom")}.pdf`);
}

function genererDeclaration() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    dessinerCadre(pdf);
    pdf.setFontSize(16); pdf.setFont(font, "bold");
    pdf.text("DÉCLARATION DE DÉCÈS", 105, 45, { align: "center" });
    helperLignePropre(pdf, "NOM", v("nom").toUpperCase(), 20, 70, 75);
    helperLignePropre(pdf, "PRÉNOMS", v("prenom"), 20, 85, 75);
    helperLignePropre(pdf, "DÉCÉDÉ LE", formatD(v("date_deces")), 20, 100, 75);
    pdf.save(`Declaration_${v("nom")}.pdf`);
}

function genererFermeture() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    dessinerCadre(pdf);
    pdf.text("PROCÈS-VERBAL DE FERMETURE", 105, 45, { align: "center" });
    helperLignePropre(pdf, "DÉFUNT", v("nom").toUpperCase() + " " + v("prenom"), 20, 70, 75);
    pdf.save(`Fermeture_${v("nom")}.pdf`);
}

function genererTransport() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    dessinerCadre(pdf);
    pdf.text("DÉCLARATION DE TRANSPORT", 105, 45, { align: "center" });
    pdf.save(`Transport_${v("nom")}.pdf`);
}