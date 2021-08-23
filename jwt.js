const jwt = require('jsonwebtoken');
const fs = require('fs');
const { randomUUID, X509Certificate } = require('crypto');

function generateToken(issuer, bid, kid, privateKeyPath) {
  const audience = 'appstoreconnect-v1';
  const algorithm = 'ES256';

  const payload = {
    iat: Math.round(Date.now() / 1000),
    nonce: randomUUID(),
    bid,
  };

  const key = fs.readFileSync(privateKeyPath);
  const options = {
    expiresIn: '30m',
    algorithm,
    audience,
    issuer,
    header: {
      kid,
    },
  };

  return jwt.sign(payload, key, options);
}

function verifyToken(token) {
  const decoded = jwt.decode(token, { complete: true });
  const base64Cert = decoded.header.x5c[0];
  const decodedCert = Buffer.from(base64Cert, 'base64');
  const cert = new X509Certificate(decodedCert);
  const verified = jwt.verify(token, cert.publicKey, { algorithms: 'ES256' });
  return verified;
}

module.exports = { generateToken, verifyToken };