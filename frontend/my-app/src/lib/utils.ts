export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ")
    .trim();
}

