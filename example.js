/* eslint-disable no-console */
const StoreKit = require('./storekit');

(async () => {
  const store = new StoreKit({
    baseURL: 'https://api.storekit-sandbox.itunes.apple.com/inApps/v1',
    issuer: '69a6de70-ff9b-47e3-e053-5b8c7c11a4d1',
    bid: 'com.cardinalblue.PicCollage',
    kid: '6R27A8XG4T',
    privateKeyPath: 'SubscriptionKey_6R27A8XG4T.p8',
  });

  const subscriptions = await store.subscriptions(1000000459891047);
  const history = await store.history(1000000459891047);
  console.log(subscriptions);
  console.log(history);
})();

module.exports = {
  StoreKit,
};
