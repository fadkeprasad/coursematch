// src/pages/CourseDetailsPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt?: any;
}

const CourseDetailsPage: React.FC = () => {
  // route param: e.g. /course/abc123
  const { courseId } = useParams();
  const [user] = useAuthState(auth);

  // local state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // Fetch comments whenever courseId changes
  useEffect(() => {
    const fetchComments = async () => {
      if (!courseId) return;

      // sub-collection: courses -> <courseId> -> comments
      const commentsRef = collection(db, 'courses', courseId, 'comments');
      const snapshot = await getDocs(commentsRef);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      // optional: sort so newest at top
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setComments(data);
    };

    fetchComments();
  }, [courseId]);

  // Add a new comment
  const handleAddComment = async () => {
    if (!user || !courseId) return;

    const commentsRef = collection(db, 'courses', courseId, 'comments');

    await addDoc(commentsRef, {
      userId: user.uid,
      text: newComment,
      createdAt: Timestamp.now(),
    });

    // Clear input
    setNewComment('');

    // Optional: Re-fetch or push to local state
    // For simplicity, let's re-fetch:
    const snapshot = await getDocs(commentsRef);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];
    data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setComments(data);
  };

  if (!courseId) return <p>No course specified</p>;

  return (
    <div style={{ margin: '20px' }}>
      <h2>Course Details: {courseId}</h2>
      <Link to="/home">&larr; Back to Home</Link>

      <h3>Comments</h3>
      {comments.map((comment) => (
        <div key={comment.id} style={{ border: '1px solid #ccc', margin: '8px 0', padding: '8px' }}>
          <p>{comment.text}</p>
          <small>User ID: {comment.userId}</small>
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
