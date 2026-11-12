import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('firestore.rules enforces all 8 pillars and Dirty Dozen invariants', () => {
  const rules = fs.readFileSync('firestore.rules', 'utf8');

  // 1. Global Safety Net default-deny catch-all
  assert.match(rules, /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);

  // 2. Path Variable Hardening
  assert.match(rules, /function\s+isValidId\(id\)/);
  assert.match(rules, /isValidId\(adminId\)/);
  assert.match(rules, /isValidId\(otpId\)/);

  // 3. Verified email enforcement
  assert.match(rules, /request\.auth\.token\.email_verified\s*==\s*true/);

  // 4. Strict Validation Blueprints (hasAll + hasOnly)
  assert.match(rules, /function\s+isValidAdminConfig\(data\)/);
  assert.match(rules, /function\s+isValidAdminOtp\(data\)/);
  assert.match(rules, /data\.keys\(\)\.hasAll\(/);
  assert.match(rules, /data\.keys\(\)\.hasOnly\(/);

  // 5. Temporal integrity & immutability
  assert.match(rules, /incoming\(\)\.createdAt\s*==\s*request\.time/);
  assert.match(rules, /incoming\(\)\.updatedAt\s*==\s*request\.time/);
  assert.match(rules, /incoming\(\)\.ownerId\s*==\s*existing\(\)\.ownerId/);
  assert.match(rules, /incoming\(\)\.createdAt\s*==\s*existing\(\)\.createdAt/);

  // 6. Terminal state locking on AdminOtp
  assert.match(rules, /existing\(\)\.status\s*==\s*'pending'/);
});
