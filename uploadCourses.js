const admin = require("firebase-admin");
const fs = require("fs");
const csvParser = require("csv-parser");

// Initialize Firebase Admin
const serviceAccount = require("C:/Users/fadke/Downloads/courses.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  const db = admin.firestore();
  const filePath = "./courseslist.csv";
  
  async function uploadCSV() {
    try {
      let rowIndex = 0; // Initialize row index
  
      // Read and process the CSV file
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          const docId = rowIndex.toString(); // Use rowIndex as the document ID
          rowIndex++; // Increment the row index
  
          // Log the document ID for debugging
          console.log("Processing document ID:", docId);
  
          // Prepare the data for upload (include all relevant columns)
          const courseData = {
            courseNumber: row.courseNumber,
            courseTitle: row.courseTitle,
            faculty: row.faculty,
            daytime: row.daytime,
            units: parseInt(row.units, 10) || 0, // Default to 0 if invalid
            commentCount: parseInt(row.commentCount || 0, 10),
            category: row.category || "N/A", // Add category
            stem: row.stem || "N/A",         // Add stem
            ldr: row.ldr,           // Add ldr
            slack_comments: row.slack_comments,
            desc: row.desc
          };
  
          // Add slack_comments if valid
          if (row.slack_comments && row.slack_comments.trim() !== "") {
            courseData.slack_comments = row.slack_comments.split(",");
          }
  
          // Write to Firestore
          const docRef = db.collection("courses").doc(docId);
          docRef
            .set(courseData, { merge: true })
            .then(() =>
              console.log(`Course with ID ${docId} uploaded successfully`)
            )
            .catch((err) =>
              console.error(`Error uploading course with ID ${docId}:`, err)
            );
        })
        .on("end", () => {
          console.log(
            "CSV file successfully processed and uploaded to Firestore."
          );
        });
    } catch (error) {
      console.error("Error processing CSV:", error);
    }
  }
  
  uploadCSV();
