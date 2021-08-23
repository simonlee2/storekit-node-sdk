const axios = require('axios');
const jp = require('jsonpath');
const jwt = require('./jwt');

function StoreKit(config) {
  this.baseURL = config.baseURL || 'https://api.storekit-sandbox.itunes.apple.com/inApps/v1';
  this.issuer = config.issuer;
  this.bid = config.bid;
  this.kid = config.kid;
  this.privateKeyPath = config.privateKeyPath;

  this.axios = axios.create({ baseURL: this.baseURL });
  this.updateToken();
}

StoreKit.prototype.updateToken = function updateToken() {
  const token = jwt.generateToken(this.issuer, this.bid, this.kid, this.privateKeyPath);
  this.axios.defaults.headers.common.Authorization = token;
};

StoreKit.prototype.processSubscriptionResponse = function processSubscriptionResponse(response) {
  jp.apply(response, '$.data.data[*].lastTransactions[*].signedTransactionInfo', (value) => jwt.verifyToken(value));
  jp.apply(response, '$.data.data[*].lastTransactions[*].signedRenewalInfo', (value) => jwt.verifyToken(value));
  return response.data;
};

StoreKit.prototype.processHistoryResponse = function processHistoryResponse(response) {
  jp.apply(response, '$.data.signedTransactions[*]', (value) => jwt.verifyToken(value));
  return response.data;
};

StoreKit.prototype.subscriptions = async function subscriptions(originalTransactionId) {
  if (originalTransactionId === undefined) {
    return undefined;
  }

  const response = await this.axios.get(`/subscriptions/${originalTransactionId}`);
  return this.processSubscriptionResponse(response);
};

StoreKit.prototype.history = async function history(originalTransactionId) {
  if (originalTransactionId === undefined) {
    return undefined;
  }

  const response = await this.axios.get(`/history/${originalTransactionId}`);
  return this.processHistoryResponse(response);
};

module.exports = StoreKit;
