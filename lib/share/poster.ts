import { toPng } from 'html-to-image';

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1920;

async function waitForImageDecode(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(images.map(async (image) => {
    if (image.complete && image.naturalWidth > 0) {
      if (typeof image.decode === 'function') await image.decode().catch(() => undefined);
      return;
    }
    await new Promise<void>((resolve) => {
      const done = () => {
        image.removeEventListener('load', done);
        image.removeEventListener('error', done);
        resolve();
      };
      image.addEventListener('load', done, { once: true });
      image.addEventListener('error', done, { once: true });
    });
    if (image.naturalWidth > 0 && typeof image.decode === 'function') await image.decode().catch(() => undefined);
  }));
}

export async function posterToPng(node: HTMLElement): Promise<string> {
  const clone = node.cloneNode(true) as HTMLElement;
  clone.dataset.posterExportClone = 'true';
  clone.style.position = 'fixed';
  clone.style.left = '0px';
  clone.style.top = '0px';
  clone.style.zIndex = '2147483647';
  clone.style.visibility = 'visible';
  clone.style.opacity = '1';
  clone.style.pointerEvents = 'none';
  clone.style.transform = 'none';
  clone.style.width = `${POSTER_WIDTH}px`;
  clone.style.height = `${POSTER_HEIGHT}px`;
  clone.style.boxSizing = 'border-box';
  document.body.appendChild(clone);
  try {
    if (typeof document.fonts?.ready !== 'undefined') await document.fonts.ready;
    await waitForImageDecode(clone);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    return await toPng(clone, { width: POSTER_WIDTH, height: POSTER_HEIGHT, pixelRatio: 1, cacheBust: true, backgroundColor: '#f4efe5' });
  } finally {
    clone.remove();
  }
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.download = filename;
  anchor.href = dataUrl;
  anchor.click();
}
