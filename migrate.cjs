// migrate.cjs
const { createClient } = require('@supabase/supabase-js');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// SUPABASE CONFIG
const supabaseUrl = 'https://eqvnppulhzwlsyrhnvcb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxdm5wcHVsaHp3bHN5cmhudmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY0MzIsImV4cCI6MjA4ODYyMjQzMn0.obMK3hhEPFs2wNHF1p9aIhuLjdxV-BdKYPw5u8WTC20';
const supabase = createClient(supabaseUrl, supabaseKey);

// FIREBASE CONFIG
const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const tables = [
    'users',
    'registrations',
    'attendance_sessions',
    'attendance_records',
    'news',
    'gallery',
    'sliders',
    'media_posts',
    'profile_pages',
    'site_config',
    'korwils'
];

async function migrateData() {
    console.log("Starting migration from Supabase to Firebase...");
    for (const table of tables) {
        let allData = [];
        let from = 0;
        let to = 999;
        let fetchMore = true;

        console.log(`\nFetching ${table}...`);
        while (fetchMore) {
            const { data, error } = await supabase.from(table).select('*').range(from, to);
            if (error) {
                console.error(`Error fetching ${table}:`, error);
                break;
            }
            if (data && data.length > 0) {
                allData = allData.concat(data);
                from += 1000;
                to += 1000;
            } else {
                fetchMore = false;
            }
        }

        console.log(`Found ${allData.length} records in ${table}`);

        if (allData.length > 0) {
            for (const item of allData) {
                try {
                    // Use id as document ID if exists, OR use slug if profile_pages, OR generate random
                    let docId = item.id ? String(item.id) : (item.slug ? item.slug : null);
                    
                    const colRef = collection(db, table);
                    let docRef;
                    if (docId) {
                        docRef = doc(colRef, docId);
                    } else {
                        docRef = doc(colRef);
                    }
                    
                    await setDoc(docRef, item);
                } catch (err) {
                    console.error(`Failed to insert into ${table}:`, err);
                }
            }
            console.log(`Migrated ${allData.length} records to ${table}`);
        }
    }
    console.log("\nMigration completed!");
    process.exit(0);
}

migrateData();
