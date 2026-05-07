const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

(async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  console.log("Users in Firebase:", snapshot.size);
  process.exit(0);
})();
