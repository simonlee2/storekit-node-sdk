const axios = require('axios');
const jwt = require('./jwt');

const instance = axios.create({
  baseURL: 'https://api.storekit-sandbox.itunes.apple.com/inApps/v1',
});

const getToken = () => {
  const issuer = '69a6de70-ff9b-47e3-e053-5b8c7c11a4d1';
  const bid = 'com.cardinalblue.PicCollage';
  const kid = '6R27A8XG4T';
  const privateKeyPath = 'SubscriptionKey_6R27A8XG4T.p8';
  return jwt.generateToken(issuer, bid, kid, privateKeyPath);
};

instance.defaults.headers.common.Authorization = getToken();

async function subscriptions(originalTransactionId) {
  const response = await instance.get(`/subscriptions/${originalTransactionId}`);
  return response.data;
}

async function history(originalTransactionId) {
  const response = await instance.get(`/history/${originalTransactionId}`);
  return response.data;
}

module.exports = {
  subscriptions,
  history,
};

const test = async () => {
  try {
    const data = await subscriptions('1000000459891047');
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

test();
