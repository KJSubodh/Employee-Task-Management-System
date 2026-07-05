/**
 * generateToken.js
 *
 * Standalone helper to mint a JWT for manual API testing (Postman, curl,
 * etc.) using this project's JWT_SECRET / JWT_EXPIRE from .env.
 *
 * Usage:
 *   node generateToken.js
 *   node generateToken.js --id=<userId> --role=admin
 *   node generateToken.js --id=<userId> --role=employee --email=john@example.com
 *
 * Requires: npm install jsonwebtoken dotenv  (if not already installed)
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

// --- parse simple --key=value CLI args ---
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  acc[key] = value;
  return acc;
}, {});

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Make sure .env is present and dotenv can find it.');
  process.exit(1);
}

// Payload shape matches what the app's `protect` middleware expects to
// find on req.user (id + role are the fields used throughout the
// controllers/repositories - e.g. req.user.id, req.user.role).
const payload = {
  id: args.id || '00000000-0000-0000-0000-000000000000', // replace with a real user UUID from your Users table
  role: args.role || 'admin',                              // 'admin' | 'employee'
  email: args.email || 'test@example.com'
};

const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE || '7d'
});

console.log('\n✅ Token generated\n');
console.log('Payload:', payload);
console.log('\nToken:\n');
console.log(token);
console.log('\nUse it as a header:\n');
console.log(`Authorization: Bearer ${token}\n`);