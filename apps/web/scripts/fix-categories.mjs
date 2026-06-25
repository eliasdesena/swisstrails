/**
 * Reassigns empty categories (sunset-spot, road-trip, night-sky, photo-spot)
 * to appropriate locations based on their names.
 * Run: node apps/web/scripts/fix-categories.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "../data/locations.ts");

const REASSIGNMENTS = {
  "night-sky": [
    "loc-001", // Greina Plateau — remote 2300m, total darkness
    "loc-032", // Alp Sardasca (Klosters)
    "loc-033", // Silvrettahütte
    "loc-061", // Lag da Pintga / Frisalhütte
    "loc-078", // Alp Flix (Parc Ela)
    "loc-085", // Alp Curciusa (Hinterrhein)
    "loc-092", // Cabane du Petit Mountet
    "loc-093", // Lac de Moiry / Cabane de Moiry
    "loc-110", // Cabane de Chanrion
    "loc-111", // Lac de Louvie / Cabane de Louvie
    "loc-117", // Cabane de l'A Neuve
    "loc-148", // Anenhütte / Gletscherstafel
    "loc-173", // Bortelhütte / Bortelsee
    "loc-206", // Capanna Motterascio
    "loc-209", // Capanna Adula / Rheinwaldhorn
    "loc-222", // Üschinen / Allmenalp
    "loc-225", // Lämmerenboden / Lämmerenhütte
    "loc-230", // Elsigenalp / Elsigsee
    "loc-255", // Busenalp / Soustal
    "loc-256", // Faulhorn from Axalp
    "loc-259", // Grindelalp / Bachläger
    "loc-268", // Engstlenalp / Tannensee
  ],
  "sunset-spot": [
    "loc-038", // Tschiertschen / Hochwang
    "loc-140", // Monte Moro (Mattmark)
    "loc-194", // Monte Gridone (Ghiridone)
    "loc-213", // Monte Bar / Capanna Monte Bar
    "loc-214", // Monte Tamaro–Lema ridge
    "loc-215", // Monte Lema (Malcantone)
    "loc-219", // Monte Bisbino back
    "loc-220", // Monte Generoso back trails
    "loc-307", // Hoch-Ybrig — Druesberg
    "loc-312", // Rigi Scheidegg / Hochflue
    "loc-344", // Pilatus — Mittaggüpfi / Tomlishorn
    "loc-367", // Hochalp (Urnäsch)
    "loc-430", // Chasseral ridge
    "loc-445", // Weissenstein (Solothurn)
    "loc-465", // Hochmatt
  ],
  "road-trip": [
    "loc-021", // Jöriseen (Flüela pass)
    "loc-039", // Val Bregaglia high (Pass da Cam)
    "loc-072", // Tomülpass
    "loc-088", // Splügen / Tambo
    "loc-090", // Heinzenberg / Glaspass
    "loc-139", // Antronapass
    "loc-146", // Augstbordpass
    "loc-149", // Lötschenpass
    "loc-153", // Albrunpass
    "loc-175", // Saflischpass
    "loc-204", // Passo San Giacomo / Val Corno
    "loc-216", // Val Morobbia — Passo San Jorio
    "loc-227", // Hahnenmoospass back
    "loc-234", // Trütlisbergpass
    "loc-238", // Ammertenpass
    "loc-271", // Bächlital (Grimsel)
    "loc-286", // Fisetenpass
    "loc-287", // Klausenpass back trails
    "loc-293", // Meiental (Susten)
    "loc-294", // Surenenpass
    "loc-305", // Pragelpass
    "loc-359", // Zwinglipass
    "loc-387", // Weisstannental — Foopass
    "loc-388", // Heidelpass (Weisstannen)
    "loc-448", // Passwang
    "loc-483", // Jaunpass / Hundsrügg
  ],
  "photo-spot": [
    "loc-082", // Schyn gorge
    "loc-130", // Lizerne gorge
    "loc-170", // Stockalperweg (Gondo gorge)
    "loc-226", // Engstligenalp & Engstligenfälle
    "loc-232", // Iffigfall
    "loc-233", // Simmenfälle / Rezliberg
    "loc-249", // Geltenschlucht / Geltenhütte
    "loc-250", // Tungelschlucht (Lauenen)
    "loc-253", // Schmadribach falls
    "loc-274", // Trift bridge / Triftgletscher
    "loc-391", // Seerenbachfälle / Betlis
    "loc-406", // Gorges de l'Areuse
    "loc-407", // Gorges du Seyon
    "loc-415", // Les Brenets / Doubs gorges
    "loc-433", // Twannbachschlucht
    "loc-434", // Taubenlochschlucht
    "loc-438", // Gorges de Court
    "loc-439", // Gorges du Pichoux
    "loc-450", // Wasserfallen / Reigoldswil
  ],
};

let content = readFileSync(FILE, "utf-8");
const lines = content.split("\n");
let changed = 0;

// Build a reverse map: id -> new category
const idToCategory = {};
for (const [cat, ids] of Object.entries(REASSIGNMENTS)) {
  for (const id of ids) {
    idToCategory[id] = cat;
  }
}

// Walk through lines looking for id: "loc-XXX" then replace the next category: "..." within 10 lines
let i = 0;
while (i < lines.length) {
  const idMatch = lines[i].match(/^\s+id:\s+"(loc-\d+)"/);
  if (idMatch) {
    const id = idMatch[1];
    const newCat = idToCategory[id];
    if (newCat) {
      // Look ahead up to 10 lines for the category field
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const catMatch = lines[j].match(/^(\s+category:\s+)"([^"]+)"/);
        if (catMatch) {
          lines[j] = `${catMatch[1]}"${newCat}"`;
          changed++;
          break;
        }
      }
    }
  }
  i++;
}

writeFileSync(FILE, lines.join("\n"), "utf-8");
console.log(`Done. Reassigned ${changed} locations.`);

// Print counts
const newContent = readFileSync(FILE, "utf-8");
for (const cat of ["night-sky", "sunset-spot", "road-trip", "photo-spot", "viewpoint", "hidden-lake", "waterfall", "gorge", "forest", "glacier", "alpine-meadow", "river"]) {
  const count = (newContent.match(new RegExp(`category: "${cat}"`, "g")) || []).length;
  console.log(`  ${cat}: ${count}`);
}
