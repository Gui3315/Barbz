importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBNkGKwHwdHY40m3ta5PHtj-M32HuEd4HE",
  authDomain: "barbz-2d089.firebaseapp.com",
  projectId: "barbz-2d089",
  messagingSenderId: "1015934072723",
  appId: "1:1015934072723:web:8685ef4841c75cd2bc9a66"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo 192x192.png'
  });
});