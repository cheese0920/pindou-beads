/** 导出带色号标注的 PNG 图纸 + 采购清单 */
import type { CellData } from './pixelation';
import { getColorName } from '../data/mardPalette';

function cellSize(grid: CellData[][], maxW: number): number {
  const N = grid[0].length, M = grid.length;
  // 统一最小 cs=14，确保坐标轴/标签/分割线清晰可读；104+ 网格按比例放大 maxW
  const effectiveMax = N >= 100 ? Math.max(maxW, N * 16) : maxW;
  return Math.max(14, Math.min(Math.floor(effectiveMax / N), Math.floor(2400 / M)));
}

/** 统计色号用量 */
interface ColorEntry { key: string; hex: string; count: number; pct: number }

function countColors(grid: CellData[][]): ColorEntry[] {
  const counts: Record<string, { hex: string; count: number }> = {};
  for (const row of grid) for (const c of row) {
    if (!c.isExternal) {
      if (!counts[c.key]) counts[c.key] = { hex: c.hex, count: 0 };
      counts[c.key].count++;
    }
  }
  const total = Object.values(counts).reduce((s, c) => s + c.count, 0);
  return Object.entries(counts)
    .map(([key, { hex, count }]) => ({ key, hex, count, pct: count / total }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 导出图纸 PNG：顶部/左侧坐标轴 + 主图 + 红色加粗分割线 + 底部多行色号图例
 */
export function exportPattern(grid: CellData[][], gridLineInterval: number = 10): string {
  const N = grid[0].length, M = grid.length;
  const cs = cellSize(grid, 720);
  const showLabels = cs >= 12; // 格子 ≥12px 才显示色号，避免溢出

  // 坐标轴 padding
  const leftPad = Math.max(20, Math.floor(cs * 0.7));
  const topPad = Math.max(16, Math.floor(cs * 0.55));
  const rightPad = 6;

  const gridW = N * cs;
  const gridH = M * cs;

  // 图例区
  const entries = countColors(grid);
  // 按网格宽度决定每行图例数：每 ~10 格容纳一个色块
  const perRow = Math.max(4, Math.ceil(N / 10));
  const legendRows = Math.ceil(entries.length / perRow);
  const swatch = Math.max(14, Math.floor(cs * 0.55));
  const itemH = swatch + 10;
  const legendTopPad = 10;
  const legendH = legendRows * itemH + legendTopPad + 4;

  const canvas = document.createElement('canvas');
  canvas.width = gridW + leftPad + rightPad;
  canvas.height = topPad + gridH + legendH;
  const ctx = canvas.getContext('2d')!;

  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 顶部坐标轴
  ctx.fillStyle = '#64748b';
  ctx.font = `${Math.max(8, cs * 0.28)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < N; i++) {
    ctx.fillText(String(i + 1), leftPad + i * cs + cs / 2, topPad / 2);
  }

  // 左侧坐标轴
  for (let j = 0; j < M; j++) {
    ctx.fillText(String(j + 1), leftPad / 2, topPad + j * cs + cs / 2);
  }

  // 主图
  for (let j = 0; j < M; j++) {
    for (let i = 0; i < N; i++) {
      const cell = grid[j][i];
      if (cell.isExternal) continue;
      ctx.fillStyle = cell.hex;
      ctx.fillRect(leftPad + i * cs, topPad + j * cs, cs, cs);

      if (showLabels) {
        ctx.fillStyle = '#222222'; // 统一黑色，打印更清晰
        // 字号自适应：约 cs 的 42%，且永远留 2px 内边距防止溢出（紧凑适配 3 字符色号如 H04、ZG6）
        const fontSize = Math.min(Math.max(6, Math.floor(cs * 0.5)), cs - 2);
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell.key, leftPad + i * cs + cs / 2, topPad + j * cs + cs / 2);
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(leftPad + i * cs, topPad + j * cs, cs, cs);
    }
  }

  // 主图外边框
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(leftPad, topPad, gridW, gridH);

  // 每 10 格红色加粗分割线
  if (gridLineInterval > 0) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    for (let i = gridLineInterval; i < N; i += gridLineInterval) {
      ctx.beginPath();
      ctx.moveTo(leftPad + i * cs, topPad);
      ctx.lineTo(leftPad + i * cs, topPad + gridH);
      ctx.stroke();
    }
    for (let j = gridLineInterval; j < M; j += gridLineInterval) {
      ctx.beginPath();
      ctx.moveTo(leftPad, topPad + j * cs);
      ctx.lineTo(leftPad + gridW, topPad + j * cs);
      ctx.stroke();
    }
  }

  // ===== 底部多行色号图例 =====
  const itemW = gridW / perRow;
  ctx.textBaseline = 'middle';

  entries.forEach((entry, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const x = leftPad + col * itemW + 4;
    const y = topPad + gridH + legendTopPad + row * itemH;

    // 色块
    ctx.fillStyle = entry.hex;
    ctx.fillRect(x, y, swatch, swatch);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, swatch, swatch);

    // 色号 + 数量
    const name = entry.key;
    const cnt = `(${entry.count})`;
    const fontSize = Math.max(11, Math.floor(cs * 0.4));
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(name, x + swatch + 5, y + swatch / 2);
    const nameW = ctx.measureText(name).width;
    ctx.font = `${fontSize}px system-ui, sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText(cnt, x + swatch + 5 + nameW + 4, y + swatch / 2);
  });

  return canvas.toDataURL('image/png');
}

/** 导出采购清单（暗色背景风格） */
export function exportShoppingList(grid: CellData[][]): string {
  const entries = countColors(grid);

  const swatch = 32, gap = 6, pad = 20, rowH = swatch + gap + 2;
  const w = 320, h = pad * 2 + entries.length * rowH + 40;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = Math.max(h, 200);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('采购清单', w / 2, pad + 14);

  ctx.font = '14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  entries.forEach(({ key, hex, count }, i) => {
    const y = pad + 40 + i * rowH;
    ctx.fillStyle = hex;
    ctx.fillRect(pad, y, swatch, swatch);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, y, swatch, swatch);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(getColorName(key), pad + swatch + 10, y + swatch / 2 + 5);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'right';
    ctx.fillText(`${count} 颗`, w - pad, y + swatch / 2 + 5);
    ctx.textAlign = 'left';
  });

  const total = entries.reduce((s, e) => s + e.count, 0);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`合计: ${total} 颗 | ${entries.length} 色`, w / 2, canvas.height - pad + 4);

  return canvas.toDataURL('image/png');
}