// tools/verify-firestore-deploy.cjs
// Usage: node verify-firestore-deploy.cjs <admin-email>
// Requirements:
// - Node 18+ (for fetch available globally)
// - tools/serviceAccountKey.json present (service account with roles: Firestore Admin, Firebase Admin)
// - src/lib/firebase.ts present so script can extract API key and projectId

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

async function readFirebaseConfig() {
  const file = path.join(__dirname, '..', 'src', 'lib', 'firebase.ts');
  const txt = fs.readFileSync(file, 'utf8');
  const apiKeyMatch = txt.match(/apiKey:\s*"([^"]+)"/);
  const projectIdMatch = txt.match(/projectId:\s*"([^"]+)"/);
  if (!apiKeyMatch || !projectIdMatch) throw new Error('Could not parse apiKey/projectId from src/lib/firebase.ts');
  return { apiKey: apiKeyMatch[1], projectId: projectIdMatch[1] };
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node verify-firestore-deploy.cjs <admin-email>');
    process.exit(2);
  }

  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  if (!fs.existsSync(keyPath)) {
    console.error('Missing tools/serviceAccountKey.json - download from Firebase console and save there');
    process.exit(1);
  }

  const serviceAccount = require(keyPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  const { apiKey, projectId } = await readFirebaseConfig();
  console.log('Project ID:', projectId);

  try {
    const user = await admin.auth().getUserByEmail(email);
    console.log('Found user:', user.uid);

    console.log('Setting custom claim { admin: true } for user...');
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log('Custom claim set. Note: the user should sign out and sign in again to refresh their ID token.');

    console.log('Creating custom token for user (including admin claim)...');
    const customToken = await admin.auth().createCustomToken(user.uid, { admin: true });

    console.log('Exchanging custom token for ID token using Identity Toolkit REST API...');
    const exchangeUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
    const res1 = await fetch(exchangeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    });
    const json1 = await res1.json();
    if (!json1.idToken) {
      console.error('Failed to exchange custom token:', json1);
      process.exit(1);
    }
    const idToken = json1.idToken;
    console.log('Obtained ID token for user. It should include custom claims now.');

    // Test a read to settings/site
    const docPath = `projects/${projectId}/databases/(default)/documents/settings/site`;
    const readUrl = `https://firestore.googleapis.com/v1/${docPath}`;
    console.log('Attempting read of settings/site...');
    const r1 = await fetch(readUrl, { headers: { Authorization: `Bearer ${idToken}` } });
    const readText = await r1.text();
    console.log('Read status:', r1.status);
    console.log(readText);

    // Attempt a merge write (PATCH) to settings/site with a small test field
    console.log('Attempting write (merge) to settings/site...');
    const writeUrl = `${readUrl}?updateMask.fieldPaths=verify_deploy`;
    const writeBody = {
      fields: {
        verify_deploy: { stringValue: `deployed-check-${Date.now()}` }
      }
    };
    const r2 = await fetch(writeUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(writeBody)
    });
    const writeText = await r2.text();
    console.log('Write status:', r2.status);
    console.log(writeText);

    if (r1.status === 200 && (r2.status === 200 || r2.status === 201)) {
      console.log('\nVerification succeeded: rules allow admin read & write.');
      process.exit(0);
    } else {
      console.warn('\nVerification indicates rules prevented some actions. See above responses.');
      process.exit(2);
    }

  } catch (err) {
    console.error('Verification failed', err);
    process.exit(1);
  }
}

main();
