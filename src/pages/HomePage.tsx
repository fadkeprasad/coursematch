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
  quarter?: string;
  averageRating?: number;
  ratingCount?: number;
  day1: string;        // New field (M, T, W, Th, F)
  day2?: string;       // Optional second day
  start: number;       // Fractional time (0 to 1) like 0.423611111
  end: number;         // Fractional time (0 to 1)
  liked?: boolean;
}


const HomePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  

  const [filters, setFilters] = useState({
    units: [] as string[],
    category: [] as string[],
    ldr: [] as string[],
    quarter: [] as string[],
    days: [] as string[],      // New - for M, T, W, Th, F
    timeBlocks: [] as string[]  // New - for morning, afternoon, evening
});

const toggleFilter = (key: keyof typeof filters, value: string) => {
  setFilters((prevFilters) => {
      const updated = prevFilters[key].includes(value)
          ? prevFilters[key].filter((v: string) => v !== value)
          : [...prevFilters[key], value];

      return { ...prevFilters, [key]: updated };
  });
};

const clearFilter = (key: keyof typeof filters) => {
  setFilters((prevFilters) => ({ ...prevFilters, [key]: [] }));
};




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

    if (filters.units.length) {
        result = result.filter(course => filters.units.includes(course.units.toString()));
    }

    if (filters.category.length) {
        result = result.filter(course => filters.category.includes(course.category));
    }

    if (filters.ldr.length) {
        result = result.filter(course => filters.ldr.includes(course.ldr));
    }

    if (filters.quarter.length) {
        result = result.filter(course => course.quarter && filters.quarter.includes(course.quarter));
    }

    if (filters.days.length) {
        result = result.filter(course => 
            filters.days.includes(course.day1) || (course.day2 && filters.days.includes(course.day2))
        );
    }

    if (filters.timeBlocks.length) {
        result = result.filter(course => {
            if (typeof course.start !== 'number') return false;  // Safeguard if data is corrupt
            if (filters.timeBlocks.includes('morning') && course.start < 0.5) return true;
            if (filters.timeBlocks.includes('afternoon') && course.start >= 0.5 && course.start < 0.708333333) return true;
            if (filters.timeBlocks.includes('evening') && course.start >= 0.708333333) return true;
            return false;
        });
    }

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
          <div className="hover-container">
              <img src="/images/coursematch_logo.png" alt="CourseMatch Logo" className="logo" />
              <div className="hover-tooltip">Rate and review the courses to help your friends find the right one!</div>
          </div>

          <div className="nav-links" style={{ display: 'flex', gap: '15px', marginLeft: 'auto' }}>
              <div className="hover-container">
                  <Link to="/account" className="link">{username}</Link>
                  <div className="hover-tooltip">This is your anonymous username</div>
              </div>
              <Link to="/" className="link">Sign Out</Link>
          </div>
      </div>



      <h3>All Courses</h3>

      <div className="filters-container">

{/* Quarter Filter */}
<div className="filter-group">
    <button type="button" className="dropdown-button">Filter by Quarter ▼</button>
    <div className="dropdown-content">
        {[...new Set(courses.map(course => course.quarter))].map(quarter => (
            <label key={quarter} className="checkbox-item">
                <input
                    type="checkbox"
                    checked={filters.quarter.includes(quarter!)}
                    onChange={() => toggleFilter('quarter', quarter!)}
                />
                {quarter}
            </label>
        ))}
        <div className="dropdown-footer">
            <button onClick={() => clearFilter('quarter')}>Clear all</button>
        </div>
    </div>
</div>

{/* Units Filter */}
<div className="filter-group">
    <button type="button" className="dropdown-button">Filter by Units ▼</button>
    <div className="dropdown-content">
        {[...new Set(courses.map(course => course.units))].map(unit => (
            <label key={unit} className="checkbox-item">
                <input
                    type="checkbox"
                    checked={filters.units.includes(unit.toString())}
                    onChange={() => toggleFilter('units', unit.toString())}
                />
                {unit}
            </label>
        ))}
        <div className="dropdown-footer">
            <button onClick={() => clearFilter('units')}>Clear all</button>
        </div>
    </div>
</div>

{/* Category Filter */}
<div className="filter-group">
    <button type="button" className="dropdown-button">Filter by Category ▼</button>
    <div className="dropdown-content">
        {[...new Set(courses.map(course => course.category))].map(category => (
            <label key={category} className="checkbox-item">
                <input
                    type="checkbox"
                    checked={filters.category.includes(category)}
                    onChange={() => toggleFilter('category', category)}
                />
                {category}
            </label>
        ))}
        <div className="dropdown-footer">
            <button onClick={() => clearFilter('category')}>Clear all</button>
        </div>
    </div>
</div>

{/* Leadership Filter */}
<div className="filter-group">
    <button type="button" className="dropdown-button">Filter by Leadership ▼</button>
    <div className="dropdown-content">
        {['Y', 'N'].map(option => (
            <label key={option} className="checkbox-item">
                <input
                    type="checkbox"
                    checked={filters.ldr.includes(option)}
                    onChange={() => toggleFilter('ldr', option)}
                />
                {option}
            </label>
        ))}
        <div className="dropdown-footer">
            <button onClick={() => clearFilter('ldr')}>Clear all</button>
        </div>
    </div>
</div>

{/* Days Filter */}
<div className="filter-group">
    <button type="button" className="dropdown-button">Filter by Days ▼</button>
    <div className="dropdown-content">
        {['M', 'T', 'W', 'Th', 'F'].map(day => (
            <label key={day} className="checkbox-item">
                <input
                    type="checkbox"
                    checked={filters.days.includes(day)}
                    onChange={() => toggleFilter('days', day)}
                />
                {day}
            </label>
        ))}
        <div className="dropdown-footer">
            <button onClick={() => clearFilter('days')}>Clear all</button>
        </div>
    </div>
</div>

{/* Time Filter */}
<div className="filter-group">
    <button type="button" className="dropdown-button">Filter by Time ▼</button>
    <div className="dropdown-content">
        {['morning', 'afternoon', 'evening'].map(block => (
            <label key={block} className="checkbox-item">
                <input
                    type="checkbox"
                    checked={filters.timeBlocks.includes(block)}
                    onChange={() => toggleFilter('timeBlocks', block)}
                />
                {block}
            </label>
        ))}
        <div className="dropdown-footer">
            <button onClick={() => clearFilter('timeBlocks')}>Clear all</button>
        </div>
    </div>
</div>

</div>





      <table className="courses-table">
      <thead>
        <tr>
          
          <th onClick={() => handleSort('courseTitle')} style={{ cursor: 'pointer', position: 'relative' }}>
              Course Title {renderSortArrow('courseTitle')}
          </th>

          <th onClick={() => handleSort('faculty1')} style={{ cursor: 'pointer' }}>
            Faculty {renderSortArrow('faculty1')}
          </th>
          <th onClick={() => handleSort('quarter')} style={{ cursor: 'pointer' }}>
            Quarter {renderSortArrow('quarter')}
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
            <td>{course.quarter || 'Not Available'}</td>
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
