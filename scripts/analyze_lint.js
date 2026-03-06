const fs = require('fs');
const report = JSON.parse(fs.readFileSync('lint_report.json', 'utf8'));

report.forEach(file => {
    if (file.errorCount > 0) {
        console.log(`\nFile: ${file.filePath}`);
        file.messages.forEach(msg => {
            if (msg.severity === 2) {
                console.log(`  Line ${msg.line}:${msg.column} - ${msg.ruleId}: ${msg.message}`);
            }
        });
    }
});
