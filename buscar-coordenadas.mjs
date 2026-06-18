// Preenche rota.coords em bh.json e rio.json via OSRM público.
// Uso: node buscar-coordenadas.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_DIR = path.join(__dirname, "routes");
const ARQUIVOS = ["bh.json", "rio.json", "bh-triangulo.json"];

async function fetchOSRM(url, tentativas = 3) {
  for (let t = 0; t < tentativas; t++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (t < tentativas - 1) {
        console.warn(`  Tentativa ${t + 1} falhou (${e.message}), aguardando 1 s…`);
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        throw e;
      }
    }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  for (let i = 0; i < ARQUIVOS.length; i++) {
    const arquivo = ARQUIVOS[i];
    const caminho = path.join(ROUTES_DIR, arquivo);
    const rota = JSON.parse(readFileSync(caminho, "utf8"));

    if (!rota.waypoints?.length) {
      console.warn(`[${arquivo}] Sem waypoints — pulando.`);
      continue;
    }

    // OSRM usa lon,lat (longitude primeiro)
    const coordStr = rota.waypoints.map((w) => `${w.lon},${w.lat}`).join(";");
    const url =
      `https://router.project-osrm.org/route/v1/driving/${coordStr}` +
      `?overview=full&geometries=geojson`;

    console.log(`\n[${arquivo}] Buscando via OSRM…`);
    console.log(`  Waypoints: ${rota.waypoints.map((w) => w.nome).join(" → ")}`);

    try {
      const data = await fetchOSRM(url);
      const route = data.routes?.[0];
      if (!route) throw new Error("OSRM não retornou rota.");

      // OSRM retorna [lon, lat]; Leaflet espera [lat, lon]
      rota.coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      rota.distancia_km = Math.round(route.distance / 100) / 10;
      rota.duracao_h    = Math.round((route.duration / 3600) * 10) / 10;

      writeFileSync(caminho, JSON.stringify(rota, null, 2) + "\n", "utf8");

      console.log(
        `  ✓ ${rota.coords.length} pontos | ` +
        `${rota.distancia_km} km | ${rota.duracao_h} h`
      );
    } catch (e) {
      console.error(`  ✗ Falhou: ${e.message}`);
    }

    if (i < ARQUIVOS.length - 1) await sleep(1200);
  }

  console.log("\nConcluído.");
}

main();
