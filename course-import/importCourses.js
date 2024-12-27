// importCourses.js

const admin = require('firebase-admin');
const fs = require('fs');
// For csv-parse v4, we can still use the old path:
const parse = require('csv-parse/lib/sync'); // for CSV parsing

// 1. Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json'); // your downloaded key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 2. CSV file path
const csvFilePath = './courseslist.csv'; // or whatever your file is named

// 3. Read CSV content (and remove possible BOM if present)
let fileContent = fs.readFileSync(csvFilePath, 'utf8');

// If the first character is 0xFEFF, slice it off
if (fileContent.charCodeAt(0) === 0xFEFF) {
  fileContent = fileContent.slice(1);
}

// 4. Parse CSV
const records = parse(fileContent, {
  columns: true,       // treat first row as column headers
  skip_empty_lines: true,
});

// 5. For each row, add document to "courses" collection
async function importCourses() {
  for (const row of records) {
    // Build your doc data
    const docData = {
      courseNumber: row.courseNumber, // MUST match exactly "courseNumber" from CSV header
      courseTitle: row.courseTitle,
      faculty1: row.faculty1,
      daytime: row.daytime,
      units: parseInt(row.Units, 10),        // Notice row.Units (capital "U") if that's your CSV header
      commentCount: parseInt(row.commentCount, 10) || 0, // or remove this if it’s not in CSV
    };

    // Trim the courseNumber to avoid leftover spaces
    const docIdRaw = row.courseNumber || '';
    const docId = docIdRaw.trim();

    // Log docId to debug
    console.log(`Doc ID: "${docId}" from row:`, row);

    // Skip if docId is empty
    if (!docId) {
      console.log(`Skipping row with empty docId: ${JSON.stringify(row)}`);
      continue;
    }

    // Write to Firestore with the trimmed docId
    await db.collection('courses').doc(docId).set(docData);
    console.log(`Imported: ${docId}`);
  }

  console.log('Done importing courses!');
}

// Run the import
importCourses().catch(console.error);
