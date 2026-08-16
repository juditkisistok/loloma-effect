import { gunzipSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";

const z = 13;
const bbox = {
  minLon: 177.28,
  minLat: -17.78,
  maxLon: 177.62,
  maxLat: -17.48,
};
const years = new Set([1999, 2007, 2015, 2023]);
const tileUrl = "https://tileserver.prod.digitalearthpacific.io/data/coastlines";
const debug = process.argv.includes("--debug");

async function fetchTile(tile) {
  const response = await fetch(`${tileUrl}/${tile.z}/${tile.x}/${tile.y}.pbf`);
  if (!response.ok) return Buffer.alloc(0);
  return Buffer.from(await response.arrayBuffer());
}

function tilesForBbox(bounds, zoom) {
  const nw = lonLatToTile(bounds.minLon, bounds.maxLat, zoom);
  const se = lonLatToTile(bounds.maxLon, bounds.minLat, zoom);
  const tiles = [];
  for (let x = nw.x; x <= se.x; x += 1) {
    for (let y = nw.y; y <= se.y; y += 1) {
      tiles.push({ x, y, z: zoom });
    }
  }
  return tiles;
}

function lonLatToTile(lon, lat, zoom) {
  const n = 2 ** zoom;
  const latRad = (lat * Math.PI) / 180;
  return {
    x: Math.floor(((lon + 180) / 360) * n),
    y: Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
        n,
    ),
  };
}

function tilePointToLonLat(tile, extent, x, y) {
  const n = 2 ** tile.z;
  const worldX = (tile.x + x / extent) / n;
  const worldY = (tile.y + y / extent) / n;
  const lon = worldX * 360 - 180;
  const lat =
    (Math.atan(Math.sinh(Math.PI * (1 - 2 * worldY))) * 180) / Math.PI;
  return [lon, lat];
}

function decodeVectorTile(buffer, tile) {
  const reader = new PbfReader(buffer);
  const features = [];

  while (reader.pos < reader.length) {
    const { field, wire } = reader.readTag();
    if (field !== 3 || wire !== 2) {
      reader.skip(wire);
      continue;
    }

    const layerEnd = reader.readVarint() + reader.pos;
    features.push(...decodeLayer(reader.readBytes(layerEnd), tile));
    reader.pos = layerEnd;
  }

  return features;
}

function decodeLayer(buffer, tile) {
  const reader = new PbfReader(buffer);
  const layer = {
    name: "",
    extent: 4096,
    keys: [],
    values: [],
    rawFeatures: [],
  };

  while (reader.pos < reader.length) {
    const { field, wire } = reader.readTag();
    if (field === 1) layer.name = reader.readString();
    else if (field === 2 && wire === 2) {
      const end = reader.readVarint() + reader.pos;
      layer.rawFeatures.push(reader.readBytes(end));
      reader.pos = end;
    } else if (field === 3) layer.keys.push(reader.readString());
    else if (field === 4 && wire === 2) {
      const end = reader.readVarint() + reader.pos;
      layer.values.push(decodeValue(reader.readBytes(end)));
      reader.pos = end;
    } else if (field === 5) layer.extent = reader.readVarint();
    else if (field === 15) reader.readVarint();
    else reader.skip(wire);
  }

  return layer.rawFeatures.map((raw) => decodeFeature(raw, layer, tile));
}

function decodeValue(buffer) {
  const reader = new PbfReader(buffer);
  let value = null;

  while (reader.pos < reader.length) {
    const { field, wire } = reader.readTag();
    if (field === 1) value = reader.readString();
    else if (field === 2) value = reader.readFloat();
    else if (field === 3) value = reader.readDouble();
    else if (field === 4) value = Number(reader.readVarint());
    else if (field === 5) value = Number(reader.readVarint());
    else if (field === 6) value = reader.readSVarint();
    else if (field === 7) value = Boolean(reader.readVarint());
    else reader.skip(wire);
  }

  return value;
}

function decodeFeature(buffer, layer, tile) {
  const reader = new PbfReader(buffer);
  const feature = {
    layer: layer.name,
    type: 0,
    properties: {},
    geometryCommands: [],
  };

  while (reader.pos < reader.length) {
    const { field, wire } = reader.readTag();
    if (field === 1) reader.readVarint();
    else if (field === 2 && wire === 2) {
      const end = reader.readVarint() + reader.pos;
      const tags = [];
      while (reader.pos < end) tags.push(reader.readVarint());
      for (let i = 0; i < tags.length; i += 2) {
        feature.properties[layer.keys[tags[i]]] = layer.values[tags[i + 1]];
      }
    } else if (field === 3) feature.type = reader.readVarint();
    else if (field === 4 && wire === 2) {
      const end = reader.readVarint() + reader.pos;
      while (reader.pos < end) feature.geometryCommands.push(reader.readVarint());
    } else reader.skip(wire);
  }

  feature.geometry = decodeGeometry(
    feature.type,
    feature.geometryCommands,
    layer.extent,
    tile,
  );

  return feature;
}

function decodeGeometry(type, commands, extent, tile) {
  let x = 0;
  let y = 0;
  let cursor = 0;
  const lines = [];
  let line = [];

  while (cursor < commands.length) {
    const commandInteger = commands[cursor];
    cursor += 1;
    const command = commandInteger & 0x7;
    const count = commandInteger >> 3;

    if (command === 1 || command === 2) {
      for (let i = 0; i < count; i += 1) {
        x += zigZag(commands[cursor]);
        y += zigZag(commands[cursor + 1]);
        cursor += 2;
        const point = tilePointToLonLat(tile, extent, x, y);
        if (type === 1) lines.push(point);
        else {
          if (command === 1 && line.length) {
            lines.push(line);
            line = [];
          }
          line.push(point);
        }
      }
    } else if (command === 7) {
      if (line.length) line.push(line[0]);
    }
  }

  if (type !== 1 && line.length) lines.push(line);
  return lines;
}

function zigZag(value) {
  return (value >> 1) ^ (-(value & 1));
}

function inBbox(lon, lat, bounds) {
  return (
    lon >= bounds.minLon &&
    lon <= bounds.maxLon &&
    lat >= bounds.minLat &&
    lat <= bounds.maxLat
  );
}

function simplifyLine(points, tolerance) {
  if (points.length <= 2) return points;
  const simplified = [points[0]];
  let previous = points[0];
  for (const point of points.slice(1, -1)) {
    if (distance(previous, point) >= tolerance) {
      simplified.push(point);
      previous = point;
    }
  }
  simplified.push(points.at(-1));
  return simplified;
}

function distance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function roundCoord([lon, lat]) {
  return [round(lon, 5), round(lat, 5)];
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function maybeGunzip(buffer) {
  return buffer[0] === 0x1f && buffer[1] === 0x8b ? gunzipSync(buffer) : buffer;
}

class PbfReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.pos = 0;
    this.length = buffer.length;
  }

  readTag() {
    const tag = this.readVarint();
    return { field: tag >> 3, wire: tag & 0x7 };
  }

  readVarint() {
    let value = 0;
    let shift = 0;
    while (this.pos < this.length) {
      const byte = this.buffer[this.pos];
      this.pos += 1;
      value += (byte & 0x7f) * 2 ** shift;
      if (byte < 0x80) break;
      shift += 7;
    }
    return value;
  }

  readSVarint() {
    return zigZag(this.readVarint());
  }

  readString() {
    const len = this.readVarint();
    const start = this.pos;
    this.pos += len;
    return this.buffer.toString("utf8", start, this.pos);
  }

  readFloat() {
    const value = this.buffer.readFloatLE(this.pos);
    this.pos += 4;
    return value;
  }

  readDouble() {
    const value = this.buffer.readDoubleLE(this.pos);
    this.pos += 8;
    return value;
  }

  readBytes(end) {
    return this.buffer.subarray(this.pos, end);
  }

  skip(wire) {
    if (wire === 0) this.readVarint();
    else if (wire === 1) this.pos += 8;
    else if (wire === 2) this.pos += this.readVarint();
    else if (wire === 5) this.pos += 4;
    else throw new Error(`Unsupported protobuf wire type: ${wire}`);
  }
}

async function main() {
  const shorelineFeatures = [];
  const rateFeatures = [];
  const seenLines = new Set();
  const seenPoints = new Set();
  const counts = new Map();
  const yearCounts = new Map();
  const coordRange = {
    minLon: Infinity,
    minLat: Infinity,
    maxLon: -Infinity,
    maxLat: -Infinity,
  };

  for (const tile of tilesForBbox(bbox, z)) {
    const buffer = await fetchTile(tile);
    if (!buffer.length) continue;

    const decoded = decodeVectorTile(maybeGunzip(buffer), tile);
    for (const feature of decoded) {
      if (debug) {
        counts.set(feature.layer, (counts.get(feature.layer) ?? 0) + 1);
        if (feature.layer === "shorelines_annual") {
          const year = feature.properties.year;
          yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
          for (const line of feature.geometry) {
            for (const [lon, lat] of line) {
              coordRange.minLon = Math.min(coordRange.minLon, lon);
              coordRange.maxLon = Math.max(coordRange.maxLon, lon);
              coordRange.minLat = Math.min(coordRange.minLat, lat);
              coordRange.maxLat = Math.max(coordRange.maxLat, lat);
            }
          }
        }
      }

      if (
        feature.layer === "shorelines_annual" &&
        years.has(feature.properties.year) &&
        feature.properties.certainty === "good"
      ) {
        for (const line of feature.geometry) {
          const clipped = line.filter(([lon, lat]) => inBbox(lon, lat, bbox));
          if (clipped.length < 2) continue;
          const simplified = simplifyLine(clipped, 0.00034).map(roundCoord);
          const key = `${feature.properties.year}:${simplified
            .map((point) => point.join(","))
            .join(";")}`;
          if (seenLines.has(key)) continue;
          seenLines.add(key);
          shorelineFeatures.push({
            year: feature.properties.year,
            certainty: feature.properties.certainty,
            coordinates: simplified,
          });
        }
      }

      if (
        feature.layer === "rates_of_change" &&
        feature.properties.certainty === "good" &&
        feature.properties.sig_time <= 0.01
      ) {
        for (const point of feature.geometry) {
          const [lon, lat] = point;
          if (!inBbox(lon, lat, bbox)) continue;
          const rounded = roundCoord(point);
          const key = rounded.join(",");
          if (seenPoints.has(key)) continue;
          seenPoints.add(key);
          rateFeatures.push({
            coordinates: rounded,
            rate: round(feature.properties.rate_time, 3),
            se: round(feature.properties.se_time, 3),
            sig: round(feature.properties.sig_time, 3),
          });
        }
      }
    }
  }

  rateFeatures.sort((a, b) => Math.abs(b.rate) - Math.abs(a.rate));

  const data = {
    source: {
      title: "Annual Shorelines (Landsat, 30 m)",
      provider: "Digital Earth Pacific / Pacific Data Hub",
      url: "https://pacificdata.org/data/dataset/dep_ls_coastlines",
      tilejson:
        "https://tileserver.prod.digitalearthpacific.io/data/coastlines.json",
      note: "Subset extracted from vector tiles for the Lautoka-Nadi coast. Shorelines are annual Landsat-derived coastline vectors; rates are metres per year.",
    },
    bbox,
    years: [...years],
    shorelines: shorelineFeatures,
    rates: rateFeatures.slice(0, 90),
  };

  await mkdir("src/data", { recursive: true });
  await writeFile(
    "src/data/coastalShoreline.js",
    `export const coastalShoreline = ${JSON.stringify(data, null, 2)};\n`,
  );

  console.log(
    `Wrote ${shorelineFeatures.length} shoreline segments and ${Math.min(
      rateFeatures.length,
      90,
    )} rate points.`,
  );

  if (debug) {
    console.log("Layer counts:", Object.fromEntries(counts));
    console.log(
      "Shoreline years:",
      Object.fromEntries([...yearCounts].sort((a, b) => a[0] - b[0])),
    );
    console.log("Shoreline coordinate range:", coordRange);
  }
}

await main();
