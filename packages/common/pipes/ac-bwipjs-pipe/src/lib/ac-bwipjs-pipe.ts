import { IAcPipe, acPipeRegistry } from '@autocode-ts/ac-pipes';
import bwipjs from 'bwip-js';

const PLACEHOLDER_SVG = `
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" fill="#f5f5f5"/>
  <rect x="10" y="10" width="100" height="100" fill="#e0e0e0" rx="8"/>
  <text x="60" y="60" font-family="sans-serif" font-size="14" fill="#999999" text-anchor="middle" dominant-baseline="middle">
    No QR Data
  </text>
</svg>`.trim();

const bwipjsPipe: IAcPipe = {
  name: 'bwipjs',
  pure: true,
  transform: async (
    value: any,
    options: Partial<{
      bcid?: string
      scale?: number;
      height?: number;
      width?: number;
      includetext?: boolean;
      textxalign?: 'left' | 'center' | 'right';
      textyoffset?: number;
      backgroundcolor?: string;
      paddingwidth?: number;
      paddingheight?: number;
      [key: string]: any;
    }> = {}
  ): Promise<string> => {
    const text = value == null || value === '' ? '' : String(value).trim();
    if (!text) {
      return PLACEHOLDER_SVG;
    }
    const bwipOptions: any = {
      bcid: 'qrcode',
      text,
      scale: 3,
      height: 5,
      width: 5,
      includetext: false,
      textxalign: 'center',
      paddingwidth: 0,
      paddingheight: 0,
      ...options, // User options override defaults
    };
    try {
      return await bwipjs.toSVG(bwipOptions);
    } catch (err) {
      console.error(`QR code generation failed for "${text}"`, err);
      return `
        <svg width="${bwipOptions.width}" height="${bwipOptions.height}" viewBox="0 0 150 ${bwipOptions.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${bwipOptions.width}" height="${bwipOptions.height}" fill="#ffeeee"/>
          <text x="75" y="40" font-family="sans-serif" font-size="12" fill="#990000" text-anchor="middle" dominant-baseline="middle">
            Error
          </text>
        </svg>`.trim();
    }
  },
};

export function acInitBwipjsPipe() {
  acPipeRegistry.register(bwipjsPipe);
}
