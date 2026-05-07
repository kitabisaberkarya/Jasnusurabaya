const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, getDocs, orderBy, limit } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    let s = await getDocs(query(collection(db, 'users'), limit(100)));
    console.log("Users:", s.size);
    
    s = await getDocs(query(collection(db, 'news'), orderBy('date', 'desc')));
    console.log("News:", s.size);

    s = await getDocs(collection(db, 'gallery'));
    console.log("Gallery:", s.size);

    console.log("Done");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
run();
