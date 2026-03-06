const fs = require('fs');

function analyze() {
    let content;
    try {
        content = fs.readFileSync('lint_report.json', 'utf16le');
        if (!content.startsWith('[') && !content.startsWith('{')) {
            content = fs.readFileSync('lint_report.json', 'utf8');
        }
    } catch (e) {
        content = fs.readFileSync('lint_report.json', 'utf8');
    }

    // Clean up potential BOM or other leading noise
    const startBracket = content.indexOf('[');
    if (startBracket === -1) {
        console.log("Could not find start of JSON array");
        return;
    }
    content = content.substring(startBracket);

    const report = JSON.parse(content);
    const errors = [];

    report.forEach(file => {
        if (file.errorCount > 0) {
            file.messages.forEach(msg => {
                if (msg.severity === 2) {
                    errors.push({
                        file: file.filePath,
                        line: msg.line,
                        rule: msg.ruleId,
                        message: msg.message
                    });
                }
            });
        }
    });

    console.log(JSON.stringify(errors, null, 2));
}

analyze();
