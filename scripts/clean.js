/**
 * Cross-platform clean script for Next.js build output.
 * Removes both the dev cache (.next) and production build (.next-build)
 * before a fresh production build to prevent webpack artifact conflicts.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dirs = [".next", ".next-build"];

for (const dir of dirs) {
  const target = path.join(root, dir);
  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`✓ Removed ${dir}`);
  } catch (e) {
    // Directory may not exist — that's fine
  }
}
