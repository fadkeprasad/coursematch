// src/pages/CourseDetailsPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, doc, getDoc, Timestamp, setDoc } from 'firebase/firestore';
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
  averageRating?: number;
  ratingCount?: number;
}

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editComment, setEditComment] = useState<string>('');
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const showOnboarding = localStorage.getItem('showOnboarding') === 'true';
    setShowOnboarding(showOnboarding);
}, []);



  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      const courseDocRef = doc(db, 'courses', courseId);
      const courseDocSnap = await getDoc(courseDocRef);

      if (courseDocSnap.exists()) {
        setCourseDetails(courseDocSnap.data() as CourseDetails);
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

      const fetchedComments = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
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
        })
      );

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
    const snapshot = await getDocs(commentsRef);
    const fetchedComments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];

    setComments(fetchedComments);
  };

  const handleStarClick = async (rating: number) => {
    if (!user || !courseId) return;
  
    setUserRating(rating); // Optimistic UI update
  
    const ratingDocRef = doc(db, 'ratings', `${user.uid}_${courseId}`);
    const courseDocRef = doc(db, 'courses', courseId);
  
    const ratingDocSnap = await getDoc(ratingDocRef);
    const courseDocSnap = await getDoc(courseDocRef);
    if (!courseDocSnap.exists()) return;
  
    const courseData = courseDocSnap.data();
    let newAverageRating = courseData.averageRating || 0;
    let newRatingCount = courseData.ratingCount || 0;
    let totalRating = newAverageRating * newRatingCount;
  
    if (ratingDocSnap.exists()) {
      // Update existing rating
      const oldRating = ratingDocSnap.data().rating;
      totalRating = totalRating - oldRating + rating; // Remove old rating and add new rating
      newAverageRating = totalRating / newRatingCount; // Average remains the same count
      await updateDoc(ratingDocRef, {
        rating,
        updatedAt: Timestamp.now(),
      });
    } else {
      // Add new rating
      newRatingCount += 1; // Increment count only for new rating
      totalRating = totalRating + rating;
      newAverageRating = totalRating / newRatingCount;
      await setDoc(ratingDocRef, {
        userId: user.uid,
        courseId,
        rating,
        createdAt: Timestamp.now(),
      });
    }
  
    // Update the course document with correct values
    await updateDoc(courseDocRef, {
      averageRating: parseFloat(newAverageRating.toFixed(1)), // Limit to 1 decimal place
      ratingCount: newRatingCount,
    });
  
    setCourseDetails((prev) =>
      prev ? { ...prev, averageRating: newAverageRating, ratingCount: newRatingCount } : prev
    );
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

      {courseDetails?.averageRating && (
        <p>
          <strong>Average Rating:</strong> {courseDetails.averageRating.toFixed(1)} / 5 ({courseDetails.ratingCount} reviews)
        </p>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Your Rating</h3>
        <div style={{ marginBottom: '10px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleStarClick(star)}
              style={{
                color: userRating && star <= userRating ? 'gold' : 'gray',
                cursor: 'pointer',
                fontSize: '24px',
                marginRight: '5px',
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <Link to="/home" className="link">
        &larr; Back to Home
      </Link>

      <h3 style={{ marginTop: '20px' }}>Comments</h3>
      <div className="comments-section">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p>{comment.text}</p>
            <small>
              By: {comment.username} <span style={{ marginLeft: '8px' }}></span>
            </small>
          </div>
        ))}
      </div>

      {user && (
        <div className="add-comment">
          <textarea
            rows={3}
            placeholder="Tell us what you loved or hated about this course!"
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            className="input-field"
          />

            {showOnboarding && (
                    <div className="popup-tooltip" style={{
                        position: 'absolute',
                        top: '-50px',
                        left: '0'
                    }}>
                        Tell us what you loved or hated about this course!
                        <button onClick={() => {
                            setShowOnboarding(false);
                            localStorage.removeItem('showOnboarding');
                        }}>&#x2715;</button>
                    </div>
                )}

          <button className="btn btn-primary" onClick={handleAddComment} style={{ marginTop: '10px' }}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
