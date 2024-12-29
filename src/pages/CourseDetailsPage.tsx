// src/pages/CourseDetailsPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// [CHANGED] - import doc, getDoc in addition to everything else
import { collection, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Comment {
  id?: string;
  userId?: string;
  text?: string;
  createdAt?: any;
  // [ADDED] If your prepopulated comments are objects with extra fields,
  //        add them here too (e.g. courseNumber, courseTitle, etc.)
  // courseNumber?: string;
  // ...
}

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams();
  const [user] = useAuthState(auth);

  // [CHANGED] – we’ll store *all* comments (both prepopulated array & subcollection) in one state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      if (!courseId) return;

      // ------------------------------------------------------------------
      // [ADDED] 1) Fetch the course document to grab any prepopulated
      // comments array. For instance, if your CSV wrote them as
      // doc.data().comments = [ {text: "...", ...}, { ... } ]
      // ------------------------------------------------------------------
      const courseDocRef = doc(db, 'courses', courseId);
      const courseDocSnap = await getDoc(courseDocRef);

      let prepopulated: Comment[] = [];
      if (courseDocSnap.exists()) {
        const data = courseDocSnap.data();
        // If “comments” is an array of objects:
        if (Array.isArray(data.comments)) {
          prepopulated = data.comments.map((item: any) => {
            // In case each item is just a string, or has custom fields
            return typeof item === 'string'
              ? ({ text: item } as Comment)
              : (item as Comment);
          });
        }
      }

      // ------------------------------------------------------------------
      // [CHANGED] 2) Fetch subcollection comments (your user-submitted ones)
      // ------------------------------------------------------------------
      const commentsRef = collection(db, 'courses', courseId, 'comments');
      const snapshot = await getDocs(commentsRef);

      const subcollectionComments = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        } as Comment;
      });

      // ------------------------------------------------------------------
      // [ADDED] 3) Combine array-based prepopulated + subcollection
      // ------------------------------------------------------------------
      const combined = [...prepopulated, ...subcollectionComments];

      // ------------------------------------------------------------------
      // [ADDED] 4) Optional sort so newest at top if you have a createdAt
      // ------------------------------------------------------------------
      combined.sort((a, b) => {
        // If a.createdAt is missing, treat it as 0
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setComments(combined);
    };

    fetchComments();
  }, [courseId]);

  const handleAddComment = async () => {
    if (!user || !courseId) return;

    // This adds a new doc in the 'comments' subcollection
    const commentsRef = collection(db, 'courses', courseId, 'comments');
    await addDoc(commentsRef, {
      userId: user.uid,
      text: newComment,
      createdAt: Timestamp.now(),
    });

    setNewComment('');

    // [CHANGED] – re-fetch combined comments so the new doc is included
    const snapshot = await getDocs(commentsRef);
    const subcollectionComments = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Comment;
    });

    // We also want to preserve prepopulated array comments
    // so let's fetch the doc again:
    const courseDocRef = doc(db, 'courses', courseId);
    const courseDocSnap = await getDoc(courseDocRef);

    let prepopulated: Comment[] = [];
    if (courseDocSnap.exists()) {
      const data = courseDocSnap.data();
      if (Array.isArray(data.comments)) {
        prepopulated = data.comments.map((item: any) => {
          return typeof item === 'string'
            ? ({ text: item } as Comment)
            : (item as Comment);
        });
      }
    }

    // Combine them
    const combined = [...prepopulated, ...subcollectionComments];
    combined.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setComments(combined);
  };

  if (!courseId) return <p>No course specified</p>;

  return (
    <div style={{ margin: '20px' }}>
      <h2>Course Details: {courseId}</h2>
      <Link to="/home">&larr; Back to Home</Link>

      <h3>Comments</h3>
      {comments.map((comment, idx) => (
        <div
          key={comment.id ?? idx} // fallback to index if there's no id
          style={{ border: '1px solid #ccc', margin: '8px 0', padding: '8px' }}
        >
          {/* If prepopulated item might just have .text */}
          <p>{comment.text}</p>
          {comment.userId && <small>User ID: {comment.userId}</small>}
        </div>
      ))}

      {user ? (
        <div style={{ marginTop: '10px' }}>
          <textarea
            rows={3}
            placeholder="Add your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <br />
          <button onClick={handleAddComment}>Submit</button>
        </div>
      ) : (
        <p>You must be signed in to add a comment.</p>
      )}
    </div>
  );
};

export default CourseDetailsPage;
