import pandas as pd
import asyncio
import os
import re
import json
from playwright.async_api import async_playwright

# Configuration
INPUT_FILE = 'movies jon w alphabet order.xlsx'
OUTPUT_FILE = 'movies_master_list.csv'

# Column Names (Adjust if they differ in the actual sheet)
COL_LETTER = 'Movie Folder'
COL_LINK = 'Folder Link'

# Video file extensions to look for
VIDEO_EXTENSIONS = ['.mkv', '.mp4', '.avi', '.mov', '.ts', '.m4v', '.webm']


async def extract_from_jottacloud(page, url, letter):
    """
    Uses Playwright to navigate to a Jottacloud page and extract file links.
    Returns a list of dicts: {'Letter': ..., 'Film Name': ..., 'Link': ...}
    """
    movies = []
    
    try:
        print(f"  Navigating to {url}...")
        await page.goto(url, wait_until='networkidle', timeout=30000)
        
        # Wait for content to load - Jottacloud uses React, so we wait for file list
        # Try multiple selectors that might indicate file list is ready
        await asyncio.sleep(3)  # Give time for JS rendering
        
        # Get the page content after JavaScript has rendered
        content = await page.content()
        
        # Debug: Save first page HTML
        if not movies:
            with open('debug_rendered.html', 'w', encoding='utf-8') as f:
                f.write(content)
        
        # Method 1: Look for visible file links in the rendered DOM
        # Jottacloud typically shows files as clickable elements
        links = await page.query_selector_all('a')
        
        for link in links:
            try:
                href = await link.get_attribute('href')
                text = await link.inner_text()
                
                if not href or not text:
                    continue
                
                # Clean up text
                text = text.strip()
                
                # Check if it's a video file
                is_video = any(text.lower().endswith(ext) for ext in VIDEO_EXTENSIONS)
                
                if is_video:
                    movies.append({
                        'Letter': letter,
                        'Film Name': text,
                        'Link': href if href.startswith('http') else f"https://jottacloud.com{href}"
                    })
            except:
                continue
        
        # Method 2: Look for file items in Jottacloud's typical structure
        if not movies:
            # Try looking for file entry elements (React components often have data attributes)
            file_elements = await page.query_selector_all('[data-testid*="file"], .file-item, .file-row, [class*="FileRow"], [class*="file"]')
            
            for elem in file_elements:
                try:
                    text = await elem.inner_text()
                    text = text.strip()
                    
                    is_video = any(text.lower().endswith(ext) for ext in VIDEO_EXTENSIONS)
                    if is_video:
                        # Try to get download link
                        link_elem = await elem.query_selector('a')
                        href = await link_elem.get_attribute('href') if link_elem else url
                        
                        movies.append({
                            'Letter': letter,
                            'Film Name': text,
                            'Link': href if href and href.startswith('http') else url
                        })
                except:
                    continue
        
        # Method 3: Intercept network requests for file listing API
        # This is often how SPAs work - they fetch a JSON list
        
    except Exception as e:
        print(f"  [ERROR] Failed to scrape {url}: {e}")
    
    return movies


async def main():
    print(f"Reading input file: {INPUT_FILE}...")
    
    try:
        df = pd.read_excel(INPUT_FILE)
    except Exception as e:
        print(f"Failed to read Excel file: {e}")
        return

    # Normalize columns
    df.columns = [c.strip() for c in df.columns]
    
    print(f"Columns found: {list(df.columns)}")
    
    if COL_LETTER not in df.columns or COL_LINK not in df.columns:
        print(f"Error: Required columns not found.")
        print(f"Expected: '{COL_LETTER}', '{COL_LINK}'")
        print(f"Found: {list(df.columns)}")
        return

    all_movies = []
    total_rows = len(df)
    print(f"Found {total_rows} alphabet folders to process.")
    
    async with async_playwright() as p:
        # Launch browser (headless for automation)
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        for index, row in df.iterrows():
            letter = row[COL_LETTER]
            link = row[COL_LINK]
            
            if pd.isna(link) or not str(link).startswith('http'):
                print(f"Skipping row {index}: Invalid link for '{letter}'")
                continue
                
            print(f"Processing [{index+1}/{total_rows}]: {letter} -> {link}")
            
            extracted = await extract_from_jottacloud(page, link, letter)
            
            if not extracted:
                print(f"  [WARN] No movies found in {letter}. Check debug_rendered.html.")
            else:
                print(f"  Found {len(extracted)} items.")
                all_movies.extend(extracted)
                
            # Small delay between requests
            await asyncio.sleep(1)
        
        await browser.close()

    if all_movies:
        print(f"\nSaving {len(all_movies)} items to {OUTPUT_FILE}...")
        result_df = pd.DataFrame(all_movies)
        result_df.to_csv(OUTPUT_FILE, index=False)
        print("Done!")
    else:
        print("\nNo movies were extracted.")
        print("Check 'debug_rendered.html' to see what the page looks like after JavaScript execution.")
        print("\nPossible issues:")
        print("1. Jottacloud may require authentication for this share")
        print("2. The page structure may be different than expected")
        print("3. Files may be in subfolders that need to be navigated into")


if __name__ == "__main__":
    asyncio.run(main())
