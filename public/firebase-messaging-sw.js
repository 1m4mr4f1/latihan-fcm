importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyARYP7vSSkPseHDM0LvxpmWmPsuxg6zMso",
  authDomain: "latihan-fcm-d687a.firebaseapp.com",
  projectId: "latihan-fcm-d687a",
  messagingSenderId: "883374137847",
  appId: "1:883374137847:web:75794ae229a0a5eb818ef2"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notifikasi background diterima: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = { 
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon.png'
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});