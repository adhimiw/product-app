import fs from 'fs';

let content = fs.readFileSync('src/components/ProductCard.jsx', 'utf8');

content = content.replace(
    'let activePrice = basePrice;\n    let packageSizeId = null;',
    'let activePrice = basePrice;\n    let packageSizeId = null;\n    let isSelectedVariantDisabled = false;'
);

fs.writeFileSync('src/components/ProductCard.jsx', content, 'utf8');
console.log('DECLARED_IS_SELECTED_VARIANT_DISABLED_SUCCESS');
