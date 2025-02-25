// prepopulateSlackComments.ts

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as csv from 'csv-parser';

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

// Path to your CSV file
const filePath = './comments.csv';

async function uploadSlackComments() {
  const results: { courseCode: string; comment: string }[] = [];

  // Read the CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      results.push({ courseCode: row[Object.keys(row)[0]], comment: row[Object.keys(row)[1]] });
    })
    .on('end', async () => {
      console.log(`Found ${results.length} comments.`);

      for (const { courseCode, comment } of results) {
        if (courseCode) {
          try {
            const courseRef = db.collection('courses').doc(courseCode);

            // Check if course exists
            const courseSnapshot = await courseRef.get();
            if (!courseSnapshot.exists) {
              console.warn(`Course ${courseCode} not found, skipping.`);
              continue;
            }

            // Update slack_comments field (only if comment exists)
            await courseRef.update({
              slack_comments: comment || "", // If comment is empty, field remains blank
            });

            console.log(`Updated slack_comments for course ${courseCode}`);
          } catch (err) {
            console.error(`Error updating course ${courseCode}: ${err}`);
          }
        }
      }

      console.log('All slack comments updated!');
    });
}

uploadSlackComments().catch(console.error);
