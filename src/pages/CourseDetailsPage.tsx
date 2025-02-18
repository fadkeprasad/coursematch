// src/pages/CourseDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/CourseDetailsPage.css';

interface Comment {
  id?: string;
  userId?: string;
  text?: string;
  createdAt?: any;
}

interface CourseDetails {
  courseNumber: string;
  courseTitle: string;
  faculty: string;
  desc?: string; // Added description field
  slackComments?: string[]; // Only show on this page
}

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams();
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({}); // Map of userId to username

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      const courseDocRef = doc(db, 'courses', courseId);
      const courseDocSnap = await getDoc(courseDocRef);

      if (courseDocSnap.exists()) {
        setCourseDetails(courseDocSnap.data() as CourseDetails);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!courseId) return;

      const commentsRef = collection(db, 'courses', courseId, 'comments');
      const snapshot = await getDocs(commentsRef);

      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      setComments(fetchedComments);
    };

    fetchComments();
  }, [courseId]);

  // Fetch usernames for each comment
  useEffect(() => {
    const fetchUsernames = async () => {
      const userIds = [...new Set(comments.map((comment) => comment.userId))]; // Get unique userIds
      const fetchedUsernames: Record<string, string> = {};

      for (const userId of userIds) {
        if (!userId) continue;

        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          fetchedUsernames[userId] = userDoc.data()?.username || 'Anonymous';
        }
      }

      setUsernames(fetchedUsernames);
    };

    fetchUsernames();
  }, [comments]);

  // Add a new comment
  const handleAddComment = async () => {
    if (!user || !courseId) return;

    const commentsRef = collection(db, 'courses', courseId, 'comments');
    await addDoc(commentsRef, {
      userId: user.uid,
      text: newComment,
      createdAt: Timestamp.now(),
    });

    setNewComment('');

    // Fetch the updated comments
    const snapshot = await getDocs(commentsRef);
    const fetchedComments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];

    setComments(fetchedComments);
  };

  if (!courseId) return <p>No course specified</p>;

  return (
    <div className="course-details-container">
      <h2>
        Course Details: {courseDetails?.courseNumber} - {courseDetails?.courseTitle}
      </h2>
      <p>
        <strong>Faculty:</strong> {courseDetails?.faculty || 'Not Available'}
      </p>
      <p>
        <strong>Description:</strong> {courseDetails?.desc || 'No description available.'}
      </p>

      {courseDetails?.slackComments && (
        <div>
          <h3>Slack Comments</h3>
          <ul>
            {courseDetails.slackComments.map((comment, index) => (
              <li key={index}>{comment}</li>
            ))}
          </ul>
        </div>
      )}

      <Link to="/home" className="link">
        &larr; Back to Home
      </Link>

      <h3>Comments</h3>
      <div className="comments-section">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p>{comment.text}</p>
            {comment.userId && (
              <small>
                User: {usernames[comment.userId] || 'Anonymous'}
              </small>
            )}
          </div>
        ))}
      </div>

      {user ? (
        <div className="add-comment">
          <textarea
            rows={3}
            placeholder="Add your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input-field"
          />
          <button className="btn btn-primary" onClick={handleAddComment}>
            Submit
          </button>
        </div>
      ) : (
        <p>You must be signed in to add a comment.</p>
      )}
    </div>
  );
};

export default CourseDetailsPage;
