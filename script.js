/* ==========================================================================
   SECURITE & CONFIG
   ========================================================================== */
const PASSWORD_ACCES = "PF2024"; 

function checkPassword() {
    const input = document.getElementById('password-input').value;
    const errorMsg = document.getElementById('login-error');
    if (input === PASSWORD_ACCES) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-content').classList.remove('hidden');
        sessionStorage.setItem('isLoggedIn', 'true');
    } else {
        errorMsg.style.display = 'block';
        document.getElementById('password-input').value = '';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-content').classList.remove('hidden');
    }
});

/* ==========================================================================
   HELPERS
   ========================================================================== */
const v = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
const formatD = (d) => d ? d.split("-").reverse().join("/") : ".................";
const font = "helvetica"; 
let logoBase64 = null;

window.onload = () => {
    if(document.getElementById('faita')) document.getElementById('faita').value = "Perpignan";
    const today = new Date().toISOString().split('T')[0];
    const dateFields = ['dateSignature', 'date_fermeture', 'date_inhumation', 'date_cremation'];
    dateFields.forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).value = today;
    });
    setTimeout(chargerLogoBase64, 500);
};

function chargerLogoBase64() {
    const imgElement = document.getElementById('logo-source');
    if (!imgElement || !imgElement.complete || imgElement.naturalWidth === 0) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    ctx.drawImage(imgElement, 0, 0);
    try { logoBase64 = canvas.toDataURL("image/png"); } catch (e) { logoBase64 = null; }
}

function ajouterFiligrane(pdf) {
    if (logoBase64) {
        try {
            pdf.saveGraphicsState();
            pdf.setGState(new pdf.GState({ opacity: 0.08 }));
            const width = 130; const height = 130; 
            pdf.addImage(logoBase64, 'PNG', (210 - width) / 2, (297 - height) / 2, width, height);
            pdf.restoreGraphicsState();
        } catch(e) {}
    }
}

// Fonction pour dessiner le tampon PF en bas à droite
function ajouterTamponPF(pdf, yPos) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(0);
    // Rotation légère pour effet tampon réaliste
    // pdf.setTextColor(50, 50, 150); // Bleu tampon
    
    const x = 140; 
    pdf.text("Signature", 150, yPos - 5);
    
    // Cadre du tampon imaginaire
    pdf.setFontSize(8);
    pdf.text("Pompes Funèbres Solidaire Perpignan", x, yPos + 5);
    pdf.setFont("helvetica", "normal");
    pdf.text("Mustapha CHERKAOUI", x + 5, yPos + 9);
    pdf.text("32 boulevard Léon Jean Grégory Thuir", x, yPos + 13);
    pdf.setFont("helvetica", "bold");
    pdf.text("07.55.18.27.77", x + 15, yPos + 17);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text("Siret : 539 270 298 00042 - APE 9603Z", x, yPos + 22);
    pdf.text("N° Habilitation : 23-66-0205", x + 10, yPos + 26);
    
    // Gribouillage signature simulé
    pdf.setLineWidth(0.5);
    pdf.lines([[5, -2], [10, 5], [5, -5], [10, 2]], x + 10, yPos + 10);
}

/* --- Navigation --- */
function switchView(viewName) {
    const sections = ['section-main', 'section-transport', 'section-fermeture'];
    sections.forEach(s => { if(document.getElementById(s)) document.getElementById(s).classList.add('hidden'); });

    const villeBase = v("faita");
    const dateBase = v("dateSignature");

    if (viewName === 'main') {
        document.getElementById('section-main').classList.remove('hidden');
    } 
    else if (viewName === 'transport') {
        document.getElementById('section-transport').classList.remove('hidden');
        if(!v("faita_transport")) document.getElementById('faita_transport').value = villeBase;
        if(!v("dateSignature_transport")) document.getElementById('dateSignature_transport').value = dateBase;
        if(!v("lieu_depart_t")) document.getElementById('lieu_depart_t').value = v("lieu_deces");
    } 
    else if (viewName === 'fermeture') {
        document.getElementById('section-fermeture').classList.remove('hidden');
        if(!v("faita_fermeture")) document.getElementById('faita_fermeture').value = villeBase;
        if(!v("dateSignature_fermeture")) document.getElementById('dateSignature_fermeture').value = dateBase;
        togglePresence('famille');
    }
}

function toggleProf(isAutre) { 
    document.getElementById('profession_autre').disabled = !isAutre; 
    if(!isAutre) document.getElementById('profession_autre').value = "";
}

function toggleConjoint() {
    const sit = document.getElementById("matrimoniale").value;
    const isActive = ["Marié(e)", "Veuf(ve)", "Divorcé(e)"].includes(sit);
    document.getElementById("conjoint").disabled = !isActive;
}

function togglePresence(type) {
    const fam = document.getElementById('bloc_presence_famille');
    const pol = document.getElementById('bloc_presence_police');
    const radios = document.getElementsByName('type_presence');
    radios.forEach(r => { if(r.value === type) r.checked = true; });
    if (type === 'famille') { fam.classList.remove('hidden'); pol.classList.add('hidden'); } 
    else { fam.classList.add('hidden'); pol.classList.remove('hidden'); }
}

function copierMandant() {
    const nom = v("soussigne"); const lien = v("lien"); const adr = v("demeurant");
    if(nom) document.getElementById('f_nom_prenom').value = nom;
    if(lien) document.getElementById('f_lien').value = lien;
    if(adr) document.getElementById('f_adresse').value = adr;
}

function getSituationComplete() {
    const sit = v("matrimoniale");
    const conj = v("conjoint");
    if (conj && !document.getElementById("conjoint").disabled) {
        if (sit === "Marié(e)") return `${sit} à ${conj}`;
        else return `${sit} de ${conj}`;
    }
    return sit;
}

/* ==========================================================================
   GENERATION PDF - DOCUMENTS EXISTANTS
   ========================================================================== */
function dessinerCadre(pdf) {
    ajouterFiligrane(pdf);
    pdf.setDrawColor(26, 90, 143); pdf.setLineWidth(0.8); pdf.rect(5, 5, 200, 287);
    pdf.setLineWidth(0.2); pdf.rect(6.5, 6.5, 197, 284);
    pdf.setFont(font, "bold"); pdf.setTextColor(34, 155, 76); pdf.setFontSize(12);
    pdf.text("POMPES FUNEBRES SOLIDAIRE PERPIGNAN", 105, 15, { align: "center" });
    pdf.setTextColor(80); pdf.setFontSize(8); pdf.setFont(font, "normal");
    pdf.text("32 boulevard Léon Jean Grégory Thuir - TEL : 07.55.18.27.77", 105, 20, { align: "center" });
    pdf.text("HABILITATION N° : 23-66-0205 | SIRET : 53927029800042", 105, 24, { align: "center" });
}

function helperLignePropre(pdf, label, value, x, y, dotsStart = 60) {
    pdf.setFont(font, "bold"); pdf.setTextColor(0); pdf.text(label, x, y);
    const labelWidth = pdf.getTextWidth(label);
    let currentX = x + labelWidth + 2;
    pdf.setFont(font, "normal"); pdf.setTextColor(150);
    const limit = dotsStart > currentX ? dotsStart : currentX + 5;
    while(currentX < limit) { pdf.text(".", currentX, y); currentX += 1.5; }
    pdf.text(" : ", limit, y);
    if(value) {
        pdf.setFont(font, "bold"); pdf.setTextColor(0); pdf.text(String(value), limit + 5, y);
    }
}

// 1. POUVOIR
function genererPouvoir() {
    if(!logoBase64) chargerLogoBase64();
    const { jsPDF } = window.jspdf; const pdf = new jsPDF();
    dessinerCadre(pdf);
    pdf.setFillColor(245, 245, 245); pdf.rect(20, 35, 170, 12, 'F');
    pdf.setFontSize(18); pdf.setTextColor(180, 0, 0); pdf.setFont(font, "bold");
    pdf.text("POUVOIR", 105, 43, { align: "center" });
    
    pdf.setFontSize(10); pdf.setTextColor(0);
    let y = 60;
    helperLignePropre(pdf, "Je soussigné(e)", v("soussigne"), 20, y, 70); y+=8;
    helperLignePropre(pdf, "Demeurant à", v("demeurant"), 20, y, 70); y+=8;
    helperLignePropre(pdf, "Lien de parenté", v("lien"), 20, y, 70); y+=12;
    pdf.text("Ayant qualité pour pourvoir aux funérailles de :", 20, y); y+=8;

    const detailPrestation = `${v("prestation").toUpperCase()} prévue le ${formatD(v("date_prestation"))}`;
    pdf.setFillColor(255, 243, 205); pdf.rect(20, y-5, 170, 10, 'F');
    pdf.setDrawColor(200); pdf.rect(20, y-5, 170, 10);
    pdf.setFont(font, "bold"); pdf.setTextColor(180,0,0);
    pdf.text("PRESTATION : " + detailPrestation, 105, y+1, { align: "center" });
    
    y += 12;
    const data = [
        ["Nom d'usage", v("nom")], ["Nom de jeune fille", v("nom_jeune_fille")],
        ["Prénoms", v("prenom")], ["Né(e) le", formatD(v("date_naiss")) + " à " + v("lieu_naiss")],
        ["Décédé(e) le", formatD(v("date_deces")) + " à " + v("lieu_deces")],
        ["Domicile", v("adresse_fr")], ["Situation", getSituationComplete()],
        ["Filiation", `De ${v("pere")} et de ${v("mere")}`]
    ];
    pdf.setTextColor(0); pdf.setFontSize(9);
    data.forEach(row => {
        pdf.setFillColor(252, 253, 255); pdf.rect(20, y-4, 50, 7, 'F'); pdf.rect(70, y-4, 120, 7, 'F');
        pdf.setDrawColor(0); pdf.rect(20, y-4, 50, 7); pdf.rect(70, y-4, 120, 7);
        pdf.setFont(font, "normal"); pdf.text(row[0], 22, y+1);
        pdf.setFont(font, "bold"); pdf.text(String(row[1] || ""), 72, y+1);
        y += 7;
    });
    y += 15;
    pdf.setFont(font, "bold"); pdf.setFontSize(10);
    pdf.text("Donne mandat aux Pompes Funèbres Solidaire Perpignan pour :", 20, y);
    pdf.setFont(font, "normal");
    pdf.text("- Me représenter auprès des mairies, cultes, cimetières et crématoriums.", 25, y+6);
    pdf.text("- Effectuer toutes les démarches administratives nécessaires.", 25, y+11);
    pdf.text("- Payer les sommes dues pour les frais d'obsèques.", 25, y+16);
    y = 240;
    pdf.line(20, y, 190, y); y += 10;
    pdf.text(`Fait à ${v("faita")}, le ${formatD(v("dateSignature"))}`, 25, y);
    pdf.setFont(font, "bold"); pdf.text("Signature du Mandant", 150, y, { align: "center" });
    pdf.save(`Pouvoir_${v("nom")}.pdf`);
}

// 2. DECLARATION
function genererDeclaration() {
    if(!logoBase64) chargerLogoBase64();
    const { jsPDF } = window.jspdf; const pdf = new jsPDF();
    ajouterFiligrane(pdf);
    pdf.setFont("times", "bold"); pdf.setFontSize(18);
    pdf.text("DECLARATION DE DECES", 105, 30, { align: "center" });
    pdf.setLineWidth(0.5); pdf.line(65, 32, 145, 32);
    pdf.setFontSize(11); pdf.text("A remettre obligatoirement complété et signé", 105, 40, { align: "center" });
    let y = 60; const margin = 20; const endLine = 190;
    const drawFormLine = (label, val, yPos) => {
        pdf.setFont("times", "bold"); pdf.text(label + " : ", margin, yPos);
        const startDots = margin + pdf.getTextWidth(label + " : ");
        let curX = startDots; pdf.setFont("times", "normal");
        while (curX < endLine) { pdf.text(".", curX, yPos); curX += 2; }
        if (val) {
            pdf.setFont("times", "bold");
            pdf.setFillColor(255, 255, 255); pdf.rect(startDots + 4, yPos - 4, pdf.getTextWidth(val) + 2, 5, 'F');
            pdf.text(val.toUpperCase(), startDots + 5, yPos);
        }
    };
    drawFormLine("NOM", v("nom"), y); y += 12;
    drawFormLine("NOM DE JEUNE FILLE", v("nom_jeune_fille"), y); y += 12;
    drawFormLine("Prénoms", v("prenom"), y); y += 12;
    drawFormLine("Né(e) le", formatD(v("date_naiss")), y); y+=12;
    drawFormLine("A", v("lieu_naiss"), y); y+=12;
    drawFormLine("Décédé(e) le", formatD(v("date_deces")), y); y+=12;
    drawFormLine("A", v("lieu_deces"), y); y+=12;
    drawFormLine("Domicilié(e)", v("adresse_fr"), y); y+=12;
    drawFormLine("Profession", v("profession_autre") || "Retraité(e)", y); y+=20;
    pdf.text("Signature des Pompes Funèbres :", 105, y, { align: "center" });
    ajouterTamponPF(pdf, y + 20);
    pdf.save(`Declaration_Deces_${v("nom")}.pdf`);
}

/* ==========================================================================
   NOUVEAUX DOCUMENTS (MAIRIE / DEMANDES)
   ========================================================================== */

// 3. DEMANDE D'INHUMATION (Document Bleu/Vert)
function genererDemandeInhumation() {
    if(!logoBase64) chargerLogoBase64();
    const { jsPDF } = window.jspdf; const pdf = new jsPDF();
    
    // En-tête PF
    pdf.setFont("helvetica", "bold"); pdf.setTextColor(0, 100, 50); pdf.setFontSize(11);
    pdf.text("POMPES FUNEBRES SOLIDAIRE PERPIGNAN", 105, 20, { align: "center" });
    pdf.setFont("helvetica", "normal"); pdf.setTextColor(0); pdf.setFontSize(9);
    pdf.text("32 Bd Léon Jean Grégory, 66300 THUIR - Tél: 07.55.18.27.77", 105, 25, { align: "center" });
    pdf.text("HABILITATION N° : 23-66-0205", 105, 30, { align: "center" });

    // Titre
    pdf.setFillColor(230, 240, 230); pdf.rect(20, 40, 170, 10, 'F');
    pdf.setFontSize(14); pdf.setFont("helvetica", "bold");
    pdf.text("DEMANDE D'INHUMATION", 105, 47, { align: "center" });

    let y = 65; const x = 25;
    pdf.setFontSize(11); pdf.setTextColor(0);
    
    pdf.setFont("helvetica", "bold"); pdf.text("Je soussigné :", x, y); y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.text("• Nom et Prénom : M. CHERKAOUI Mustapha", x + 10, y); y += 6;
    pdf.text("• Qualité : Dirigeant des Pompes Funèbres Solidaire Perpignan", x + 10, y); y += 6;
    pdf.text("• Adresse : 32 Bd Léon Jean Grégory, 66300 THUIR", x + 10, y); y += 15;

    pdf.text("Je vous adresse cette lettre afin de solliciter l'autorisation d'inhumation du défunt :", x, y); y += 10;
    
    // Info Défunt
    pdf.setFont("helvetica", "bold");
    pdf.text("• Nom et Prénom : " + v("nom").toUpperCase() + " " + v("prenom"), x + 10, y); y += 8;
    pdf.text("• Né(e) le : " + formatD(v("date_naiss")) + " à " + v("lieu_naiss"), x + 10, y); y += 8;
    pdf.text("• Décédé(e) le : " + formatD(v("date_deces")) + " à " + v("lieu_deces"), x + 10, y); y += 15;

    pdf.text("Lieu d'inhumation :", x, y); y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.text("• Nom du cimetière : " + v("cimetiere_nom"), x + 10, y); y += 8;
    pdf.text("• Date et Heure : Le " + formatD(v("date_inhumation")) + " à " + v("heure_inhumation"), x + 10, y); y += 8;
    pdf.text("• Numéro de concession : " + v("num_concession"), x + 10, y); y += 8;
    pdf.text("• Type : " + v("type_sepulture"), x + 10, y); y += 20;

    pdf.text("Je vous prie d'agréer, Monsieur le Maire, l'expression de mes salutations distinguées.", x, y); y += 20;

    pdf.setFont("helvetica", "bold");
    pdf.text(`Fait à ${v("faita")}, le ${formatD(v("dateSignature"))}`, x, y);
    
    ajouterTamponPF(pdf, y); // Ajout du tampon en bas à droite

    // Ajouter le logo en gros fond (filigrane très léger)
    ajouterFiligrane(pdf);

    pdf.save(`Demande_Inhumation_${v("nom")}.pdf`);
}

// 4. DEMANDE DE CREMATION (Lettre A Mr le Maire)
function genererDemandeCremation() {
    const { jsPDF } = window.jspdf; const pdf = new jsPDF();
    
    // En-tête Demandeur (Mandant)
    pdf.setFont("times", "bold"); pdf.setFontSize(11);
    pdf.text(v("soussigne"), 20, 20);
    pdf.setFont("times", "normal");
    pdf.text(v("demeurant"), 20, 25);

    // Destinataire
    pdf.setFont("times", "bold"); pdf.setFontSize(14);
    pdf.text("A", 105, 40, {align:"center"});
    pdf.text("Monsieur le Maire", 105, 50, {align:"center"});

    // Objet
    pdf.setFontSize(11); pdf.setFont("times", "bold");
    pdf.text("OBJET : DEMANDE D'AUTORISATION DE CREMATION", 20, 70);

    let y = 90;
    pdf.setFont("times", "normal");
    const texte = `Monsieur le Maire,

Je soussigné(e) ${v("soussigne")}, ${v("lien")} du défunt(e) ${v("nom")} ${v("prenom")}, né(e) le ${formatD(v("date_naiss"))} à ${v("lieu_naiss")} et décédé(e) le ${formatD(v("date_deces"))} à ${v("lieu_deces")}, déclare avoir qualité à ses funérailles.

Par la présente, je souhaite obtenir une autorisation de crémation de la dépouille mortelle.

Je certifie sur l'honneur agir conformément à la dernière volonté du défunt(e).

Je vous informe que le corps ne renferme pas de stimulateur cardiaque et que cette crémation aura lieu le ${formatD(v("date_cremation"))} au ${v("crematorium_nom")}.

Les cendres seront : ${v("destination_cendres")}.

Je vous prie de croire, Monsieur le Maire, en l'assurance de mes considérations distinguées.`;

    const lignes = pdf.splitTextToSize(texte, 170);
    pdf.text(lignes, 20, y);

    y += (lignes.length * 6) + 20;
    pdf.setFont("times", "bold");
    pdf.text(`A ${v("faita")}, le ${formatD(v("dateSignature"))}`, 120, y);
    pdf.text("Signature du demandeur", 120, y + 10);

    pdf.save(`Demande_Cremation_${v("nom")}.pdf`);
}

// 5. AUTORISATION DE FERMETURE (Mairie)
function genererDemandeFermetureMairie() {
    const { jsPDF } = window.jspdf; const pdf = new jsPDF();
    
    // Cadre bleu style officiel
    pdf.setDrawColor(26, 90, 143); pdf.setLineWidth(1);
    pdf.rect(10, 10, 190, 277);

    pdf.setFont("helvetica", "bold"); pdf.setTextColor(26, 90, 143); pdf.setFontSize(14);
    pdf.text("DEMANDE D'AUTORISATION DE FERMETURE", 105, 25, { align: "center" });
    pdf.text("DE CERCUEIL", 105, 32, { align: "center" });

    let y = 60; const x = 25;
    pdf.setTextColor(0); pdf.setFontSize(11);
    pdf.text("Je soussigné :", x, y); y+=10;
    
    pdf.setFont("helvetica", "normal");
    pdf.text("• Nom et Prénom : M. CHERKAOUI Mustapha", x+10, y); y+=7;
    pdf.text("• Qualité : Dirigeant PF Solidaire Perpignan", x+10, y); y+=7;
    pdf.text("• Adresse : 32 Bd Léon Jean Grégory, Thuir", x+10, y); y+=15;

    pdf.setFont("helvetica", "bold");
    pdf.text("A l'honneur de solliciter votre autorisation de fermeture du cercueil de :", x, y); y+=12;

    pdf.text("• Nom et Prénom : " + v("nom").toUpperCase() + " " + v("prenom"), x+10, y); y+=8;
    pdf.text("• Né(e) le : " + formatD(v("date_naiss")) + " à " + v("lieu_naiss"), x+10, y); y+=8;
    pdf.text("• Décédé(e) le : " + formatD(v("date_deces")) + " à " + v("lieu_deces"), x+10, y); y+=15;

    pdf.text("Et ce,", x, y); y+=10;
    pdf.text("• Le : " + formatD(v("date_fermeture")), x+10, y); y+=8;
    pdf.text("• A (Lieu) : " + v("lieu_fermeture"), x+10, y); y+=30;

    pdf.text(`Fait à ${v("faita")}, le ${formatD(v("dateSignature"))}`, x, y);
    
    ajouterTamponPF(pdf, y);
    pdf.save(`Demande_Fermeture_Mairie_${v("nom")}.pdf`);
}

// 6. DEMANDE D'OUVERTURE / EXHUMATION
function genererDemandeOuverture() {
    const { jsPDF } = window.jspdf; const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(14);
    pdf.text("DEMANDE D'OUVERTURE D'UNE SEPULTURE DE FAMILLE", 105, 20, {align:"center"});
    
    pdf.setFontSize(10);
    // Cases à cocher simulées
    const type = v("prestation"); // Inhumation, Exhumation...
    const check = (t) => type === t ? "[X]" : "[ ]";
    
    pdf.text(`${check("Inhumation")} INHUMATION    ${check("Exhumation")} EXHUMATION    [ ] SCELLEMENT D'URNE`, 105, 30, {align:"center"});

    let y = 50; const x = 20;
    pdf.text("Nous soussignons :", x, y); y+=7;
    pdf.text(`> Nom et Prénom : ${v("soussigne")} (${v("lien")})`, x+10, y); y+=7;
    // On laisse de la place pour d'autres signataires manuscrits si besoin
    pdf.text("> ...........................................................................................", x+10, y); y+=15;

    pdf.text("Demandons à faire :", x, y); y+=7;
    pdf.setFont("helvetica", "bold");
    pdf.text("Ouvrir la concession n° " + v("num_concession"), x+10, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Située au cimetière : ${v("cimetiere_nom")}`, x+10, y+5); y+=15;

    pdf.text("Concernant le défunt(e) :", x, y); y+=7;
    pdf.setFont("helvetica", "bold");
    pdf.text(`${v("nom")} ${v("prenom")}`, x+10, y); y+=5;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Décédé(e) le ${formatD(v("date_deces"))}`, x+10, y); y+=15;

    pdf.setFont("helvetica", "bold");
    pdf.text("Mandatons l'entreprise POMPES FUNEBRES SOLIDAIRE PERPIGNAN", x, y); y+=5;
    pdf.setFont("helvetica", "normal");
    pdf.text("Pour exécuter les travaux d'ouverture et de fermeture nécessaires.", x, y); y+=15;

    pdf.setFontSize(9);
    const disclaimer = "La présente déclaration dont j'assure la peine et entière responsabilité m'engage à garantir la ville contre toute réclamation qui pourrait survenir suite à l'opération.";
    const lines = pdf.splitTextToSize(disclaimer, 170);
    pdf.text(lines, x, y);
    
    y += 20;
    pdf.text("Signature des déclarants :", 140, y);
    
    pdf.save(`Demande_Ouverture_${v("nom")}.pdf`);
}

// ... (Garder les fonctions genererTransport et genererFermeture existantes en bas du fichier)
function genererFermeture() {
    if(!logoBase64) chargerLogoBase64();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    dessinerCadre(pdf);

    const isPolice = document.querySelector('input[name="type_presence"][value="police"]').checked;
    
    pdf.setFillColor(235, 245, 251); pdf.rect(20, 38, 170, 20, 'F');
    pdf.setDrawColor(26, 90, 143); pdf.rect(20, 38, 170, 20);
    
    pdf.setFontSize(13); pdf.setTextColor(26, 90, 143); pdf.setFont(font, "bold");
    pdf.text("PROCÈS-VERBAL DE FERMETURE DE CERCUEIL", 105, 45, { align: "center" });
    
    pdf.setFontSize(9); pdf.setTextColor(0);
    const subTitle = isPolice ? "ET SCELLEMENT SUR RÉQUISITION (ABSENCE DE FAMILLE)" : "ET SCELLEMENT EN PRÉSENCE DE LA FAMILLE";
    pdf.text(subTitle, 105, 53, { align: "center" });

    let y = 75; const xL = 25; const xD = 80;

    pdf.setFont(font, "bold"); pdf.text("L'ENTREPRISE DE POMPES FUNÈBRES :", xL, y); y+=7;
    pdf.setFont(font, "normal");
    pdf.text("Nous, PF Solidaire (Hab. 23-66-0205), certifions avoir procédé à la fermeture.", xL, y); y+=10;
    
    helperLignePropre(pdf, "DATE", formatD(v("date_fermeture")), xL, y, xD);
    helperLignePropre(pdf, "LIEU", v("lieu_fermeture"), 110, y, 125); y+=15;

    pdf.setFillColor(250, 250, 250); pdf.rect(20, y-5, 170, 32, 'F');
    pdf.setFont(font, "bold"); pdf.text("CONCERNANT LE DÉFUNT(E) :", xL, y); y+=8;
    helperLignePropre(pdf, "NOM / PRÉNOMS", `${v("nom")} ${v("prenom")}`, xL, y, xD); y+=8;
    helperLignePropre(pdf, "NÉ(E) LE", formatD(v("date_naiss")) + ` à ${v("lieu_naiss")}`, xL, y, xD); y+=8;
    helperLignePropre(pdf, "DÉCÉDÉ(E) LE", formatD(v("date_deces")) + ` à ${v("lieu_deces")}`, xL, y, xD); y+=15;

    pdf.line(20, y, 190, y); y+=10;
    
    if(isPolice) {
        pdf.setFont(font, "bold"); pdf.text("EN PRÉSENCE DE L'AUTORITÉ DE POLICE :", xL, y); y+=6;
        pdf.setFont(font, "italic"); pdf.setFontSize(8);
        pdf.text("(Requis en l'absence de famille ou d'ayants droit connus sur place)", xL, y); 
        pdf.setFontSize(10); pdf.setFont(font, "normal"); y+=8;
        helperLignePropre(pdf, "NOM & GRADE", v("p_nom_grade"), xL, y, xD); y+=8;
        helperLignePropre(pdf, "AFFECTATION", v("p_commissariat"), xL, y, xD);
    } else {
        pdf.setFont(font, "bold"); pdf.text("EN PRÉSENCE DE (FAMILLE) :", xL, y); y+=10;
        helperLignePropre(pdf, "NOM & PRÉNOM", v("f_nom_prenom"), xL, y, xD); y+=8;
        helperLignePropre(pdf, "LIEN DE PARENTÉ", v("f_lien"), xL, y, xD); y+=8;
        helperLignePropre(pdf, "DOMICILE", v("f_adresse"), xL, y, xD);
    }

    y = 220;
    pdf.setFillColor(255); pdf.rect(20, y, 80, 35, 'F'); pdf.rect(110, y, 80, 35, 'F');
    pdf.rect(20, y, 80, 35); pdf.rect(110, y, 80, 35);
    
    pdf.setFillColor(230); pdf.rect(20, y, 80, 7, 'F'); pdf.rect(110, y, 80, 7, 'F');
    pdf.setFontSize(9); pdf.setFont(font, "bold");
    const labelGauche = isPolice ? "L'OFFICIER DE POLICE" : "LA FAMILLE";
    pdf.text(labelGauche, 60, y+5, { align: "center" });
    pdf.text("L'OPERATEUR FUNÉRAIRE", 150, y+5, { align: "center" });
    pdf.setFont(font, "italic"); pdf.setFontSize(7);
    if(!isPolice) pdf.text("(Mention 'Lu et approuvé')", 60, y+32, { align: "center" });
    
    y += 45;
    pdf.setFont(font, "normal"); pdf.setFontSize(10);
    pdf.text(`Fait à ${v("faita_fermeture")}, le ${formatD(v("dateSignature_fermeture"))}`, 105, y, { align: "center" });

    pdf.save(`PV_Fermeture_${v("nom")}.pdf`);
}

function genererTransport() {
    if(!logoBase64) chargerLogoBase64();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    dessinerCadre(pdf);

    pdf.setFontSize(10); pdf.setFont(font, "bold");
    pdf.text(`VÉHICULE : ${v("immatriculation")}`, 180, 30, { align: "right" });

    pdf.setFontSize(15); pdf.setTextColor(26, 90, 143);
    pdf.text("DÉCLARATION DE TRANSPORT DE CORPS", 105, 50, { align: "center" });
    
    const typeTransport = document.querySelector('input[name="transport_type"]:checked').value;
    const titreSous = typeTransport === "avant" ? "AVANT MISE EN BIÈRE" : "APRÈS MISE EN BIÈRE";

    pdf.setFontSize(12); pdf.setTextColor(180, 0, 0); 
    pdf.text(titreSous, 105, 58, { align: "center" });

    let y = 80; const x = 25;
    pdf.setTextColor(0); pdf.setFontSize(10);
    pdf.text("Je soussigné, M. CHERKAOUI Mustapha, Gérant des PF Solidaire,", x, y); y+=6;
    pdf.text("Déclare effectuer le transport de la personne décédée suivante :", x, y); y+=15;

    pdf.setFillColor(245); pdf.rect(20, y-5, 170, 25, 'F');
    pdf.setFont(font, "bold"); pdf.text(`${v("nom")} ${v("prenom")}`, 105, y+2, { align: "center" });
    pdf.setFont(font, "normal");
    pdf.text(`Né(e) le ${formatD(v("date_naiss"))} et décédé(e) le ${formatD(v("date_deces"))}`, 105, y+10, { align: "center" });

    y += 35;
    
    pdf.setDrawColor(150); pdf.setLineWidth(0.5);
    pdf.line(105, y, 105, y+35); 
    
    pdf.setFont(font, "bold"); pdf.text("DÉPART", 60, y, { align: "center" });
    pdf.setFont(font, "normal");
    pdf.text(formatD(v("date_depart_t")) + " à " + v("heure_depart_t"), 60, y+8, { align: "center" });
    pdf.text(v("lieu_depart_t"), 60, y+16, { align: "center" });
    
    pdf.setFont(font, "bold"); pdf.text("ARRIVÉE", 150, y, { align: "center" });
    pdf.setFont(font, "normal");
    pdf.text(formatD(v("date_arrivee_t")) + " à " + v("heure_arrivee_t"), 150, y+8, { align: "center" });
    pdf.text(v("lieu_arrivee_t"), 150, y+16, { align: "center" });

    y += 50;
    pdf.text(`Fait à ${v("faita_transport")}, le ${formatD(v("dateSignature_transport"))}`, 25, y);
    
    pdf.setFont(font, "bold");
    pdf.text("Signature et Cachet", 150, y);
    
    pdf.save(`Transport_${titreSous}_${v("nom")}.pdf`);
}