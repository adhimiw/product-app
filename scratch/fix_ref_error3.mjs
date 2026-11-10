import fs from 'fs';

let content = fs.readFileSync('src/components/ProductCard.jsx', 'utf8');

content = content.replace(
    /let packageSizeId = null;\r?\n/,
    'let packageSizeId = null;\n    let isSelectedVariantDisabled = false;\n'
);

fs.writeFileSync('src/components/ProductCard.jsx', content, 'utf8');
console.log('REGEX_DECLARATION_SUCCESS');
