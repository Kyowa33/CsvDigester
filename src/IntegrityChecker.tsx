import React, { useState } from 'react';

// Définition des types
type HashResults = Record<string, string>;
type Status = 'idle' | 'loading' | 'done' | 'error';

const IntegrityChecker: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [msg, setMsg] = useState<string | null>("🔍 Vérification d'intégrité de l'application en cours...");
  const [buildHash, setBuildHash] = useState<string>("");

  if (status === 'idle') {
    setTimeout(async () => {
      await verifyIntegrity();
    }, 1000);
  }

  const verifyIntegrity = async () => {
    setStatus('loading');

    let buildHash: string = "";
    try {
      console.log("Fetching build.hash");
      // Charger le build.hash
      const buildRes = await fetch('./build.hash');
      if ((!buildRes) || (!buildRes.ok))
        throw new Error('Impossible de charger le build.hash');
      buildHash = await buildRes.text();
      localStorage.setItem("buildHash", buildHash);
    }
    catch (e) {
      const tmpBuildHash = localStorage.getItem("buildHash");
      if (tmpBuildHash) {
        buildHash = tmpBuildHash;
      }
    }

    try {
      console.log("Fetching build.json");
      // Charger le manifest.json
      const manifestRes = await fetch('./build.json');
      if ((!manifestRes) || (!manifestRes.ok))
        throw new Error('Impossible de charger le build.json');

      localStorage.setItem("buildJson", await manifestRes.text());
    }
    catch (e) { }

    let buildJsonTxt = localStorage.getItem("buildJson");
    if (!buildJsonTxt) {
      throw new Error("Impossible de charger le build.json");
    }
    let manifest: { files: string[] };
    try {
      manifest = JSON.parse(buildJsonTxt);
      
      manifest.files.sort();
      // Calculer les hash
      const localHashes: HashResults = {};
      for (const file of manifest.files) {
        try {
          const hash = await hashFile(`./${file}`);
          localHashes[file] = hash;
          localStorage.setItem("HASH" + file, hash);
        }
        catch (err) {
          const tmpHashFile = localStorage.getItem("HASH" + file);
          if (tmpHashFile !== null) {
            localHashes[file] = tmpHashFile;
          }
          else {
            throw new Error("Impossible de charger le fichier " + file);
          }
        }
      }

      // Concatène tous les hash pour créer un hash global
      const allHashes = Object.entries(localHashes)
        .map(([file, hash]) => `${file}:${hash}`)
        .join('\n');

      const encoder = new TextEncoder();
      const buffer = encoder.encode(allHashes);
      const finalHash = await calculateHash(new Uint8Array(buffer));

      setBuildHash("Build hash : " + buildHash);
      if (buildHash !== finalHash) {
        throw new Error(buildHash);
      }
      else {
        setMsg("✅ Intégrité de l'application vérifiée");
        setStatus('done');
      }

    } catch (err: any) {
      setBuildHash("" + err);
      setMsg("❌ Problème d'intégrité de l'application");
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }} title={buildHash}>
      <h2>{msg && <p style={{ color: (status === 'error') ? 'red' : (status === 'done') ? '#4C4' : '#848', marginTop: '1rem' }}>{msg}</p>}</h2>
    </div>
  );
};

export default IntegrityChecker;

// Fonction utilitaire pour hasher un fichier
async function hashFile(url: string): Promise<string> {
  console.log("Fetching url " + url);
  const response = await fetch(url);
  if ((!response) || (!response.ok))
    throw new Error("Impossible de charger le fichier " + url);
  const text = await response.text();
  const encoder = new TextEncoder();
  const buffer = encoder.encode(text);

  return calculateHash(buffer);
}

// Fonction utilitaire pour hasher un fichier
async function calculateHash(buffer: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return arrayBufferToHex(hashBuffer);
}

// Convertit un ArrayBuffer en hexadécimal
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}