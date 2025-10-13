#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting cleanup of test and unused files...\n');

// Files to delete
const filesToDelete = [
  // Root test files
  'test-otp-flow.js',
  'test-individual-bookings.js',
  'test-dashboard.js',
  'test-invoices.js',
  'test-role-fix.js',
  'test-add-credit-note.js',
  'test-env.js',
  'test-image.txt',
  
  // Temporary files
  'temp_calendar.js',
  'temp_calendar.tsx',
  
  // Debug files
  'debug-property-mapping.js',
  
  // Simple/Example files
  'simple-index.js',
  'simple-server.js',
  
  // Test files in src
  'src/test.js',
  'src/testExpenses.ts',
  'src/testGetCompanyName.ts',
  'src/test-api.http',
  'test-statement.csv',
  'test-statement.html',
  
  // Test scripts in src/scripts
  'src/scripts/testHostkitPropertyData.ts',
  'src/scripts/testPropertiesAPI.ts',
  'src/scripts/testPropertiesEndpoint.ts',
  'src/scripts/testReservationAPI.ts',
  
  // Test files in dist
  'dist/testExpenses.js',
  'dist/testGetCompanyName.js',
  'dist/routes/test.routes.js',
  'dist/routes/debug.routes.js',
  
  // Test scripts in dist/scripts
  'dist/scripts/testHostkitPropertyData.js',
  'dist/scripts/testPropertiesAPI.js',
  'dist/scripts/testPropertiesEndpoint.js',
  'dist/scripts/testReservationAPI.js',
  
  // Documentation files (optional)
  'BOOKING_ISSUES_RESOLVED.md',
  'HOSTAWAY_SETUP.md',
  'HOSTKIT_SETUP.md',
  'MONGODB_KEEP_ALIVE_GUIDE.md',
  'POSTMAN_TESTING_GUIDE.txt',
  'SEED_INSTRUCTIONS.md',
  
  // Generated statement files
  'statements/statement_392776_2025_07.csv',
  'statements/statement_392776_2025_07.pdf',
  'statements/statement_392776_2025_08.csv',
  'statements/statement_392776_2025_08.pdf',
  'statements/statement_392777_2025_07.csv',
  'statements/statement_392777_2025_07.pdf',
  'statements/statement_392778_2025_07.csv',
  'statements/statement_392778_2025_07.pdf',
  
  // Empty test files
  '../tests/backend/auth.test.ts',
  '../tests/backend/booking.test.ts',
  '../tests/backend/invoice.test.ts',
  '../tests/backend/portfolio.test.ts',
  '../tests/frontend/bookings.test.tsx',
  '../tests/frontend/dashboard.test.tsx',
  '../tests/frontend/invoices.test.tsx'
];

let deletedCount = 0;
let notFoundCount = 0;
let errorCount = 0;

filesToDelete.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
      // Check if it's a file or directory
      const stats = fs.statSync(fullPath);
      
      if (stats.isFile()) {
        fs.unlinkSync(fullPath);
        console.log(`✅ Deleted: ${filePath}`);
        deletedCount++;
      } else if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Deleted directory: ${filePath}`);
        deletedCount++;
      }
    } else {
      console.log(`⚠️  Not found: ${filePath}`);
      notFoundCount++;
    }
  } catch (error) {
    console.log(`❌ Error deleting ${filePath}: ${error.message}`);
    errorCount++;
  }
});

// Try to remove empty statements directory
try {
  const statementsDir = path.join(__dirname, 'statements');
  if (fs.existsSync(statementsDir)) {
    const files = fs.readdirSync(statementsDir);
    if (files.length === 0) {
      fs.rmdirSync(statementsDir);
      console.log('✅ Deleted empty statements directory');
    }
  }
} catch (error) {
  console.log(`⚠️  Could not remove statements directory: ${error.message}`);
}

console.log('\n📊 Cleanup Summary:');
console.log(`✅ Successfully deleted: ${deletedCount} files`);
console.log(`⚠️  Not found: ${notFoundCount} files`);
console.log(`❌ Errors: ${errorCount} files`);

if (errorCount === 0) {
  console.log('\n🎉 Cleanup completed successfully!');
  console.log('💡 Your backend is now ready for deployment.');
} else {
  console.log('\n⚠️  Cleanup completed with some errors.');
  console.log('💡 Check the errors above and delete manually if needed.');
}
