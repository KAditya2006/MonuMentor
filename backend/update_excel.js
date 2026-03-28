const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Paths to your files
const excelPath = path.join(__dirname, '../india_districts.xlsx');
const jsonPath = path.join(__dirname, '../india_520_monuments_dataset.json');

async function main() {
  console.log('Loading datasets...');
  
  // 1. Load the Monument data from your JSON file
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Could not find the monuments JSON dataset!');
    return;
  }
  const monumentsData = require(jsonPath).data;

  // 2. Read or Create the Excel File
  let workbook;
  let sheetName;
  let excelData = [];

  if (fs.existsSync(excelPath)) {
    console.log('Found existing india_districts.xlsx file. Reading data...');
    workbook = xlsx.readFile(excelPath);
    sheetName = workbook.SheetNames[0];
    excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  } else {
    console.log('Excel file not found. Creating a fresh sheet from scratch...');
    sheetName = 'Districts & Monuments';
  }

  // 3. Map all monuments by State and City/District
  const monumentsMap = {};
  for (const [state, stateData] of Object.entries(monumentsData)) {
    monumentsMap[state.toLowerCase()] = {};
    for (const mon of stateData.monuments) {
      const city = (mon.city || 'Unknown').toLowerCase();
      if (!monumentsMap[state.toLowerCase()][city]) {
        monumentsMap[state.toLowerCase()][city] = [];
      }
      monumentsMap[state.toLowerCase()][city].push(mon.monument_name);
    }
  }

  // 4. Update the Excel Data
  if (excelData.length > 0) {
    // If you already have rows (like states and districts), fill in the blanks!
    for (let row of excelData) {
      // Adjust these column names ("State", "District") to match what is actually written in your Excel header!
      const state = (row['State'] || row['State/UT'] || '').toLowerCase().trim();
      const district = (row['District'] || row['City'] || '').toLowerCase().trim();

      if (state && district && monumentsMap[state] && monumentsMap[state][district]) {
        row['Total Monuments'] = monumentsMap[state][district].length;
        row['Monuments Listed'] = monumentsMap[state][district].join(', ');
      } else if (!row['Monuments Listed']) {
        row['Total Monuments'] = 0;
        row['Monuments Listed'] = 'None found in dataset';
      }
    }
  }

  // 5. Write the completed data back to the Excel file
  const newWorksheet = xlsx.utils.json_to_sheet(excelData);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
  xlsx.writeFile(newWorkbook, excelPath);

  console.log(`✅ Successfully completed and saved data to ${excelPath}!`);
}

main().catch(console.error);