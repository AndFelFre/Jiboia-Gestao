const fs = require('fs');
const path = require('path');

const rootDir = path.join(process.cwd(), 'src');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Aggressive Import Fix
            if (content.match(/sup@|abase\/auth/)) {
                console.log(`Fixing Imports: ${fullPath}`);
                // Replace any string containing sup@/lib/supabase/auth with the correct one
                content = content.replace(/['"]([^'"]*?)(sup@|abase\/auth)([^'"]*?)['"]/g, "'@/lib/supabase/auth'");
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

walk(rootDir);
console.log('Sanitization Complete!');
