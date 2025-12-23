import json

def is_unfixable(film):
    """
    Determine if a film entry is unfixable.
    Be more conservative - only discard truly broken entries.
    """
    fixed_title = film.get('fixedTitle', '')
    fixed_year = film.get('fixedYear')
    director = film.get('director', '')
    
    # ONLY discard if:
    
    # 1. "Unknown Title" from hash/garbage
    if fixed_title == 'Unknown Title':
        return True, "Hash/garbage title - cannot identify movie"
    
    # 2. Hash-like title (64 or 32 char hexadecimal)
    title_clean = fixed_title.replace(' ', '').replace('-', '')
    if len(title_clean) == 64 or len(title_clean) == 32:
        if all(c in '0123456789abcdefABCDEF' for c in title_clean):
            return True, "Hexadecimal hash title"
    
    # 3. Title is too short (single letter) AND no director
    if len(fixed_title.strip()) == 1 and (not director or director == 'Unknown'):
        return True, "Single letter title with no director info"
    
    # 4. Completely blank title
    if not fixed_title or fixed_title.strip() == '':
        return True, "Blank title"
    
    # DO NOT discard numeric titles if they have a director or year
    # (e.g., "1917" by Sam Mendes, "2046" by Wong Kar-Wai are valid)
    
    return False, ""

# Load data
print("Loading quarantined_films_fixed_strict.json...\n")
with open('quarantined_films_fixed_strict.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Separate fixable from unfixable
fixable_films = []
unfixable_films = []

for film in data['films']:
    is_bad, reason = is_unfixable(film)
    if is_bad:
        film['discard_reason'] = reason
        unfixable_films.append(film)
    else:
        fixable_films.append(film)

print(f"=== FILTERING RESULTS (CONSERVATIVE) ===")
print(f"Original count: {data['totalFilms']}")
print(f"Fixable films: {len(fixable_films)}")
print(f"Unfixable films: {len(unfixable_films)}")

# Show unfixable entries
if unfixable_films:
    print(f"\n=== UNFIXABLE ENTRIES TO DISCARD ===")
    for i, film in enumerate(unfixable_films, 1):
        print(f"\n{i}. {film.get('originalTitle')[:60]}")
        print(f"   Fixed: {film.get('fixedTitle')}")
        print(f"   Year: {film.get('fixedYear')}")
        print(f"   Director: {film.get('director', 'N/A')}")
        print(f"   Reason: {film['discard_reason']}")

# Create clean dataset for TMDB enrichment
clean_data = {
    "instructions": {
        "task": "Enrich with TMDB data",
        "note": "These films have been cleaned and are ready for TMDB metadata enrichment"
    },
    "totalFilms": len(fixable_films),
    "films": fixable_films
}

# Save cleaned version
output_file = 'quarantined_films_clean_ready_for_tmdb.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(clean_data, f, indent=2, ensure_ascii=False)

print(f"\n{'='*60}")
print(f"✅ Created: {output_file}")
print(f"   Contains {len(fixable_films)} films ready for TMDB enrichment")

# Save discarded entries
if unfixable_films:
    discard_file = 'quarantined_films_discarded.json'
    discard_data = {
        "totalDiscarded": len(unfixable_films),
        "reason": "Truly unfixable - hash titles, blank titles, or insufficient data",
        "films": unfixable_films
    }
    
    with open(discard_file, 'w', encoding='utf-8') as f:
        json.dump(discard_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created: {discard_file}")
    print(f"   Contains {len(unfixable_films)} discarded entries")

# Summary
print(f"\n{'='*60}")
print(f"📊 SUMMARY:")
print(f"  • Started with: {data['totalFilms']} films")
print(f"  • Ready for TMDB: {len(fixable_films)} films ({len(fixable_films)/data['totalFilms']*100:.1f}%)")
print(f"  • Discarded: {len(unfixable_films)} films ({len(unfixable_films)/data['totalFilms']*100:.1f}%)")
print(f"\n🎯 Next step: Enrich with TMDB metadata")
