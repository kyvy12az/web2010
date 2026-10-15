/* Adapted from Vantage by thebuggeddev (https://github.com/thebuggeddev/vantage).
Required Notice: Copyright 2026 thebuggeddev. Contact: <thebuggeddev@gmail.com>. Creator: <https://x.com/thebuggeddev>
PolyForm Noncommercial 1.0.0 — see vendor/vantage/LICENSE.md.
Adaptation: extracted procedural chair and row builders; Three.js r170; no booking UI. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
const M4=()=>new THREE.Matrix4();const _boxCache=new Map();
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function mergeParts(parts, withColor) {
        let pos = [],
          nor = [],
          uv = [],
          col = [];
        const c = new THREE.Color();
        for (const p of parts) {
          const g = p.geo.index ? p.geo.toNonIndexed() : p.geo;
          if (p.matrix) g.applyMatrix4(p.matrix);
          const pa = g.attributes.position.array,
            na = g.attributes.normal.array,
            ua = g.attributes.uv ? g.attributes.uv.array : null;
          for (let i = 0; i < pa.length; i++) pos.push(pa[i]);
          for (let i = 0; i < na.length; i++) nor.push(na[i]);
          if (ua) for (let i = 0; i < ua.length; i++) uv.push(ua[i]);
          else for (let i = 0; i < (pa.length / 3) * 2; i++) uv.push(0);
          if (withColor) {
            c.set(p.color !== undefined ? p.color : 0xffffff);
            const j =
              0.98 +
              (((((mergeParts._i = (mergeParts._i || 0) + 1) * 2654435761) >>>
                13) &
                255) /
                255) *
                0.04;
            for (let i = 0; i < pa.length / 3; i++) {
              col.push(c.r * j, c.g * j, c.b * j);
            }
          }
          g.dispose();
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
        geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        if (withColor)
          geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
        return geo;
      }
function boxGeo(w, h, d) {
        const md = Math.min(w, h, d);
        if (md < 0.11) return new THREE.BoxGeometry(w, h, d);
        const key = w.toFixed(3) + "," + h.toFixed(3) + "," + d.toFixed(3);
        let base = _boxCache.get(key);
        if (!base) {
          const bev = Math.min(0.035, md * 0.3);
          base = new THREE.ExtrudeGeometry(
            roundedRect(w, h, Math.min(0.05, md * 0.32)),
            {
              depth: Math.max(0.002, d - 2 * bev),
              bevelEnabled: true,
              bevelThickness: bev,
              bevelSize: bev,
              bevelSegments: 1,
              curveSegments: 1,
            },
          );
          base.translate(0, 0, -(d - 2 * bev) / 2); /* recentre on depth axis */
          _boxCache.set(key, base);
        }
        return base.clone();
      }
function boxAt(w, h, d, x, y, z, rx, ry, rz, color) {
        const m = M4()
          .makeRotationFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0))
          .setPosition(x, y, z);
        return { geo: boxGeo(w, h, d), matrix: m, color: color };
      }
function cylAt(rt, rb, h, seg, x, y, z, rx, ry, rz, color) {
        const m = M4()
          .makeRotationFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0))
          .setPosition(x, y, z);
        return {
          geo: new THREE.CylinderGeometry(rt, rb, h, seg),
          matrix: m,
          color: color,
        };
      }
function roundedRect(w, h, r) {
        const sh = new THREE.Shape(),
          x = -w / 2,
          y = -h / 2;
        sh.moveTo(x + r, y);
        sh.lineTo(x + w - r, y);
        sh.quadraticCurveTo(x + w, y, x + w, y + r);
        sh.lineTo(x + w, y + h - r);
        sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        sh.lineTo(x + r, y + h);
        sh.quadraticCurveTo(x, y + h, x, y + h - r);
        sh.lineTo(x, y + r);
        sh.quadraticCurveTo(x, y, x + r, y);
        return sh;
      }
function backShape(w, h) {
        const sh = new THREE.Shape(),
          hw = w / 2;
        sh.moveTo(-hw * 0.84, -h * 0.5);
        sh.quadraticCurveTo(-hw * 1.02, -h * 0.16, -hw * 0.95, h * 0.1);
        sh.quadraticCurveTo(-hw * 0.9, h * 0.36, -hw * 0.6, h * 0.48);
        sh.quadraticCurveTo(0, h * 0.58, hw * 0.6, h * 0.48);
        sh.quadraticCurveTo(hw * 0.9, h * 0.36, hw * 0.95, h * 0.1);
        sh.quadraticCurveTo(hw * 1.02, -h * 0.16, hw * 0.84, -h * 0.5);
        sh.quadraticCurveTo(0, -h * 0.57, -hw * 0.84, -h * 0.5);
        return sh;
      }
function puffFront(geo, amount) {
        const p = geo.attributes.position;
        let zMax = -1e9,
          xM = 1e-6,
          yM = 1e-6;
        for (let i = 0; i < p.count; i++) {
          zMax = Math.max(zMax, p.getZ(i));
          xM = Math.max(xM, Math.abs(p.getX(i)));
          yM = Math.max(yM, Math.abs(p.getY(i)));
        }
        for (let i = 0; i < p.count; i++) {
          if (p.getZ(i) < zMax - 1e-4) continue;
          const rx = p.getX(i) / xM,
            ry = p.getY(i) / yM;
          const d = Math.max(0, 1 - (rx * rx + ry * ry) * 0.92);
          p.setZ(i, p.getZ(i) + amount * Math.pow(d, 1.15));
        }
        return geo;
      }
function smoothNormals(geo) {
        geo.computeVertexNormals();
        const p = geo.attributes.position,
          n = geo.attributes.normal,
          map = {};
        for (let i = 0; i < p.count; i++) {
          const k =
            ((p.getX(i) * 1e4) | 0) +
            "_" +
            ((p.getY(i) * 1e4) | 0) +
            "_" +
            ((p.getZ(i) * 1e4) | 0);
          (map[k] = map[k] || []).push(i);
        }
        const v = new THREE.Vector3();
        for (const k in map) {
          const a = map[k];
          if (a.length < 2) continue;
          v.set(0, 0, 0);
          for (let j = 0; j < a.length; j++)
            ((v.x += n.getX(a[j])),
              (v.y += n.getY(a[j])),
              (v.z += n.getZ(a[j])));
          v.normalize();
          for (let j = 0; j < a.length; j++) n.setXYZ(a[j], v.x, v.y, v.z);
        }
        return geo;
      }
function padGeo(shape, depth, bev, puff) {
        const g = new THREE.ExtrudeGeometry(shape, {
          depth: depth,
          bevelEnabled: true,
          bevelThickness: bev,
          bevelSize: bev * 0.92,
          bevelSegments: 3,
          curveSegments: 4,
        });
        if (puff) puffFront(g, puff);
        smoothNormals(g);
        g.translate(0, 0, -depth / 2);
        return g;
      }
function pipeGeo(shape, z, scale) {
        const pts = shape
          .getPoints(22)
          .map(
            (pt) =>
              new THREE.Vector3(pt.x * (scale || 1), pt.y * (scale || 1), z),
          );
        return new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5),
          56,
          0.0085,
          7,
          true,
        );
      }
function partAt(geo, x, y, z, rx, ry, rz, color) {
        const m = M4()
          .makeRotationFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0))
          .setPosition(x, y, z);
        return { geo: geo, matrix: m, color: color };
      }
function buildSeatGeometry() {
        /* Orientation contract: FRONT of the chair faces LOCAL -Z.
     v5 — ergonomic silhhouette, vertex-puffed upholstery, piping trim.  */
        const L = 0xffffff,
          Ld = 0xe4e4e4,
          P = 0xc9c9c9,
          F = 0x141419,
          C = 0x0b0b0f,
          M = 0x3a3a44;
        const lean = 0.15;
        const bsh = backShape(0.46, 0.55); // fabric pad silhouette
        const ssh = backShape(0.52, 0.61); // dark shell, one size up
        const csh = roundedRect(0.44, 0.46, 0.1); // cushion plan
        const parts = [
          /* legs + tip-up mechanism */
          boxAt(0.05, 0.3, 0.24, -0.235, 0.15, 0.12, 0, 0, 0, M),
          boxAt(0.05, 0.3, 0.24, 0.235, 0.15, 0.12, 0, 0, 0, M),
          boxAt(0.44, 0.08, 0.32, 0, 0.315, 0.06, 0, 0, 0, C),
          /* seat cushion: puffed pad + piping + frame + front roll */
          partAt(
            padGeo(csh, 0.085, 0.03, 0.026),
            0,
            0.445,
            0.01,
            -Math.PI / 2 + 0.06,
            0,
            0,
            L,
          ),
          partAt(
            pipeGeo(csh, 0.052),
            0,
            0.445,
            0.01,
            -Math.PI / 2 + 0.06,
            0,
            0,
            P,
          ),
          boxAt(0.47, 0.07, 0.47, 0, 0.372, 0.02, 0, 0, 0, F),
          cylAt(0.04, 0.04, 0.42, 12, 0, 0.418, -0.225, 0, 0, Math.PI / 2, L),
          /* backrest: shell one size up, tall puffed pad with piping, top roll */
          partAt(padGeo(ssh, 0.045, 0.016, 0), 0, 0.825, 0.295, lean, 0, 0, F),
          partAt(
            padGeo(bsh, 0.065, 0.028, 0.03),
            0,
            0.815,
            0.225,
            lean,
            0,
            0,
            L,
          ),
          partAt(pipeGeo(bsh, 0.062), 0, 0.815, 0.225, lean, 0, 0, P),
          partAt(
            padGeo(roundedRect(0.34, 0.1, 0.045), 0.05, 0.018, 0.012),
            0,
            1.175,
            0.276,
            lean * 1.35,
            0,
            0,
            Ld,
          ),
          /* slim side bolsters */
          partAt(
            padGeo(roundedRect(0.055, 0.56, 0.024), 0.045, 0.013, 0.008),
            -0.245,
            0.8,
            0.253,
            lean,
            -0.07,
            0,
            Ld,
          ),
          partAt(
            padGeo(roundedRect(0.055, 0.56, 0.024), 0.045, 0.013, 0.008),
            0.245,
            0.8,
            0.253,
            lean,
            0.07,
            0,
            Ld,
          ),
          /* armrests + cupholders at the front tips */
          boxAt(0.06, 0.32, 0.11, -0.295, 0.35, 0.17, 0, 0, 0, F),
          boxAt(0.06, 0.32, 0.11, 0.295, 0.35, 0.17, 0, 0, 0, F),
          partAt(
            padGeo(roundedRect(0.075, 0.46, 0.032), 0.03, 0.012, 0.006),
            -0.295,
            0.545,
            0.02,
            -Math.PI / 2,
            0,
            0,
            F,
          ),
          partAt(
            padGeo(roundedRect(0.075, 0.46, 0.032), 0.03, 0.012, 0.006),
            0.295,
            0.545,
            0.02,
            -Math.PI / 2,
            0,
            0,
            F,
          ),
          cylAt(0.041, 0.035, 0.06, 14, -0.295, 0.545, -0.235, 0, 0, 0, C),
          cylAt(0.041, 0.035, 0.06, 14, 0.295, 0.545, -0.235, 0, 0, 0, C),
          cylAt(0.047, 0.047, 0.013, 14, -0.295, 0.578, -0.235, 0, 0, 0, M),
          cylAt(0.047, 0.047, 0.013, 14, 0.295, 0.578, -0.235, 0, 0, 0, M),
        ];
        return mergeParts(parts, true);
      }
function buildSeats(cfg) {
        const seats = [];
        const rnd = mulberry32(cfg.seed);
        const zScreen = cfg.firstRowZ - 6.5;
        const floorRows = cfg.rows.filter((r) => r.balc === undefined).length;
        cfg._fr = floorRows;
        const lastZ = cfg.firstRowZ + (floorRows - 1) * cfg.rowSpacing;
        const zBack = lastZ + 3.4;
        let fi = 0;
        const balcK = {};
        cfg.rows.forEach((row, ri) => {
          let tierY, zRow;
          if (row.balc !== undefined) {
            const b = cfg.balconyLevels[row.balc];
            const k = (balcK[row.balc] =
              (balcK[row.balc] === undefined ? -1 : balcK[row.balc]) + 1);
            tierY = b.y + 0.11 + k * 0.44;
            zRow = zBack - b.depth + 0.6 + k * 1.08;
          } else {
            tierY = fi * cfg.rise;
            zRow = cfg.firstRowZ + fi * cfg.rowSpacing;
            fi++;
          }
          const totalSeats = row.blocks.reduce((a, b) => a + b, 0);
          /* aisles align vertically across ALL rows: fixed global aisle centres at +-cfg._aisleX */
          if (cfg._aisleX === undefined) {
            const centers = cfg.rows
              .filter((r) => r.blocks.length === 3)
              .map((r) => r.blocks[1]);
            if (centers.length) {
              cfg._aisleX = (Math.max(...centers) * cfg.gapX) / 2 + 0.62;
            } else {
              /* no 3-block rows (single-block or 4-block halls): put the
                 reference aisle just outside the widest row so the side-aisle
                 stairs/LED strips land at the edges, never at +-Infinity */
              const widest = Math.max(
                ...cfg.rows.map((r) => r.blocks.reduce((a, b) => a + b, 0)),
              );
              cfg._aisleX = (widest * cfg.gapX) / 2 + 1.1;
            }
          }
          const aisle =
            row.blocks.length === 3
              ? Math.max(
                  1.15,
                  2 * (cfg._aisleX - (row.blocks[1] * cfg.gapX) / 2),
                )
              : 1.15;
          const width = totalSeats * cfg.gapX + (row.blocks.length - 1) * aisle;
          let x = -width / 2 + cfg.gapX / 2,
            num = 1;
          row.blocks.forEach((count, bi) => {
            for (let sc = 0; sc < count; sc++) {
              /* floor rows arc by cfg.curve, balcony rows by cfg.balconyCurve
                 (their curved slabs follow the same arc). The back-shift is
                 capped to a fraction of the pitch so every seat stays on its
                 tier — balconies get a touch more room for a deeper sweep. */
              const curve =
                row.balc !== undefined ? cfg.balconyCurve || 0 : cfg.curve;
              const pushCap =
                cfg.rowSpacing * (row.balc !== undefined ? 0.4 : 0.32);
              const zx = zRow + Math.min(curve * 0.01 * x * x, pushCap);
              const yaw = Math.atan2(x, zx - zScreen) * curve * 0.55;
              let cat = row.cat;
              if (ri === 0 && (num <= 2 || num > totalSeats - 2))
                cat = "accessible";
              const avail = rnd() > 0.16;
              const id = row.r + "-" + num;
              seats.push({
                id,
                row: row.r,
                num,
                ri,
                section: row.section,
                cat,
                price: row.price,
                pos: new THREE.Vector3(x, tierY, zx),
                yaw,
                avail: id === cfg.defaultSeat ? true : avail,
                blockIdx: bi,
              });
              x += cfg.gapX;
              num++;
            }
            x += aisle; // extra aisle gap between blocks
          });
        });
        /* widest seat on either side of centre — used to size the hall and to
           park the side-aisle stairs just beyond the outermost chairs */
        const seatMaxX = seats.reduce(
          (m, s) => Math.max(m, Math.abs(s.pos.x)),
          0,
        );
        cfg._seatMaxX = seatMaxX;
        /* single-block / 4-block halls have no true inner aisle to key off, so
           place the side-aisle stairs just outside the seats — never under a chair */
        if (!cfg.rows.some((r) => r.blocks.length === 3))
          cfg._aisleX = seatMaxX + 0.7;
        return { seats, zScreen };
      }
export {buildSeatGeometry,buildSeats};

