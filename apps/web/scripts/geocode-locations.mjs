#!/usr/bin/env node
/**
 * Geocodes Swiss trail locations using Nominatim (OSM) and writes locations.ts
 * Rate-limited to 1.2 req/s per Nominatim policy.
 * Run: node scripts/geocode-locations.mjs
 */
import { writeFileSync } from "fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── SWITZERLAND BOUNDING BOX ────────────────────────────────────────────────
const CH_LAT = [45.8, 47.8];
const CH_LNG = [5.9, 10.5];

// ─── REGION FALLBACK CENTERS ─────────────────────────────────────────────────
const REGION_CENTERS = {
  graubunden: { lat: 46.656, lng: 9.628 },
  valais:     { lat: 46.233, lng: 7.758 },
  ticino:     { lat: 46.195, lng: 8.793 },
  bern:       { lat: 46.558, lng: 7.787 },
  uri:        { lat: 46.760, lng: 8.627 },
  lucerne:    { lat: 47.050, lng: 8.309 },
  appenzell:  { lat: 47.334, lng: 9.412 },
  "st-gallen":{ lat: 47.050, lng: 9.133 },
  fribourg:   { lat: 46.764, lng: 7.155 },
  vaud:       { lat: 46.519, lng: 6.653 },
  obwalden:   { lat: 46.878, lng: 8.251 },
};

// ─── CATEGORY DETECTION ──────────────────────────────────────────────────────
function guessCategory(name) {
  const n = name.toLowerCase();
  if (/\b(see|lac |lago |lake|lacs|lai |laghett|weiher|jöri|stausee|tsaté|lona|moiry|louvie|fenêtre|cleuson|salanfe|taney|lioson|saoseo|cadagno|tremorgio|ritom|camadra|retico|silvaplana|silvaplanersee|langgjetscher|geltenschlucht|geltenhütt|fälensse|sämtisersee|kl[öo]ntalersee|murg|jöriseen|lai da|saoseo|tuma|nalps|curnera|pintga|grialet|bergsee|silberen|steisee|seeberg|lauenen|elsigen|iffigsee|murgseen|grialet|urdensee|partnunsee|macun|tuoi|sella|spilauer|schwendiseen|voralpsee|gräppelensee|obersee|schwarzsee|lac de)\b/.test(n))
    return "hidden-lake";
  if (/\b(fall|fälle|cascade|waterfall|cascata|saut du|wasserfall|iffigfall|simmenfälle|schmadribach|seerenbachfälle|foroglio|geltenschlucht|trift|rosenlaui)\b/.test(n))
    return "waterfall";
  if (/\b(gorge|schlucht|gorges|canyon|tobel|enge|graben|twannbach|taubenloch|gorges du|gorges de|welschtobel|schyn|val d'uina|gondo)\b/.test(n))
    return "gorge";
  if (/\b(glacier|gletscher|ghiacciaio|firn|neve)\b/.test(n))
    return "glacier";
  if (/\b(forest|wald|forêt|selva|wood|bödmerenwaldvalleyforest)\b/.test(n))
    return "forest";
  if (/\b(night|sterne|étoile|milkyway|milky way|dark sky)\b/.test(n))
    return "night-sky";
  if (/\b(road trip|drive|route|via|strada|strasse)\b/.test(n))
    return "road-trip";
  if (/\b(bisse|suone|wasserleitung|torrent-neuf|bisse du|bisse de|bisse vieux)\b/.test(n))
    return "river";
  if (/\b(moor|bog|tourbière|moos|hochmoor|raised bog)\b/.test(n))
    return "alpine-meadow";
  if (/\b(alp |alpe |alpage|plateau|boden|ebene|plaun|böden|greina|flue|fluh|charte|rais|plan |matte|staffel|alm |plangg)\b/.test(n))
    return "alpine-meadow";
  // Default everything else to viewpoint (peaks, ridges, passes, huts, valleys)
  return "viewpoint";
}

// ─── ALL LOCATIONS ────────────────────────────────────────────────────────────
const RAW = [
  // ── GRAUBÜNDEN: Engadin & Swiss National Park ──
  { name: "Greina Plateau (Plaun la Greina)", hint: "Graubünden", region: "graubunden" },
  { name: "Val Trupchun", hint: "Swiss National Park", region: "graubunden" },
  { name: "Val Cluozza", hint: "Swiss National Park", region: "graubunden" },
  { name: "Lai da Macun", hint: "Swiss National Park", region: "graubunden" },
  { name: "Val Tantermozza", hint: "Swiss National Park Graubünden", region: "graubunden" },
  { name: "Munt la Schera", hint: "Swiss National Park", region: "graubunden" },
  { name: "Val Mingèr", hint: "S-charl Graubünden", region: "graubunden" },
  { name: "Val S-charl", hint: "Lower Engadin Graubünden", region: "graubunden" },
  { name: "Val d'Uina", hint: "Sesvenna Graubünden", region: "graubunden" },
  { name: "Val Sinestra", hint: "Graubünden", region: "graubunden" },
  { name: "Val Tasna", hint: "Ardez Graubünden", region: "graubunden" },
  { name: "Val Lavinuoz", hint: "Lavin Graubünden", region: "graubunden" },
  { name: "Val Plavna", hint: "S-charl Graubünden", region: "graubunden" },
  { name: "Lai da Tuoi", hint: "Guarda Graubünden", region: "graubunden" },
  { name: "Val Fex", hint: "Sils Maria Graubünden", region: "graubunden" },
  { name: "Val Roseg", hint: "Pontresina Graubünden", region: "graubunden" },
  { name: "Val Languard", hint: "Pontresina Graubünden", region: "graubunden" },
  { name: "Val d'Es-cha", hint: "Madulain Graubünden", region: "graubunden" },
  { name: "Val Bever", hint: "Engadin Graubünden", region: "graubunden" },
  { name: "Val Susauna", hint: "Graubünden", region: "graubunden" },
  { name: "Jöriseen", hint: "Flüela Graubünden", region: "graubunden" },
  { name: "Val Grialetsch", hint: "Graubünden", region: "graubunden" },

  // ── GRAUBÜNDEN: Davos & Prättigau ──
  { name: "Sertig valley", hint: "Davos Graubünden", region: "graubunden" },
  { name: "Dischma valley", hint: "Davos Graubünden", region: "graubunden" },
  { name: "Monstein", hint: "Davos Graubünden", region: "graubunden" },
  { name: "Fideriser Heuberge", hint: "Graubünden", region: "graubunden" },
  { name: "St. Antönien", hint: "Prättigau Graubünden", region: "graubunden" },
  { name: "Partnunsee", hint: "Prättigau Graubünden", region: "graubunden" },
  { name: "Sulzfluh", hint: "Rätikon Graubünden", region: "graubunden" },
  { name: "Schijenflue", hint: "Rätikon Graubünden", region: "graubunden" },
  { name: "Madrisa", hint: "Klosters Graubünden", region: "graubunden" },
  { name: "Alp Sardasca", hint: "Klosters Silvretta Graubünden", region: "graubunden" },
  { name: "Silvrettahütte", hint: "Graubünden", region: "graubunden" },
  { name: "Vereinatal", hint: "Klosters Graubünden", region: "graubunden" },
  { name: "Sapün", hint: "Arosa Graubünden", region: "graubunden" },
  { name: "Welschtobel", hint: "Arosa Graubünden", region: "graubunden" },
  { name: "Urdensee", hint: "Arosa Lenzerheide Graubünden", region: "graubunden" },
  { name: "Tschiertschen", hint: "Graubünden", region: "graubunden" },

  // ── GRAUBÜNDEN: Bregaglia & Poschiavo ──
  { name: "Pass da Cam", hint: "Bregaglia Graubünden", region: "graubunden" },
  { name: "Soglio", hint: "Val Bregaglia Graubünden", region: "graubunden" },
  { name: "Val Bondasca", hint: "Bregaglia Graubünden", region: "graubunden" },
  { name: "Albigna dam", hint: "Bregaglia Graubünden", region: "graubunden" },
  { name: "Lai da Saoseo", hint: "Val di Campo Poschiavo Graubünden", region: "graubunden" },
  { name: "Lagh da Val Viola", hint: "Poschiavo Graubünden", region: "graubunden" },
  { name: "Val da Camp", hint: "Poschiavo Graubünden", region: "graubunden" },
  { name: "Alp Grüm", hint: "Bernina Poschiavo Graubünden", region: "graubunden" },
  { name: "Lago Bianco", hint: "Bernina Poschiavo Graubünden", region: "graubunden" },
  { name: "Val Varuna", hint: "Poschiavo Graubünden", region: "graubunden" },
  { name: "Lai da Rims", hint: "Val Müstair Graubünden", region: "graubunden" },

  // ── GRAUBÜNDEN: Surselva & Vorderrhein ──
  { name: "Lag da Tuma", hint: "Tomasee Graubünden", region: "graubunden" },
  { name: "Maighelstal", hint: "Tujetsch Graubünden", region: "graubunden" },
  { name: "Lai da Curnera", hint: "Graubünden", region: "graubunden" },
  { name: "Lai da Nalps", hint: "Graubünden", region: "graubunden" },
  { name: "Lai da Sontga Maria", hint: "Lukmanier Graubünden", region: "graubunden" },
  { name: "Val Cristallina", hint: "Graubünden", region: "graubunden" },
  { name: "Val Russein", hint: "Tödi Graubünden", region: "graubunden" },
  { name: "Val Cavardiras", hint: "Surselva Graubünden", region: "graubunden" },
  { name: "Punteglias", hint: "Tödi Surselva Graubünden", region: "graubunden" },
  { name: "Val Frisal", hint: "Brigels Graubünden", region: "graubunden" },
  { name: "Tenigerbad", hint: "Val Sumvitg Graubünden", region: "graubunden" },
  { name: "Val Sumvitg", hint: "Surselva Graubünden", region: "graubunden" },
  { name: "Vrin", hint: "Lumnezia Graubünden", region: "graubunden" },
  { name: "Val Lumnezia", hint: "Graubünden", region: "graubunden" },
  { name: "Piz Mundaun", hint: "Surselva Graubünden", region: "graubunden" },

  // ── GRAUBÜNDEN: Hinterrhein, Schams, Avers & Calanca ──
  { name: "Val Calanca", hint: "Graubünden", region: "graubunden" },
  { name: "Avers", hint: "Graubünden", region: "graubunden" },
  { name: "Juf", hint: "Avers Graubünden", region: "graubunden" },
  { name: "Safiental", hint: "Graubünden", region: "graubunden" },
  { name: "Tomülpass", hint: "Safiental Vals Graubünden", region: "graubunden" },
  { name: "Zervreila", hint: "Vals Graubünden", region: "graubunden" },
  { name: "Val Ferrera", hint: "Graubünden", region: "graubunden" },
  { name: "Alp Flix", hint: "Parc Ela Graubünden", region: "graubunden" },
  { name: "Val d'Err", hint: "Julier Graubünden", region: "graubunden" },
  { name: "Val Tuors", hint: "Bergün Graubünden", region: "graubunden" },
  { name: "Bergün", hint: "Albula Graubünden", region: "graubunden" },
  { name: "Schyn gorge", hint: "Solis Graubünden", region: "graubunden" },
  { name: "Valle di Lei", hint: "Graubünden Italy border", region: "graubunden" },
  { name: "Rheinwald", hint: "Hinterrhein Graubünden", region: "graubunden" },
  { name: "Val Mora", hint: "Müstair Graubünden", region: "graubunden" },
  { name: "Splügen", hint: "Graubünden", region: "graubunden" },
  { name: "Heinzenberg", hint: "Domleschg Graubünden", region: "graubunden" },

  // ── VALAIS: Val d'Anniviers ──
  { name: "Zinal", hint: "Val d'Anniviers Valais", region: "valais" },
  { name: "Cabane du Petit Mountet", hint: "Zinal Valais", region: "valais" },
  { name: "Lac de Moiry", hint: "Val d'Anniviers Valais", region: "valais" },
  { name: "Col de Torrent", hint: "Moiry Hérens Valais", region: "valais" },
  { name: "Lac des Autannes", hint: "Moiry Valais", region: "valais" },
  { name: "Sorebois", hint: "Zinal Valais", region: "valais" },
  { name: "St-Luc Chandolin planet trail", hint: "Val d'Anniviers Valais", region: "valais" },
  { name: "Bella Tola", hint: "Val d'Anniviers Valais", region: "valais" },
  { name: "Vallon de Réchy", hint: "Valais", region: "valais" },

  // ── VALAIS: Val d'Hérens ──
  { name: "Arolla", hint: "Val d'Hérens Valais", region: "valais" },
  { name: "Lac Bleu d'Arolla", hint: "Val d'Hérens Valais", region: "valais" },
  { name: "Pas de Chèvres", hint: "Arolla Valais", region: "valais" },
  { name: "Ferpècle", hint: "Dent Blanche Valais", region: "valais" },
  { name: "Glacier de Ferpècle", hint: "Val d'Hérens Valais", region: "valais" },
  { name: "Lac de Tsaté", hint: "Val d'Hérens Valais", region: "valais" },
  { name: "Évolène", hint: "Val d'Hérens Valais", region: "valais" },
  { name: "Col de la Meina", hint: "Val d'Hérens Valais", region: "valais" },
  { name: "Sasseneire", hint: "Val d'Hérens Valais", region: "valais" },

  // ── VALAIS: Bagnes, Entremont & Ferret ──
  { name: "Mauvoisin", hint: "Val de Bagnes Valais", region: "valais" },
  { name: "Cabane de Chanrion", hint: "Val de Bagnes Valais", region: "valais" },
  { name: "Lac de Louvie", hint: "Val de Bagnes Valais", region: "valais" },
  { name: "Lac de Cleuson", hint: "Nendaz Valais", region: "valais" },
  { name: "Lac des Vaux", hint: "Verbier Valais", region: "valais" },
  { name: "Combe de l'A", hint: "Liddes Valais", region: "valais" },
  { name: "Val Ferret", hint: "La Fouly Valais", region: "valais" },
  { name: "Lacs de Fenêtre", hint: "Grand St-Bernard Valais", region: "valais" },
  { name: "Cabane de l'A Neuve", hint: "Val Ferret Valais", region: "valais" },
  { name: "Mont Fort", hint: "Verbier Valais", region: "valais" },

  // ── VALAIS: Bisses ──
  { name: "Bisse du Ro", hint: "Crans Valais", region: "valais" },
  { name: "Bisse de Savièse", hint: "Valais", region: "valais" },
  { name: "Bisse de Clavau", hint: "Sion Valais", region: "valais" },
  { name: "Grand Bisse de Lens", hint: "Valais", region: "valais" },
  { name: "Bisse de Vercorin", hint: "Valais", region: "valais" },
  { name: "Bisse Vieux", hint: "Nendaz Valais", region: "valais" },
  { name: "Bisse du Tsittoret", hint: "Crans Valais", region: "valais" },
  { name: "Derborence", hint: "Valais", region: "valais" },
  { name: "Lizerne gorge", hint: "Derborence Valais", region: "valais" },
  { name: "Pas de Cheville", hint: "Anzeinde Derborence Valais", region: "valais" },
  { name: "Sanetsch", hint: "Valais", region: "valais" },

  // ── VALAIS: Mattertal & Saastal ──
  { name: "Grächen", hint: "Saas Valais", region: "valais" },
  { name: "Gasenried", hint: "Bordierhütte Valais", region: "valais" },
  { name: "Täschalp", hint: "Zermatt Valais", region: "valais" },
  { name: "Mattmark reservoir", hint: "Saastal Valais", region: "valais" },
  { name: "Almagelleralp", hint: "Saastal Valais", region: "valais" },
  { name: "Antronapass", hint: "Saastal Valais Italy", region: "valais" },
  { name: "Monte Moro Pass", hint: "Mattmark Valais", region: "valais" },
  { name: "Nanztal", hint: "Visp Valais", region: "valais" },
  { name: "Baltschiedertal", hint: "Valais", region: "valais" },
  { name: "Gredetschtal", hint: "Valais", region: "valais" },
  { name: "Jolital", hint: "Mund Valais", region: "valais" },
  { name: "Turtmanntal", hint: "Gruben Meiden Valais", region: "valais" },
  { name: "Augstbordpass", hint: "Turtmann St Niklaus Valais", region: "valais" },

  // ── VALAIS: Lötschental, Aletsch, Goms & Binn ──
  { name: "Lötschental", hint: "Valais", region: "valais" },
  { name: "Anenhütte", hint: "Lötschental Valais", region: "valais" },
  { name: "Lötschenpass", hint: "Valais", region: "valais" },
  { name: "Märjelensee", hint: "Aletsch Valais", region: "valais" },
  { name: "Binntal", hint: "Valais", region: "valais" },
  { name: "Albrunpass", hint: "Binn Valais Italy", region: "valais" },
  { name: "Mässersee", hint: "Binn Valais", region: "valais" },
  { name: "Gerental", hint: "Goms Valais", region: "valais" },
  { name: "Blinnental", hint: "Goms Valais", region: "valais" },
  { name: "Obergoms", hint: "Valais", region: "valais" },

  // ── VALAIS: Chablais & Simplon ──
  { name: "Lac de Salanfe", hint: "Dents du Midi Valais", region: "valais" },
  { name: "Col de Susanfe", hint: "Valais", region: "valais" },
  { name: "Vieux Emosson", hint: "Valais", region: "valais" },
  { name: "Lac d'Emosson", hint: "Valais", region: "valais" },
  { name: "Val d'Illiez", hint: "Champéry Valais", region: "valais" },
  { name: "Lac de Taney", hint: "Cornettes de Bise Valais", region: "valais" },
  { name: "Grammont", hint: "Léman Valais", region: "valais" },
  { name: "Gondo gorge", hint: "Simplon Valais", region: "valais" },
  { name: "Zwischbergental", hint: "Simplon Valais", region: "valais" },
  { name: "Laggintal", hint: "Simplon Valais", region: "valais" },
  { name: "Rossbodengletscher", hint: "Simplon Valais", region: "valais" },
  { name: "Saflischpass", hint: "Binn Rosswald Valais", region: "valais" },

  // ── TICINO: Vallemaggia, Verzasca & Onsernone ──
  { name: "Val Bavona", hint: "Vallemaggia Ticino", region: "ticino" },
  { name: "Robiei", hint: "Vallemaggia Ticino", region: "ticino" },
  { name: "Val Rovana", hint: "Vallemaggia Ticino", region: "ticino" },
  { name: "Bosco Gurin", hint: "Ticino", region: "ticino" },
  { name: "Val di Peccia", hint: "Vallemaggia Ticino", region: "ticino" },
  { name: "Lago del Sambuco", hint: "Val Sambuco Ticino", region: "ticino" },
  { name: "Val Lavizzara", hint: "Vallemaggia Ticino", region: "ticino" },
  { name: "Sonogno", hint: "Verzasca Ticino", region: "ticino" },
  { name: "Val Vegornèss", hint: "Verzasca Ticino", region: "ticino" },
  { name: "Corippo", hint: "Verzasca Ticino", region: "ticino" },
  { name: "Val Onsernone", hint: "Spruga Ticino", region: "ticino" },
  { name: "Val Vergeletto", hint: "Onsernone Ticino", region: "ticino" },
  { name: "Centovalli ridge", hint: "Ticino", region: "ticino" },
  { name: "Cardada", hint: "Locarno Ticino", region: "ticino" },
  { name: "Pizzo Leone", hint: "Brissago Ticino", region: "ticino" },
  { name: "Monte Gridone", hint: "Brissago Ticino", region: "ticino" },
  { name: "Valle del Salto", hint: "Maggia Ticino", region: "ticino" },

  // ── TICINO: Leventina, Blenio & Bedretto ──
  { name: "Val Piora", hint: "Lago Ritom Ticino", region: "ticino" },
  { name: "Lago Cadagno", hint: "Piora Ticino", region: "ticino" },
  { name: "Val Canaria", hint: "Airolo Ticino", region: "ticino" },
  { name: "Campo Tencia", hint: "Piumogna Ticino", region: "ticino" },
  { name: "Val Chironico", hint: "Leventina Ticino", region: "ticino" },
  { name: "Lago Tremorgio", hint: "Ticino", region: "ticino" },
  { name: "Val Bedretto", hint: "Ticino", region: "ticino" },
  { name: "Passo San Giacomo", hint: "Val Corno Ticino", region: "ticino" },
  { name: "Lago di Luzzone", hint: "Blenio Ticino", region: "ticino" },
  { name: "Capanna Motterascio", hint: "Greina Ticino", region: "ticino" },
  { name: "Val Camadra", hint: "Blenio Ticino", region: "ticino" },
  { name: "Capanna Adula", hint: "Rheinwaldhorn Ticino", region: "ticino" },
  { name: "Campo Blenio", hint: "Ghirone Ticino", region: "ticino" },

  // ── TICINO: Lugano, Bellinzona & Mendrisiotto ──
  { name: "Val Colla", hint: "Lugano Ticino", region: "ticino" },
  { name: "Denti della Vecchia", hint: "Lugano Ticino", region: "ticino" },
  { name: "Monte Bar", hint: "Lugano Ticino", region: "ticino" },
  { name: "Monte Tamaro", hint: "Ticino", region: "ticino" },
  { name: "Monte Lema", hint: "Malcantone Ticino", region: "ticino" },
  { name: "Val Morobbia", hint: "Bellinzona Ticino", region: "ticino" },
  { name: "Valle di Muggio", hint: "Ticino", region: "ticino" },
  { name: "Monte Generoso", hint: "Ticino", region: "ticino" },

  // ── BERNESE OBERLAND: Kandersteg, Adelboden & Lenk ──
  { name: "Gasterntal", hint: "Kandersteg Bern", region: "bern" },
  { name: "Üschinensee", hint: "Kandersteg Bern", region: "bern" },
  { name: "Bunderchrinde", hint: "Kandersteg Bern", region: "bern" },
  { name: "Daubensee", hint: "Gemmi Bern", region: "bern" },
  { name: "Lämmerenboden", hint: "Gemmi Bern", region: "bern" },
  { name: "Engstligenalp", hint: "Adelboden Bern", region: "bern" },
  { name: "Hahnenmoospass", hint: "Adelboden Bern", region: "bern" },
  { name: "Iffigsee", hint: "Lenk Bern", region: "bern" },
  { name: "Simmenfälle", hint: "Lenk Bern", region: "bern" },
  { name: "Trütlisbergpass", hint: "Lenk Lauenen Bern", region: "bern" },
  { name: "Wildstrubel", hint: "Lämmeren Bern", region: "bern" },
  { name: "Elsigenalp", hint: "Adelboden Bern", region: "bern" },
  { name: "Ammertenpass", hint: "Adelboden Bern", region: "bern" },

  // ── BERNESE OBERLAND: Diemtigtal, Simmental & Gantrisch ──
  { name: "Diemtigtal", hint: "Bern", region: "bern" },
  { name: "Seebergsee", hint: "Diemtigtal Bern", region: "bern" },
  { name: "Spillgerten", hint: "Bern", region: "bern" },
  { name: "Stockhorn", hint: "Bern", region: "bern" },
  { name: "Gantrisch", hint: "Bern", region: "bern" },
  { name: "Lauenensee", hint: "Lauenen Bern", region: "bern" },
  { name: "Geltenschlucht", hint: "Lauenen Bern", region: "bern" },
  { name: "Tungelschlucht", hint: "Lauenen Bern", region: "bern" },

  // ── BERNESE OBERLAND: Lauterbrunnen, Grindelwald, Saanenland ──
  { name: "Oberhornsee", hint: "Lauterbrunnen Bern", region: "bern" },
  { name: "Obersteinberg", hint: "Lauterbrunnen Bern", region: "bern" },
  { name: "Schmadribach falls", hint: "Lauterbrunnen Bern", region: "bern" },
  { name: "Sefinental", hint: "Mürren Bern", region: "bern" },
  { name: "Faulhorn", hint: "Grindelwald Bern", region: "bern" },
  { name: "Hagelseewli", hint: "Faulhorn Bern", region: "bern" },
  { name: "Schwarzhorn", hint: "Grosse Scheidegg Bern", region: "bern" },
  { name: "Hohgant", hint: "Bern", region: "bern" },
  { name: "Augstmatthorn", hint: "Thun Bern", region: "bern" },
  { name: "Justistal", hint: "Bern", region: "bern" },
  { name: "Sigriswiler Rothorn", hint: "Thunersee Bern", region: "bern" },
  { name: "Turbachtal", hint: "Gstaad Bern", region: "bern" },
  { name: "Abländschen", hint: "Gastlosen Bern", region: "bern" },

  // ── BERNESE OBERLAND: Haslital, Gadmen, Susten & Grimsel ──
  { name: "Engstlenalp", hint: "Jochpass Bern", region: "bern" },
  { name: "Steingletscher", hint: "Susten Bern", region: "bern" },
  { name: "Sustlihütte", hint: "Bern", region: "bern" },
  { name: "Sidelhorn", hint: "Grimsel Bern", region: "bern" },
  { name: "Räterichsbodensee", hint: "Grimsel Bern", region: "bern" },
  { name: "Trift glacier", hint: "Gadmen Bern", region: "bern" },
  { name: "Rosenlaui", hint: "Bern", region: "bern" },
  { name: "Engelhörner", hint: "Rosenlaui Bern", region: "bern" },
  { name: "Schwarzwaldalp", hint: "Grindelwald Bern", region: "bern" },
  { name: "Hinterburgsee", hint: "Axalp Bern", region: "bern" },

  // ── CENTRAL SWITZERLAND: Uri ──
  { name: "Maderanertal", hint: "Uri", region: "uri" },
  { name: "Etzlital", hint: "Uri", region: "uri" },
  { name: "Brunnital", hint: "Schächental Uri", region: "uri" },
  { name: "Urner Boden", hint: "Uri", region: "uri" },
  { name: "Klausenpass", hint: "Uri", region: "uri" },
  { name: "Göscheneralp", hint: "Uri", region: "uri" },
  { name: "Bergsee", hint: "Göschenen Uri", region: "uri" },
  { name: "Chelenalptal", hint: "Göschenen Uri", region: "uri" },
  { name: "Meiental", hint: "Susten Uri", region: "uri" },
  { name: "Surenenpass", hint: "Engelberg Uri", region: "uri" },
  { name: "Isenthal", hint: "Uri", region: "uri" },
  { name: "Erstfeldertal", hint: "Uri", region: "uri" },
  { name: "Golzernsee", hint: "Maderanertal Uri", region: "uri" },

  // ── CENTRAL SWITZERLAND: Schwyz ──
  { name: "Muotathal", hint: "Schwyz", region: "lucerne" },
  { name: "Bisistal", hint: "Muotathal Schwyz", region: "lucerne" },
  { name: "Glattalp", hint: "Schwyz", region: "lucerne" },
  { name: "Bödmerenwald", hint: "Muotathal Schwyz", region: "lucerne" },
  { name: "Silberen", hint: "Schwyz", region: "lucerne" },
  { name: "Pragelpass", hint: "Muotathal Schwyz", region: "lucerne" },
  { name: "Hoch-Ybrig", hint: "Schwyz", region: "lucerne" },
  { name: "Wägitalersee", hint: "Schwyz", region: "lucerne" },
  { name: "Mythen", hint: "Schwyz", region: "lucerne" },
  { name: "Fronalpstock", hint: "Stoos Schwyz", region: "lucerne" },
  { name: "Sihlsee", hint: "Einsiedeln Schwyz", region: "lucerne" },
  { name: "Rossberg", hint: "Schwyz", region: "lucerne" },

  // ── CENTRAL SWITZERLAND: Glarus ──
  { name: "Klöntalersee", hint: "Glarus", region: "st-gallen" },
  { name: "Murgseen", hint: "Glarus", region: "st-gallen" },
  { name: "Kärpf", hint: "Glarus", region: "st-gallen" },
  { name: "Sernftal", hint: "Elm Glarus", region: "st-gallen" },
  { name: "Tschingelhörner", hint: "Martinsloch Glarus", region: "st-gallen" },
  { name: "Niederental", hint: "Glärnisch Glarus", region: "st-gallen" },
  { name: "Obersee", hint: "Näfels Glarus", region: "st-gallen" },
  { name: "Glärnischhütte", hint: "Glarus", region: "st-gallen" },
  { name: "Fridolinshütte", hint: "Tödi Glarus", region: "st-gallen" },
  { name: "Muttsee", hint: "Glarus", region: "st-gallen" },
  { name: "Braunwald", hint: "Glarus", region: "st-gallen" },
  { name: "Tierfehd", hint: "Sandalp Glarus", region: "st-gallen" },
  { name: "Leglerhütte", hint: "Kärpf Glarus", region: "st-gallen" },

  // ── CENTRAL SWITZERLAND: Nidwalden, Lucerne & Zug ──
  { name: "Bannalp", hint: "Nidwalden", region: "obwalden" },
  { name: "Brisen", hint: "Nidwalden", region: "obwalden" },
  { name: "Niederbauen-Chulm", hint: "Uri lake", region: "uri" },
  { name: "Engelberg", hint: "Obwalden", region: "obwalden" },
  { name: "Fürenalp", hint: "Engelberg Obwalden", region: "obwalden" },
  { name: "Trübsee", hint: "Engelberg Obwalden", region: "obwalden" },
  { name: "Melchsee-Frutt", hint: "Obwalden", region: "obwalden" },
  { name: "Tannalp", hint: "Melchsee Obwalden", region: "obwalden" },
  { name: "Glaubenberg", hint: "Lucerne", region: "lucerne" },
  { name: "Mörlialp", hint: "Giswil Obwalden", region: "obwalden" },
  { name: "Schrattenfluh", hint: "Entlebuch Lucerne", region: "lucerne" },
  { name: "Schimbrig", hint: "Entlebuch Lucerne", region: "lucerne" },
  { name: "Napf", hint: "Lucerne Bern", region: "lucerne" },

  // ── EASTERN SWITZERLAND: Alpstein ──
  { name: "Fälensee", hint: "Alpstein Appenzell", region: "appenzell" },
  { name: "Sämtisersee", hint: "Alpstein Appenzell", region: "appenzell" },
  { name: "Bollenwees", hint: "Fählensee Alpstein Appenzell", region: "appenzell" },
  { name: "Alp Sigel", hint: "Alpstein Appenzell", region: "appenzell" },
  { name: "Hoher Kasten", hint: "Stauberen Alpstein Appenzell", region: "appenzell" },
  { name: "Saxer Lücke", hint: "Alpstein Appenzell", region: "appenzell" },
  { name: "Kreuzberge", hint: "Alpstein Appenzell", region: "appenzell" },
  { name: "Zwinglipass", hint: "Alpstein Appenzell", region: "appenzell" },
  { name: "Marwees", hint: "Alpstein Appenzell", region: "appenzell" },
  { name: "Altmann", hint: "Alpstein Appenzell", region: "appenzell" },
  { name: "Gäbris", hint: "Appenzell", region: "appenzell" },
  { name: "Kronberg", hint: "Appenzell", region: "appenzell" },
  { name: "Hundstein", hint: "Alpstein Appenzell", region: "appenzell" },

  // ── EASTERN SWITZERLAND: Toggenburg ──
  { name: "Churfirsten Selun", hint: "Toggenburg St Gallen", region: "st-gallen" },
  { name: "Zuestoll", hint: "Churfirsten St Gallen", region: "st-gallen" },
  { name: "Chäserrugg", hint: "Toggenburg St Gallen", region: "st-gallen" },
  { name: "Lütispitz", hint: "Toggenburg St Gallen", region: "st-gallen" },
  { name: "Speer", hint: "Toggenburg St Gallen", region: "st-gallen" },
  { name: "Gräppelensee", hint: "Toggenburg St Gallen", region: "st-gallen" },
  { name: "Schwendiseen", hint: "Wildhaus Toggenburg St Gallen", region: "st-gallen" },
  { name: "Voralpsee", hint: "Grabs St Gallen", region: "st-gallen" },
  { name: "Gamserrugg", hint: "Toggenburg St Gallen", region: "st-gallen" },
  { name: "Säntis", hint: "Appenzell", region: "appenzell" },
  { name: "Sellamatt", hint: "Toggenburg St Gallen", region: "st-gallen" },

  // ── EASTERN SWITZERLAND: Sarganserland, Walensee & St. Gallen ──
  { name: "Calfeisental", hint: "St Martin St Gallen", region: "st-gallen" },
  { name: "Sardona", hint: "Tektonikarena St Gallen", region: "st-gallen" },
  { name: "Weisstannental", hint: "St Gallen", region: "st-gallen" },
  { name: "Murgseen Flumserberg", hint: "St Gallen", region: "st-gallen" },
  { name: "Quinten", hint: "Walensee St Gallen", region: "st-gallen" },
  { name: "Seerenbachfälle", hint: "Betlis Walensee St Gallen", region: "st-gallen" },
  { name: "Leistchamm", hint: "Walensee St Gallen", region: "st-gallen" },
  { name: "Spitzmeilen", hint: "Flumserberg St Gallen", region: "st-gallen" },
  { name: "Maschgenkamm", hint: "St Gallen", region: "st-gallen" },
  { name: "Alvier", hint: "St Gallen Rhine valley", region: "st-gallen" },
  { name: "Gonzen", hint: "Sargans St Gallen", region: "st-gallen" },
  { name: "Pizol", hint: "St Gallen", region: "st-gallen" },
  { name: "Wildsee", hint: "Pizol Wangs St Gallen", region: "st-gallen" },

  // ── JURA: Neuchâtel ──
  { name: "Gorges de l'Areuse", hint: "Neuchâtel", region: "fribourg" },
  { name: "Gorges du Seyon", hint: "Neuchâtel", region: "fribourg" },
  { name: "Chasseron", hint: "Neuchâtel", region: "fribourg" },
  { name: "Creux du Van", hint: "Neuchâtel", region: "fribourg" },
  { name: "Tête de Ran", hint: "Neuchâtel", region: "fribourg" },
  { name: "Tourbières des Ponts-de-Martel", hint: "Neuchâtel", region: "fribourg" },
  { name: "Vallée de la Brévine", hint: "Neuchâtel", region: "fribourg" },
  { name: "Saut du Doubs", hint: "Neuchâtel Switzerland", region: "fribourg" },
  { name: "Mont Aubert", hint: "Lac de Neuchâtel", region: "fribourg" },

  // ── JURA: Vaud Jura ──
  { name: "Dent de Vaulion", hint: "Vaud Jura", region: "vaud" },
  { name: "Mont Tendre", hint: "Vaud Jura", region: "vaud" },
  { name: "Le Suchet", hint: "Orbe Vaud", region: "vaud" },
  { name: "Aiguilles de Baulmes", hint: "Vaud Jura", region: "vaud" },
  { name: "Forêt du Risoud", hint: "Vaud Jura", region: "vaud" },
  { name: "Combe des Amburnex", hint: "Vaud Jura", region: "vaud" },
  { name: "Vallée de Joux", hint: "Vaud", region: "vaud" },

  // ── JURA: Bern Jura ──
  { name: "Combe Grède", hint: "Jura Bern", region: "bern" },
  { name: "Chasseral", hint: "Bern Jura", region: "bern" },
  { name: "Mont Soleil", hint: "St-Imier Bern", region: "bern" },
  { name: "Twannbachschlucht", hint: "Lake Biel Bern", region: "bern" },
  { name: "Taubenlochschlucht", hint: "Biel Bern", region: "bern" },
  { name: "Gorges du Pichoux", hint: "Bern Jura", region: "bern" },
  { name: "Mont Raimeux", hint: "Jura Bern", region: "bern" },

  // ── JURA: Jura canton, Solothurn, Basel & Aargau ──
  { name: "Étang de la Gruère", hint: "Jura canton Switzerland", region: "fribourg" },
  { name: "Clos du Doubs", hint: "Goumois Jura Switzerland", region: "fribourg" },
  { name: "Weissenstein", hint: "Solothurn", region: "bern" },
  { name: "Passwang", hint: "Jura Solothurn", region: "bern" },
  { name: "Belchenflue", hint: "Jura Basel", region: "bern" },
  { name: "Wasserfallen", hint: "Reigoldswil Basel", region: "bern" },
  { name: "Gempen plateau", hint: "Basel", region: "bern" },

  // ── ROMANDIE: Chablais & Pays-d'Enhaut ──
  { name: "Tour d'Aï", hint: "Leysin Vaud", region: "vaud" },
  { name: "La Pierreuse", hint: "Gstaad Bern Vaud", region: "vaud" },
  { name: "Gummfluh", hint: "Pays-d'Enhaut Vaud", region: "vaud" },
  { name: "Vanil Noir", hint: "Fribourg Prealps", region: "fribourg" },
  { name: "Gastlosen", hint: "Fribourg", region: "fribourg" },
  { name: "Vallée de l'Hongrin", hint: "Vaud", region: "vaud" },
  { name: "Rochers de Naye", hint: "Montreux Vaud", region: "vaud" },
  { name: "Dent de Jaman", hint: "Montreux Vaud", region: "vaud" },
  { name: "Cape au Moine", hint: "Vaud", region: "vaud" },

  // ── ROMANDIE: Fribourg Prealps ──
  { name: "Schwarzsee", hint: "Fribourg", region: "fribourg" },
  { name: "Kaiseregg", hint: "Fribourg Prealps", region: "fribourg" },
  { name: "Dent de Broc", hint: "Gruyère Fribourg", region: "fribourg" },
  { name: "Dent de Lys", hint: "Fribourg", region: "fribourg" },
  { name: "Moléson", hint: "Gruyère Fribourg", region: "fribourg" },
  { name: "La Berra", hint: "Fribourg", region: "fribourg" },
  { name: "Jaunpass", hint: "Fribourg Bern", region: "fribourg" },
  { name: "Lac des Joncs", hint: "Fribourg Prealps", region: "fribourg" },
  { name: "Teysachaux", hint: "Moléson Fribourg", region: "fribourg" },

  // ── ROMANDIE: Vaud Alps ──
  { name: "Vallon de Nant", hint: "Pont de Nant Vaud", region: "vaud" },
  { name: "Anzeinde", hint: "Solalex Vaud", region: "vaud" },
  { name: "Miroir d'Argentine", hint: "Vaud", region: "vaud" },
  { name: "Les Pléiades", hint: "Vevey Vaud", region: "vaud" },
  { name: "Grand Muveran", hint: "Cabane Rambert Vaud", region: "vaud" },
  { name: "Lac Lioson", hint: "Les Mosses Vaud", region: "vaud" },
  { name: "Creux de Champ", hint: "Diablerets Vaud", region: "vaud" },
  { name: "Dent de Corjon", hint: "Vaud Fribourg", region: "vaud" },
];

// ─── GEOCODING ────────────────────────────────────────────────────────────────
async function geocode(name, hint) {
  const q = hint ? `${name}, ${hint}, Switzerland` : `${name}, Switzerland`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=ch&limit=3&accept-language=en`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SwissTrails/1.0 (geocode script)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Prefer results within Swiss bounding box
    for (const r of data) {
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lon);
      if (lat >= CH_LAT[0] && lat <= CH_LAT[1] && lng >= CH_LNG[0] && lng <= CH_LNG[1]) {
        return { lat: +lat.toFixed(5), lng: +lng.toFixed(5) };
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

const HERO_IMAGES = {
  "hidden-lake":    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  viewpoint:        "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1200&q=80",
  waterfall:        "https://images.unsplash.com/photo-1546632009-f66f57585f75?w=1200&q=80",
  gorge:            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  glacier:          "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
  forest:           "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80",
  "night-sky":      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
  "road-trip":      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&q=80",
  "photo-spot":     "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80",
  "alpine-meadow":  "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=1200&q=80",
  "sunset-spot":    "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=1200&q=80",
  river:            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
console.log(`Geocoding ${RAW.length} locations…`);

const results = [];
let ok = 0, fallback = 0;

for (let i = 0; i < RAW.length; i++) {
  const { name, hint, region } = RAW[i];
  process.stdout.write(`[${i + 1}/${RAW.length}] ${name.slice(0, 50).padEnd(50)} `);

  const coords = await geocode(name, hint);
  const finalCoords = coords ?? REGION_CENTERS[region] ?? REGION_CENTERS.bern;
  const category = guessCategory(name);

  if (coords) { ok++; process.stdout.write("✓\n"); }
  else         { fallback++; process.stdout.write("~ (fallback)\n"); }

  results.push({
    name,
    region,
    category,
    coordinates: finalCoords,
    geocoded: !!coords,
  });

  // Nominatim rate limit: 1 req/sec
  await sleep(1250);
}

console.log(`\nDone: ${ok} geocoded, ${fallback} fallbacks`);

// ─── GENERATE TYPESCRIPT ──────────────────────────────────────────────────────
const lines = [
  `import type { Location } from "@/types";`,
  ``,
  `export const PLACEHOLDER_LOCATIONS: Location[] = [`,
];

const pad = (n) => String(n).padStart(3, "0");

results.forEach((r, i) => {
  const id = `loc-${pad(i + 1)}`;
  const slug = slugify(r.name);
  const heroUrl = HERO_IMAGES[r.category] ?? HERO_IMAGES.viewpoint;

  lines.push(`  {`);
  lines.push(`    id: "${id}",`);
  lines.push(`    slug: "${slug}",`);
  lines.push(`    name: ${JSON.stringify(r.name)},`);
  lines.push(`    tagline: "",`);
  lines.push(`    description: "",`);
  lines.push(`    category: "${r.category}",`);
  lines.push(`    difficulty: "moderate",`);
  lines.push(`    region: "${r.region}",`);
  lines.push(`    coordinates: { lat: ${r.coordinates.lat}, lng: ${r.coordinates.lng} },`);
  lines.push(`    heroImage: {`);
  lines.push(`      id: "img-${id}",`);
  lines.push(`      url: "${heroUrl}",`);
  lines.push(`      alt: ${JSON.stringify(r.name)},`);
  lines.push(`      isHero: true,`);
  lines.push(`    },`);
  lines.push(`    gallery: [],`);
  lines.push(`    tags: [],`);
  lines.push(`    bestSeason: ["summer"],`);
  lines.push(`    travelTimeMinutes: 60,`);
  lines.push(`    visitDurationHours: { min: 2, max: 4 },`);
  lines.push(`    highlights: [],`);
  lines.push(`    tips: [],`);
  lines.push(`    whatToBring: [],`);
  lines.push(`    accessInfo: "",`);
  lines.push(`    parkingAvailable: true,`);
  lines.push(`    publicTransport: false,`);
  lines.push(`    isFeatured: false,`);
  lines.push(`    isNew: true,`);
  lines.push(`    viewCount: 0,`);
  lines.push(`    saveCount: 0,`);
  lines.push(`    createdAt: "2025-06-24T00:00:00Z",`);
  lines.push(`    updatedAt: "2025-06-24T00:00:00Z",`);
  lines.push(`  },`);
});

lines.push(`];`);
lines.push(``);
lines.push(`export const SWITZERLAND_CENTER = { lat: 46.8182, lng: 8.2275 };`);
lines.push(`export const SWITZERLAND_DEFAULT_ZOOM = 8;`);

const outPath = new URL("../data/locations.ts", import.meta.url).pathname;
writeFileSync(outPath, lines.join("\n"));
console.log(`\nWrote ${results.length} locations to ${outPath}`);
