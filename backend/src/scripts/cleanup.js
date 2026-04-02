import { cleanupInactiveAccounts } from '../controllers/userController.js';

console.log('Running cleanup job...');
cleanupInactiveAccounts()
  .then(result => {
    console.log(`Cleanup completed: ${result.deleted} accounts deleted, ${result.marked} accounts marked for deletion`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });