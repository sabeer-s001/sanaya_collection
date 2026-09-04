/**
 * Cross-platform clean script for Next.js build output.
 * Removes build output (.next) and legacy build directory (.next-build)
 * before a fresh build to prevent webpack artifact conflicts.
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
