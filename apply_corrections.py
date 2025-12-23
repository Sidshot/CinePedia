import json
import re

def fix_title(title, original_title='', original_year=None):
    """Apply comprehensive title cleaning"""
    if not title:
        return title
    
    # 1. Fix HTML entities
    title = title.replace('&amp;', '&')
    title = title.replace('&Amp;', '&')
    
    # 2. Fix special Unicode punctuation
    title = title.replace('꞉', ':')
    
    # 3. Remove number prefixes (like "206 Amores perros")
    title = re.sub(r'^\d{3}\s+', '', title)
    title = re.sub(r'^\d{2,3}\s+', '', title)
    
    # 4. Fix Roman numerals (Ii → II, Iii → III)
    title = re.sub(r'\bIi\b', 'II', title)
    title = re.sub(r'\bIii\b', 'III', title)
    title = re.sub(r'\bIv\b', 'IV', title)
    title = re.sub(r'\bVi\b', 'VI', title)
    title = re.sub(r'\bVii\b', 'VII', title)
    title = re.sub(r'\bViii\b', 'VIII', title)
    title = re.sub(r'\bIx\b', 'IX', title)
    
    # 5. Remove language/quality tags
    artifacts = [
        r'\s*Tamil\s*$',
        r'\s*German\s*$',
        r'\s*Uncut\s*$',
        r'\s*BDrip\s*',
        r'\s*DVDRip\s*',
        r'\s*v2\s*$',
    ]
    for artifact in artifacts:
        title = re.sub(artifact, '', title, flags=re.IGNORECASE)
    
    # 6. Clean up whitespace
    title = re.sub(r'\s+', ' ', title).strip()
    
    return title

def fix_year(fixed_year, original_year, title):
    """Fix year issues - restore null years where they make sense"""
    # If fixedYear is None but originalYear exists and is reasonable
    if fixed_year is None and original_year is not None:
        # Check if original year is within reasonable range
        if 1888 <= original_year <= 2030:
            # Special cases: if title is a year-like number, keep as None
            if title.strip() in ['2046', '2073', '1917'] and original_year != int(title.strip()):
                return None
            return original_year
    
    return fixed_year

def apply_corrections(data):
    """Apply all corrections to the dataset"""
    corrections_made = 0
    
    for film in data['films']:
        original_fixed_title = film.get('fixedTitle', '')
        original_fixed_year = film.get('fixedYear')
        
        # Apply title fixes
        new_title = fix_title(
            original_fixed_title,
            film.get('originalTitle', ''),
            film.get('originalYear')
        )
        
        # Apply year fixes
        new_year = fix_year(
            original_fixed_year,
            film.get('originalYear'),
            film.get('originalTitle', '')
        )
        
        # Update if changed
        if new_title != original_fixed_title:
            film['fixedTitle'] = new_title
            corrections_made += 1
            print(f"✓ Title: {original_fixed_title} → {new_title}")
        
        if new_year != original_fixed_year:
            film['fixedYear'] = new_year
            corrections_made += 1
            print(f"✓ Year: {film.get('originalTitle')} ({original_fixed_year} → {new_year})")
    
    return corrections_made

# Load data
print("Loading quarantined_films_fixed_strict.json...")
with open('quarantined_films_fixed_strict.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total films: {data['totalFilms']}\n")
print("Applying corrections...\n")

# Apply corrections
corrections = apply_corrections(data)

print(f"\n=== SUMMARY ===")
print(f"Corrections applied: {corrections}")

# Save corrected file
output_file = 'quarantined_films_fixed_strict_corrected.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Saved corrected file to: {output_file}")
print("\nVerifying corrections...")

# Quick verification
issues_remaining = 0
for film in data['films']:
    fixed_title = film.get('fixedTitle', '')
    
    # Check for remaining issues
    if ('Ii' in fixed_title or 'Iii' in fixed_title or 
        '&amp;' in fixed_title or '꞉' in fixed_title or
        re.match(r'^\d{3}\s+', fixed_title)):
        issues_remaining += 1

print(f"Issues remaining: {issues_remaining}")

if issues_remaining == 0:
    print("\n🎉 All corrections completed successfully!")
else:
    print(f"\n⚠️  {issues_remaining} entries may need manual review")
