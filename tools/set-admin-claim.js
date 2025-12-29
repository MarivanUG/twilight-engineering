const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const adminEmail = 'cypheruganda@gmail.com';

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Custom claim 'admin: true' set for user: ${email} (UID: ${user.uid})`);
    // Optionally revoke all refresh tokens to force the user to re-authenticate
    // This ensures the new custom claims are picked up immediately
    await admin.auth().revokeRefreshTokens(user.uid);
    console.log(`All refresh tokens revoked for user: ${email}. User must re-authenticate.`);
  } catch (error) {
    console.error(`Error setting custom claim for ${email}:`, error);
  }
}

setAdminClaim(adminEmail).then(() => {
  console.log('Admin claim script finished.');
  process.exit(0);
}).catch((err) => {
  console.error('Unhandled error in admin claim script:', err);
  process.exit(1);
});