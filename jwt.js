const jwt = require('jsonwebtoken');
const { randomUUID, X509Certificate } = require('crypto');

function generateToken(issuer, bid, kid, privateKey) {
  const audience = 'appstoreconnect-v1';
  const algorithm = 'ES256';

  const payload = {
    iat: Math.round(Date.now() / 1000),
    nonce: randomUUID(),
    bid,
  };

  const options = {
    expiresIn: '30m',
    algorithm,
    audience,
    issuer,
    header: {
      kid,
    },
  };

  return jwt.sign(payload, privateKey, options);
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
