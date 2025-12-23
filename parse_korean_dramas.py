#!/usr/bin/env python3
"""
Parse Korean Drama.txt and convert to CineAmore-compatible JSON format.
Cleans drama titles by removing prefixes, quality tags, and episode counts.
"""

import re
import json
from pathlib import Path

def clean_title(raw_line: str) -> tuple[str, str | None, int | None]:
    """
    Parse a raw line and extract clean title, URL, and year (if present).
    Returns: (title, url, year)
    """
    line = raw_line.strip()
    
    # Skip empty lines, separators, and header text
    if not line or line.startswith('---') or line.startswith('These are'):
        return None, None, None
    
    # Remove (reup), (redo) prefixes
    line = re.sub(r'^\(reup\)\s*', '', line, flags=re.IGNORECASE)
    line = re.sub(r'^\(redo\)\s*', '', line, flags=re.IGNORECASE)
    
    # Split on ' - ' to separate title/quality from URL
    # Handle entries with no URL (end with just ' -')
    if ' - ' in line:
        parts = line.split(' - ', 1)
        title_part = parts[0].strip()
        url_part = parts[1].strip() if len(parts) > 1 and parts[1].strip() else None
    elif line.endswith('-'):
        title_part = line[:-1].strip()
        url_part = None
    else:
        title_part = line
        url_part = None
    
    # Skip if URL is empty or just whitespace
    if not url_part or not url_part.startswith('http'):
        # Some entries have partial text like "Goblin - https://..."
        # Try to find URL in original line
        url_match = re.search(r'(https?://[^\s]+)', line)
        if url_match:
            url_part = url_match.group(1)
        else:
            return None, None, None
    
    # Handle multiple URLs (take first one)
    if '|' in url_part:
        url_part = url_part.split('|')[0].strip()
    
    # Remove quality tags [NF 540p/720p/1080p w/engsubs], [BD 540p/720p], etc.
    title_clean = re.sub(r'\s*\[.*?\]\s*', ' ', title_part)
    
    # Remove episode counts (16ep), (12ep), (6ep), etc.
    title_clean = re.sub(r'\s*\(\d+ep(?:\s*\+[^)]+)?\)\s*', '', title_clean)
    
    # Clean up multiple spaces
    title_clean = re.sub(r'\s+', ' ', title_clean).strip()
    
    # Try to extract year from title (e.g., "1% of Anything 2016", "Punch 2003")
    year = None
    year_match = re.search(r'\s+(\d{4})\s*$', title_clean)
    if year_match:
        potential_year = int(year_match.group(1))
        # Only treat as year if it's reasonable (1990-2030)
        if 1990 <= potential_year <= 2030:
            year = potential_year
            # Don't remove year from title if it's part of the name like "2 Weeks"
            # Only remove if it's at the end and looks like a year suffix
            title_clean = title_clean[:year_match.start()].strip()
    
    # Handle special cases
    # Remove trailing special characters
    title_clean = title_clean.rstrip('*').strip()
    
    # Skip entries that are just links or have no meaningful title
    if not title_clean or len(title_clean) < 2:
        return None, None, None
    
    return title_clean, url_part, year


def parse_korean_dramas(input_file: str, output_file: str):
    """
    Parse the Korean Drama.txt file and output CineAmore-compatible JSON.
    """
    dramas = []
    skipped = []
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            title, url, year = clean_title(line)
            
            if title and url:
                drama_entry = {
                    "title": title,
                    "downloadLinks": [{"label": "Download", "url": url}]
                }
                if year:
                    drama_entry["year"] = year
                dramas.append(drama_entry)
            elif line.strip() and not line.strip().startswith('---') and not line.strip().startswith('These are'):
                # Log skipped entries for review
                skipped.append(f"Line {line_num}: {line.strip()[:80]}...")
    
    # Output the result
    output = {"movies": dramas}
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Parsed {len(dramas)} Korean dramas")
    print(f"⚠️  Skipped {len(skipped)} entries (no URL or invalid)")
    print(f"📁 Output saved to: {output_file}")
    
    # Print a few examples
    print("\n📋 Sample entries:")
    for drama in dramas[:5]:
        print(f"  - {drama['title']}" + (f" ({drama.get('year', 'N/A')})" if drama.get('year') else ""))
    
    return dramas, skipped


if __name__ == "__main__":
    input_path = Path(__file__).parent / "Korean Drama.txt"
    output_path = Path(__file__).parent / "korean_dramas_for_import.json"
    
    dramas, skipped = parse_korean_dramas(str(input_path), str(output_path))
    
    # Also save skipped entries for review
    if skipped:
        skipped_path = Path(__file__).parent / "korean_dramas_skipped.txt"
        with open(skipped_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(skipped))
        print(f"\n📝 Skipped entries saved to: {skipped_path}")
