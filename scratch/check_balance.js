const fs = require('fs');
const p = 'src/app/community/page.tsx';
const s = fs.readFileSync(p, 'utf8');
const pairs = [['(',')'], ['{','}'], ['[',']']];
for (const [o,c] of pairs) {
  const oCount = s.split(o).length - 1;
  const cCount = s.split(c).length - 1;
  console.log(`${o} open: ${oCount} close: ${cCount}`);
}
