const fs = require('fs');
const path = require('path');

// --- Configuration ---
const csvPath = path.join(__dirname, '../india_520_monuments_dataset.csv');
const outputCsvPath = path.join(__dirname, '../india_monuments_with_districts.csv'); // Save to a new file to be safe
const USER_AGENT = 'RootsAndWings-District-Finder/1.0 (contact: your-email@example.com)'; // Required by Nominatim

// --- Helper Functions ---
const delay = ms => new Promise(res => setTimeout(res, ms));

function parseCsvRow(line) {
    const cols = [];
    let cur = '';
    let inQuote = false;
    for (const char of line) {
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            cols.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    cols.push(cur);
    return cols;
}

async function getDistrict(city, state) {
    // Don't bother searching for placeholder names to save time
    if (!city || !state || city.toLowerCase().includes('city') || city.toLowerCase().includes('town')) {
        return '';
    }
    const query = `${city}, ${state}, India`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;

    try {
        const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!response.ok) {
            console.error(`  -> Nominatim API failed with status: ${response.status}`);
            return '';
        }
        const data = await response.json();

        if (data && data.length > 0) {
            const address = data[0].address;
            // Nominatim uses 'county' for district in many Indian regions.
            const district = address.county || address.state_district || '';
            return district.replace(/,/g, ''); // Remove commas from district name to not break CSV
        }
    } catch (error) {
        console.error(`  -> Error fetching district for ${city}, ${state}:`, error.message);
    }
    return '';
}

// --- Main Execution ---
async function main() {
    if (!fs.existsSync(csvPath)) {
        console.error(`Error: Input file not found at ${csvPath}`);
        return;
    }

    const data = fs.readFileSync(csvPath, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim() !== '');

    const header = lines[0].trim();
    const newHeader = header.replace('State/UT,City', 'State/UT,District,City');
    const rows = lines.slice(1);

    const newCsvLines = [newHeader];

    console.log(`Processing ${rows.length} monuments to find their districts.`);
    console.log(`This will take approximately ${Math.ceil(rows.length * 1.1 / 60)} minutes.`);
    console.log('---');

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cols = parseCsvRow(row);

        if (cols.length < 3) continue; // Skip malformed rows

        const monumentName = cols[0];
        const state = cols[1];
        const city = cols[2];

        process.stdout.write(`[${i + 1}/${rows.length}] Searching: ${monumentName} (${city}, ${state})... `);

        const district = await getDistrict(city, state);
        
        cols.splice(2, 0, `"${district}"`); // Insert district with quotes to be safe
        
        newCsvLines.push(cols.join(','));
        console.log(`Found: ${district || 'N/A'}`);

        // IMPORTANT: Nominatim has a strict usage policy. 1 request per second max.
        await delay(1100);
    }

    fs.writeFileSync(outputCsvPath, newCsvLines.join('\n'), 'utf-8');
    console.log('\n---');
    console.log(`✅ Successfully created ${outputCsvPath} with a new 'District' column.`);
    console.log(`\nNOTE: Some districts will be missing, especially for placeholder city names like "Fort City".`);
}

main().catch(console.error);