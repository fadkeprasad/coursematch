// src/pages/HomePage.tsx

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Course {
  id: string;            // doc ID in Firestore
  courseNumber: string;
  courseTitle: string;
  faculty1: string;
  daytime: string;
  units: number;
  commentCount?: number; // optional field
}

const HomePage: React.FC = () => {
  // Check if user is signed in
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // State to hold courses
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // If no user, redirect to sign in
    if (!user) {
      navigate('/signin');
      return;
    }

    // Fetch courses from Firestore
    const fetchCourses = async () => {
      try {
        const courseCollection = collection(db, 'courses');
        const snapshot = await getDocs(courseCollection);
        const data: Course[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [user, navigate]);

  return (
    <div style={{ margin: '20px' }}>
      <h2>Welcome, {user?.email}</h2>
      <div style={{ marginBottom: '10px' }}>
        <Link to="/account">Account</Link> |{' '}
        <Link to="/">Sign Out (via Account Page)</Link>
      </div>

      <h3>All Courses</h3>
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Course Number</th>
            <th>Title</th>
            <th>Faculty</th>
            <th>Day/Time</th>
            <th>Units</th>
            <th># Comments</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>
                <Link to={`/course/${course.id}`}>{course.courseNumber}</Link>
              </td>
              <td>{course.courseTitle}</td>
              <td>{course.faculty1}</td>
              <td>{course.daytime}</td>
              <td>{course.units}</td>
              <td>{course.commentCount || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HomePage;
