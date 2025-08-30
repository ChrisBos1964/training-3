const { execSync } = require('child_process');
const path = require('path');

async function globalSetup() {
  console.log('🔄 Running database reset before tests...');
  
  try {
    // Run reset-db.sh from the project root
    const projectRoot = path.join(__dirname, '..');
    execSync('./reset-db.sh', { 
      cwd: projectRoot, 
      stdio: 'inherit',
      shell: true 
    });
    console.log('✅ Database reset completed successfully');
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    // Don't fail the tests if reset fails, just warn
    console.warn('⚠️  Continuing with tests despite database reset failure');
  }
}

module.exports = globalSetup;
