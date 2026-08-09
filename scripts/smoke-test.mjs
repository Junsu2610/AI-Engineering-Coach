#!/usr/bin/env node
/**
 * Pre-publish smoke test for the generated extension bundle and manifest.
 */
import { execFileSync, execSync } from 'child_process';
import { existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, '..');
const skipBuild = process.argv.includes('--skip-build');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (skipBuild) {
  console.log('Using existing extension build...');
} else {
  console.log('Building extension...');
  execSync('npm run build', { cwd: root, stdio: 'inherit' });
}

const distPath = join(root, 'dist', 'extension.js');
if (!existsSync(distPath)) {
  fail('dist/extension.js not found');
}

const bundle = readFileSync(distPath, 'utf8');
console.log(`dist/extension.js exists (${(statSync(distPath).size / 1024).toFixed(0)} KB)`);

// Syntax-checking does not execute the bundle or resolve its external vscode module.
try {
  execFileSync(process.execPath, ['--check', distPath], { cwd: root, stdio: 'inherit' });
} catch (error) {
  fail(`dist/extension.js failed syntax validation: ${error.message}`);
}

const bundleChecks = [
  ['CommonJS module export', /module\.exports\s*=/],
  ['activate() export', /activate\s*:\s*\(\)\s*=>\s*activate/],
  ['external vscode dependency', /require\(['\"]vscode['\"]\)/],
];
for (const [label, pattern] of bundleChecks) {
  if (!pattern.test(bundle)) {
    fail(`missing ${label} in dist/extension.js`);
  }
  console.log(`${label} present`);
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if (!pkg.name || !pkg.version || !pkg.main) {
  fail('package.json missing required fields');
}
if (!existsSync(join(root, pkg.main))) {
  fail(`package.json main does not exist: ${pkg.main}`);
}
console.log(`package.json valid: ${pkg.name}@${pkg.version}`);

if (!pkg.contributes?.commands?.length) {
  fail('no commands registered');
}
console.log(`${pkg.contributes.commands.length} commands registered`);

if (!pkg.activationEvents?.length) {
  fail('no activation events configured');
}
console.log(`${pkg.activationEvents.length} activation events configured`);

console.log('Smoke test passed.');
