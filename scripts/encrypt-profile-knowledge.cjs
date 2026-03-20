const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const vm = require('vm');
const crypto = require('crypto');

// Load .env.local so this works standalone without exporting env vars
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
        const match = line.match(/^([^=#][^=]*)=(.*)$/);
        if (match) process.env[match[1].trim()] = match[2].trim();
    }
}

const passphrase = process.env.PROFILE_KNOWLEDGE_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
if (!passphrase) {
    console.error('ERROR: Set PROFILE_KNOWLEDGE_ENCRYPTION_KEY or NEXTAUTH_SECRET in .env.local');
    process.exit(1);
}

// Transpile and extract PROFILE_KNOWLEDGE from the plaintext TS file
const sourcePath = path.join(__dirname, '..', 'lib', 'profile-knowledge.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

// Guard: refuse to run if the file is already the encrypted loader
if (source.includes('createDecipheriv') || source.includes('encrypted.json')) {
    console.error('ERROR: profile-knowledge.ts is already the encrypted loader. Cannot re-encrypt.');
    console.error('Restore the plaintext version first, then run this script.');
    process.exit(1);
}

const transpiled = ts.transpileModule(source, {
    compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
    },
}).outputText;

const sandbox = { exports: {}, module: { exports: {} }, require, console, Buffer, process };
vm.createContext(sandbox);
vm.runInContext(transpiled, sandbox);

const knowledge = sandbox.exports.PROFILE_KNOWLEDGE || sandbox.module.exports.PROFILE_KNOWLEDGE;
if (!Array.isArray(knowledge)) {
    throw new Error('PROFILE_KNOWLEDGE array not found in profile-knowledge.ts');
}

console.log(`Encrypting ${knowledge.length} knowledge chunks with key: ${passphrase.slice(0, 3)}***`);

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const iterations = 150000;
const key = crypto.pbkdf2Sync(passphrase, salt, iterations, 32, 'sha256');

const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const ciphertext = Buffer.concat([cipher.update(JSON.stringify(knowledge), 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();

const payload = {
    version: 'v1',
    kdf: 'pbkdf2-sha256',
    iterations,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: ciphertext.toString('base64'),
};

const outPath = path.join(__dirname, '..', 'lib', 'profile-knowledge.encrypted.json');
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log('Done → lib/profile-knowledge.encrypted.json');
