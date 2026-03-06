const fs = require('fs');

function convert(filename) {
    try {
        const content = fs.readFileSync(filename, 'utf16le');
        fs.writeFileSync(filename.replace('.txt', '_utf8.txt'), content, 'utf8');
        console.log(`Converted ${filename} to UTF-8`);
    } catch (e) {
        console.error(`Error converting ${filename}: ${e.message}`);
    }
}

convert('app_actions_lint.txt');
convert('dashboard_lint.txt');
