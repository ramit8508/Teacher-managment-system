import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';

/**
 * Debug component to show all students and their className values
 * Temporarily add this to your Dashboard to see student data
 */
const DebugStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await authAPI.getAllUsers({ role: 'student' });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group students by className
  const groupedByClass = students.reduce((acc, student) => {
    const className = student.className || 'No Class';
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(student);
    return acc;
  }, {});

  if (loading) return <div className="p-6">Loading students...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Debug: Students by Class</h2>
      <p className="text-gray-600 mb-4">Total Students: {students.length}</p>

      <div className="space-y-4">
        {Object.entries(groupedByClass).map(([className, classStudents]) => (
          <div key={className} className="bg-white border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">
              Class: "{className}" ({classStudents.length} students)
            </h3>
            <div className="text-sm text-gray-600">
              <p>Normalized: "{className.trim().toUpperCase()}"</p>
            </div>
            <div className="mt-2 space-y-1">
              {classStudents.slice(0, 3).map(student => (
                <div key={student._id} className="text-sm">
                  • {student.fullName} - {student.email}
                </div>
              ))}
              {classStudents.length > 3 && (
                <p className="text-sm text-gray-500">...and {classStudents.length - 3} more</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugStudents;
