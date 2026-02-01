import { useState, useEffect } from 'react';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the Django API
    fetch('http://127.0.0.1:8000/mywebapp/courses/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>Error loading courses: {error.message}</p>;

  return (
    <div>
      <h1>Available Courses</h1>
      <div className="course-list">
        {courses.map(course => (
          <div key={course.id} className="course-card" style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <small>Instructor: {course.instructor}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseList;
