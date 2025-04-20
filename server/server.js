import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from "./routes/attendanceRoutes.js";
import studentRoutes from './routes/studentRoutes.js'; // ✅ Import student routes
dotenv.config();

const app = express();
dotenv.config();

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://automation-for-latecomer-management-system.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Add a test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/students", studentRoutes); 

app.get("/", (req, res) => {
    res.send("Backend is working!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
