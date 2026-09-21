function formatVariantSize(sizeNumber, sizeUnit) {
    if (sizeNumber === undefined || sizeNumber === null || sizeNumber === '') return '';
    const num = Number(sizeNumber);
    const displayNum = isNaN(num) ? sizeNumber : num;
    const unit = String(sizeUnit || 'g').trim().toLowerCase();

    if (unit === 'g' || unit === 'gram' || unit === 'grams') return `${displayNum}g`;
    if (unit === 'kg' || unit === 'kilo' || unit === 'kilos' || unit === 'kilogram') return `${displayNum}kg`;
    if (unit === 'ml' || unit === 'milliliter' || unit === 'milliliters') return `${displayNum}ml`;
    if (unit === 'l' || unit === 'liter' || unit === 'liters') return `${displayNum}L`;
    if (unit === 'pcs' || unit === 'pc' || unit === 'piece' || unit === 'pieces') {
        return `${displayNum} ${displayNum === 1 ? 'Pc' : 'Pcs'}`;
    }
    if (unit === 'pack' || unit === 'packs') {
        return `${displayNum} ${displayNum === 1 ? 'Pack' : 'Packs'}`;
    }
    if (unit === 'set' || unit === 'sets') {
        return `${displayNum} ${displayNum === 1 ? 'Set' : 'Sets'}`;
    }
    if (unit === 'box' || unit === 'boxes') {
        return `${displayNum} ${displayNum === 1 ? 'Box' : 'Boxes'}`;
    }
    if (unit === 'bar' || unit === 'bars') {
        return `${displayNum} ${displayNum === 1 ? 'Bar' : 'Bars'}`;
    }
    if (unit === 'unit' || unit === 'units') {
        return `${displayNum} ${displayNum === 1 ? 'Unit' : 'Units'}`;
    }
    return `${displayNum}${sizeUnit || ''}`;
}

console.log('--- Testing formatVariantSize Helper Output ---');
console.log("500, 'g'    =>", formatVariantSize(500, 'g'));
console.log("1, 'kg'     =>", formatVariantSize(1, 'kg'));
console.log("100, 'ml'   =>", formatVariantSize(100, 'ml'));
console.log("1, 'l'      =>", formatVariantSize(1, 'l'));
console.log("1, 'pcs'    =>", formatVariantSize(1, 'pcs'));
console.log("6, 'pcs'    =>", formatVariantSize(6, 'pcs'));
console.log("1, 'pack'   =>", formatVariantSize(1, 'pack'));
console.log("3, 'pack'   =>", formatVariantSize(3, 'pack'));
console.log("1, 'set'    =>", formatVariantSize(1, 'set'));
console.log("1, 'box'    =>", formatVariantSize(1, 'box'));
console.log("1, 'bar'    =>", formatVariantSize(1, 'bar'));
console.log("2, 'bar'    =>", formatVariantSize(2, 'bar'));
console.log("1, 'unit'   =>", formatVariantSize(1, 'unit'));
console.log('------------------------------------------------');
