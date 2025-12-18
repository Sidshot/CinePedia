import dotenv from 'dotenv';
import { spawn } from 'child_process';

console.log('\x1b[36m%s\x1b[0m', '\n🛡️  CineAmore Deployment Guardrails Initiated...');

// 1. Environment Variable Check
console.log('🔍 Checking Environment Variables...');
// Load .env.local explicitly
dotenv.config({ path: '.env.local' });

const requiredEnv = ['MONGODB_URI', 'TMDB_API_KEY', 'AUTH_SECRET'];

const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', `❌ CRITICAL: Missing environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}
console.log('\x1b[32m%s\x1b[0m', '✅ Environment OK.');

// 2. Database Invariant Audit
console.log('\n🔍 Running Database Audit (scripts/audit-db.mjs)...');

const audit = spawn('node', ['scripts/audit-db.mjs'], {
    stdio: 'inherit',
    shell: true
});

audit.on('close', (code) => {
    if (code === 0) {
        console.log('\x1b[32m%s\x1b[0m', '\n✅ Guardrails Passed. Proceeding to build...');
        process.exit(0);
    } else {
        console.error('\x1b[31m%s\x1b[0m', '\n❌ CRITICAL: Database Audit Failed. Deployment Aborted.');
        console.error('   Fix invariants before building.');
        process.exit(1);
    }
});
