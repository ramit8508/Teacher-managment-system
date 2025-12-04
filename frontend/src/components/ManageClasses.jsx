import { useState, useEffect } from 'react';
import { authAPI, classAPI } from '../api';

const ManageClasses = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [dbClasses, setDbClasses] = useState([]); // Classes from database
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    grade: '',
    section: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students
      const studentsRes = await authAPI.getAllUsers({ role: 'student' });
      const studentsList = studentsRes.data.data || [];
      setStudents(studentsList);
      
      // Fetch classes from database
      const classesRes = await classAPI.getAllClassNames();
      const dbClassList = classesRes.data.data || [];
      setDbClasses(dbClassList);
      
      // Merge database classes with classes from students
      const classMap = new Map();
      
      // Add all database classes first
      dbClassList.forEach(className => {
        classMap.set(className, {
          name: className,
          studentCount: 0,
          students: [],
          inDatabase: true
        });
      });
      
      // Add student counts
      studentsList.forEach(student => {
        if (student.className) {
          const className = student.className.toUpperCase();
          if (!classMap.has(className)) {
            classMap.set(className, {
              name: className,
              studentCount: 0,
              students: [],
              inDatabase: false
            });
          }
          const classData = classMap.get(className);
          classData.studentCount++;
          classData.students.push(student);
        }
      });

      // Sort classes
      const sortedClasses = Array.from(classMap.values()).sort((a, b) => {
        const matchA = a.name.match(/^(\d+)([A-Z]+)$/);
        const matchB = b.name.match(/^(\d+)([A-Z]+)$/);
        if (matchA && matchB) {
          const gradeA = parseInt(matchA[1]);
          const gradeB = parseInt(matchB[1]);
          if (gradeA !== gradeB) return gradeA - gradeB;
          return matchA[2].localeCompare(matchB[2]);
        }
        return a.name.localeCompare(b.name);
      });

      setClasses(sortedClasses);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    
    if (!formData.grade || !formData.section) {
      alert('Please enter both grade and section');
      return;
    }

    const newClassName = `${formData.grade}${formData.section.toUpperCase()}`;
    
    // Check if class already exists
    if (classes.some(cls => cls.name === newClassName)) {
      alert(`Class ${newClassName} already exists!`);
      return;
    }

    try {
      // Save class to database
      await classAPI.createClassName(newClassName);
      
      alert(`✅ Class ${newClassName} created successfully!\nYou can now add students to this class.`);
      
      setShowAddModal(false);
      setFormData({ grade: '', section: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class. Please try again.');
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    
    if (!formData.grade || !formData.section) {
      alert('Please enter both grade and section');
      return;
    }

    const newClassName = `${formData.grade}${formData.section.toUpperCase()}`;
    const oldClassName = editingClass.name;

    if (newClassName === oldClassName) {
      alert('No changes made');
      setShowEditModal(false);
      return;
    }

    // Check if new class name already exists
    if (classes.some(cls => cls.name === newClassName)) {
      alert(`Class ${newClassName} already exists!`);
      return;
    }

    try {
      // Update all students in this class
      const studentsToUpdate = editingClass.students;
      const updatePromises = studentsToUpdate.map(student =>
        authAPI.updateUser(student._id, { className: newClassName })
      );

      await Promise.all(updatePromises);

      alert(`✅ Class renamed from ${oldClassName} to ${newClassName}!\n${studentsToUpdate.length} student(s) updated.`);
      
      setShowEditModal(false);
      setEditingClass(null);
      setFormData({ grade: '', section: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Failed to update class. Please try again.');
    }
  };

  const handleDeleteClass = async (classItem) => {
    const confirmed = confirm(
      `⚠️ Warning!\n\nAre you sure you want to delete class ${classItem.name}?\n\nThis will:\n• Remove ${classItem.studentCount} student(s) from this class\n• Students will become "Unassigned"\n• Delete the class from the system\n\nThis action cannot be undone!`
    );

    if (!confirmed) return;

    try {
      // Remove className from all students in this class
      const updatePromises = classItem.students.map(student =>
        authAPI.updateUser(student._id, { className: '' })
      );

      await Promise.all(updatePromises);

      // Delete class from database if it exists
      if (classItem.inDatabase || dbClasses.includes(classItem.name)) {
        await classAPI.deleteClassName(classItem.name);
      }

      alert(`✅ Class ${classItem.name} deleted!\n${classItem.studentCount} student(s) are now unassigned.`);
      fetchData();
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class. Please try again.');
    }
  };

  const openEditModal = (classItem) => {
    const match = classItem.name.match(/^(\d+)([A-Z]+)$/);
    if (match) {
      setFormData({
        grade: match[1],
        section: match[2]
      });
    }
    setEditingClass(classItem);
    setShowEditModal(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Manage Classes</h1>
        <p className="text-sm sm:text-base text-gray-600">Add, edit, or delete classes in your school</p>
      </div>

      {/* Add Class Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>Add New Class</span>
        </button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading classes...</p>
          </div>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Classes Yet</h3>
          <p className="text-gray-600 mb-4">Start by adding your first class!</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Add First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map((classItem) => (
            <div
              key={classItem.name}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-blue-600">{classItem.name}</h3>
                  <p className="text-sm text-gray-500">Class</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(classItem)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit Class"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteClass(classItem)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Class"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-600">Students</span>
                  <span className="text-lg font-semibold text-gray-800">{classItem.studentCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Class</h2>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade/Class Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 outline-none"
                  placeholder="e.g., 1, 5, 10, 12"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength="1"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 outline-none uppercase"
                  placeholder="e.g., A, B, C, D, E"
                  pattern="[A-Za-z]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Single letter A-Z</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Preview:</span> {formData.grade && formData.section ? `${formData.grade}${formData.section}` : 'e.g., 5E'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                >
                  Create Class
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ grade: '', section: '' });
                  }}
                  className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Class: {editingClass.name}</h2>
            <form onSubmit={handleEditClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade/Class Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="e.g., 1, 5, 10, 12"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength="1"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none uppercase"
                  placeholder="e.g., A, B, C, D, E"
                  pattern="[A-Za-z]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Single letter A-Z</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <p className="text-sm text-orange-700">
                  <span className="font-semibold">⚠️ Warning:</span> This will rename the class and update all {editingClass.studentCount} student(s).
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Update Class
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingClass(null);
                    setFormData({ grade: '', section: '' });
                  }}
                  className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClasses;
