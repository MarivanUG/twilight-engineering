const admin = require('firebase-admin');
const path = require('path');

async function checkRules() {
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  const serviceAccount = require(keyPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  try {
    console.log('Listing rulesets...');
    // listRulesets returns a page of rulesets
    const rulesets = await admin.securityRules().listRulesets();
    console.log(`Found ${rulesets.rulesets.length} rulesets.`);
    if (rulesets.rulesets.length > 0) {
      console.log('Latest ruleset name:', rulesets.rulesets[0].name);
      const latest = await admin.securityRules().getRuleset(rulesets.rulesets[0].name);
      console.log('Latest ruleset content snippet:', latest.source.files[0].content.substring(0, 100));
    }
  } catch (error) {
    console.error('Failed to list rulesets:', error);
  }
}

checkRules();