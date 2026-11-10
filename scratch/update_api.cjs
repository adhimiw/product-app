const fs = require('fs');

let content = fs.readFileSync('src/services/api.js', 'utf8');

const oldFnStart = "export function formatVariantSize(";
const idxStart = content.indexOf(oldFnStart);

if (idxStart !== -1) {
    const idxEnd = content.indexOf("/**\n * Normalize product API item", idxStart);
    
    const newFn = `export function formatVariantSize(sizeNumber, sizeUnit, piecesCount = null, packageSize = null) {
    let baseSize = '';
    if (sizeNumber !== undefined && sizeNumber !== null && sizeNumber !== '') {
        const num = Number(sizeNumber);
        const displayNum = isNaN(num) ? sizeNumber : num;
        const unit = String(sizeUnit || 'g').trim().toLowerCase();

        if (unit === 'g' || unit === 'gram' || unit === 'grams') baseSize = \`\${displayNum}g\`;
        else if (unit === 'kg' || unit === 'kilo' || unit === 'kilos' || unit === 'kilogram') baseSize = \`\${displayNum}kg\`;
        else if (unit === 'ml' || unit === 'milliliter' || unit === 'milliliters') baseSize = \`\${displayNum}ml\`;
        else if (unit === 'l' || unit === 'liter' || unit === 'liters') baseSize = \`\${displayNum}L\`;
        else if (unit === 'pcs' || unit === 'pc' || unit === 'piece' || unit === 'pieces') {
            baseSize = \`\${displayNum} \${displayNum === 1 ? 'Pc' : 'Pcs'}\`;
        }
        else if (unit === 'pack' || unit === 'packs') {
            baseSize = \`\${displayNum} \${displayNum === 1 ? 'Pack' : 'Packs'}\`;
        }
        else if (unit === 'set' || unit === 'sets') {
            baseSize = \`\${displayNum} \${displayNum === 1 ? 'Set' : 'Sets'}\`;
        }
        else if (unit === 'box' || unit === 'boxes') {
            baseSize = \`\${displayNum} \${displayNum === 1 ? 'Box' : 'Boxes'}\`;
        }
        else if (unit === 'bar' || unit === 'bars') {
            baseSize = \`\${displayNum} \${displayNum === 1 ? 'Bar' : 'Bars'}\`;
        }
        else if (unit === 'unit' || unit === 'units') {
            baseSize = \`\${displayNum} \${displayNum === 1 ? 'Unit' : 'Units'}\`;
        }
        else {
            baseSize = \`\${displayNum}\${sizeUnit || ''}\`;
        }

        if (piecesCount !== null && piecesCount !== undefined && piecesCount !== '' && !isNaN(Number(piecesCount)) && Number(piecesCount) > 0) {
            const pcsNum = Number(piecesCount);
            baseSize = \`\${baseSize} / \${pcsNum} \${pcsNum === 1 ? 'Pc' : 'Pcs'}\`;
        }
    }

    const pkgSizeStr = packageSize ? String(packageSize).trim() : '';
    if (pkgSizeStr && baseSize) {
        return \`\${pkgSizeStr} (\${baseSize})\`;
    }
    if (pkgSizeStr) {
        return pkgSizeStr;
    }
    return baseSize;
}

`;

    content = content.slice(0, idxStart) + newFn + content.slice(idxEnd);
}

content = content.replace(
    /pieces_count: ps\.pieces_count !== undefined && ps\.pieces_count !== null && ps\.pieces_count !== '' \? Number\(ps\.pieces_count\) : null,/g,
    `pieces_count: ps.pieces_count !== undefined && ps.pieces_count !== null && ps.pieces_count !== '' ? Number(ps.pieces_count) : null,
        package_size: ps.package_size || '',
        status: ps.status !== undefined && ps.status !== null ? Number(ps.status) : (ps.is_active !== undefined ? (ps.is_active ? 1 : 0) : 1),
        is_disabled: (ps.status === 0 || ps.status === '0' || ps.is_disabled === true || ps.is_active === false),`
);

fs.writeFileSync('src/services/api.js', content, 'utf8');
console.log('SUCCESSFULLY_UPDATED_API_JS');
