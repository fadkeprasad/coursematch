const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// Correct the path with double backslashes or use forward slashes
const serviceAccount = require('C:\\Users\\fadke\\Downloads\\courses.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Reading the CSV and updating Firestore
fs.createReadStream('./comments.csv')
  .pipe(csv())
  .on('data', (row) => {
    const courseRef = db.collection('courses').doc(row.course_code);
    
    // Update or set the comments array
    courseRef.update({
      comments: admin.firestore.FieldValue.arrayUnion(row.comment)
    })
    .then(() => console.log(`Comment added to ${row.course_code}`))
    .catch(err => console.error('Error adding comment: ', err));
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
