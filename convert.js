const fs = require('fs');
try {
    const raw = fs.readFileSync('ts_errors.txt');
    const content = Buffer.from(raw).toString('utf16le');
    fs.writeFileSync('ts_errors_clean.txt', content, 'utf8');
    console.log("Converted ts_errors.txt tightly.");
} catch (e) {
    console.error(e);
}
