import puppeteer from 'puppeteer';

(async () => {
  console.log("Starting puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 }); // Mobile viewport
  
  console.log("Navigating to http://localhost:3000...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Find hamburger menu
  console.log("Looking for hamburger button...");
  const hamburger = await page.$('button[aria-label="Open mobile menu"]');
  if (hamburger) {
    const box = await hamburger.boundingBox();
    console.log("Hamburger bounding box:", box);
    
    // Check if another element covers it
    const center_x = box.x + box.width / 2;
    const center_y = box.y + box.height / 2;
    
    const overlappingElement = await page.evaluate((x, y) => {
      const el = document.elementFromPoint(x, y);
      if (el) {
        return {
          tagName: el.tagName,
          className: el.className,
          id: el.id
        };
      }
      return null;
    }, center_x, center_y);
    
    console.log("Element at hamburger center:", overlappingElement);
    
    console.log("Clicking hamburger...");
    await hamburger.click();
    console.log("Clicked.");
    
    // Check if mobile menu is open
    await new Promise(r => setTimeout(r, 1000));
    const mobileMenu = await page.$('button[aria-label="Close mobile menu"]');
    console.log("Close mobile menu button found:", !!mobileMenu);
    
  } else {
    console.log("Hamburger not found!");
  }
  
  await browser.close();
})();
