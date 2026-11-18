/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcPipeRegistry } from "../core/ac-pipe";

AcPipeRegistry.register({
  name: 'currency',
  pure: true,
  transform: (
    v: any,
    currency: string = 'INR',
    locale: string = 'en-IN'
  ) => {
    if (v == null) return '';
    const num = parseFloat(v);
    if (isNaN(num)) return v;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(num);
  }
});

AcPipeRegistry.register({
  name: 'decimal',
  transform: (value: any, digitsInfo?: string) => {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;

    const options: Intl.NumberFormatOptions = { style: 'decimal' };
    if (digitsInfo) {
      const parts = digitsInfo.split('.');
      if (parts[1]) {
        const subParts = parts[1].split('-');
        options.minimumFractionDigits = parseInt(subParts[0]);
        options.maximumFractionDigits = parseInt(subParts[1] || subParts[0]);
      }
    }
    return new Intl.NumberFormat('en-IN', options).format(num);
  }
});

AcPipeRegistry.register({
  name: 'number',
  pure: true,
  transform: (v: any, fractionDigits: any = 2, locale: string = 'en-IN') => {
    if (v == null) return '';
    const num = parseFloat(v);
    if (isNaN(num)) return v;
    const digits = typeof fractionDigits === 'number' && !isNaN(fractionDigits) ? fractionDigits : 2;
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(num);
  }
});

AcPipeRegistry.register({
  name: 'percent',
  pure: true,
  transform: (v: any, fractionDigits: any = 2, locale: string = 'en-IN') => {
    if (v == null) return '';
    const num = parseFloat(v);
    if (isNaN(num)) return v;
    const digits = typeof fractionDigits === 'number' && !isNaN(fractionDigits) ? fractionDigits : 2;
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(num / 100);
  }
});

AcPipeRegistry.register( {
  name: 'formatBytes',
  transform: (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        if (!bytes) return '';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});

AcPipeRegistry.register({
  name:'numberToWords',
  transform : (value: any, options: { system?: 'indian' | 'international', useAnd?: boolean } = {})=>{
        if (value == null || value === '') return '';
        const num = Number(value);
        if (isNaN(num)) return value;

        const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
        const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
        const scales = options.system === 'international' ? ["", "thousand", "million", "billion", "trillion"] : ["", "thousand", "lakh", "crore", "arab", "kharab"];

        if (num === 0) return "zero";

        const formatSegment = (n: number) => {
            let res = "";
            const h = Math.floor(n / 100);
            const t = n % 100;
            if (h > 0) res += ones[h] + " hundred ";
            if (t > 0) {
                if (h > 0 && options.useAnd) res += "and ";
                if (t < 20) res += ones[t];
                else {
                    res += tens[Math.floor(t / 10)];
                    if (t % 10 > 0) res += "-" + ones[t % 10];
                }
            }
            return res.trim();
        };

        const str = Math.abs(num).toString();
        const parts = str.split('.');
        let integerPart = parseInt(parts[0]);
        let result = "";

        if (options.system === 'international') {
            let scaleIdx = 0;
            while (integerPart > 0) {
                const chunk = integerPart % 1000;
                if (chunk > 0) {
                    result = formatSegment(chunk) + (scales[scaleIdx] ? " " + scales[scaleIdx] : "") + " " + result;
                }
                integerPart = Math.floor(integerPart / 1000);
                scaleIdx++;
            }
        } else {
            // Indian System
            let chunkIdx = 0;
            while (integerPart > 0) {
                const divisor = chunkIdx === 0 ? 1000 : 100;
                const chunk = integerPart % divisor;
                if (chunk > 0) {
                    result = formatSegment(chunk) + (scales[chunkIdx] ? " " + scales[chunkIdx] : "") + " " + result;
                }
                integerPart = Math.floor(integerPart / divisor);
                chunkIdx++;
            }
        }

        if (num < 0) result = "minus " + result;
        if (parts[1]) {
            result += " point " + parts[1].split('').map(d => ones[parseInt(d)]).join(' ');
        }

        return result.trim();
    }
});
