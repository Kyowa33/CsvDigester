import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

// Pour utiliser __dirname et __filename dans un module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins
const distDir = path.resolve(__dirname, '../dist');
const outputManifest = path.resolve(distDir, 'build.json');
const outputHashFile = path.resolve(distDir, 'build.hash');

// Fonction pour lister les fichiers
function getFiles(dir, parentDir = '') {
  const fullPath = path.join(dir, parentDir);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ Dossier introuvable : ${fullPath}`);
    return [];
  }

  const files = fs.readdirSync(fullPath);
  let fileList = [];

  for (const file of files) {
    const currentPath = path.join(parentDir, file);
    const absolutePath = path.join(fullPath, file);
    const stat = fs.statSync(absolutePath);

    if (stat.isDirectory()) {
      fileList = fileList.concat(getFiles(dir, currentPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.html', '.js', '.css'].includes(ext)) {
        fileList.push(currentPath.replaceAll('\\', '/'));
      }
    }
  }

  return fileList;
}

// Fonction pour calculer le hash d’un fichier
function calculateHash(content) {
  return createHash('sha256').update(content).digest('hex');
}

// === Étape 1 : Génère le manifest.json ===
const files = getFiles(distDir).sort();

fs.writeFileSync(
  outputManifest,
  JSON.stringify({ files }, null, 2),
  'utf-8'
);

console.log(`✅ Manifest généré avec succès (${files.length} fichiers).`);

// === Étape 2 : Calcule les hash individuels et génère build.hash ===

const hashes = {};

for (const file of files) {
  const filePath = path.join(distDir, file);
  try {
    const content = fs.readFileSync(filePath);
    const hash = calculateHash(content);
    hashes[file] = hash;
  } catch (err) {
    console.error(`❌ Impossible de lire le fichier : ${filePath}`);
    process.exit(1);
  }
}

// Concatène tous les hash pour créer un hash global
const allHashes = Object.entries(hashes)
  .map(([file, hash]) => `${file}:${hash}`)
  .join('\n');

const finalHash = calculateHash(Buffer.from(allHashes));

// Sauvegarde le hash final
fs.writeFileSync(outputHashFile, finalHash, 'utf-8');

console.log(`✅ Hash global généré : ${finalHash}`);
console.log(`Fichier écrit : ${outputHashFile}`);