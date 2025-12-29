const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function deployRules() {
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  const rulesPath = path.join(__dirname, '../firestore.rules');

  if (!fs.existsSync(keyPath)) {
    console.error('Error: serviceAccountKey.json not found in tools/');
    process.exit(1);
  }

  if (!fs.existsSync(rulesPath)) {
    console.error('Error: firestore.rules not found in project root');
    process.exit(1);
  }

  const serviceAccount = require(keyPath);
  
  // Minimal test rule
  const rulesContent = `service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  console.log('Initializing Firebase Admin...');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  try {
    console.log('Creating new ruleset...');
    const ruleset = await admin.securityRules().createRuleset({
      source: {
        files: [{
          name: 'firestore.rules',
          content: rulesContent
        }]
      }
    });

    console.log(`Ruleset created: ${ruleset.name}`);
    console.log('Releasing ruleset to cloud.firestore...');
    
    await admin.securityRules().releaseFirestoreRuleset(ruleset.name);
    
    console.log('Successfully deployed Firestore rules!');
  } catch (error) {
    console.error('Failed to deploy rules:', error);
    process.exit(1);
  }
}

deployRules();