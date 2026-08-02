const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const packagesRoot = path.join(projectRoot, 'packages');
const shouldFix = process.argv.includes('--fix');
const invalidExport = /\bmodule\.exports\s*=\s*new\s+ContainerModule\b/;
const defaultExport = /(?:\b(?:exports|module\.exports)\.default\s*=\s*new\s+ContainerModule\b)|(?:\bexport\s+default\s+new\s+ContainerModule\b)/;

function findPackageManifests(directory) {
    const manifests = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === 'node_modules') {
            continue;
        }

        const child = path.join(directory, entry.name);
        const manifest = path.join(child, 'package.json');
        if (fs.existsSync(manifest)) {
            manifests.push(manifest);
        } else {
            manifests.push(...findPackageManifests(child));
        }
    }
    return manifests;
}

const failures = [];
for (const manifestPath of findPackageManifests(packagesRoot)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const extension of manifest.theiaExtensions || []) {
        for (const modulePath of Object.values(extension)) {
            if (typeof modulePath !== 'string') {
                continue;
            }

            const absolutePath = path.resolve(path.dirname(manifestPath), `${modulePath}.js`);
            const relativePath = path.relative(projectRoot, absolutePath);
            if (!fs.existsSync(absolutePath)) {
                failures.push(`${relativePath}: module file does not exist`);
                continue;
            }

            let source = fs.readFileSync(absolutePath, 'utf8');
            if (shouldFix && invalidExport.test(source)) {
                source = source.replace(invalidExport, 'exports.default = new ContainerModule');
                fs.writeFileSync(absolutePath, source, 'utf8');
                console.log(`Fixed Theia default export: ${relativePath}`);
            }

            if (!defaultExport.test(source)) {
                failures.push(`${relativePath}: must default-export its ContainerModule`);
            }
        }
    }
}

if (failures.length) {
    console.error('Invalid Theia extension modules:');
    for (const failure of failures) {
        console.error(`- ${failure}`);
    }
    console.error('Run "npm run fix:theia-exports" for the supported CommonJS repair.');
    process.exitCode = 1;
} else {
    console.log('Verified Theia extension module default exports.');
}