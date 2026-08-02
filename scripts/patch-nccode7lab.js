const fs = require('fs');
const path = require('path');

const extensionRoot = path.resolve(__dirname, '..', 'node_modules', 'nccode7lab');
const providerFiles = [
  'src/BottomViewProvider.ts',
  'src/NCEditorProvider.ts',
];
const paddingReset = 'html, body { padding: 0 !important; }';
const injectionAnchor = "htmlContent = htmlContent.replace('<head>', `<head>\\n${scriptInjection}`);";
const patchedInjection = `htmlContent = htmlContent.replace('<head>', \`<head>\\n<style>${paddingReset}</style>\\n\${scriptInjection}\`);`;

for (const relativePath of providerFiles) {
  const filePath = path.join(extensionRoot, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');

  if (source.includes(paddingReset)) {
    console.log(`Already patched: ${relativePath}`);
    continue;
  }

  const anchorMatches = source.split(injectionAnchor).length - 1;
  if (anchorMatches !== 1) {
    throw new Error(
      `Cannot patch ${relativePath}: expected one webview head injection, found ${anchorMatches}.`,
    );
  }

  fs.writeFileSync(filePath, source.replace(injectionAnchor, patchedInjection), 'utf8');
  console.log(`Patched: ${relativePath}`);
}