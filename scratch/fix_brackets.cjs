const fs = require('fs');

let content = fs.readFileSync('src/services/api.js', 'utf8');

content = content.replace("baseSize = `${displayNum} ${displayNum === 1 ? 'Pack' : 'Packs';", "baseSize = `${displayNum} ${displayNum === 1 ? 'Pack' : 'Packs'}`;");
content = content.replace("baseSize = `${displayNum} ${displayNum === 1 ? 'Set' : 'Sets';", "baseSize = `${displayNum} ${displayNum === 1 ? 'Set' : 'Sets'}`;");
content = content.replace("baseSize = `${displayNum} ${displayNum === 1 ? 'Box' : 'Boxes';", "baseSize = `${displayNum} ${displayNum === 1 ? 'Box' : 'Boxes'}`;");
content = content.replace("baseSize = `${displayNum} ${displayNum === 1 ? 'Bar' : 'Bars';", "baseSize = `${displayNum} ${displayNum === 1 ? 'Bar' : 'Bars'}`;");
content = content.replace("baseSize = `${displayNum} ${displayNum === 1 ? 'Unit' : 'Units';", "baseSize = `${displayNum} ${displayNum === 1 ? 'Unit' : 'Units'}`;");

fs.writeFileSync('src/services/api.js', content, 'utf8');
console.log('FIXED_BRACKETS_SUCCESS');
