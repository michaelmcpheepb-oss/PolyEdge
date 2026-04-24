const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function takeScreenshot(htmlFile, outputFile) {
    console.log(`Taking screenshot of ${htmlFile}...`);
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport to 1080x1920 (phone size)
        await page.setViewport({
            width: 1080,
            height: 1920,
            deviceScaleFactor: 2 // Retina display
        });
        
        // Load the HTML file
        const htmlContent = fs.readFileSync(htmlFile, 'utf8');
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Take screenshot
        await page.screenshot({
            path: outputFile,
            type: 'png',
            fullPage: false
        });
        
        console.log(`✅ Saved screenshot to ${outputFile}`);
    } catch (error) {
        console.error(`❌ Error taking screenshot of ${htmlFile}:`, error.message);
    } finally {
        await browser.close();
    }
}

async function main() {
    const screenshots = [
        { html: 'feed.html', output: 'feed.png' },
        { html: 'whales.html', output: 'whales.png' },
        { html: 'market-detail.html', output: 'market-detail.png' },
        { html: 'leaderboard.html', output: 'leaderboard.png' },
        { html: 'pro.html', output: 'pro.png' }
    ];
    
    console.log('Starting screenshot generation...');
    
    for (const screenshot of screenshots) {
        const htmlPath = path.join(__dirname, screenshot.html);
        const outputPath = path.join(__dirname, screenshot.output);
        
        if (fs.existsSync(htmlPath)) {
            await takeScreenshot(htmlPath, outputPath);
        } else {
            console.log(`❌ HTML file not found: ${htmlPath}`);
        }
    }
    
    console.log('Screenshot generation complete!');
}

// Check if puppeteer is available
try {
    require.resolve('puppeteer');
    main().catch(console.error);
} catch (error) {
    console.log('Puppeteer not available. Creating placeholder screenshots...');
    
    // Create placeholder text files instead
    const screenshots = ['feed', 'whales', 'market-detail', 'leaderboard', 'pro'];
    screenshots.forEach(name => {
        const placeholder = `Placeholder for ${name} screenshot\nDimensions: 1080x1920px\nGenerated: ${new Date().toISOString()}`;
        fs.writeFileSync(path.join(__dirname, `${name}.txt`), placeholder);
        console.log(`Created placeholder: ${name}.txt`);
    });
    
    console.log('Note: Install puppeteer for actual PNG screenshots: npm install puppeteer');
}