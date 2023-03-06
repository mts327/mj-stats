// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuuxNpBhlgtej1uSisvBeAuseo569Bo7o",
  authDomain: "mjstats-29429.firebaseapp.com",
  projectId: "mjstats-29429",
  storageBucket: "mjstats-29429.appspot.com",
  messagingSenderId: "28755989355",
  appId: "1:28755989355:web:13d7914b810a3f3c80b22e"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;