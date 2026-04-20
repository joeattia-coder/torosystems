const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const canonicalOrigin = 'https://www.torosystems.ca';
const analyticsModuleSource = path.join(projectRoot, 'node_modules', '@vercel', 'analytics', 'dist', 'index.mjs');
const analyticsModuleTarget = path.join(projectRoot, 'assets', 'js', 'vercel-analytics.mjs');
const headerHtml = fs.readFileSync(path.join(projectRoot, 'partials', 'site-header.inc'), 'utf8').trim();
const footerHtml = fs.readFileSync(path.join(projectRoot, 'partials', 'site-footer.inc'), 'utf8').trim();
const analyticsScriptTag = '<script type="module" src="/assets/js/vercel-analytics-init.mjs"></script>';

function toPosixPath(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function toCanonicalUrl(relativePath) {
  const normalizedPath = toPosixPath(relativePath);

  if (normalizedPath === 'index.html') {
    return canonicalOrigin + '/';
  }

  return canonicalOrigin + '/' + normalizedPath;
}

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

function ensureAnalytics(html) {
  const withoutExistingTag = html.replace(/^\s*<script type="module" src="\/assets\/js\/vercel-analytics-init\.mjs"><\/script>\s*$/gm, '').trimEnd();

  if (withoutExistingTag.includes(analyticsScriptTag)) {
    return withoutExistingTag;
  }

  return withoutExistingTag.replace(/<\/body>/i, '  ' + analyticsScriptTag + '\n</body>');
}

function normalizeInternalUrl(value) {
  if (!value || /^(?:[a-z]+:|\/\/|#)/i.test(value)) {
    return value;
  }

  if (value.startsWith('/')) {
    return canonicalOrigin + value;
  }

  if (/^(?:\.\/)?index\.html(?:[?#].*)?$/i.test(value)) {
    const suffix = value.replace(/^(?:\.\/)?index\.html/i, '');
    return canonicalOrigin + '/' + suffix;
  }

  if (/^(?:\.\/)?[^/?#:]+\.html(?:[?#].*)?$/i.test(value)) {
    return canonicalOrigin + '/' + value.replace(/^\.\//, '');
  }

  return value;
}

function normalizeInternalLinks(html) {
  return html.replace(/\b(href|action)=(['"])([^'"]+)\2/gi, function (_match, attribute, quote, value) {
    return attribute + '=' + quote + normalizeInternalUrl(value) + quote;
  });
}

function normalizeCanonicalSignals(html, relativePath) {
  const canonicalUrl = toCanonicalUrl(relativePath);
  let nextHtml = html.replace(/https:\/\/torosystems\.ca/gi, canonicalOrigin);

  nextHtml = nextHtml.replace(/<link rel="canonical" href="[^"]*">/i, '<link rel="canonical" href="' + canonicalUrl + '">');
  nextHtml = nextHtml.replace(/<meta property="og:url" content="[^"]*">/i, '<meta property="og:url" content="' + canonicalUrl + '">');

  return nextHtml;
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

if (!fs.existsSync(analyticsModuleSource)) {
  throw new Error('Missing @vercel/analytics build asset. Run npm install before building.');
}

fs.copyFileSync(analyticsModuleSource, analyticsModuleTarget);

getHtmlTargets().forEach((relativePath) => {
  const absolutePath = path.join(projectRoot, relativePath);
  const originalHtml = fs.readFileSync(absolutePath, 'utf8');
  let nextHtml = originalHtml;

  nextHtml = replaceSection(nextHtml, /(^[ \t]*)<header>[\s\S]*?<\/header>/m, '<header>', '</header>', headerHtml);
  nextHtml = replaceSection(nextHtml, /(^[ \t]*)<footer class="footer">[\s\S]*?<\/footer>/m, '<footer class="footer">', '</footer>', footerHtml);
  nextHtml = normalizeCanonicalSignals(nextHtml, relativePath);
  nextHtml = normalizeInternalLinks(nextHtml);
  nextHtml = ensureAnalytics(nextHtml);

  if (nextHtml !== originalHtml) {
    fs.writeFileSync(absolutePath, nextHtml, 'utf8');
    updatedCount += 1;
  }
});

console.log('Rendered shared layout into ' + updatedCount + ' HTML files.');