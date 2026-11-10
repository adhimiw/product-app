const fs = require('fs');

let lines = fs.readFileSync('src/services/api.js', 'utf8').split(/\r?\n/);

let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export function formatVariantSize(')) {
        startLine = i;
    }
    if (startLine !== -1 && lines[i].includes('/**') && lines[i+1] && lines[i+1].includes('Normalize product API item')) {
        endLine = i;
        break;
    }
}

if (startLine !== -1 && endLine !== -1) {
    const newFnLines = [
        'export function formatVariantSize(sizeNumber, sizeUnit, piecesCount = null, packageSize = null) {',
        '    let baseSize = \'\';',
        '    if (sizeNumber !== undefined && sizeNumber !== null && sizeNumber !== \'\') {',
        '        const num = Number(sizeNumber);',
        '        const displayNum = isNaN(num) ? sizeNumber : num;',
        '        const unit = String(sizeUnit || \'g\').trim().toLowerCase();',
        '',
        '        if (unit === \'g\' || unit === \'gram\' || unit === \'grams\') baseSize = `${displayNum}g`;',
        '        else if (unit === \'kg\' || unit === \'kilo\' || unit === \'kilos\' || unit === \'kilogram\') baseSize = `${displayNum}kg`;',
        '        else if (unit === \'ml\' || unit === \'milliliter\' || unit === \'milliliters\') baseSize = `${displayNum}ml`;',
        '        else if (unit === \'l\' || unit === \'liter\' || unit === \'liters\') baseSize = `${displayNum}L`;',
        '        else if (unit === \'pcs\' || unit === \'pc\' || unit === \'piece\' || unit === \'pieces\') {',
        '            baseSize = `${displayNum} ${displayNum === 1 ? \'Pc\' : \'Pcs\'}`;',
        '        }',
        '        else if (unit === \'pack\' || unit === \'packs\') {',
        '            baseSize = `${displayNum} ${displayNum === 1 ? \'Pack\' : \'Packs\';',
        '        }',
        '        else if (unit === \'set\' || unit === \'sets\') {',
        '            baseSize = `${displayNum} ${displayNum === 1 ? \'Set\' : \'Sets\';',
        '        }',
        '        else if (unit === \'box\' || unit === \'boxes\') {',
        '            baseSize = `${displayNum} ${displayNum === 1 ? \'Box\' : \'Boxes\';',
        '        }',
        '        else if (unit === \'bar\' || unit === \'bars\') {',
        '            baseSize = `${displayNum} ${displayNum === 1 ? \'Bar\' : \'Bars\';',
        '        }',
        '        else if (unit === \'unit\' || unit === \'units\') {',
        '            baseSize = `${displayNum} ${displayNum === 1 ? \'Unit\' : \'Units\';',
        '        }',
        '        else {',
        '            baseSize = `${displayNum}${sizeUnit || \'\'}`;',
        '        }',
        '',
        '        if (piecesCount !== null && piecesCount !== undefined && piecesCount !== \'\' && !isNaN(Number(piecesCount)) && Number(piecesCount) > 0) {',
        '            const pcsNum = Number(piecesCount);',
        '            baseSize = `${baseSize} / ${pcsNum} ${pcsNum === 1 ? \'Pc\' : \'Pcs\'}`;',
        '        }',
        '    }',
        '',
        '    const pkgSizeStr = packageSize ? String(packageSize).trim() : \'\';',
        '    if (pkgSizeStr && baseSize) {',
        '        return `${pkgSizeStr} (${baseSize})`;',
        '    }',
        '    if (pkgSizeStr) {',
        '        return pkgSizeStr;',
        '    }',
        '    return baseSize;',
        '}',
        ''
    ];

    lines.splice(startLine, endLine - startLine, ...newFnLines);
    fs.writeFileSync('src/services/api.js', lines.join('\n'), 'utf8');
    console.log('REPLACED_FORMAT_VARIANT_SIZE_LINE_ARRAY_SUCCESS');
}
