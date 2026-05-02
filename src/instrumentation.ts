import fs from "fs";
import path from "path";

export async function register() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const src = path.resolve(process.cwd(), "dev.db");
    const dest = "/tmp/dev.db";
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    }
  }
}
