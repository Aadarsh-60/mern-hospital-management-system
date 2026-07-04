import crypto from 'crypto';

// Generates a random hex token + its SHA256 hash
// Store the HASH in DB, send the RAW token to user
const generateCryptoToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

export default generateCryptoToken;
