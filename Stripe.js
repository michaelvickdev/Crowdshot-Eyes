const config = {
  apiKey: 'AIzaSyBjumJLkClQJxnpRNjNRRw9yPVkrwgYUbs',
  authDomain: 'crowdshot-11ce3.firebaseapp.com',
  databaseURL: 'https://crowdshot-11ce3.firebaseio.com',
  storageBucket: 'crowdshot-11ce3.appspot.com',
  messagingSenderId: '580889623356'
};
const StripePrivateAPI = 'sk_test_ZajBLN6RSgJ3JJr4TNrQZadF';

// start database
const fetch = require('node-fetch');
const Base64 = require('base-64');
const firebase = require('firebase');
const Firebase = firebase.initializeApp(config);
const Database = firebase.database();
firebase.auth().signInWithEmailAndPassword(
  'server@crowdshot.com',
  'GrayHatesLemonade'
).catch(error => {
  console.log(error);
}).then(() => {

  // add Stripe customers to new profiles
  console.log('Starting New User Listener..');
  Database.ref('profiles').on('child_added', data => {
    let user = data.val();

    // add Stripe customer if newly created
    if (!user.stripeCustomerId) {
      console.log(`New User found: ${
        user.displayName
      }; Provisioning Stripe Customer..`);
      let customer = {
        description: user.displayName,
        email: user.email
      };
      fetch(
        'https://api.stripe.com/v1/customers',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${
              Base64.encode(`${StripePrivateAPI}:`)
            }`
          },
          body: Object.keys(customer).map(
            key => `${encodeURIComponent(key)}=${
              encodeURIComponent(customer[key])
            }`
          ).join('&')
        }
      ).then(response => {
        return response.json();
      }).then(json => {
        if (!json.error) {
          Database.ref(
            `profiles/${data.key}/stripeCustomerId`
          ).set(json.id);
        }
      });
    }
  })

  // add billing tokens to Stripe customers
  console.log('Starting New Card Listener..');
  Database.ref('billing').on('child_added', data => {
    let token = data.val();

    // convert token into card if inactive (newly added)
    if (!token.active) {
      console.log(`New Card found: ${token.stripeToken}`);
      fetch(
        `https://api.stripe.com/v1/customers/${
          token.stripeCustomerId
        }/sources`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${
              Base64.encode(`${StripePrivateAPI}:`)
            }`
          },
          body: `${
            encodeURIComponent('source')
          }=${
            encodeURIComponent(token.stripeToken)
          }`
        }
      ).then(response => {
        return response.json();
      }).then(json => {
        if (json.error) {

          // remove token due to error
          Database.ref(
            `billing/${data.key}`
          ).update({
            error: json.error
          });
          Database.ref(
            `profiles/${
              token.createdBy
            }/billing/${
              data.key
            }`
          ).remove();
        } else {

          // looks good, so convert to card
          Database.ref(
            `billing/${data.key}`
          ).update({
            active: true,
            stripeCardId: json.id,
            stripeToken: null,
            lastFour: json.last4,
            name: json.name,
            expiryMonth: json.exp_month,
            expiryYear: json.exp_year,
            type: (() => {
              switch(json.brand) {
                case 'MasterCard': return 1;
                case 'American Express': return 2;
                default: return 0;
              }
            })()
          });
        }
      });
    }
  });
});
