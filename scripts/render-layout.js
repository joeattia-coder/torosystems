const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const headerHtml = fs.readFileSync(path.join(projectRoot, 'partials', 'site-header.inc'), 'utf8').trim();
const footerHtml = fs.readFileSync(path.join(projectRoot, 'partials', 'site-footer.inc'), 'utf8').trim();

function indentBlock(block, indent) {
  return block
    .split(/\r?\n/)
    .map((line) => (line ? indent + line : line))
    .join('\n');
}

function replaceSection(html, pattern, openTag, closeTag, block) {
  return html.replace(pattern, function (_match, indent) {
    return [
      indent + openTag,
      indentBlock(block, indent + '  '),
      indent + closeTag
    ].join('\n');
  });
}

function getHtmlTargets() {
  const targets = [];
  const rootEntries = fs.readdirSync(projectRoot, { withFileTypes: true });

  rootEntries.forEach((entry) => {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      targets.push(entry.name);
    }
  });

  const tempDir = path.join(projectRoot, 'Temp');

  if (fs.existsSync(tempDir)) {
    fs.readdirSync(tempDir, { withFileTypes: true }).forEach((entry) => {
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        targets.push(path.join('Temp', entry.name));
      }
    });
  }

  return targets;
}

let updatedCount = 0;

getHtmlTargets().forEach((relativePath) => {
  const absolutePath = path.join(projectRoot, relativePath);
  const originalHtml = fs.readFileSync(absolutePath, 'utf8');
  let nextHtml = originalHtml;

  nextHtml = replaceSection(nextHtml, /(^[ \t]*)<header>[\s\S]*?<\/header>/m, '<header>', '</header>', headerHtml);
  nextHtml = replaceSection(nextHtml, /(^[ \t]*)<footer class="footer">[\s\S]*?<\/footer>/m, '<footer class="footer">', '</footer>', footerHtml);

  if (nextHtml !== originalHtml) {
    fs.writeFileSync(absolutePath, nextHtml, 'utf8');
    updatedCount += 1;
  }
});

console.log('Rendered shared layout into ' + updatedCount + ' HTML files.');