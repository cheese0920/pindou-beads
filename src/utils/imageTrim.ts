/** 自动裁剪图片四周的白色边缘（用于作品集展示） */

/**
 * 把图片四周的纯白边裁掉，返回处理后的 data URL
 * 检测算法：从四边向内扫描，找第一个非白色像素作为边界
 * - 阈值：RGB 任一通道 < 245 即视为非白色（保留淡灰网格）
 */
export async function trimWhiteBorder(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.width, h = img.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, w, h).data;

      const isWhite = (r: number, g: number, b: number) =>
        r >= 245 && g >= 245 && b >= 245;

      // 上边
      let top = 0;
      outer1: for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (!isWhite(data[i], data[i + 1], data[i + 2])) {
            top = y; break outer1;
          }
        }
      }
      // 下边
      let bottom = h - 1;
      outer2: for (let y = h - 1; y >= 0; y--) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (!isWhite(data[i], data[i + 1], data[i + 2])) {
            bottom = y; break outer2;
          }
        }
      }
      // 左边
      let left = 0;
      outer3: for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          const i = (y * w + x) * 4;
          if (!isWhite(data[i], data[i + 1], data[i + 2])) {
            left = x; break outer3;
          }
        }
      }
      // 右边
      let right = w - 1;
      outer4: for (let x = w - 1; x >= 0; x--) {
        for (let y = 0; y < h; y++) {
          const i = (y * w + x) * 4;
          if (!isWhite(data[i], data[i + 1], data[i + 2])) {
            right = x; break outer4;
          }
        }
      }

      const newW = right - left + 1;
      const newH = bottom - top + 1;
      if (newW === w && newH === h) {
        resolve(src); // 无白边，原样返回
        return;
      }
      const out = document.createElement('canvas');
      out.width = newW;
      out.height = newH;
      out.getContext('2d')!.putImageData(
        ctx.getImageData(left, top, newW, newH),
        0, 0
      );
      resolve(out.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = reject;
    img.src = src;
  });
}