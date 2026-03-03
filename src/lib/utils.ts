import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatNumber(
  value: number | string,
  options?: {
    decimals?: number;
    compact?: boolean;
  }
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  if (options?.compact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: options.decimals ?? 1,
    }).format(num);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: options?.decimals ?? 2,
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function formatVTON(
  value: bigint | string | number,
  options?: {
    decimals?: number;
    compact?: boolean;
  }
): string {
  const bigValue = typeof value === "bigint" ? value : BigInt(value || 0);
  const decimals = 18;
  const divisor = BigInt(10 ** decimals);
  const integerPart = bigValue / divisor;
  const fractionalPart = bigValue % divisor;
  const numValue =
    Number(integerPart) + Number(fractionalPart) / Number(divisor);

  return formatNumber(numValue, {
    decimals: options?.decimals ?? 2,
    compact: options?.compact,
  });
}

export function formatBasisPoints(value: bigint | number): string {
  const num = typeof value === "bigint" ? Number(value) : value;
  return `${num / 100}%`;
}

export function formatPercentage18(value: bigint | number): string {
  const bigValue = typeof value === "bigint" ? value : BigInt(value || 0);
  const divisor = BigInt(10 ** 16);
  const percentage = Number(bigValue) / Number(divisor);
  return `${formatNumber(percentage, { decimals: 2 })}%`;
}

export function formatDuration(seconds: bigint | number): string {
  const secs = typeof seconds === "bigint" ? Number(seconds) : seconds;
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  const days = Math.floor(secs / 86400);
  return days === 1 ? "1 day" : `${days} days`;
}

export function truncateMiddle(
  str: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (str.length <= startChars + endChars) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}
