# All Crawled Films Export - Ready for Fixing

## Export Complete ✅

**Date**: December 23, 2025 at 19:42 IST  
**File**: `all_crawled_films_to_fix.json`  
**Size**: 10.83 MB  
**Total Films**: 24,500

---

## What You Have

### File Format:
```json
{
  "instructions": {
    "task": "Fix and clean movie titles",
    "guidelines": [
      "Remove '/movies/' prefix from titles",
      "Remove trailing '(' from titles",
      "Clean up formatting",
      "Fix capitalization",
      "Remove quality tags",
      "Extract proper years",
      "etc..."
    ]
  },
  "totalFilms": 24500,
  "films": [
    {
      "originalTitle": "/movies/#Alive (",
      "originalYear": 2020,
      "downloadLinks": [...],
      "genre": ["Uncategorized"],
      
      "fixedTitle": "",      // ← YOU FILL THIS
      "fixedYear": null,     // ← YOU FILL THIS
      "notes": ""            // ← ADD NOTES IF NEEDED
    },
    ...
  ]
}
```

---

## Current Issues in the Data

### All 24,500 films have problems:

1. **All have `/movies/` prefix** (24,500 films)
   - Example: `/movies/#Alive (`
   - Should be: `#Alive`

2. **All have trailing `(`** (24,500 films)
   - Example: `/movies/10 Cloverfield Lane (`
   - Should be: `10 Cloverfield Lane`

3. **Some have missing years**
   - Need to extract from filename or research

4. **Some have quality tags**
   - Example: "German", "DUBBED", "KOREAN", etc.

5. **Many duplicates** (same movie, different qualities)
   - Example: Multiple "10 Cloverfield Lane (2016)" entries
   - Each with different download links

---

## Sample Entries

### Before Fixing:
```json
{
  "originalTitle": "/movies/#Alive (",
  "originalYear": 2020,
  "downloadLinks": [{
    "url": "https://a.111477.xyz/movies/%23Alive%20%282020%29/..."
  }],
  "fixedTitle": "",
  "fixedYear": null,
  "notes": ""
}
```

### After Fixing (Example):
```json
{
  "originalTitle": "/movies/#Alive (",
  "originalYear": 2020,
  "downloadLinks": [{
    "url": "https://a.111477.xyz/movies/%23Alive%20%282020%29/..."
  }],
  "fixedTitle": "#Alive",
  "fixedYear": 2020,
  "notes": "Korean zombie thriller - removed prefix and trailing ("
}
```

---

## Your Task

### 1. Open the File
- Location: `d:/CinePedia - IDL/CinePedia/all_crawled_films_to_fix.json`
- Size: 10.83 MB (392,021 lines)
- Format: JSON

### 2. Fix Each Film
For each of the 24,500 films:
- Fill in `fixedTitle` - clean, proper title
- Fill in `fixedYear` - correct release year
- Add `notes` - any special cases or issues

### 3. Common Fixes Needed:
- ✅ Remove `/movies/` prefix
- ✅ Remove trailing `(`
- ✅ Fix title case (proper capitalization)
- ✅ Remove quality tags (HD, 4K, BluRay, etc.)
- ✅ Remove language tags (KOREAN, GERMAN, etc.)
- ✅ Extract year if missing
- ✅ Mark unfixable entries as "skip" in notes

### 4. Save As:
- Filename: `all_crawled_films_fixed.json`
- Keep the JSON structure intact!
- Same location: `d:/CinePedia - IDL/CinePedia/`

---

## Tips for Fixing

### Option 1: Manual (Small Batches)
- Use a text editor (VS Code, Notepad++, etc.)
- Fix in batches
- Very time-consuming for 24,500 films!

### Option 2: Use Scripts/AI (Recommended)
You can use:
- **Python scripts** - Create regex-based auto-fixes
- **AI assistance** - Claude/ChatGPT to help clean data
- **Spreadsheet tools** - Convert to CSV, use Excel formulas
- **Combination** - Script for common issues, manual for edge cases

### Sample Auto-Fix Script:
```python
import json
import re

with open('all_crawled_films_to_fix.json') as f:
    data = json.load(f)

for film in data['films']:
    title = film['originalTitle']
    
    # Remove /movies/ prefix
    title = title.replace('/movies/', '')
    
    # Remove trailing (
    title = title.rstrip(' (')
    
    # Basic cleanup
    title = title.strip()
    
    # Set fixed title
    film['fixedTitle'] = title
    film['fixedYear'] =film['originalYear']

# Save
with open('all_crawled_films_fixed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```

---

## When You're Done

### 1. Save the Fixed File
- Name it: `all_crawled_films_fixed.json`
- Keep it in: `d:/CinePedia - IDL/CinePedia/`

### 2. Run Cross-Check
```bash
python crosscheck_fixed_films.py
```

This will:
- ✅ Validate JSON structure
- ✅ Check how many films are fixed
- ✅ Find duplicates
- ✅ Identify remaining issues
- ✅ Show statistics

### 3. Bring It Back
Once cross-check passes:
- Share the file with me
- I'll review the corrections
- We'll import to CineAmore database
- All 24,500 films will go live!

---

## Expected Results

### After Fixing:
- **~24,500 films** with clean titles
- **Proper capitalization** and formatting
- **Valid years** extracted/verified
- **No artifacts** or quality tags
- **Ready for TMDB enrichment** (optional)
- **Ready for import** to CineAmore

---

## Files Created

1. ✅ `all_crawled_films_to_fix.json` - **Main file for you to edit**
2. ✅ `export_all_films_for_fixing.py` - Export script (already run)
3. ✅ `crosscheck_fixed_films.py` - Validation script (run when done)

---

## Need Help?

If you want me to:
- Create an auto-fix script for common patterns
- Help with specific edge cases
- Review partial fixes
- Suggest better approaches

Just ask! 🙋‍♂️

---

**Good luck with the fixing! The file is ready for you to work on.** 🎬✨

*Exported: 2025-12-23 19:42 IST*  
*Location: d:/CinePedia - IDL/CinePedia/all_crawled_films_to_fix.json*  
*Total to fix: 24,500 films*
