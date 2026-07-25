/** 网格像素化：主导色采样 + CIEDE2000 色板映射 + 保守合并 + 色号预算 */

import { ciede2000, hexToRgb, getLab, type RgbColor, type LabColor } from './colorDistance';

export interface CellData {
  key: string;    // MARD 色号键
  hex: string;    // 十六进制色值
  isExternal: boolean;
}

/** 获取网格单元格的平均色（避免 JPEG 噪点导致暗色占优） */
function cellAverageColor(
  data: ImageData, sx: number, sy: number, w: number, h: number
): RgbColor | null {
  const d = data.data, iw = data.width;
  let rSum = 0, gSum = 0, bSum = 0, n = 0;
  for (let y = sy; y < sy + h; y++) {
    for (let x = sx; x < sx + w; x++) {
      const i = (y * iw + x) * 4;
      if (d[i+3] < 128) continue;
      rSum += d[i]; gSum += d[i+1]; bSum += d[i+2];
      n++;
    }
  }
  if (n === 0) return null;
  return { r: Math.round(rSum / n), g: Math.round(gSum / n), b: Math.round(bSum / n) };
}

/** 找最接近的色板色 */
function closestPalette(rgb: RgbColor, palette: { key: string; hex: string }[]): { key: string; hex: string } {
  let best = palette[0], minD = Infinity;
  for (const p of palette) {
    const d = ciede2000(rgb, hexToRgb(p.hex));
    if (d < minD) { minD = d; best = p; }
  }
  return best;
}

export interface PixelateResult {
  grid: CellData[][];
  N: number;
  M: number;
}

/**
 * 主导色像素化 + 色板映射
 */
export function pixelate(
  img: HTMLImageElement,
  N: number,
  palette: { key: string; hex: string }[]
): PixelateResult {
  // 保持原始宽高比，计算 M
  const aspect = img.height / img.width;
  const M = Math.max(1, Math.round(N * aspect));

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const cw = Math.max(1, Math.floor(img.width / N));
  const ch = Math.max(1, Math.floor(img.height / M));

  const data = ctx.getImageData(0, 0, img.width, img.height);

  const grid: CellData[][] = [];

  // T01 白色作为空单元格回退
  const fallback = { key: 'T01', hex: '#FFFFFF' };

  for (let j = 0; j < M; j++) {
    const row: CellData[] = [];
    for (let i = 0; i < N; i++) {
      const rgb = cellAverageColor(data, i * cw, j * ch, cw, ch);
      if (rgb) {
        const matched = closestPalette(rgb, palette);
        row.push({ key: matched.key, hex: matched.hex, isExternal: false });
      } else {
        row.push({ key: fallback.key, hex: fallback.hex, isExternal: true });
      }
    }
    grid.push(row);
  }

  return { grid, N, M };
}

// ===================== 合并阶段 =====================

/**
 * 保守相似合并：只合并且在阈值内的近乎相同色
 * 返回合并后的 grid
 */
export function conservativeMerge(
  grid: CellData[][],
  threshold: number,  // CIEDE2000 × 2 阈值
  palette: { key: string; hex: string }[]
): CellData[][] {
  const colors = palette.reduce((m, p) => {
    m[p.key] = p.hex;
    return m;
  }, {} as Record<string, string>);

  const N = grid[0].length, M = grid.length;

  // 统计每种颜色用量
  const counts: Record<string, number> = {};
  for (const row of grid) for (const c of row) {
    if (!c.isExternal) counts[c.key] = (counts[c.key] || 0) + 1;
  }

  const keys = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  const replaced = new Set<string>();

  for (let i = 0; i < keys.length; i++) {
    const cur = keys[i];
    if (replaced.has(cur)) continue;
    const curRgb = hexToRgb(colors[cur]);
    if (!curRgb) continue;
    for (let j = i + 1; j < keys.length; j++) {
      const low = keys[j];
      if (replaced.has(low)) continue;
      const lowRgb = hexToRgb(colors[low]);
      if (!lowRgb) continue;
      if (ciede2000(curRgb, lowRgb) < threshold) {
        replaced.add(low);
        for (let r = 0; r < M; r++) for (let c = 0; c < N; c++) {
          if (grid[r][c].key === low && !grid[r][c].isExternal) {
            grid[r][c] = { key: cur, hex: colors[cur], isExternal: false };
          }
        }
      }
    }
  }

  return grid;
}

/**
 * 色号预算合并—K-means 在 LAB 空间聚类
 * 将 grid 中颜色归并到 ≤ maxColors 族色，每簇选"簇中心 LAB 距离最近"的色号为代表
 */
export function budgetMerge(
  grid: CellData[][],
  maxColors: number,
  palette: { key: string; hex: string }[]
): CellData[][] {
  if (maxColors <= 0) return grid;
  const N = grid[0].length, M = grid.length;

  // 1. 收集当前使用的颜色 → LAB 值
  const counts: Record<string, number> = {};
  for (const row of grid) for (const c of row) {
    if (!c.isExternal) counts[c.key] = (counts[c.key] || 0) + 1;
  }
  const usedKeys = Object.keys(counts);
  if (usedKeys.length <= maxColors) return grid;

  const keyLab = new Map<string, LabColor>();
  for (const k of usedKeys) {
    const hex = palette.find(p => p.key === k)?.hex;
    if (!hex) continue;
    keyLab.set(k, getLab(hexToRgb(hex)));
  }

  // 2. Farthest-First 初始化（确定性，结果可复现）
  const K = maxColors;
  const centroids: LabColor[] = [];
  const allPoints = usedKeys.filter(k => keyLab.has(k));
  if (allPoints.length === 0) return grid;

  // 第一个种子：使用频次最高的色
  let firstIdx = 0, firstCount = 0;
  for (let i = 0; i < allPoints.length; i++) {
    if (counts[allPoints[i]] > firstCount) {
      firstCount = counts[allPoints[i]];
      firstIdx = i;
    }
  }
  centroids.push(keyLab.get(allPoints[firstIdx])!);

  for (let t = 1; t < K && t < allPoints.length; t++) {
    let bestIdx = -1, bestDist = -1;
    for (let i = 0; i < allPoints.length; i++) {
      const p = keyLab.get(allPoints[i])!;
      let minD = Infinity;
      for (const c of centroids) {
        const d = (c.l - p.l)**2 + (c.a - p.a)**2 + (c.b - p.b)**2;
        if (d < minD) minD = d;
      }
      if (minD > bestDist) { bestDist = minD; bestIdx = i; }
    }
    if (bestIdx < 0) break;
    centroids.push(keyLab.get(allPoints[bestIdx])!);
  }

  // 3. 迭代分配 + 更新中心
  const points = allPoints.map(k => ({ key: k, lab: keyLab.get(k)! }));
  const assignments = new Map<string, number>();
  const maxIter = 30;

  for (let iter = 0; iter < maxIter; iter++) {
    for (const p of points) {
      let minD = Infinity, bestIdx = 0;
      for (let i = 0; i < centroids.length; i++) {
        const d = (centroids[i].l - p.lab.l)**2
                + (centroids[i].a - p.lab.a)**2
                + (centroids[i].b - p.lab.b)**2;
        if (d < minD) { minD = d; bestIdx = i; }
      }
      assignments.set(p.key, bestIdx);
    }
    let moved = 0;
    const newCentroids = centroids.map(() => ({ l: 0, a: 0, b: 0, n: 0 }));
    for (const p of points) {
      const ci = assignments.get(p.key)!;
      newCentroids[ci].l += p.lab.l;
      newCentroids[ci].a += p.lab.a;
      newCentroids[ci].b += p.lab.b;
      newCentroids[ci].n++;
    }
    for (let i = 0; i < centroids.length; i++) {
      if (newCentroids[i].n === 0) continue;
      const nl = newCentroids[i].l / newCentroids[i].n;
      const na = newCentroids[i].a / newCentroids[i].n;
      const nb = newCentroids[i].b / newCentroids[i].n;
      const shift = Math.sqrt(
        (centroids[i].l - nl)**2 +
        (centroids[i].a - na)**2 +
        (centroids[i].b - nb)**2
      );
      centroids[i] = { l: nl, a: na, b: nb };
      if (shift > 0.01) moved++;
    }
    if (moved === 0) break;
  }

  // 4. 每簇选代表色号：簇中心 LAB 距离最近的色号（保留色族鲜明度）
  const clusterRep = new Map<number, string>();
  for (let ci = 0; ci < centroids.length; ci++) {
    const c = centroids[ci];
    let bestKey = '', bestDist = Infinity;
    for (const [k, lab] of keyLab) {
      const d = (c.l - lab.l)**2 + (c.a - lab.a)**2 + (c.b - lab.b)**2;
      if (d < bestDist) { bestDist = d; bestKey = k; }
    }
    if (bestKey) clusterRep.set(ci, bestKey);
  }

  // 5. 替换格子
  for (let r = 0; r < M; r++) for (let c = 0; c < N; c++) {
    const cell = grid[r][c];
    if (cell.isExternal) continue;
    const ci = assignments.get(cell.key);
    if (ci === undefined) continue;
    const repKey = clusterRep.get(ci);
    if (!repKey || repKey === cell.key) continue;
    const repHex = palette.find(p => p.key === repKey)?.hex;
    if (!repHex) continue;
    grid[r][c] = { key: repKey, hex: repHex, isExternal: false };
  }

  return grid;
}
