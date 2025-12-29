This folder contains helper resources to set up Firestore rules and grant an `admin` custom claim to an admin user.

1) Deploy Firestore rules

- Install Firebase CLI (if not already):

  npm install -g firebase-tools
  firebase login

- Save `firestore.rules` (project root) and deploy:

  firebase deploy --only firestore:rules --project twilight-engineering

Replace `twilight-engineering` with your Firebase project ID if different.

2) Set `admin` custom claim for an admin user

- Download a service account JSON from Firebase Console -> Project Settings -> Service Accounts -> Generate new private key. Save as `tools/serviceAccountKey.json`.
- Run the script to set the claim (use Node >=12):

  cd tools
  npm install firebase-admin
  node set-admin-claim.js cypheruganda@gmail.com

- After setting the claim the user should sign out and sign in again (or you can revoke tokens) so the ID token contains `admin: true`.

3) Test in the app

- Remove the local dev flag if present in browser localStorage: `localStorage.removeItem('dev_admin')` and refresh.
- Sign in as admin via the Admin sign-in form (or use the PIN which now attempts real sign-in if configured).
- Try saving settings or seeding demo data — operations should succeed for admin users.

Security notes

- Only grant `admin` claims to trusted users.
- Keep `serviceAccountKey.json` private and do not commit it to source control.
- Review and tighten rules before deploying to production. The provided rules aim to be reasonable defaults for this app but may need adjustment depending on your data model and security requirements.
