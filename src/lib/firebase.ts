// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNkGKwHwdHY40m3ta5PHtj-M32HuEd4HE",
  authDomain: "barbz-2d089.firebaseapp.com",
  projectId: "barbz-2d089",
  storageBucket: "barbz-2d089.firebasestorage.app",
  messagingSenderId: "1015934072723",
  appId: "1:1015934072723:web:8685ef4841c75cd2bc9a66",
  measurementId: "G-DJEY3GH5F0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let messaging: ReturnType<typeof getMessaging> | undefined = undefined;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  messaging = getMessaging(app);
}

export { app, messaging };