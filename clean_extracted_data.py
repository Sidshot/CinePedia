"""
Clean extracted Jottacloud movie data and format for CineAmore bulk import.
Extracts: Title, Year (from filename), Download Link
Outputs: JSON format compatible with bulk import
"""
import pandas as pd
import json
import re
from pathlib import Path

INPUT_FILE = 'movies_master_list.csv'
OUTPUT_JSON = 'movies_for_import.json'
OUTPUT_CSV = 'movies_cleaned.csv'

# Common patterns to remove from filenames (applied in order)
CLEANUP_PATTERNS = [
    # Subtitle indicators - MUST be first
    r'\bENG\s*SUBS?\b',
    r'\bSUBS?\b',
    r'\bSUBTITLED\b',
    r'\bENGLISH\s*SUBTITLES?\b',
    # Quality tags in brackets
    r'\[HD\]?',
    r'\[SD\]?',
    r'\[Uncut\]?',
    r'\[Extended\s*version\]?',
    r'\[Director\'?s?\s*Cut\]?',
    r'\[Remastered\]?',
    # Video quality tags
    r'\b(4k|2160p|1080p|720p|480p|bluray|blu-ray|brrip|bdrip|dvdrip|hdtv|webrip|web-dl|webdl|hdrip)\b',
    # HDR/Audio tags
    r'\b(hdr|hdr10|dv|dolby|atmos|dts|ac3|aac|x264|x265|h264|h265|hevc|10bit|remux)\b',
    # Release groups (usually in brackets at end)
    r'\[.*?\]$',
    r'\(.*?(rip|release|repack|proper).*?\)',
    # Common file hosting artifacts
    r'\bflat\b',
    # File extensions
    r'\.(mkv|mp4|avi|mov|ts|m4v|webm)$',
]

# Year extraction patterns
YEAR_PATTERNS = [
    r'\((\d{4})\)',           # (1999)
    r'\[(\d{4})\]',           # [1999]  
    r'\.(\d{4})\.',           # .1999.
    r'\s(\d{4})\s',           # space 1999 space
    r'[\._-](\d{4})[\._-]',   # _1999_ or -1999-
    r'\s(\d{4})$',            # trailing year
]


def extract_year(text):
    """Try to extract a 4-digit year from the text."""
    for pattern in YEAR_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            year = int(match.group(1))
            if 1888 <= year <= 2030:  # Valid movie year range
                return year
    return None


def clean_title(filename):
    """
    Clean a filename to extract the movie title.
    Removes quality tags, years, extensions, etc.
    """
    title = filename
    
    # First, extract and remove year (we'll use it separately)
    year = extract_year(title)
    if year:
        # Remove year pattern from title
        for pattern in YEAR_PATTERNS:
            title = re.sub(pattern, ' ', title, flags=re.IGNORECASE)
    
    # Apply cleanup patterns
    for pattern in CLEANUP_PATTERNS:
        title = re.sub(pattern, '', title, flags=re.IGNORECASE)
    
    # Replace common separators with spaces
    title = re.sub(r'[\._-]+', ' ', title)
    
    # Clean up whitespace
    title = re.sub(r'\s+', ' ', title).strip()
    
    # Remove trailing/leading punctuation
    title = title.strip('.,;:-_()[]{}\'\"')
    
    # Also remove trailing partial brackets
    title = re.sub(r'\s*\[$', '', title)
    title = re.sub(r'\s*\($', '', title)
    
    # Fix apostrophes in contractions
    title = re.sub(r"'s\s", "'s ", title)
    title = re.sub(r"n't\s", "n't ", title)
    
    # Clean up multiple spaces again
    title = re.sub(r'\s+', ' ', title).strip()
    
    return title, year


def process_movies(input_file):
    """Process the extracted movies CSV and clean the data."""
    df = pd.read_csv(input_file)
    
    print(f"Loaded {len(df)} movies from {input_file}")
    
    movies = []
    seen_titles = set()  # Track duplicates
    
    for _, row in df.iterrows():
        filename = row['Film Name']
        link = row['Link']
        letter = row.get('Letter', '')
        
        # Skip if no filename or link
        if pd.isna(filename) or pd.isna(link):
            continue
            
        # Clean the title
        title, year = clean_title(str(filename))
        
        # Skip if title is too short or empty
        if not title or len(title) < 2:
            print(f"  Skipping (empty title): {filename}")
            continue
        
        # Skip pure numbers
        if title.replace(' ', '').isdigit():
            print(f"  Skipping (numeric title): {filename}")
            continue
        
        # Create unique key for dedup (title + year)
        key = (title.lower(), year)
        if key in seen_titles:
            print(f"  Skipping (duplicate): {title} ({year})")
            continue
        seen_titles.add(key)
        
        movie = {
            'title': title,
            'downloadLinks': [{'label': 'Download', 'url': str(link)}]
        }
        
        if year:
            movie['year'] = year
            
        movies.append(movie)
    
    return movies


def main():
    print("=" * 60)
    print("CineAmore Movie Data Cleaner v2")
    print("=" * 60)
    
    if not Path(INPUT_FILE).exists():
        print(f"Error: {INPUT_FILE} not found!")
        return
    
    movies = process_movies(INPUT_FILE)
    
    print(f"\n✅ Processed: {len(movies)} unique movies")
    
    # Show sample
    print("\n--- Sample (first 15) ---")
    for movie in movies[:15]:
        year_str = f" ({movie.get('year', '?')})" if 'year' in movie else ""
        print(f"  • {movie['title']}{year_str}")
    
    # Save JSON for import
    output_data = {'movies': movies}
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved JSON: {OUTPUT_JSON} ({len(movies)} movies)")
    
    # Also save a cleaned CSV for reference
    csv_data = []
    for m in movies:
        csv_data.append({
            'Title': m['title'],
            'Year': m.get('year', ''),
            'Link': m['downloadLinks'][0]['url']
        })
    csv_df = pd.DataFrame(csv_data)
    csv_df.to_csv(OUTPUT_CSV, index=False)
    print(f"✅ Saved CSV:  {OUTPUT_CSV}")
    
    print("\n" + "=" * 60)
    print("Ready for CineAmore Import!")
    print("  File: movies_for_import.json")
    print("  Admin Panel > Import > Upload this file")
    print("  Enable 'Enrich with TMDB' for metadata")
    print("=" * 60)


if __name__ == "__main__":
    main()
