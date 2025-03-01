import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from pathlib import Path

# Initialize Firebase Admin SDK (only if not already initialized)
if not firebase_admin._apps:
    cred_path = Path("C:/Users/fadke/Downloads/coursematch_key.json")
    cred = credentials.Certificate(str(cred_path))
    firebase_admin.initialize_app(cred)

# Load Firestore
db = firestore.client()

# Load CSV with courseNumber and quarter
df = pd.read_csv("quarterlist.csv")

# Safety check: print first few rows to confirm columns
print("Loaded Data:")
print(df.head())

# Check if column names match expectations
expected_columns = {'courseNumber', 'quarter'}
if not expected_columns.issubset(set(df.columns)):
    raise ValueError(f"CSV must contain columns: {expected_columns}. Found: {df.columns}")

# Iterate through each row and update Firestore
for index, row in df.iterrows():
    course_number = row['courseNumber']
    quarter = row['quarter']

    # Skip if quarter is missing (optional safeguard)
    if pd.isna(quarter):
        print(f"Skipping {course_number} because quarter is missing.")
        continue

    # Find the document with this course number
    courses_ref = db.collection('courses')
    query = courses_ref.where('courseNumber', '==', course_number).stream()

    doc_found = False
    for doc in query:
        doc_found = True
        doc_ref = db.collection('courses').document(doc.id)
        doc_ref.update({'quarter': quarter})
        print(f"✅ Updated {course_number} with quarter {quarter}")

    if not doc_found:
        print(f"⚠️ No document found for courseNumber {course_number}")

print("🎉 All updates complete!")
