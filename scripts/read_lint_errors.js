const fs = require('fs');
const content = fs.readFileSync('dashboard_lint_unix.txt', 'utf16le');
const lines = content.split('\n');
lines.forEach(line => {
    if (line.includes('Error:')) {
        console.log(line.trim());
    }
});
