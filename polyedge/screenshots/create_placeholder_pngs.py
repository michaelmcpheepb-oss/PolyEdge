#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder(name, width=1080, height=1920):
    # Create a new image with dark background
    img = Image.new('RGB', (width, height), color='#0D0D1A')
    draw = ImageDraw.Draw(img)
    
    # Add accent color border
    draw.rectangle([0, 0, width-1, height-1], outline='#00D4AA', width=10)
    
    # Add title
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
    except:
        font = ImageFont.load_default()
    
    # Draw app name
    draw.text((width//2, 300), "PolyEdge", fill='#00D4AA', font=font, anchor='mm')
    
    # Draw screen name
    try:
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 60)
    except:
        font_small = ImageFont.load_default()
    
    draw.text((width//2, 450), name, fill='#FFFFFF', font=font_small, anchor='mm')
    
    # Draw dimensions
    draw.text((width//2, 600), f"{width}x{height}px", fill='#A0A0B8', font=font_small, anchor='mm')
    
    # Draw note
    draw.text((width//2, height-300), "Screenshot placeholder", fill='#6A6A8A', font=font_small, anchor='mm')
    draw.text((width//2, height-200), "HTML version available", fill='#6A6A8A', font=font_small, anchor='mm')
    
    # Save
    filename = f"{name.lower().replace(' ', '-')}.png"
    img.save(filename)
    print(f"Created placeholder: {filename}")
    
    return filename

def main():
    screens = [
        "Feed Screen",
        "Whale Feed", 
        "Market Detail",
        "Leaderboard",
        "Pro Screen"
    ]
    
    print("Creating placeholder PNG screenshots...")
    
    created = []
    for screen in screens:
        filename = create_placeholder(screen)
        created.append(filename)
    
    print(f"\nCreated {len(created)} placeholder PNG files:")
    for f in created:
        size = os.path.getsize(f)
        print(f"  {f} - {size:,} bytes")
    
    print("\nNote: These are placeholders. Use HTML files for accurate screenshots.")
    print("HTML files can be converted to PNG when browser tools are available.")

if __name__ == '__main__':
    try:
        from PIL import Image
        main()
    except ImportError:
        print("PIL/Pillow not installed. Cannot create placeholder PNGs.")
        print("Install with: pip install Pillow")