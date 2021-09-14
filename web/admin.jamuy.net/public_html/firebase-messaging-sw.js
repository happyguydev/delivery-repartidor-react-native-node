importScripts('https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.9/firebase-messaging.js');


firebase.initializeApp({
  apiKey: "AIzaSyAfG2jGc3KWT5Ud5TP5cNdMPEece-EWuwk",
  authDomain: "jamuy-ab9c5.firebaseapp.com",
  databaseURL: "https://jamuy-ab9c5-default-rtdb.firebaseio.com",
  projectId: "jamuy-ab9c5",
  storageBucket: "jamuy-ab9c5.appspot.com",
  messagingSenderId: "663307726242",
  appId: "1:663307726242:web:9ffbeed3297867e71a56fb",
  measurementId: "G-66YBMR9T75"
});

const messaging = firebase.messaging();



messaging.setBackgroundMessageHandler(function(payload) {

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    })
    .then((windowClients) => {
    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      windowClient.postMessage(payload);
    }
    })
    .then(() => {
    return registration.showNotification('my notification title');
    });
    return promiseChain;

});

