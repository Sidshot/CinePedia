const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Input File
const EXCEL_FILE = 'Copy of Planilha Santy Atualizada em 11 de Dezembro de 2025.xlsx';
const OUTPUT_FILE = 'films_new_raw.json';

const filePath = path.join(__dirname, EXCEL_FILE);

if (!fs.existsSync(filePath)) {
    console.error(`Error: File "${EXCEL_FILE}" not found.`);
    process.exit(1);
}

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`✅ Converted ${data.length} rows from "${sheetName}".`);

    if (data.length > 0) {
        console.log('📋 Columns detected:', Object.keys(data[0]));
    }

    fs.writeFileSync('films_raw.json', JSON.stringify(data, null, 2));
    console.log('💾 Saved to films_raw.json');

} catch (err) {
    console.error('❌ Conversion Error:', err);
}
