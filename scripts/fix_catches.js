const fs = require('fs');
const path = require('path');

const rootDir = path.join(process.cwd(), 'src');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(rootDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Fix catch (error: any)
    if (content.includes('catch (error: any)')) {
        content = content.replace(/catch\s*\(error:\s*any\)\s*{/g, 'catch (error: unknown) {\n        const err = error as Error;');
        // Also replace usage of error.message with err.message if we just injected err
        content = content.replace(/error\.message/g, 'err.message');
        changed = true;
    }

    // 2. Fix catch (err: any)
    if (content.includes('catch (err: any)')) {
        content = content.replace(/catch\s*\(err:\s*any\)\s*{/g, 'catch (err: unknown) {\n        const error = err as Error;');
        content = content.replace(/err\.message/g, 'error.message');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Sanitized: ${file}`);
    }
});
