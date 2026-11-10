import fs from 'fs';

let content = fs.readFileSync('src/components/ProductCard.jsx', 'utf8');

content = content.replace(
    'let packageSizeId = null;\n    let currentBadge = \'\';',
    'let packageSizeId = null;\n    let isSelectedVariantDisabled = false;\n    let currentBadge = \'\';'
);

fs.writeFileSync('src/components/ProductCard.jsx', content, 'utf8');
console.log('REPLACED_DECLARATION_SUCCESS');
