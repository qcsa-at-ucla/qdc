const fs = require('fs');
const f = 'c:/qdc/src/app/qdw/2026/member-only/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/text-gray-900/g, 'text-white');
c = c.replace(/bg-gray-50/g, 'bg-white\/10');
c = c.replace(/border-gray-300/g, 'border-white\/20');
c = c.replace(/bg-gray-200 hover:bg-gray-300 text-gray-700/g, 'bg-white\/10 hover:bg-white\/20 text-gray-300');
c = c.replace(/text-gray-600/g, 'text-gray-400');

fs.writeFileSync(f, c, 'utf8');

const remaining900 = (c.match(/text-gray-900/g) || []).length;
const remaining50 = (c.match(/bg-gray-50/g) || []).length;
const remaining300 = (c.match(/border-gray-300/g) || []).length;
console.log('Done.');
console.log('Remaining text-gray-900:', remaining900);
console.log('Remaining bg-gray-50:', remaining50);
console.log('Remaining border-gray-300:', remaining300);
