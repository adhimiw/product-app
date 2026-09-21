import { formatVariantSize } from '../src/services/api.js';

console.log('--- Testing formatVariantSize Helper ---');
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
console.log('-----------------------------------------');
