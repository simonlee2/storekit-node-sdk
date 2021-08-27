/* eslint-disable no-console */
const fs = require('fs');
const StoreKit = require('./storekit');

(async () => {
  const key = fs.readFileSync('SubscriptionKey_6R27A8XG4T.p8');
  const store = new StoreKit({
    baseURL: 'https://api.storekit-sandbox.itunes.apple.com/inApps/v1',
    issuer: '69a6de70-ff9b-47e3-e053-5b8c7c11a4d1',
    bid: 'com.cardinalblue.PicCollage',
    kid: '6R27A8XG4T',
    privateKey: key,
  });

  const subscriptions = await store.subscriptions(1000000459891047);
  const history = await store.history(1000000459891047);
  console.log(subscriptions);
  console.log(history);
})();

module.exports = {
  StoreKit,
};
