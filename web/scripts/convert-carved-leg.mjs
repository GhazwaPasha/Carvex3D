// One-off offline conversion: STL (352k-triangle, non-indexed, 17.6MB) -> GLB
// (indexed, binary) for the homepage hero. Same geometry, same triangle
// count — this only removes the STL format's redundancy (every triangle
// stores its own copy of each vertex) by welding shared vertices and
// shipping a compact binary buffer instead. Also bakes in the watermark-blob
// removal that useCarvedLegHero used to do on every page load, so that CPU
// cost — and the code for it — moves out of the runtime path entirely.
//
// Run with: node scripts/convert-carved-leg.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// GLTFExporter's binary path reads the merged Blob back via the browser's
// FileReader API, which Node doesn't have. Polyfill just enough of it.
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob
        .arrayBuffer()
        .then((buf) => {
          this.result = buf;
          if (this.onloadend) this.onloadend();
        })
        .catch((err) => {
          if (this.onerror) this.onerror(err);
        });
    }
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.join(__dirname, '../public/uploads/cleaned-carved-leg.stl');
const outPath = path.join(__dirname, '../public/uploads/carved-leg.glb');

/** Ported as-is from useCarvedLegHero.ts's keepLargestSolid. */
function keepLargestSolid(geo) {
  const pos = geo.attributes.position;
  const triCount = pos.count / 3;
  const parent = new Int32Array(pos.count);
  for (let i = 0; i < pos.count; i++) parent[i] = i;
  function find(a) {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]];
      a = parent[a];
    }
    return a;
  }
  function union(a, b) {
    a = find(a);
    b = find(b);
    if (a !== b) parent[a] = b;
  }

  const keyToVert = new Map();
  const scale = 1e4;
  for (let i = 0; i < pos.count; i++) {
    const k = Math.round(pos.getX(i) * scale) + '_' + Math.round(pos.getY(i) * scale) + '_' + Math.round(pos.getZ(i) * scale);
    if (keyToVert.has(k)) union(i, keyToVert.get(k));
    else keyToVert.set(k, i);
  }
  for (let t = 0; t < triCount; t++) {
    union(t * 3, t * 3 + 1);
    union(t * 3 + 1, t * 3 + 2);
  }
  const triRoot = new Int32Array(triCount);
  const sizeByRoot = new Map();
  for (let t = 0; t < triCount; t++) {
    const r = find(t * 3);
    triRoot[t] = r;
    sizeByRoot.set(r, (sizeByRoot.get(r) || 0) + 1);
  }
  if (sizeByRoot.size <= 1) return geo;

  const bboxByRoot = new Map();
  for (let t = 0; t < triCount; t++) {
    const r = triRoot[t];
    let bb = bboxByRoot.get(r);
    if (!bb) {
      bb = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };
      bboxByRoot.set(r, bb);
    }
    for (let v = 0; v < 3; v++) {
      const idx = t * 3 + v;
      const x = pos.getX(idx), y = pos.getY(idx), z = pos.getZ(idx);
      if (x < bb.minX) bb.minX = x;
      if (x > bb.maxX) bb.maxX = x;
      if (y < bb.minY) bb.minY = y;
      if (y > bb.maxY) bb.maxY = y;
      if (z < bb.minZ) bb.minZ = z;
      if (z > bb.maxZ) bb.maxZ = z;
    }
  }
  let overallMaxDiag = 0;
  bboxByRoot.forEach((bb) => {
    const diag = Math.hypot(bb.maxX - bb.minX, bb.maxY - bb.minY, bb.maxZ - bb.minZ);
    if (diag > overallMaxDiag) overallMaxDiag = diag;
  });
  const keepRoots = new Set();
  bboxByRoot.forEach((bb, root) => {
    const diag = Math.hypot(bb.maxX - bb.minX, bb.maxY - bb.minY, bb.maxZ - bb.minZ);
    if (diag >= overallMaxDiag * 0.12) keepRoots.add(root);
  });

  const keptTris = [];
  for (let t = 0; t < triCount; t++) if (keepRoots.has(triRoot[t])) keptTris.push(t);
  if (keptTris.length === triCount) return geo;

  const newPos = new Float32Array(keptTris.length * 9);
  for (let i = 0; i < keptTris.length; i++) {
    const t = keptTris[i];
    for (let v = 0; v < 3; v++) {
      const src = t * 3 + v;
      newPos[i * 9 + v * 3] = pos.getX(src);
      newPos[i * 9 + v * 3 + 1] = pos.getY(src);
      newPos[i * 9 + v * 3 + 2] = pos.getZ(src);
    }
  }
  const cleaned = new THREE.BufferGeometry();
  cleaned.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
  return cleaned;
}

const raw = fs.readFileSync(srcPath);
const arrayBuffer = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
console.log('source STL:', (raw.length / 1024 / 1024).toFixed(2), 'MB');

let geometry = new STLLoader().parse(arrayBuffer);
console.log('parsed triangles:', geometry.attributes.position.count / 3);

geometry = keepLargestSolid(geometry);
console.log('after watermark strip:', geometry.attributes.position.count / 3, 'triangles');

// Weld shared vertices (position-only). STLLoader attaches a per-face
// normal attribute, and mergeVertices hashes *all* attributes together —
// leaving it in place would mean adjacent triangles' shared corners hash
// differently (different face normals) and never merge. Drop it first,
// weld on position alone, then rebuild smooth per-vertex normals.
geometry.deleteAttribute('normal');
geometry = mergeVertices(geometry);
geometry.computeVertexNormals();
console.log('indexed vertices:', geometry.attributes.position.count, '/ indices:', geometry.index.count);

const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());

const exporter = new GLTFExporter();
const glb = await new Promise((resolve, reject) => {
  exporter.parse(
    mesh,
    (result) => resolve(result),
    (err) => reject(err),
    { binary: true, truncateDrawRange: true },
  );
});

const buf = Buffer.from(glb);
fs.writeFileSync(outPath, buf);
console.log('wrote', outPath, (buf.length / 1024 / 1024).toFixed(2), 'MB');
console.log('reduction:', (100 * (1 - buf.length / raw.length)).toFixed(1) + '%');
