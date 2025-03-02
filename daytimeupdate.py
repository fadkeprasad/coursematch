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

# Load Excel file
df = pd.read_excel("datetimes.xlsx", usecols=["courseNumber", "day1", "day2", "start", "end"])

# Safety check: print first few rows to confirm
print("Loaded Data:")
print(df.head())

# Check expected columns
expected_columns = {'courseNumber', 'day1', 'day2', 'start', 'end'}
if not expected_columns.issubset(set(df.columns)):
    raise ValueError(f"Excel file must contain columns: {expected_columns}. Found: {df.columns}")

# Process each course
for index, row in df.iterrows():
    course_number = row['courseNumber']

    update_data = {}

    if pd.notna(row['day1']) and str(row['day1']).strip():
        update_data['day1'] = row['day1']

    if pd.notna(row['day2']) and str(row['day2']).strip():
        update_data['day2'] = row['day2']

    if pd.notna(row['start']):
        update_data['start'] = float(row['start'])

    if pd.notna(row['end']):
        update_data['end'] = float(row['end'])

    if not update_data:
        print(f"Skipping {course_number}, no valid data to update.")
        continue

    courses_ref = db.collection('courses')
    query = courses_ref.where('courseNumber', '==', course_number).stream()

    doc_found = False
    for doc in query:
        doc_found = True
        doc_ref = db.collection('courses').document(doc.id)
        doc_ref.update(update_data)
        print(f"✅ Updated {course_number} with {update_data}")

    if not doc_found:
        print(f"⚠️ No document found for {course_number}")

print("🎉 All updates complete!")
