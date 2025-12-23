import requests
from bs4 import BeautifulSoup
import time
import json
import urllib.parse
import re
import os
import signal
import sys
import cloudscraper
from datetime import datetime

# CONFIGURATION
BASE_URL = "https://a.111477.xyz/movies/"
OUTPUT_FILE = "directory_import.json"
DELAY_SECONDS = 3.0  # Increased to avoid 429s
MAX_RETRIES = 3
RETRY_DELAY = 60     # Wait 60s if we hit a limit

# Create scraper
scraper = cloudscraper.create_scraper()

# Headers to look like a real browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Referer': 'https://a.111477.xyz/'
}

MOVIE_EXTENSIONS = ('.mp4', '.mkv', '.avi', '.mov', '.wmv', '.m4v')

all_movies = []

def save_data():
    """Save current data to file"""
    output_data = {
        "movies": all_movies
    }
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)
    print(f"\n💾 Saved {len(all_movies)} movies to {OUTPUT_FILE}")

def signal_handler(sig, frame):
    print("\n⚠️  Interrupted! Saving data before exit...")
    save_data()
    sys.exit(0)

# Register signal handler
signal.signal(signal.SIGINT, signal_handler)

def clean_title(filename):
    """
    Clean filename to get a readable title and year.
    Example: "The.Matrix.1999.1080p.mkv" -> Title: "The Matrix", Year: 1999
    """
    # URL decode (e.g., %20 -> space)
    name = urllib.parse.unquote(filename)
    
    # Remove extension
    base_name = os.path.splitext(name)[0]
    
    # Try to find year (4 digits between 1900-2099)
    year_match = re.search(r'\b(19|20)\d{2}\b', base_name)
    year = int(year_match.group(0)) if year_match else None
    
    # If year found, split title before year
    if year:
        title_part = base_name[:year_match.start()]
    else:
        title_part = base_name
        
    # Replace dots, underscores with spaces
    title = title_part.replace('.', ' ').replace('_', ' ').replace('-', ' ')
    
    # Remove common release group junk
    junk = ['1080p', '720p', '480p', 'BluRay', 'WEB-DL', 'HDRip', 'x264', 'x265', 'AAC', '5.1']
    for j in junk:
        title = re.sub(r'\b' + j + r'\b', '', title, flags=re.IGNORECASE)
        
    # Clean whitespace
    title = re.sub(r'\s+', ' ', title).strip()
    
    # Handle brackets
    title = re.sub(r'\[.*?\]', '', title).strip()
    title = re.sub(r'\(.*?\)', '', title).strip()
    
    return title, year

def get_soup(url):
    """Fetch URL with retries and rate limit handling"""
    for attempt in range(MAX_RETRIES):
        try:
            print(f"Checking: {url}")
            response = scraper.get(url, headers=HEADERS, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                if soup.title:
                    print(f"  📄 Title: {soup.title.string.strip()}")
                return soup
            elif response.status_code in [429, 503]:
                print(f"⚠️ Rate limited! Waiting {RETRY_DELAY}s...")
                time.sleep(RETRY_DELAY)
            else:
                print(f"❌ Error {response.status_code}: {url}")
                return None
                
        except Exception as e:
            print(f"❌ Exception: {e}")
            time.sleep(5)
            
    return None

visited_urls = set()

def crawl(url):
    """Recursively crawl directory"""
    if url in visited_urls:
         return
    visited_urls.add(url)

    soup = get_soup(url)
    if not soup:
        return

    # Typical directory listing links
    links = soup.find_all('a')
    print(f"  Found {len(links)} links in {url}")
    
    for link in links:
        href = link.get('href')
        
        # Skip parent directory links
        if not href or href in ['../', './', '/'] or href.startswith('?'):
            continue
            
        full_url = urllib.parse.urljoin(url, href)
        
        # Prevent going back to parent if mapped to root
        if full_url == BASE_URL and url != BASE_URL:
             continue
        
        # Check if directory (ends with /)
        if href.endswith('/'):
            # BE CAREFUL: Don't go back up
            if 'parent directory' in link.text.lower():
                continue
                
            time.sleep(DELAY_SECONDS) # Respect rate limits
            crawl(full_url)
            
            # Incremental save every 20 items found
            if len(all_movies) > 0 and len(all_movies) % 20 == 0:
                print(f"checkpoint: saving {len(all_movies)} items...")
                save_data()

        # Check if movie file
        elif href.lower().endswith(MOVIE_EXTENSIONS):
            title, year = clean_title(href)
            
            entry = {
                "title": title,
                "year": year,
                "downloadLinks": [{
                    "label": "Download",
                    "url": full_url
                }],
                "genre": ["Uncategorized"] 
            }
            all_movies.append(entry)
            print(f"  🎬 Found: {title} ({year})")

def main():
    print(f"🚀 Starting scrape of {BASE_URL}")
    print(f"⏱️  Rate limit delay: {DELAY_SECONDS}s")
    print(f"Press Ctrl+C to stop and save progress.")
    
    crawl(BASE_URL)
    
    save_data()
        
    print(f"\n✅ Scrape complete!")
    print(f"📊 Found {len(all_movies)} movies")

if __name__ == "__main__":
    main()
