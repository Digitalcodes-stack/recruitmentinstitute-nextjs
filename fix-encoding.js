const fs = require('fs');
const { execSync } = require('child_process');

// U+201C left double quote, U+201D right double quote
// These were introduced by the previous fix run replacing straight quotes in JSX attributes.
// We need to revert curly double quotes back to straight double quotes ONLY where they
// appear as JSX/JS string delimiters (i.e. around attribute values like className="...").
// The safest fix: replace ALL U+201C and U+201D with straight double quote U+0022
// since TSX/JS source code should never contain curly double quotes as syntax.
// (Curly quotes inside string *content* should use HTML entities or just the char itself,
//  but JSX attribute syntax requires straight ASCII quotes.)

const leftCurly  = String.fromCharCode(0x201C);  // "
const rightCurly = String.fromCharCode(0x201D);  // "
const straight   = '"';

const files = execSync('git ls-files -- "*.tsx" "*.ts"', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

let total = 0;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes(leftCurly) && !content.includes(rightCurly)) continue;
  const fixed = content.split(leftCurly).join(straight).split(rightCurly).join(straight);
  fs.writeFileSync(file, fixed, 'utf8');
  total++;
  const count = (content.match(new RegExp('[' + leftCurly + rightCurly + ']', 'g')) || []).length;
  console.log('Fixed ' + count + ' curly quotes in: ' + file);
}
console.log('Done. Fixed ' + total + ' files.');
