import express from 'express';
import pool from '../config/db.js';
import { 
    getAllStudents, 
    addStudent, 
    importStudents, 
    getStudentByRollNo, 
    updateStudent,
    getStudentByRollNoAndBatch
    
} 
 from '../controllers/studentController.js'; // Import functions

import multer from 'multer';  

import protect from '../middleware/authMiddleware.js';
import { authenticateToken } from "../middleware/authMiddleware.js";
const router = express.Router();

// ✅ Fetch all students
router.get('/', protect, getAllStudents);



// ✅ Add a new student
router.post('/',authenticateToken ,addStudent);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/"); // Ensure this folder exists in your project
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
// ✅ Import students from CSV
router.post('/import', upload.single('file'), importStudents);


// ✅ Fetch student by Roll Number
router.get('/:rollNo', protect, getStudentByRollNo);
router.get('/:rollNo', protect, (req, res, next) => {
    console.log("Received request for Roll No:", req.params.rollNo);
    next();
}, getStudentByRollNo);


// ✅ Update student details
router.put("/:roll_no", updateStudent);




// ✅ Delete Student by Roll Number
// Delete a student by roll number
router.get('/:rollNo/:batch',authenticateToken, getStudentByRollNoAndBatch);


  // Update the delete route
  router.delete('/delete/:department/:batch', authenticateToken, async (req, res) => {
      const { department, batch } = req.params;
      const { rollNo } = req.body;
      
      try {
          const result = await pool.query(
              "DELETE FROM students WHERE department = $1 AND batch = $2 AND roll_no = $3 RETURNING *",
              [department.trim(), batch.trim(), rollNo.trim()]
          );
  
          if (result.rowCount === 0) {
              return res.status(404).json({ message: "Student not found." });
          }
  
          res.json({ message: "Student deleted successfully" });
      } catch (error) {
          console.error("Error deleting student:", error);
          res.status(500).json({ message: "Server error." });
      }
  });


// Add this route for deleting individual student
router.delete('/:rollNo', authenticateToken, async (req, res) => {
    const { rollNo } = req.params;
    
    try {
        const result = await pool.query(
            "DELETE FROM students WHERE roll_no = $1 RETURNING *",
            [rollNo]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Student not found." });
        }

        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: "Server error." });
    }
});




export default router;
