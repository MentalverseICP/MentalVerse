// Simple test runner for integration tests
const { runIntegrationTests } = require('./src/tests/integration.test.ts');

// Run the tests
runIntegrationTests()
  .then((success) => {
    if (success) {
      console.log('\n🎉 All tests completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Test runner error:', error);
    process.exit(1);
  });