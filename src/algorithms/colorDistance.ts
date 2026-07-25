/** CIEDE2000 ΔE00 感知色差（CIE 国际标准） */

export interface RgbColor { r: number; g: number; b: number }
export interface LabColor { l: number; a: number; b: number }

export function hexToRgb(hex: string): RgbColor {
  const c = parseInt(hex.slice(1), 16);
  return { r: (c>>16)&255, g: (c>>8)&255, b: c&255 };
}

// ===== RGB → XYZ → Lab =====
function srgbLin(v: number): number {
  const n = v / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function rgbToXyz(r: RgbColor) {
  const rl = srgbLin(r.r), gl = srgbLin(r.g), bl = srgbLin(r.b);
  return {
    x: 0.4124564*rl + 0.3575761*gl + 0.1804375*bl,
    y: 0.2126729*rl + 0.7151522*gl + 0.0721750*bl,
    z: 0.0193339*rl + 0.1191920*gl + 0.9503041*bl,
  };
}

function xyzToLab(xyz: { x: number; y: number; z: number }) {
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : (903.3*t + 16) / 116;
  const fx = f(xyz.x / 0.95047), fy = f(xyz.y / 1.0), fz = f(xyz.z / 1.08883);
  return { l: 116*fy - 16, a: 500*(fx - fy), b: 200*(fy - fz) };
}

function rgbToLab(r: RgbColor) {
  return xyzToLab(rgbToXyz(r));
}

const labCache = new Map<string, LabColor>();

export function getLab(r: RgbColor): LabColor {
  const k = `${r.r},${r.g},${r.b}`;
  if (labCache.has(k)) return labCache.get(k)!;
  const lab = rgbToLab(r);
  labCache.set(k, lab);
  return lab;
}

/**
 * CIEDE2000 ΔE00 × 2（兼容 0–100 阈值滑块）
 * 典型范围：<2 看不出差别、2-5 轻微差异、5-10 明显不同、>10 完全不同
 */
export function ciede2000(r1: RgbColor, r2: RgbColor): number {
  const L1 = getLab(r1), L2 = getLab(r2);
  const deg = (r: number) => r * (180 / Math.PI);
  const rad = (d: number) => d * (Math.PI / 180);

  const [l1, a1, b1] = [L1.l, L1.a, L1.b];
  const [l2, a2, b2] = [L2.l, L2.a, L2.b];

  const C1 = Math.sqrt(a1*a1 + b1*b1);
  const C2 = Math.sqrt(a2*a2 + b2*b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
  const a1p = (1+G)*a1, a2p = (1+G)*a2;
  const C1p = Math.sqrt(a1p*a1p + b1*b1);
  const C2p = Math.sqrt(a2p*a2p + b2*b2);

  const h1 = deg(Math.atan2(b1, a1p)), h2 = deg(Math.atan2(b2, a2p));
  const h1n = h1 < 0 ? h1 + 360 : h1;
  const h2n = h2 < 0 ? h2 + 360 : h2;

  const dLp = l2 - l1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p*C2p === 0) dhp = 0;
  else if (Math.abs(h2n - h1n) <= 180) dhp = h2n - h1n;
  else if (h2n - h1n > 180) dhp = h2n - h1n - 360;
  else dhp = h2n - h1n + 360;

  const dHp = 2 * Math.sqrt(C1p*C2p) * Math.sin(rad(dhp/2));

  const Lp = (l1 + l2) / 2;
  const Cp = (C1p + C2p) / 2;

  let hp: number;
  if (C1p*C2p === 0) hp = h1n + h2n;
  else if (Math.abs(h1n - h2n) <= 180) hp = (h1n + h2n) / 2;
  else if (h1n + h2n < 360) hp = (h1n + h2n + 360) / 2;
  else hp = (h1n + h2n - 360) / 2;

  const T = 1 - 0.17*Math.cos(rad(hp-30)) + 0.24*Math.cos(rad(2*hp))
          + 0.32*Math.cos(rad(3*hp+6)) - 0.20*Math.cos(rad(4*hp-63));
  const dT = 30 * Math.exp(-Math.pow((hp-275)/25, 2));
  const Rc = 2 * Math.sqrt(Math.pow(Cp,7) / (Math.pow(Cp,7) + Math.pow(25,7)));
  const SL = 1 + 0.015*(Lp-50)*(Lp-50) / Math.sqrt(20 + (Lp-50)*(Lp-50));
  const SC = 1 + 0.045*Cp;
  const SH = 1 + 0.015*Cp*T;
  const Rt = -Math.sin(rad(2*dT)) * Rc;

  const el = dLp / SL, ec = dCp / SC, eh = dHp / SH;
  return Math.sqrt(el*el + ec*ec + eh*eh + Rt*ec*eh) * 2;
}
