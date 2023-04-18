const axios = require('axios');
const jp = require('jsonpath');
const jwt = require('./util/jwt');

function StoreKit(config) {
  this.baseURL = config.baseURL || 'https://api.storekit-sandbox.itunes.apple.com/inApps/v1';
  this.issuer = config.issuer;
  this.bid = config.bid;
  this.kid = config.kid;
  this.privateKey = config.privateKey;

  this.axios = axios.create({ baseURL: this.baseURL });
  this.updateToken();
}

StoreKit.prototype.updateToken = function updateToken() {
  const token = jwt.generateToken(this.issuer, this.bid, this.kid, this.privateKey);
  this.axios.defaults.headers.common.Authorization = token;
};

StoreKit.prototype.subscriptions = async function subscriptions(originalTransactionId) {
  if (originalTransactionId === undefined) {
    return undefined;
  }

  const response = await this.axios.get(`/subscriptions/${originalTransactionId}`);
  jp.apply(response, '$.data.data[*].lastTransactions[*].signedTransactionInfo', (value) => jwt.verifyToken(value));
  jp.apply(response, '$.data.data[*].lastTransactions[*].signedRenewalInfo', (value) => jwt.verifyToken(value));
  return response.data;
};

StoreKit.prototype.history = async function history(originalTransactionId) {
  let history = await this.paginatedHistory(originalTransactionId);
    let hasMore = history.hasMore;
    let revision = history.revision;
    console.log(`Fetched initial ${history.signedTransactions.length} transactions. Revision: ${revision}`);

    while (hasMore) {
        const response = await this.paginatedHistory(originalTransactionId, revision);
        console.log(`Fetched ${response.signedTransactions.length} more transactions. Revision: ${response.revision}`);
        hasMore = response.hasMore;
        revision = response.revision;
        history.signedTransactions = history.signedTransactions.concat(response.signedTransactions);
    }

    return history;
}

StoreKit.prototype.paginatedHistory = async function paginatedHistory(originalTransactionId, revision) {
  if (originalTransactionId === undefined) {
    return undefined;
  }

  // set url based on wheter revision is provided
  const url = revision === undefined ? `/history/${originalTransactionId}` : `/history/${originalTransactionId}?revision=${revision}`;
  const response = await this.axios.get(url);
  jp.apply(response, '$.data.signedTransactions[*]', (value) => jwt.verifyToken(value));
  return response.data;
};

StoreKit.prototype.invoice = async function invoice(orderId) {
  if (orderId === undefined) {
    return undefined;
  }

  const response = await this.axios.get(`/lookup/${orderId}`);
  jp.apply(response, '$.data.signedTransactions[*]', (value) => jwt.verifyToken(value));
  return response.data;
};

StoreKit.prototype.decodeNotification = function decodeNotification(signedPayload) {
  const decodedPayload = jwt.verifyToken(signedPayload);
  jp.apply(decodedPayload, '$.data.signedTransactionInfo', (signedTransactionInfo) => jwt.verifyToken(signedTransactionInfo));
  jp.apply(decodedPayload, '$.data.signedRenewalInfo', (signedRenewalInfo) => jwt.verifyToken(signedRenewalInfo));
  return decodedPayload;
};

module.exports = StoreKit;
