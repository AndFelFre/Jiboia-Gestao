const fs = require('fs');
const path = require('path');

const rootDir = path.join(process.cwd(), 'src');

const mapping = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã£': 'ã', 'Ãµ': 'õ', 'Ã¢': 'â', 'Ãª': 'ê', 'Ã®': 'î',
    'Ã´': 'ô', 'Ã»': 'û', 'Ã§': 'ç', 'Ã€': 'À', 'Ã‰': 'É',
    'Ã ': 'Í', 'Ã“': 'Ó', 'Ãš': 'Ú', 'Â ': '', 'â† ': '←',
    'ðŸ¢': '🟢', 'ðŸ¡': '🟡', 'ðŸ”´': '🔴'
};

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

            // Fix imports - Regex to catch any variation with sup@ or abase in the middle of a path
            if (/sup@\/lib\/supabase\/auth|abase\/auth/.test(content)) {
                console.log(`Fixing Imports: ${fullPath}`);
                content = content.replace(/@\/lib\/sup@\/lib\/supabase\/auth/g, '@/lib/supabase/auth');
                content = content.replace(/@\/lib\/supabase\/sup@\/lib\/supabase\/auth/g, '@/lib/supabase/auth');
                content = content.replace(/sup@\/lib\/supabase\/auth/g, '@/lib/supabase/auth');
                content = content.replace(/@\/lib\/abase\/auth/g, '@/lib/supabase/auth');
                content = content.replace(/abase\/auth/g, '@/lib/supabase/auth');
                changed = true;
            }

            // Fix encoding
            for (const [bad, good] of Object.entries(mapping)) {
                if (content.includes(bad)) {
                    console.log(`Fixing Encoding (${bad} -> ${good}): ${fullPath}`);
                    content = content.split(bad).join(good);
                    changed = true;
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

walk(rootDir);
console.log('Sanitization Complete!');
