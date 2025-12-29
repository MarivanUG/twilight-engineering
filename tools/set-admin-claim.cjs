// Usage: node set-admin-claim.cjs <email>
// Requires: a Firebase service account JSON file named serviceAccountKey.json placed in the same folder.

const admin = require('firebase-admin');
const path = require('path');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node set-admin-claim.cjs <email>');
    process.exit(2);
  }

  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  let serviceAccount;
  try {
    serviceAccount = require(keyPath);
  } catch (err) {
    console.error('Could not load serviceAccountKey.json. Download it from Firebase Console -> Project Settings -> Service accounts');
    process.exit(1);
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log('Admin claim set for', email);
    console.log('You may need to ask the user to sign out and sign in again to refresh their ID token.');
    process.exit(0);
  } catch (err) {
    console.error('Error setting admin claim:', err);
    process.exit(1);
  }
}

main();
