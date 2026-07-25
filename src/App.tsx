import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { pixelate, conservativeMerge, budgetMerge, type CellData } from './algorithms/pixelation';
import { exportPattern, exportShoppingList } from './algorithms/exportImage';
import { getPaletteColors, PALETTE_OPTIONS, getColorName, type PaletteSizeKey } from './data/mardPalette';
import { trimWhiteBorder } from './utils/imageTrim';

type Page = 'gallery' | 'upload' | 'params' | 'result';
type GridSpec = 52 | 104;

const BEAD_COLORS = ['#F87171','#60A5FA','#FBBF24','#4ADE80','#A78BFA','#F472B6','#FB923C','#2DD4BF',
  '#818CF8','#22D3EE','#A3E635','#F59E0B','#FB7185','#38BDF8','#34D399','#C084FC'];

// 示例作品集（社区真实图纸）
const EXAMPLES = [
  { src: '/assets/gallery-1.jpg', title: '黄毛小精灵', grid: '52×83', colors: 15 },
  { src: '/assets/gallery-2.jpg', title: '蓝外套少年', grid: '52×83', colors: 20 },
  { src: '/assets/gallery-3.jpg', title: '粉灰小猫', grid: '52×83', colors: 12 },
  { src: '/assets/gallery-4.jpg', title: '双人姐妹', grid: '52×83', colors: 8 },
  { src: '/assets/gallery-5.jpg', title: '绿鹦鹉', grid: '52×83', colors: 10 },
  { src: '/assets/gallery-6.jpg', title: '黑白企鹅', grid: '52×83', colors: 6 },
];

export default function App() {
  const [page, setPage] = useState<Page>('gallery');
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [gridSpec, setGridSpec] = useState<GridSpec>(52);
  const [paletteSize, setPaletteSize] = useState<PaletteSizeKey>('all');
  const [colorBudget, setColorBudget] = useState(64);
  const [grid, setGrid] = useState<CellData[][] | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const fileRef = useRef<HTMLInputElement>(null);
  const [trimmedImages, setTrimmedImages] = useState<Record<string, string>>({});

  const palette = useMemo(() => getPaletteColors(paletteSize), [paletteSize]);

  // 作品集图片自动去白边
  useEffect(() => {
    EXAMPLES.forEach(ex => {
      if (trimmedImages[ex.src]) return;
      trimWhiteBorder(ex.src).then(trimmed => {
        if (trimmed !== ex.src) {
          setTrimmedImages(prev => ({ ...prev, [ex.src]: trimmed }));
        }
      }).catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    setGrid(null); setStatus('idle'); setExcluded(new Set());
    setPage('params');
  }, []);

  useEffect(() => {
    if (!imgSrc || palette.length === 0) return;
    setStatus('processing');
    const img = new Image();
    img.onload = () => {
      try {
        let result = pixelate(img, gridSpec, palette);
        result.grid = conservativeMerge(result.grid, 8, palette);
        result.grid = budgetMerge(result.grid, colorBudget, palette);
        setGrid(result.grid);
        setStatus('done');
        setPage('result');
      } catch (e) { console.error(e); setStatus('idle'); }
    };
    img.onerror = () => setStatus('idle');
    img.src = imgSrc;
    return () => { img.onload = null; };
  }, [imgSrc, gridSpec, paletteSize, colorBudget, palette]);

  const toggleExclude = useCallback((key: string) => {
    setExcluded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const previewCache = useMemo(() => {
    if (!grid) return null;
    const displayGrid = grid.map(row =>
      row.map(c => c.isExternal ? c : (excluded.has(c.key) ? { ...c, hex: '#ddd' } : c))
    );
    return { pattern: exportPattern(displayGrid), shopping: exportShoppingList(grid) };
  }, [grid, excluded]);

  const handleGridSpecChange = (spec: GridSpec) => { setGridSpec(spec); setColorBudget(64); };

  const handleDownload = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl; a.download = filename; a.click();
  };

  const colorStats = useMemo(() => {
    if (!grid) return [];
    const counts: Record<string, { hex: string; count: number }> = {};
    for (const row of grid) for (const c of row) {
      if (!c.isExternal) {
        if (!counts[c.key]) counts[c.key] = { hex: c.hex, count: 0 };
        counts[c.key].count++;
      }
    }
    const total = Object.values(counts).reduce((s, c) => s + c.count, 0);
    return Object.entries(counts)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([key, { hex, count }]) => ({ key, hex, count, pct: count / total * 100, excluded: excluded.has(key) }));
  }, [grid, excluded]);

  const totalBeads = colorStats.reduce((s, c) => s + c.count, 0);
  const activeColors = colorStats.filter(c => !c.excluded).length;

  const distGrid = useMemo(() => {
    if (!grid || grid.length === 0 || grid[0].length === 0) return null;
    const h = 6, w = 8;
    const m = grid.length, n = grid[0].length;
    const rows: { key: string; hex: string }[][] = [];
    for (let j = 0; j < h; j++) {
      const row: { key: string; hex: string }[] = [];
      for (let i = 0; i < w; i++) {
        const y = Math.min(m - 1, Math.round((j / h) * m));
        const x = Math.min(n - 1, Math.round((i / w) * n));
        const cell = grid[y][x];
        row.push({ key: cell.key, hex: cell.isExternal ? '#ddd' : cell.hex });
      }
      rows.push(row);
    }
    return rows;
  }, [grid]);

  const goToUpload = () => setPage('upload');
  const goToGallery = () => { setPage('gallery'); setImgSrc(null); setGrid(null); setStatus('idle'); };
  const goToParams = () => setPage('params');
  const regenerate = () => { setStatus('idle'); setGrid(null); };

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative">
      <div className="fixed w-96 h-96 rounded-full bg-purple-200/40 blur-[100px] top-[-60px] right-[-60px] pointer-events-none z-0" />
      <div className="fixed w-80 h-80 rounded-full bg-blue-200/40 blur-[80px] bottom-[-60px] left-[-40px] pointer-events-none z-0" />
      <div className="fixed w-64 h-64 rounded-full bg-pink-200/30 blur-[70px] top-[40%] left-[-30px] pointer-events-none z-0" />

      {/* 品牌区 */}
      <header className="relative z-10 w-full max-w-md flex flex-col items-center pt-10 pb-4 px-4">
        <div className="soft-card p-4 mb-4 animate-float" style={{ borderRadius: 24 }}>
          <div className="grid grid-cols-4 gap-2">
            {BEAD_COLORS.map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full"
                style={{ backgroundColor: c, boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)' }} />
            ))}
          </div>
        </div>
        <h1 className="soft-title text-3xl text-center leading-tight">
          拼豆图纸生成器
        </h1>
        <p className="mt-2 text-sm text-slate-500 text-center font-medium">
          照片一键变图纸 · 色号更少更好拼
        </p>
      </header>

      {/* 页面导航 */}
      {page !== 'gallery' && (
        <nav className="relative z-10 w-full max-w-md px-4 mb-3">
          <div className="flex items-center gap-2">
            {page !== 'upload' && (
              <button onClick={goToGallery}
                className="soft-chip px-3 py-1.5 text-xs">
                ← 作品集
              </button>
            )}
            {page === 'params' && (
              <button onClick={goToUpload}
                className="soft-chip px-3 py-1.5 text-xs">
                ← 重新上传
              </button>
            )}
            {page === 'result' && (
              <button onClick={goToParams}
                className="soft-chip px-3 py-1.5 text-xs">
                ← 调整参数
              </button>
            )}
          </div>
        </nav>
      )}

      <main className="relative z-10 w-full max-w-md flex flex-col items-center px-4 space-y-5 pb-8">

        {/* ========== 作品集页面 ========== */}
        {page === 'gallery' && (
          <>
            <div className="w-full">
              <h2 className="text-lg font-bold text-slate-700 mb-3">作品集</h2>
              <p className="text-sm text-slate-400 mb-4">看看别人用拼豆图纸做了什么</p>
              <div className="grid grid-cols-2 gap-3">
                {EXAMPLES.map((ex, i) => (
                  <div key={i} className="soft-card overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={goToUpload}>
                    <div className="aspect-square overflow-hidden">
                      <img src={trimmedImages[ex.src] || ex.src} alt={ex.title}
                        className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex-shrink-0">
                      <p className="text-sm font-bold text-slate-700">{ex.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{ex.grid} · {ex.colors} 色</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={goToUpload}
              className="soft-btn-primary w-full py-4 text-base flex items-center justify-center gap-2.5 mt-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              开始创作
            </button>
          </>
        )}

        {/* ========== 上传页面 ========== */}
        {page === 'upload' && (
          <>
            <div onClick={() => fileRef.current?.click()}
              className="soft-upload w-full p-12 text-center cursor-pointer">
              <svg className="h-14 w-14 text-purple-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-bold text-slate-700">
                拖放图片到此处，或<span className="text-purple-500 underline underline-offset-2">点击选择文件</span>
              </p>
              <p className="text-sm text-slate-400 mt-3">支持 JPG, PNG, GIF 图片格式</p>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </>
        )}

        {/* ========== 参数页面 ========== */}
        {page === 'params' && imgSrc && (
          <>
            {/* 原图预览 */}
            <div className="soft-card w-full p-3">
              <div className="rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center" style={{ maxHeight: 240 }}>
                <img src={imgSrc} alt="原图" className="max-h-60 w-auto object-contain" />
              </div>
            </div>

            <div className="soft-card w-full p-5 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">网格规格</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {([52, 104] as const).map(s => (
                    <button key={s} onClick={() => handleGridSpecChange(s)}
                      className={`soft-chip py-3 text-sm ${gridSpec === s ? 'soft-chip-active' : ''}`}>
                      {s} 格
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-sm font-bold text-slate-700">色号预算</label>
                  <span className="text-sm font-bold text-purple-600 bg-purple-50 rounded-full px-3 py-1">{colorBudget} 色</span>
                </div>
                <input type="range" min={24} max={96} step={4} value={colorBudget}
                  onChange={e => setColorBudget(parseInt(e.target.value))} className="soft-range w-full" />
                <p className="mt-2 text-xs text-slate-400">预算越大，保留颜色越丰富</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">色板规格（MARD）</label>
                <div className="flex flex-wrap gap-2">
                  {PALETTE_OPTIONS.map(opt => (
                    <button key={opt.key} onClick={() => setPaletteSize(opt.key)}
                      className={`soft-chip px-4 py-2.5 text-sm ${paletteSize === opt.key ? 'soft-chip-active' : ''}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={regenerate}
              className="soft-btn-primary w-full py-4 text-base flex items-center justify-center gap-2.5">
              生成图纸
            </button>
          </>
        )}

        {/* 处理中 */}
        {status === 'processing' && page === 'params' && (
          <div className="soft-card w-full p-8 text-center">
            <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">正在生成图纸...</p>
          </div>
        )}

        {/* ========== 结果页面 ========== */}
        {page === 'result' && previewCache && (
          <>
            <div className="soft-preview w-full">
              <img src={previewCache.pattern} alt="图纸预览" className="w-full h-auto block" />
            </div>

            {distGrid && (
              <div className="soft-card w-full p-4">
                <label className="block text-sm font-bold text-slate-700 mb-2.5">色号分布</label>
                <div className="flex flex-col gap-1">
                  {distGrid.map((row, j) => (
                    <div key={j} className="flex gap-1">
                      {row.map((cell, i) => (
                        <div key={i} className="flex-1 aspect-square rounded-lg"
                          style={{ backgroundColor: cell.hex, minWidth: 16 }} title={cell.key} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="soft-card w-full p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-slate-700">📋 色号图表说明</h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                  {totalBeads} 颗 / {activeColors} 色
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">点击颜色可排除，排除后自动重算</p>

              {/* 表头 */}
              <div className="flex items-center gap-2 px-2 py-1 mb-1">
                <span className="w-5 flex-shrink-0" />
                <span className="flex-1 text-xs font-medium text-slate-400">色号</span>
                <span className="w-20 text-xs font-medium text-slate-400 text-right">占比</span>
                <span className="w-14 text-xs font-medium text-slate-400 text-right">颗数</span>
              </div>

              <ul className="space-y-1 max-h-60 overflow-y-auto pr-1 soft-scroll">
                {colorStats.map(({ key, hex, count, pct, excluded: ex }) => (
                  <li key={key} onClick={() => toggleExclude(key)}
                    className={`soft-stat-item flex items-center p-2.5 cursor-pointer rounded-xl ${ex ? 'excluded' : ''}`}>
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* 色块 */}
                      <span className="inline-block w-5 h-5 rounded-lg flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: ex ? '#ccc' : hex }} />
                      {/* 色号名称 + 进度条 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold text-sm truncate ${ex ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {getColorName(key)}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${ex ? 0 : pct}%`,
                              backgroundColor: ex ? '#ccc' : hex,
                            }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className={`text-xs font-medium w-12 text-right ${ex ? 'text-slate-300' : 'text-slate-400'}`}>
                        {pct.toFixed(1)}%
                      </span>
                      <span className={`text-sm font-bold w-14 text-right ${ex ? 'text-slate-300 line-through' : 'text-slate-600'}`}>
                        {count} 颗
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {excluded.size > 0 && (
                <button onClick={() => setExcluded(new Set())}
                  className="soft-btn-secondary text-xs mt-3 w-full py-2.5">
                  一键恢复所有颜色 ({excluded.size})
                </button>
              )}
            </div>

            <div className="w-full space-y-3">
              <button onClick={() => handleDownload(previewCache.pattern, '拼豆图纸.png')}
                className="soft-btn-primary w-full py-4 text-base flex items-center justify-center gap-2.5">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载拼豆图纸
              </button>
              <button onClick={() => handleDownload(previewCache.shopping, '采购清单.png')}
                className="soft-btn-secondary w-full py-3.5 text-sm flex items-center justify-center gap-2">
                下载采购清单
              </button>
              <button onClick={goToGallery}
                className="soft-btn-secondary w-full py-3 text-sm">
                回到作品集
              </button>
            </div>
          </>
        )}

      </main>

      <footer className="relative z-10 w-full max-w-md mx-4 mt-auto mb-4">
        <div className="soft-footer py-3 px-4 text-center">
          <p className="text-xs text-slate-400 font-medium">拼豆图纸生成器 &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
