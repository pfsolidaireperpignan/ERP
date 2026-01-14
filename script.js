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
    const isActive = (sit === "Marié(e)" || sit === "Veuf(ve)" || sit === "Divorcé(e)");
    document.getElementById("conjoint").disabled = !isActive;
}

function getProf() {
    const radios = document.getElementsByName('prof_type');
    for (const r of radios) {
        if (r.checked) return r.value === "autre" ? v("profession_autre") : r.value;
    }
    return "";
}

function getSituationComplete() {
    const sit = v("matrimoniale");
    const conj = v("conjoint");
    const conjElt = document.getElementById("conjoint");
    
    if (conj && !conjElt.disabled) {
        if (sit === "Marié(e)") {
            return `${sit} à ${conj}`;
        } else {
            return `${sit} de ${conj}`;
        }
    }
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

// Fonction améliorée pour les lignes avec pointués
function helperLignePropre(pdf, txt, val, x, y, dotStart, dotEnd = 185) {
    pdf.setFont(font, "bold"); pdf.setTextColor(0); pdf.text(txt, x, y);
    const tw = pdf.getTextWidth(txt); 
    
    // On dessine le texte du label
    // On repasse en police normale pour les points et la valeur
    pdf.setFont(font, "normal");
    
    // Si on veut forcer le début des points, on utilise dotStart
    // Sinon on laisse un petit espace après le texte
    let curX = dotStart || (x + tw + 2);
    
    pdf.text(" : ", curX - 5, y); // Le deux-points
    
    // Boucle pour dessiner les points
    while (curX < dotEnd) { 
        pdf.text(".", curX, y); 
        curX += 1.5; 
    }
    
    // Si une valeur existe, on l'écrit par dessus les points (avec fond blanc)
    if (val && val.trim() !== "") {
        const valWidth = pdf.getTextWidth(val);
        // On crée un rectangle blanc pour masquer les points sous le texte
        pdf.setFillColor(255, 255, 255); 
        // Ajustement précis du rectangle blanc
        let rectX = dotStart + 2;
        // Si c'est trop court, on centre un peu ou on le met au début
        pdf.rect(rectX, y - 4, valWidth + 2, 5, 'F');
        
        pdf.setFont(font, "bold"); 
        pdf.text(val, rectX + 1, y);
    }
}

function genererPouvoir() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    dessinerCadre(pdf);
    pdf.setFontSize(22); pdf.setTextColor(180, 0, 0); pdf.setFont(font, "bold");
    pdf.text("POUVOIR", 105, 42, { align: "center" });
    
    pdf.setFontSize(10.5); pdf.setTextColor(0);
    helperLignePropre(pdf, "Je soussigné", v("soussigne"), 20, 55, 60);
    helperLignePropre(pdf, "Demeurant", v("demeurant"), 20, 65, 60);
    helperLignePropre(pdf, "Lien de parenté", v("lien"), 20, 75, 60);
    pdf.setFont(font, "bold"); pdf.text("Ayant qualité pour pouvoir aux funérailles de :", 20, 85);

    const detailPrestation = v("prestation").toUpperCase() + " prévue le " + formatD(v("date_prestation")) + " à " + v("lieu_prestation");

    const data = [
        ["PRESTATION", detailPrestation],
        ["Nom d'usage", v("nom")], 
        ["Nom de jeune fille", v("nom_jeune_fille") || "/"], 
        ["Prénoms", v("prenom")], 
        ["Sexe", v("sexe")],
        ["Né(le)", formatD(v("date_naiss"))], 
        ["À (Lieu naiss.)", v("lieu_naiss")], 
        ["Décédé(e) le", formatD(v("date_deces"))], 
        ["À (Lieu décès)", v("lieu_deces")],
        ["Filiation", "Fils/Fille de " + v("pere") + " et de " + v("mere")], 
        ["Nationalité", v("nationalite")], 
        ["Domicile", v("adresse_fr")], 
        ["Situation", getSituationComplete()], 
        ["Profession", getProf()]
    ];

    let yT = 90;
    data.forEach(row => {
        if(row[0] === "PRESTATION") pdf.setFillColor(255, 243, 205); 
        else pdf.setFillColor(230, 240, 255);
        pdf.rect(15, yT, 55, 7, 'F');
        pdf.setDrawColor(0); pdf.rect(15, yT, 55, 7); pdf.rect(70, yT, 125, 7);
        pdf.setFont(font, "normal"); pdf.setFontSize(8.5); pdf.setTextColor(0);
        pdf.text(row[0], 17, yT + 5);
        if(row[0] === "PRESTATION") { pdf.setTextColor(180, 0, 0); pdf.setFont(font, "bold"); pdf.setFontSize(7.5); }
        else { pdf.setTextColor(0); pdf.setFont(font, "bold"); pdf.setFontSize(8.5); }
        pdf.text(row[1], 72, yT + 5); 
        pdf.setTextColor(0);
        yT += 7;
    });

    yT += 10; pdf.setFontSize(10); pdf.setFont(font, "bold");
    pdf.text("Donne mandat aux Pompes funèbres Solidaire Perpignan;", 15, yT);
    pdf.setFont(font, "normal");
    pdf.text("De me représenter auprès des Autorités et Administrations civiles et religieuses,", 15, yT + 8);
    pdf.text("d’effectuer toutes les démarches et de payer toutes sommes que nécessitent ces funérailles.", 15, yT + 13);
    yT = 245; pdf.text(`Fait à : ${v("faita")} Le : ${formatD(v("dateSignature"))}`, 20, yT);
    pdf.setFont(font, "bold"); pdf.text("Signature Obligatoire", 145, yT);
    try { pdf.addImage("cachet.png", 'PNG', 140, yT + 5, 45, 25); } catch(e){}
    
    pdf.save(`Pouvoir ${v("nom")} ${v("prenom")}.pdf`);
}

function genererDeclaration() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    dessinerCadre(pdf);
    pdf.setFontSize(16); pdf.setFont(font, "bold");
    pdf.text("DÉCLARATION DE DÉCÈS", 105, 45, { align: "center" });
    pdf.line(70, 46, 140, 46);

    let y = 65; const colDot = 75; 
    pdf.setFontSize(9);

    helperLignePropre(pdf, "NOM", v("nom").toUpperCase(), 20, y, colDot);
    helperLignePropre(pdf, "NOM DE JEUNE FILLE", v("nom_jeune_fille").toUpperCase(), 20, y + 10, colDot);
    helperLignePropre(pdf, "PRÉNOMS", v("prenom"), 20, y + 20, colDot);
    helperLignePropre(pdf, "NÉ(E) LE", formatD(v("date_naiss")), 20, y + 30, 40, 90);
    helperLignePropre(pdf, "À", v("lieu_naiss"), 95, y + 30, 102, 185);
    helperLignePropre(pdf, "DÉCÉDÉ(E) LE", formatD(v("date_deces")), 20, y + 42, 52, 100);
    helperLignePropre(pdf, "À", v("lieu_deces"), 105, y + 42, 112, 185);
    
    pdf.setFont(font, "bold"); pdf.text("PROFESSION :", 20, y + 54);
    pdf.setFont(font, "normal");
    pdf.rect(colDot, y + 51, 3.5, 3.5); pdf.text("Sans profession", colDot + 5, y + 54);
    pdf.rect(colDot + 40, y + 51, 3.5, 3.5); pdf.text("Retraité(e)", colDot + 45, y + 54);
    
    const profActuelle = getProf();
    if(profActuelle.includes("Sans")) pdf.text("X", colDot + 0.6, y + 53.8);
    else if(profActuelle.includes("Retraité")) pdf.text("X", colDot + 40.6, y + 53.8);
    else if(profActuelle !== "") {
        pdf.setFont(font, "bold");
        pdf.text(profActuelle, colDot + 85, y + 54);
    }

    helperLignePropre(pdf, "DOMICILIÉ(E)", v("adresse_fr"), 20, y + 66, colDot);
    helperLignePropre(pdf, "FILS / FILLE DE", v("pere"), 20, y + 78, colDot);
    helperLignePropre(pdf, "ET DE", v("mere"), 20, y + 90, colDot);
    helperLignePropre(pdf, "SITUATION", getSituationComplete(), 20, y + 102, colDot);
    helperLignePropre(pdf, "NATIONALITÉ", v("nationalite"), 20, y + 114, colDot);

    y += 135; pdf.setFontSize(10); pdf.setFont(font, "bold");
    pdf.text("NOM ET SIGNATURE DES POMPES FUNEBRES :", 20, y);
    try { pdf.addImage("cachet.png", 'PNG', 40, y + 5, 50, 28); } catch(e){}
    
    pdf.save(`Déclaration Décès ${v("nom")} ${v("prenom")}.pdf`);
}

// -----------------------------------------------------------
// NOUVELLE FONCTION FERMETURE (STYLE OFFICIEL + POINTUÉS)
// -----------------------------------------------------------
function genererFermeture() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // 1. Cadre général
    dessinerCadre(pdf);

    // 2. Titre stylisé (Boite bleue)
    pdf.setFillColor(235, 245, 251); 
    pdf.rect(20, 38, 170, 18, 'F');  
    pdf.setDrawColor(26, 90, 143);   
    pdf.rect(20, 38, 170, 18);
    
    pdf.setFontSize(13); 
    pdf.setFont(font, "bold"); 
    pdf.setTextColor(26, 90, 143);
    pdf.text("PROCÈS-VERBAL DE FERMETURE DE CERCUEIL", 105, 45, { align: "center" });
    pdf.setFontSize(10);
    pdf.setTextColor(0);
    pdf.text("ET DE SCELLEMENT EN PRÉSENCE DE LA FAMILLE", 105, 52, { align: "center" });

    let y = 70;
    const xLabel = 20;     
    const xDotStart = 65;  
    
    // --- PARTIE 1 : L'ENTREPRISE ---
    pdf.setFontSize(10); 
    pdf.setFont(font, "bold"); 
    pdf.text("L'ENTREPRISE DE POMPES FUNÈBRES :", xLabel, y);
    y += 8;
    
    pdf.setFont(font, "normal");
    pdf.text("Nous, Représentant des Pompes Funèbres Solidaire (Habilitation n° 23-66-0205),", xLabel, y);
    y += 6;
    pdf.text("Certifions avoir procédé à la fermeture et au scellement du cercueil.", xLabel, y);

    // --- PARTIE 2 : DÉTAILS DE L'OPÉRATION ---
    y += 12;
    pdf.setLineWidth(0.5); pdf.setDrawColor(0); pdf.line(20, y-4, 190, y-4); // Séparateur
    y += 5;

    // Utilisation de helperLignePropre pour les pointués
    helperLignePropre(pdf, "DATE DE FERMETURE", v("date_fermeture") ? formatD(v("date_fermeture")) : "", xLabel, y, xDotStart + 5);
    helperLignePropre(pdf, "LIEU DE FERMETURE", v("lieu_fermeture"), 110, y, 150, 190); 
    
    y += 10;
    helperLignePropre(pdf, "COMMUNE", v("faita"), xLabel, y, xDotStart + 5, 100);

    // --- PARTIE 3 : LE DÉFUNT (Cadre grisé) ---
    y += 15;
    pdf.setFont(font, "bold"); pdf.text("CONCERNANT LE DÉFUNT(E) :", xLabel, y);
    y += 6;

    // Fond gris
    pdf.setFillColor(245, 245, 245);
    pdf.rect(20, y - 4, 170, 35, 'F');
    pdf.setDrawColor(200); pdf.rect(20, y - 4, 170, 35);

    helperLignePropre(pdf, "NOM", v("nom").toUpperCase(), 25, y, 50, 100);
    helperLignePropre(pdf, "PRÉNOMS", v("prenom"), 105, y, 130, 185);
    y += 10;
    helperLignePropre(pdf, "NÉ(E) LE", formatD(v("date_naiss")), 25, y, 50, 100);
    helperLignePropre(pdf, "À", v("lieu_naiss"), 105, y, 130, 185);
    y += 10;
    helperLignePropre(pdf, "DÉCÉDÉ(E) LE", formatD(v("date_deces")), 25, y, 50, 100);
    helperLignePropre(pdf, "À", v("lieu_deces"), 105, y, 130, 185);

    // --- PARTIE 4 : LE TÉMOIN (FAMILLE) - Avec Pointués ---
    y += 25;
    pdf.setLineWidth(0.5); pdf.setDrawColor(0); pdf.line(20, y-5, 190, y-5);
    
    pdf.setFont(font, "bold"); 
    pdf.text("EN PRÉSENCE DE (MEMBRE DE LA FAMILLE) :", xLabel, y);
    y += 10;

    helperLignePropre(pdf, "NOM & PRENOM", v("soussigne"), xLabel, y, xDotStart);
    y += 10;
    helperLignePropre(pdf, "LIEN DE PARENTÉ", v("lien"), xLabel, y, xDotStart);
    y += 10;
    helperLignePropre(pdf, "DEMEURANT À", v("demeurant"), xLabel, y, xDotStart);
    y += 10;
    
    // --- PARTIE 5 : CADRES SIGNATURES ---
    y += 20;
    pdf.setLineWidth(0.2); pdf.setDrawColor(0);
    
    // Cadre Famille
    pdf.rect(20, y, 80, 40); 
    // Cadre PF
    pdf.rect(110, y, 80, 40); 

    // En-têtes gris des cadres
    pdf.setFillColor(230); 
    pdf.rect(20, y, 80, 8, 'F');
    pdf.rect(110, y, 80, 8, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont(font, "bold");
    pdf.text("LE MEMBRE DE LA FAMILLE", 60, y + 5, { align: "center" });
    pdf.text("L'OPERATEUR FUNÉRAIRE", 150, y + 5, { align: "center" });

    // Mentions légales bas de cadre
    pdf.setFontSize(7);
    pdf.setFont(font, "italic");
    pdf.text("(Mention 'Lu et approuvé' + Signature)", 60, y + 36, { align: "center" });
    pdf.text("(Cachet et Signature)", 150, y + 36, { align: "center" });

    // Cachet image (si présent)
    try { pdf.addImage("cachet.png", 'PNG', 125, y + 10, 50, 25); } catch(e){}

    // Pied de page date
    y += 45;
    pdf.setFont(font, "normal"); pdf.setFontSize(10);
    pdf.text(`Fait à ${v("faita")}, le ${formatD(v("dateSignature"))}`, 105, y, { align: "center" });

    pdf.save(`Fermeture_Cercueil_${v("nom")}.pdf`);
}
function genererTransport() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    dessinerCadre(pdf);

    pdf.setFontSize(9); pdf.setFont(font, "bold");
    pdf.text(`IMMATRICULATION VEHICULE : ${v("immatriculation").toUpperCase()}`, 105, 30, { align: "center" });

    pdf.setFontSize(14); pdf.setTextColor(26, 90, 143);
    pdf.text("DECLARATION DE TRANSPORT DE CORPS", 105, 45, { align: "center" });
    pdf.text("AVANT MISE EN BIERE", 105, 52, { align: "center" });

    pdf.setTextColor(0); pdf.setFontSize(11); let y = 75;
    pdf.setFont(font, "bold"); pdf.text("Je soussigné :", 20, y);
    pdf.setFont(font, "normal"); y += 10;
    pdf.text("•  Nom et Prénom : M. CHERKAOUI Mustapha", 30, y); y += 7;
    pdf.text("•  Qualité : Dirigeant des Pompes Funèbres Solidaire Perpignan", 30, y); y += 7;
    pdf.text("•  Adresse : 32 boulevard Léon Jean Grégory Thuir", 30, y);

    y += 15; pdf.setFont(font, "bold");
    const civilite = v("sexe") === "Féminin" ? "Mme" : "M.";
    const corps = `Déclare avoir procédé au transport avant mise en bière de ${civilite} ${v("nom").toUpperCase()} ${v("prenom")}, né(e) le ${formatD(v("date_naiss"))} à ${v("lieu_naiss")} et décédé(e) le ${formatD(v("date_deces"))} à ${v("lieu_deces").toUpperCase()}.`;
    pdf.text(pdf.splitTextToSize(corps, 170), 20, y);

    y += 25;
    helperLignePropre(pdf, "Date de départ le", formatD(v("date_depart_t")) + " à " + v("heure_depart_t"), 30, y, 75); y += 10;
    helperLignePropre(pdf, "Lieu de départ", v("lieu_depart_t").toUpperCase(), 30, y, 75); y += 15;
    helperLignePropre(pdf, "Date d'arrivée le", formatD(v("date_arrivee_t")) + " à " + v("heure_arrivee_t"), 30, y, 75); y += 10;
    helperLignePropre(pdf, "Lieu d'arrivée", v("lieu_arrivee_t").toUpperCase(), 30, y, 75);

    y += 25; pdf.setFont(font, "normal");
    pdf.text("Le transport sera effectué par la Société de Pompes Funèbres :", 20, y);
    y += 10; pdf.setFont(font, "bold"); pdf.text("Pompes Funèbres Solidaire Perpignan", 105, y, { align: "center" });

    y += 30; pdf.setFont(font, "normal");
    pdf.text(`Fait à : ${v("faita").toUpperCase()}, le : ${formatD(v("dateSignature"))}`, 20, y);
    pdf.setFont(font, "bold"); pdf.text("Signature", 160, y);

    pdf.save(`Transport_${v("nom")}.pdf`);
}
