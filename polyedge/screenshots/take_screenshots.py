#!/usr/bin/env python3
import asyncio
from pyppeteer import launch
import os
import sys

async def take_screenshot(html_file, output_file):
    print(f"Taking screenshot of {html_file}...")
    
    try:
        # Launch browser with no-sandbox flag
        browser = await launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        
        page = await browser.newPage()
        
        # Set viewport to 1080x1920
        await page.setViewport({'width': 1080, 'height': 1920})
        
        # Read HTML content
        with open(html_file, 'r') as f:
            html_content = f.read()
        
        # Set content
        await page.setContent(html_content, {'waitUntil': 'networkidle0'})
        
        # Take screenshot
        await page.screenshot({'path': output_file, 'fullPage': False})
        
        print(f"✅ Saved screenshot to {output_file}")
        
        await browser.close()
        return True
        
    except Exception as e:
        print(f"❌ Error taking screenshot of {html_file}: {e}")
        return False

async def main():
    screenshots = [
        ('feed.html', 'feed.png'),
        ('whales.html', 'whales.png'),
        ('market-detail.html', 'market-detail.png'),
        ('leaderboard.html', 'leaderboard.png'),
        ('pro.html', 'pro.png')
    ]
    
    print("Starting screenshot generation...")
    
    success_count = 0
    for html_file, output_file in screenshots:
        if os.path.exists(html_file):
            success = await take_screenshot(html_file, output_file)
            if success:
                success_count += 1
        else:
            print(f"❌ HTML file not found: {html_file}")
    
    print(f"\nScreenshot generation complete! {success_count}/{len(screenshots)} successful")
    
    # List created files
    print("\nCreated files:")
    for _, output_file in screenshots:
        if os.path.exists(output_file):
            size = os.path.getsize(output_file)
            print(f"  {output_file} - {size:,} bytes")

if __name__ == '__main__':
    # Check if pyppeteer is installed
    try:
        import pyppeteer
        asyncio.get_event_loop().run_until_complete(main())
    except ImportError:
        print("Pyppeteer not installed. Creating placeholder files...")
        
        for html_file, output_file in screenshots:
            if os.path.exists(html_file):
                # Create a text placeholder
                with open(output_file.replace('.png', '.txt'), 'w') as f:
                    f.write(f"Placeholder for {html_file}\n")
                    f.write(f"Dimensions: 1080x1920px\n")
                    f.write(f"Generated: {datetime.datetime.now().isoformat()}\n")
                print(f"Created placeholder: {output_file.replace('.png', '.txt')}")
        
        print("\nNote: Install pyppeteer for actual PNG screenshots:")
        print("pip install pyppeteer")