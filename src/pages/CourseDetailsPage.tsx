// src/pages/CourseDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, doc, getDoc, query, where, Timestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/CourseDetailsPage.css';

interface Comment {
  id?: string;
  userId?: string;
  username?: string;
  text?: string;
  createdAt?: any;
}

interface CourseDetails {
  courseNumber: string;
  courseTitle: string;
  faculty: string;
  desc?: string;
  slackComments?: string[];
}

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams();
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editComment, setEditComment] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      const courseDocRef = doc(db, 'courses', courseId);
      const courseDocSnap = await getDoc(courseDocRef);

      if (courseDocSnap.exists()) {
        setCourseDetails(courseDocSnap.data() as CourseDetails);
        setRatingCount(courseDocSnap.data().ratingCount || 0);
      }

      if (user) {
        const userRatingDoc = await getDoc(doc(db, 'ratings', `${user.uid}_${courseId}`));
        if (userRatingDoc.exists()) {
          setUserRating(userRatingDoc.data().rating);
        }
      }
    };

    const fetchComments = async () => {
      if (!courseId) return;

      const commentsRef = collection(db, 'courses', courseId, 'comments');
      const snapshot = await getDocs(commentsRef);

      const fetchedComments = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data() as Comment;
        if (data.userId) {
          const userDocRef = doc(db, 'users', data.userId);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data() as { username: string };
            data.username = userData.username || 'Anonymous';
          } else {
            data.username = 'Anonymous';
          }
        }
        return { id: docSnapshot.id, ...data };
      }));

      setComments(fetchedComments);
    };

    fetchCourseDetails();
    fetchComments();
  }, [courseId, user]);

  const handleAddComment = async () => {
    if (!user || !courseId || !editComment.trim()) return;

    const commentsRef = collection(db, 'courses', courseId, 'comments');
    await addDoc(commentsRef, {
      userId: user.uid,
      text: editComment.trim(),
      createdAt: Timestamp.now(),
    });

    setEditComment('');
    setEditingCommentId(null);
    const snapshot = await getDocs(commentsRef);
    const fetchedComments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];

    setComments(fetchedComments);
  };

  return (
    <div className="course-details-container">
      <h2>
        Course Details: {courseDetails?.courseNumber} - {courseDetails?.courseTitle}
      </h2>
      <p style={{ marginBottom: '20px' }}>
        <strong>Faculty:</strong> {courseDetails?.faculty || 'Not Available'}
      </p>
      <p>
        <strong>Description:</strong> {courseDetails?.desc || 'No description available.'}
      </p>

      <div style={{ marginTop: '20px' }}>
        <h3>Your Rating</h3>
        <div style={{ marginBottom: '10px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{ color: userRating && star <= userRating ? 'gold' : 'gray', cursor: 'pointer', fontSize: '24px', marginRight: '5px' }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <Link to="/home" className="link">&larr; Back to Home</Link>

      <h3 style={{ marginTop: '20px' }}>Comments</h3>
      <div className="comments-section">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p>{comment.text}</p>
            <small>By: {comment.username} <span style={{ marginLeft: '8px' }}></span></small>
            {user && user.uid === comment.userId && (
              <button style={{ marginLeft: '10px' }}>Edit</button>
            )}
          </div>
        ))}
      </div>

      {user && (
        <div className="add-comment">
          <textarea
            rows={3}
            placeholder="Add your comment..."
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            className="input-field"
          />
          <button className="btn btn-primary" onClick={handleAddComment} style={{ marginTop: '10px' }}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
