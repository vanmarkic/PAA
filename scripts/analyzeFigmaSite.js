const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function analyzeFigmaSite() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log('Navigating to Figma site...');
  await page.goto('https://cause-set-27282774.figma.site/', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Wait for content to load
  await page.waitForTimeout(5000);

  // Take homepage screenshot
  const screenshotsDir = path.join(__dirname, '..', 'figma-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  await page.screenshot({
    path: path.join(screenshotsDir, 'homepage.png'),
    fullPage: true
  });
  console.log('Screenshot saved: homepage.png');

  // Extract page structure
  const pageAnalysis = await page.evaluate(() => {
    const analysis = {
      title: document.title,
      url: window.location.href,
      navigation: [],
      headings: [],
      links: [],
      colors: [],
      fonts: [],
      sections: []
    };

    // Get navigation links
    const navLinks = document.querySelectorAll('nav a, header a, [role="navigation"] a');
    navLinks.forEach(link => {
      analysis.navigation.push({
        text: link.textContent.trim(),
        href: link.href
      });
    });

    // Get all links
    const allLinks = document.querySelectorAll('a[href]');
    const uniqueLinks = new Set();
    allLinks.forEach(link => {
      if (link.href && link.href.startsWith('http')) {
        uniqueLinks.add(link.href);
      }
    });
    analysis.links = Array.from(uniqueLinks);

    // Get headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(h => {
      analysis.headings.push({
        level: h.tagName,
        text: h.textContent.trim()
      });
    });

    // Get computed styles from body
    const bodyStyles = window.getComputedStyle(document.body);
    analysis.fonts.push(bodyStyles.fontFamily);

    // Extract colors from inline styles and computed styles
    const allElements = document.querySelectorAll('*');
    const colorSet = new Set();
    allElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colorSet.add(styles.backgroundColor);
      }
      if (styles.color) {
        colorSet.add(styles.color);
      }
    });
    analysis.colors = Array.from(colorSet).slice(0, 20); // Limit to top 20

    // Get main sections
    const sections = document.querySelectorAll('section, [class*="section"], main > div');
    sections.forEach((section, index) => {
      const heading = section.querySelector('h1, h2, h3');
      analysis.sections.push({
        index,
        heading: heading ? heading.textContent.trim() : `Section ${index + 1}`,
        textContent: section.textContent.trim().substring(0, 200) + '...'
      });
    });

    return analysis;
  });

  // Save analysis
  fs.writeFileSync(
    path.join(screenshotsDir, 'analysis.json'),
    JSON.stringify(pageAnalysis, null, 2)
  );
  console.log('Analysis saved: analysis.json');

  // Navigate to each unique internal page and screenshot
  const internalLinks = pageAnalysis.links.filter(link =>
    link.includes('cause-set-27282774.figma.site') &&
    link !== pageAnalysis.url
  );

  console.log(`Found ${internalLinks.length} internal pages to capture`);

  for (let i = 0; i < Math.min(internalLinks.length, 10); i++) {
    const link = internalLinks[i];
    try {
      console.log(`Navigating to: ${link}`);
      await page.goto(link, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      const pageName = link.split('/').pop() || `page-${i}`;
      const filename = `${pageName.replace(/[^a-z0-9]/gi, '-')}.png`;

      await page.screenshot({
        path: path.join(screenshotsDir, filename),
        fullPage: true
      });
      console.log(`Screenshot saved: ${filename}`);
    } catch (error) {
      console.error(`Error capturing ${link}:`, error.message);
    }
  }

  await browser.close();

  console.log('\n=== ANALYSIS COMPLETE ===');
  console.log(`Screenshots saved to: ${screenshotsDir}`);
  console.log('\nPage Analysis:');
  console.log(JSON.stringify(pageAnalysis, null, 2));
}

analyzeFigmaSite().catch(console.error);
