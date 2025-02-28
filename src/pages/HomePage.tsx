// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/HomePage.css';

interface Course {
  id: string;
  courseTitle: string;
  faculty1: string;
  daytime: string;
  units: number;
  category: string;
  ldr: string;
  averageRating?: number;
  ratingCount?: number;
}

const HomePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [username, setUsername] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    units: '',
    category: '',
    ldr: '',
    daytime: '',
  });
  const [sortBy, setSortBy] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/welcomepage');
      return;
    }

    const fetchData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const fetchedUsername = userDoc.exists()
          ? userDoc.data()?.username || user.email
          : user.email;
        setUsername(fetchedUsername);

        const courseCollection = collection(db, 'courses');
        const snapshot = await getDocs(courseCollection);
        const data: Course[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    let result = [...courses];

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((course) =>
          course[key as keyof Course]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    if (sortBy === 'ratings') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    setFilteredCourses(result);
  }, [filters, courses, sortBy]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const renderSortArrow = (column: keyof Course) => {
    if (sortConfig?.key !== column) return '↕️';
    return sortConfig.direction === 'asc' ? '⬆️' : '⬇️';
  };

  const [sortConfig, setSortConfig] = useState<{ key: keyof Course; direction: 'asc' | 'desc' } | null>(null);

  // Sorting logic
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const valueA = a[key] ?? '';
    const valueB = b[key] ?? '';
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Course) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className="homepage-container">
      <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
        <img src="/images/coursematch_logo.png" alt="CourseMatch Logo" className="logo" />
        <div className="nav-links" style={{ display: 'flex', gap: '15px', marginLeft: 'auto' }}>
          <Link to="/account" className="link">{username}</Link>
          <Link to="/" className="link">Sign Out</Link>
        </div>
      </div>

      <h3>All Courses</h3>

      <div className="filters-container">
        <select name="units" value={filters.units} onChange={handleFilterChange}>
          <option value="">Filter by Units</option>
          {[...new Set(courses.map(course => course.units))].map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>

        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">Filter by Category</option>
          {[...new Set(courses.map(course => course.category))].map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select name="ldr" value={filters.ldr} onChange={handleFilterChange}>
          <option value="">Filter by Leadership</option>
          <option value="Y">Yes</option>
          <option value="N">No</option>
        </select>

        <select name="daytime" value={filters.daytime} onChange={handleFilterChange}>
          <option value="">Filter by Day/Time</option>
          {[...new Set(courses.map(course => course.daytime))].map(daytime => (
            <option key={daytime} value={daytime}>{daytime}</option>
          ))}
        </select>
      </div>




      <table className="courses-table">
      <thead>
        <tr>
          <th onClick={() => handleSort('courseTitle')} style={{ cursor: 'pointer' }}>
            Course Title {renderSortArrow('courseTitle')}
          </th>
          <th onClick={() => handleSort('faculty1')} style={{ cursor: 'pointer' }}>
            Faculty {renderSortArrow('faculty1')}
          </th>
          <th onClick={() => handleSort('daytime')} style={{ cursor: 'pointer' }}>
            Day/Time {renderSortArrow('daytime')}
          </th>
          <th onClick={() => handleSort('units')} style={{ cursor: 'pointer' }}>
            Units {renderSortArrow('units')}
          </th>
          <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
            Category {renderSortArrow('category')}
          </th>
          <th onClick={() => handleSort('ldr')} style={{ cursor: 'pointer' }}>
            Leadership {renderSortArrow('ldr')}
          </th>
          <th onClick={() => handleSort('averageRating')} style={{ cursor: 'pointer' }}>
            Ratings {renderSortArrow('averageRating')}
          </th>
        </tr>
      </thead>

      <tbody>
        {sortedCourses.map((course) => (
          <tr key={course.id}>
            <td>
              <Link to={`/course/${course.id}`} className="link">
                {course.courseTitle}
              </Link>
            </td>
            <td>{course.faculty1 || 'Not Available'}</td>
            <td>{course.daytime}</td>
            <td>{course.units}</td>
            <td>{course.category}</td>
            <td>{course.ldr}</td>
            <td>
              {course.averageRating !== undefined && course.ratingCount
                ? `${course.averageRating.toFixed(1)} / 5 (${course.ratingCount} reviews)`
                : 'No ratings'}
            </td>
          </tr>
        ))}
      </tbody>

      </table>
    </div>
  );
};

export default HomePage;


// The CourseDetailsPage.tsx file follows the same design changes with the navbar, username, and logo at the top, and consistent font size.
