import { createHash } from "crypto";

export function getGravatarUrl(email: string, size = 80): string {
  const hash = createHash("md5").update(email.toLowerCase().trim()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=404&s=${size}`;
}
