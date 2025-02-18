// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/HomePage.css';

interface Course {
  id: string;
  courseNumber: string;
  courseTitle: string;
  daytime: string;
  faculty1: string;
  units: number;
  category: string;
  stem: string;
  ldr: string;
}

const HomePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [username, setUsername] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState({
    daytime: '',
    category: '',
    stem: '',
    ldr: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/welcomepage');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch the username from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const fetchedUsername = userDoc.exists()
          ? userDoc.data()?.username || user.email
          : user.email;
        setUsername(fetchedUsername);

        // Fetch courses
        const courseCollection = collection(db, 'courses');
        const snapshot = await getDocs(courseCollection);
        const data: Course[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(data);
        setFilteredCourses(data); // Initialize with all courses
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Update filtered courses whenever filters change
  useEffect(() => {
    const applyFilters = () => {
      let filtered = courses;

      if (filters.daytime) {
        filtered = filtered.filter((course) =>
          course.daytime.toLowerCase().includes(filters.daytime.toLowerCase())
        );
      }

      if (filters.category) {
        filtered = filtered.filter((course) =>
          course.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }

      if (filters.stem) {
        filtered = filtered.filter((course) =>
          course.stem.toLowerCase() === filters.stem.toLowerCase()
        );
      }

      if (filters.ldr) {
        filtered = filtered.filter((course) =>
          course.ldr.toLowerCase() === filters.ldr.toLowerCase()
        );
      }

      setFilteredCourses(filtered);
    };

    applyFilters();
  }, [filters, courses]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="homepage-container">
      <h2>Welcome, <strong>{username}</strong></h2>
      <div className="nav-links">
        <Link to="/account" className="link">Account</Link>
        <Link to="/" className="link">Sign Out</Link>
      </div>

      <h3>All Courses</h3>

      {/* Filters Section */}
      <div className="filters-container">
        <select name="daytime" value={filters.daytime} onChange={handleFilterChange}>
          <option value="">Filter by Day/Time</option>
          {Array.from(new Set(courses.map((course) => course.daytime))).map((daytime) => (
            <option key={daytime} value={daytime}>{daytime}</option>
          ))}
        </select>

        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">Filter by Category</option>
          {Array.from(new Set(courses.map((course) => course.category))).map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select name="stem" value={filters.stem} onChange={handleFilterChange}>
          <option value="">Filter by STEM</option>
          <option value="Y">Y</option>
          <option value="N">N</option>
        </select>

        <select name="ldr" value={filters.ldr} onChange={handleFilterChange}>
          <option value="">Filter by Leadership</option>
          <option value="Y">Y</option>
          <option value="N">N</option>
        </select>
      </div>

      {/* Courses Table */}
      <table className="courses-table">
        <thead>
          <tr>
            <th>Course Number</th>
            <th>Title</th>
            <th>Faculty</th>
            <th>Day/Time</th>
            <th>Units</th>
            <th>Category</th>
            <th>STEM</th>
            <th>Leadership</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.map((course) => (
            <tr key={course.id}>
              <td>
                <Link to={`/course/${course.id}`} className="link">
                  {course.courseNumber}
                </Link>
              </td>
              <td>{course.courseTitle}</td>
              <td>{course.faculty1 || 'Not Available'}</td>
              <td>{course.daytime}</td>
              <td>{course.units}</td>
              <td>{course.category}</td>
              <td>{course.stem}</td>
              <td>{course.ldr}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HomePage;
