const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('formatVariantSize') && !content.includes('function formatVariantSize')) {
        // Check if formatVariantSize is imported or defined
        const hasImport = content.includes('formatVariantSize') && (
            content.includes("import {") && content.includes("formatVariantSize")
        );
        console.log(filePath + ' contains formatVariantSize. Has import/export: ' + hasImport);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            checkFile(fullPath);
        }
    }
}

traverse('src');
