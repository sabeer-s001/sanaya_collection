import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const reelsDir = path.join(process.cwd(), "public", "reels");
    if (!fs.existsSync(reelsDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(reelsDir);
    // Find all .mp4 video files
    const videoFiles = files.filter(file => file.toLowerCase().endsWith(".mp4"));
    
    // Map to Reel objects
    const reels = videoFiles.map((file) => {
      const jpgName = file.replace(/\.(mp4|MP4)$/i, ".jpg");
      const hasJpg = fs.existsSync(path.join(reelsDir, jpgName));
      return {
        video: `/reels/${file}`,
        thumbnail: hasJpg ? `/reels/${jpgName}` : "",
        url: "https://www.instagram.com/sanaya_collection786",
      };
    });

    return NextResponse.json(reels);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
