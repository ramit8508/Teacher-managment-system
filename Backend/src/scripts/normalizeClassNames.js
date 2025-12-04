import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { DB_NAME } from '../constants.js';

// Load environment variables
dotenv.config();

// Map old class formats to new format
const classNameMapping = {
  // Old ordinal format
  '1st': '1A',
  '2nd': '2A',
  '3rd': '3A',
  '4th': '4A',
  '5th': '5A',
  '6th': '6A',
  '7th': '7A',
  '8th': '8A',
  '9th': '9A',
  '10th': '10A',
  '11th': '11A',
  '12th': '12A',
  
  // With "Class" prefix
  'Class 1': '1A',
  'Class 2': '2A',
  'Class 3': '3A',
  'Class 4': '4A',
  'Class 5': '5A',
  'Class 6': '6A',
  'Class 7': '7A',
  'Class 8': '8A',
  'Class 9': '9A',
  'Class 10': '10A',
  'Class 11': '11A',
  'Class 12': '12A',
};

// Function to normalize class name
const normalizeClassName = (className) => {
  if (!className) return '';
  
  const trimmed = className.trim();
  
  // Check if already in correct format (e.g., "10A", "11-A")
  if (/^\d{1,2}[A-D]$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  
  // Check if it has hyphen format like "11-A"
  if (/^\d{1,2}-[A-D]$/i.test(trimmed)) {
    return trimmed.replace('-', '').toUpperCase();
  }
  
  // Handle "Class X - Section Y" format
  const sectionMatch = trimmed.match(/Class (\d{1,2})\s*-\s*Section ([A-D])/i);
  if (sectionMatch) {
    return `${sectionMatch[1]}${sectionMatch[2].toUpperCase()}`;
  }
  
  // Handle "Class X Section Y" format (no dash)
  const sectionMatch2 = trimmed.match(/Class (\d{1,2})\s+Section ([A-D])/i);
  if (sectionMatch2) {
    return `${sectionMatch2[1]}${sectionMatch2[2].toUpperCase()}`;
  }
  
  // Check mapping table for ordinal numbers
  if (classNameMapping[trimmed]) {
    return classNameMapping[trimmed];
  }
  
  // If it's just "Class X", default to section A
  const classMatch = trimmed.match(/Class (\d{1,2})$/i);
  if (classMatch) {
    return `${classMatch[1]}A`;
  }
  
  // If it's just a number with "th", "st", "nd", "rd"
  const ordinalMatch = trimmed.match(/^(\d{1,2})(st|nd|rd|th)$/i);
  if (ordinalMatch) {
    return `${ordinalMatch[1]}A`; // Default to section A
  }
  
  // Return as uppercase if nothing matches
  return trimmed.toUpperCase();
};

const normalizeAllClassNames = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log('📦 Connected to MongoDB');

    // Get all students with className
    const students = await User.find({ 
      role: 'student',
      className: { $exists: true, $ne: '' }
    });

    console.log(`\n🔍 Found ${students.length} students with class names\n`);

    let updated = 0;
    let unchanged = 0;

    for (const student of students) {
      const oldClassName = student.className;
      const newClassName = normalizeClassName(oldClassName);

      if (oldClassName !== newClassName) {
        console.log(`✏️  Updating: "${oldClassName}" → "${newClassName}" (${student.fullName})`);
        student.className = newClassName;
        await student.save();
        updated++;
      } else {
        unchanged++;
      }
    }

    console.log(`\n✅ Migration Complete!`);
    console.log(`   - Updated: ${updated} students`);
    console.log(`   - Unchanged: ${unchanged} students`);
    console.log(`   - Total: ${students.length} students\n`);

    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
normalizeAllClassNames();
