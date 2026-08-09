import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'fs';
import { join } from 'path';
import { inflateRawSync } from 'zlib';

const DIST_BUDGET_MB = 2;
const VSIX_BUDGET_MB = 5;
const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024;
const FRESHNESS_TOLERANCE_MS = 1_000;

const rootPath = join(import.meta.dirname, '..');
const packagePath = join(rootPath, 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const expectedVsixName = `${packageJson.name}-${packageJson.version}.vsix`;
const expectedVsixPath = join(rootPath, expectedVsixName);
const distPath = join(rootPath, 'dist', 'extension.js');
const failures = [];

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function packageArchivePath(relativePath) {
  if (typeof relativePath !== 'string' || relativePath.length === 0) {
    throw new Error('package.json contains an invalid package path');
  }

  const normalized = relativePath.replaceAll('\\', '/').replace(/^\.\//, '');
  const segments = normalized.split('/');
  if (
    normalized.startsWith('/')
    || /^[a-z]:/i.test(normalized)
    || segments.some(segment => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new Error(`package.json contains an unsafe package path: ${relativePath}`);
  }

  return `extension/${normalized}`;
}

function findEndOfCentralDirectory(archive) {
  const signature = 0x06054b50;
  const minimumOffset = Math.max(0, archive.length - 65_535 - 22);

  for (let offset = archive.length - 22; offset >= minimumOffset; offset -= 1) {
    if (archive.readUInt32LE(offset) !== signature) {
      continue;
    }

    const commentLength = archive.readUInt16LE(offset + 20);
    if (offset + 22 + commentLength === archive.length) {
      return offset;
    }
  }

  throw new Error('VSIX is not a supported ZIP archive');
}

function readZipEntries(vsixPath) {
  const archive = readFileSync(vsixPath);
  if (archive.length > MAX_ARCHIVE_BYTES) {
    throw new Error(`VSIX is too large to inspect safely (${formatMb(archive.length)})`);
  }

  const endOffset = findEndOfCentralDirectory(archive);
  const diskNumber = archive.readUInt16LE(endOffset + 4);
  const centralDirectoryDisk = archive.readUInt16LE(endOffset + 6);
  const entryCountOnDisk = archive.readUInt16LE(endOffset + 8);
  const entryCount = archive.readUInt16LE(endOffset + 10);
  const centralDirectorySize = archive.readUInt32LE(endOffset + 12);
  const centralDirectoryOffset = archive.readUInt32LE(endOffset + 16);

  if (diskNumber !== 0 || centralDirectoryDisk !== 0 || entryCountOnDisk !== entryCount) {
    throw new Error('Multi-disk VSIX archives are not supported');
  }
  if (entryCount === 0xffff || centralDirectoryOffset === 0xffffffff) {
    throw new Error('ZIP64 VSIX archives are not supported');
  }
  if (centralDirectoryOffset + centralDirectorySize > endOffset) {
    throw new Error('VSIX central directory is invalid');
  }

  const entries = [];
  let offset = centralDirectoryOffset;
  let totalUncompressedBytes = 0;

  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > archive.length || archive.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error('VSIX central directory entry is invalid');
    }

    const versionMadeBy = archive.readUInt16LE(offset + 4);
    const flags = archive.readUInt16LE(offset + 8);
    const compressionMethod = archive.readUInt16LE(offset + 10);
    const compressedSize = archive.readUInt32LE(offset + 20);
    const uncompressedSize = archive.readUInt32LE(offset + 24);
    const fileNameLength = archive.readUInt16LE(offset + 28);
    const extraFieldLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const externalAttributes = archive.readUInt32LE(offset + 38);
    const localHeaderOffset = archive.readUInt32LE(offset + 42);
    const entryEnd = offset + 46 + fileNameLength + extraFieldLength + commentLength;

    if (entryEnd > archive.length) {
      throw new Error('VSIX central directory entry extends beyond the archive');
    }
    if ((flags & 0x1) !== 0) {
      throw new Error('Encrypted VSIX entries are not supported');
    }

    const name = archive.subarray(offset + 46, offset + 46 + fileNameLength).toString('utf8');
    const unixMode = externalAttributes >>> 16;
    const madeByUnix = (versionMadeBy >>> 8) === 3;
    const isSymlink = madeByUnix && (unixMode & 0o170000) === 0o120000;

    totalUncompressedBytes += uncompressedSize;
    if (totalUncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
      throw new Error('VSIX uncompressed content is too large to inspect safely');
    }

    entries.push({
      archive,
      compressedSize,
      compressionMethod,
      isSymlink,
      localHeaderOffset,
      name,
      uncompressedSize,
    });
    offset = entryEnd;
  }

  if (offset !== centralDirectoryOffset + centralDirectorySize) {
    throw new Error('VSIX central directory size does not match its entries');
  }

  return entries;
}

function extractZipEntry(entry) {
  const { archive, compressedSize, compressionMethod, localHeaderOffset, uncompressedSize } = entry;
  if (
    localHeaderOffset + 30 > archive.length
    || archive.readUInt32LE(localHeaderOffset) !== 0x04034b50
  ) {
    throw new Error(`VSIX local header is invalid for ${entry.name}`);
  }

  const fileNameLength = archive.readUInt16LE(localHeaderOffset + 26);
  const extraFieldLength = archive.readUInt16LE(localHeaderOffset + 28);
  const dataOffset = localHeaderOffset + 30 + fileNameLength + extraFieldLength;
  const dataEnd = dataOffset + compressedSize;
  if (dataEnd > archive.length) {
    throw new Error(`VSIX entry data extends beyond the archive: ${entry.name}`);
  }

  const localName = archive
    .subarray(localHeaderOffset + 30, localHeaderOffset + 30 + fileNameLength)
    .toString('utf8');
  if (localName !== entry.name) {
    throw new Error(`VSIX local and central paths do not match: ${entry.name}`);
  }

  const compressed = archive.subarray(dataOffset, dataEnd);
  let content;
  if (compressionMethod === 0) {
    content = compressed;
  } else if (compressionMethod === 8) {
    content = inflateRawSync(compressed);
  } else {
    throw new Error(`Unsupported VSIX compression method ${compressionMethod}: ${entry.name}`);
  }

  if (content.length !== uncompressedSize) {
    throw new Error(`VSIX entry size mismatch: ${entry.name}`);
  }
  return content;
}

function validateArchive(entries) {
  const allowedFiles = new Set([
    '[content_types].xml',
    'extension.vsixmanifest',
    'extension/package.json',
    'extension/readme.md',
    'extension/changelog.md',
    'extension/license.txt',
    'extension/notice',
  ]);
  const allowedPayloads = [
    ['extension/assets/', /\.(?:png|svg)$/],
    ['extension/dist/', /\.(?:cjs|css|js|md)$/],
  ];
  const forbiddenSegments = new Set([
    'benchmarks',
    'comment',
    'skills',
    'summary',
    'teamagent',
    'test-results',
  ]);
  const entriesByLowercaseName = new Map();
  const archiveFailures = [];

  for (const entry of entries) {
    const { name } = entry;
    const segments = name.split('/');
    const lowercaseName = name.toLowerCase();
    const lowercaseSegments = lowercaseName.split('/');
    const fileName = lowercaseSegments.at(-1) ?? '';
    const isDirectory = name.endsWith('/');
    const pathSegments = isDirectory ? segments.slice(0, -1) : segments;

    if (
      name.length === 0
      || name.includes('\\')
      || name.includes('\0')
      || name.startsWith('/')
      || /^[a-z]:/i.test(name)
      || pathSegments.some(segment => segment === '' || segment === '.' || segment === '..')
    ) {
      archiveFailures.push(`unsafe archive path: ${name || '<empty>'}`);
      continue;
    }
    if (entry.isSymlink) {
      archiveFailures.push(`symbolic links are not allowed: ${name}`);
      continue;
    }
    if (lowercaseSegments.some(segment => forbiddenSegments.has(segment))) {
      archiveFailures.push(`private development path is not allowed: ${name}`);
      continue;
    }
    if (
      /^\.env(?:\..*)?$/.test(fileName)
      || /\.(?:key|p12|pem|pfx)$/.test(fileName)
      || fileName === 'id_ed25519'
      || fileName === 'id_rsa'
    ) {
      archiveFailures.push(`environment or secret file is not allowed: ${name}`);
      continue;
    }

    const isAllowedPayload = allowedPayloads.some(([prefix, extensionPattern]) => (
      lowercaseName.startsWith(prefix) && (isDirectory || extensionPattern.test(lowercaseName))
    ));
    const isAllowed = allowedFiles.has(lowercaseName)
      || isAllowedPayload
      || (isDirectory && lowercaseName === 'extension/');
    if (!isAllowed) {
      archiveFailures.push(`archive path is outside the release allowlist: ${name}`);
      continue;
    }
    if (entriesByLowercaseName.has(lowercaseName)) {
      archiveFailures.push(`duplicate archive path: ${name}`);
      continue;
    }

    entriesByLowercaseName.set(lowercaseName, entry);
  }

  const requiredFiles = [
    '[content_types].xml',
    'extension.vsixmanifest',
    'extension/package.json',
    'extension/readme.md',
    'extension/changelog.md',
    'extension/license.txt',
    'extension/notice',
  ];
  for (const requiredFile of requiredFiles) {
    if (!entriesByLowercaseName.has(requiredFile)) {
      archiveFailures.push(`required archive path is missing: ${requiredFile}`);
    }
  }

  let mainArchivePath;
  let iconArchivePath;
  try {
    mainArchivePath = packageArchivePath(packageJson.main).toLowerCase();
    if (packageJson.icon) {
      iconArchivePath = packageArchivePath(packageJson.icon).toLowerCase();
    }
  } catch (error) {
    archiveFailures.push(error.message);
  }

  if (mainArchivePath && !entriesByLowercaseName.has(mainArchivePath)) {
    archiveFailures.push(`packaged extension entry point is missing: ${mainArchivePath}`);
  }
  if (iconArchivePath && !entriesByLowercaseName.has(iconArchivePath)) {
    archiveFailures.push(`packaged extension icon is missing: ${iconArchivePath}`);
  }

  const embeddedPackageEntry = entriesByLowercaseName.get('extension/package.json');
  if (embeddedPackageEntry) {
    try {
      const embeddedPackage = JSON.parse(extractZipEntry(embeddedPackageEntry).toString('utf8'));
      for (const field of ['name', 'version', 'publisher', 'main']) {
        if (embeddedPackage[field] !== packageJson[field]) {
          archiveFailures.push(`packaged package.json ${field} does not match the workspace`);
        }
      }
    } catch (error) {
      archiveFailures.push(`could not validate packaged package.json: ${error.message}`);
    }
  }

  const embeddedMainEntry = mainArchivePath
    ? entriesByLowercaseName.get(mainArchivePath)
    : undefined;
  if (embeddedMainEntry && existsSync(distPath)) {
    try {
      const embeddedMain = extractZipEntry(embeddedMainEntry);
      const workspaceMain = readFileSync(distPath);
      if (!embeddedMain.equals(workspaceMain)) {
        archiveFailures.push('packaged extension entry point does not match dist/extension.js');
      }
    } catch (error) {
      archiveFailures.push(`could not validate packaged extension entry point: ${error.message}`);
    }
  }

  return archiveFailures;
}

function newestMtime(targetPath) {
  if (!existsSync(targetPath)) {
    return 0;
  }

  const targetStat = lstatSync(targetPath);
  if (!targetStat.isDirectory()) {
    return targetStat.mtimeMs;
  }

  let newest = targetStat.mtimeMs;
  for (const child of readdirSync(targetPath)) {
    newest = Math.max(newest, newestMtime(join(targetPath, child)));
  }
  return newest;
}

if (!existsSync(distPath)) {
  failures.push('dist/extension.js is missing; run npm run package first');
} else {
  const distSize = statSync(distPath).size;
  console.log(`dist/extension.js: ${formatMb(distSize)}`);
  if (distSize > DIST_BUDGET_MB * 1024 * 1024) {
    failures.push(`dist/extension.js exceeds the ${DIST_BUDGET_MB} MB budget`);
  }
}

const rootVsixFiles = readdirSync(rootPath)
  .filter(fileName => fileName.toLowerCase().endsWith('.vsix'))
  .sort();
if (!rootVsixFiles.includes(expectedVsixName)) {
  failures.push(`expected VSIX is missing: ${expectedVsixName}`);
}

const staleVsixFiles = rootVsixFiles.filter(fileName => fileName !== expectedVsixName);
if (staleVsixFiles.length > 0) {
  failures.push(`stale or unexpected VSIX artifacts found: ${staleVsixFiles.join(', ')}`);
}

if (existsSync(expectedVsixPath)) {
  const vsixStat = statSync(expectedVsixPath);
  console.log(`${expectedVsixName}: ${formatMb(vsixStat.size)}`);
  if (vsixStat.size > VSIX_BUDGET_MB * 1024 * 1024) {
    failures.push(`${expectedVsixName} exceeds the ${VSIX_BUDGET_MB} MB budget`);
  }

  try {
    const entries = readZipEntries(expectedVsixPath);
    failures.push(...validateArchive(entries));
    console.log(`VSIX archive inspected: ${entries.length} entries`);
  } catch (error) {
    failures.push(`could not inspect ${expectedVsixName}: ${error.message}`);
  }

  const packagingInputs = [
    '.vscodeignore',
    'CHANGELOG.md',
    'LICENSE',
    'NOTICE',
    'README.extension.md',
    'assets',
    'dist',
    'package.json',
    'scripts/package-readme-swap.mjs',
  ];
  const newestInputMtime = Math.max(
    ...packagingInputs.map(input => newestMtime(join(rootPath, input))),
  );
  if (vsixStat.mtimeMs + FRESHNESS_TOLERANCE_MS < newestInputMtime) {
    failures.push(`${expectedVsixName} is older than its packaging inputs; rebuild it`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`ERROR: ${failure}`);
  }
  process.exit(1);
}

console.log(`VSIX size, freshness, and content checks passed: ${expectedVsixName}`);
