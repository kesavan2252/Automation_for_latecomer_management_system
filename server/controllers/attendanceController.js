import pool from "../config/db.js";
import cron from "node-cron";
import nodemailer from "nodemailer";
// Update the Chart.js import
import { Chart } from 'chart.js/auto';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

// @desc Get latecomer count per department
// @route GET /api/attendance/department-count
// Add this function to your controller
export const getDepartmentCounts = async (req, res) => {
  try {
    const query = `
      SELECT 
        department,
        COUNT(*) as count
      FROM attendance
      WHERE DATE(date) = CURRENT_DATE
      GROUP BY department
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting department counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// @desc Mark attendance for a student
// @route POST /api/attendance/mark-attendance

// Mark Attendance with Late Status
export const markAttendance = async (req, res) => {
    try {
        const { roll_no } = req.body;
        if (!roll_no) return res.status(400).json({ error: "Roll Number is required" });

        const now = new Date();
        const currentISTDate = now.toISOString().split("T")[0];
        const currentTimeIST = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false });

        const studentQuery = await pool.query("SELECT id, name, department FROM students WHERE roll_no = $1", [roll_no]);
        if (studentQuery.rows.length === 0) return res.status(404).json({ error: "Student not found" });

        const { id: studentId, department } = studentQuery.rows[0];
        const name = studentQuery.rows[0].name.trim(); // Trim the name to remove spaces

        // Check if attendance already exists for today
        const existingRecord = await pool.query(
            "SELECT * FROM attendance WHERE student_id = $1 AND date::date = $2",
            [studentId, currentISTDate]
        );

        // Determine status: Late if after 9:15 AM
        const status = currentTimeIST >= "09:15:00" ? "Late" : "On-Time";

        let attendanceRecord;
        if (existingRecord.rows.length > 0) {
            attendanceRecord = await pool.query(
                `UPDATE attendance SET date = NOW(), status = $1 
                 WHERE student_id = $2 AND date::date = $3 
                 RETURNING *`,
                [status, studentId, currentISTDate]
            );
        } else {
            attendanceRecord = await pool.query(
                `INSERT INTO attendance (student_id, department, date, status, roll_no) 
                 VALUES ($1, $2, NOW(), $3, $4) 
                 RETURNING *`,
                [studentId, department, status, roll_no]
            );
        }

        // Return name and department explicitly
        return res.status(201).json({ 
            message: "Attendance marked successfully!", 
            record: { 
                ...attendanceRecord.rows[0], 
                name: name,  // Ensure name is included in response
                department: department
            } 
        });

    } catch (error) {
        console.error("Error marking attendance:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};





// @desc Get student attendance report
// @route GET /api/attendance/report
export const getStudentReport = async (req, res) => {
    try {
        const { roll_no, start_date, end_date } = req.query;

        // Check if student exists
        const studentResult = await pool.query("SELECT id, name, department FROM students WHERE roll_no = $1", [roll_no]);

        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const student = studentResult.rows[0];

        // Fetch attendance records within the date range
        const attendanceQuery = `
            SELECT date, status
            FROM attendance
            WHERE student_id = $1
            AND date BETWEEN $2 AND $3
            ORDER BY date ASC
        `;

        const attendanceResult = await pool.query(attendanceQuery, [student.id, start_date, end_date]);

        res.status(200).json({
            student: {
                roll_no,
                name: student.name,
                department: student.department,
            },
            attendance: attendanceResult.rows,
        });

    } catch (error) {
        console.error("Error in getStudentReport:", error);
        res.status(500).json({ error: "Server Error" });
    }
};


// @desc Get detailed student attendance report
// @route GET /api/attendance/report/details
export const getStudentAttendanceReport = async (req, res) => {
  try {
      const { roll_no, start_date, end_date } = req.query;
      console.log("Received Query Params:", { roll_no, start_date, end_date });

      if (!roll_no || !start_date || !end_date) {
          return res.status(400).json({ error: "Missing required parameters" });
      }

      const query = `
          SELECT a.date, 
                 s.roll_no, 
                 s.name, 
                 s.department, 
                 CASE 
                   WHEN a.date::time > '09:15:00' THEN 'Late'
                   ELSE 'On-Time'
                 END AS status
          FROM attendance a
          JOIN students s ON a.student_id = s.id
          WHERE s.roll_no = $1
          AND a.date::date BETWEEN $2 AND $3
          ORDER BY a.date ASC;
      `;

      const result = await pool.query(query, [roll_no, start_date, end_date]);

      if (result.rows.length === 0) {
          return res.status(404).json({ message: "No attendance records found" });
      }

      res.json({
          student: {
              roll_no,
              name: result.rows[0].name,
              department: result.rows[0].department,
          },
          attendance: result.rows.map(row => ({
              date: row.date,
              status: row.status
          }))
      });
  } catch (error) {
      console.error("Error fetching student report:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};

// @desc Get filtered attendance based on query parameters
// @route GET /api/attendance/filter
export const getFilteredAttendance = async (req, res) => {
  try {
      const { startDate, endDate } = req.query;
      console.log("Received Params:", { startDate, endDate });

      if (!startDate || !endDate) {
          return res.status(400).json({ error: "Start date and end date are required." });
      }

      const result = await pool.query(`
          SELECT 
              a.id, 
              s.roll_no, 
              s.name, 
              s.department, 
              a.date AS full_date, -- Full timestamp
              s.batch,  -- ✅ Corrected from a.batch to s.batch
              a.status
          FROM attendance a
          JOIN students s ON a.student_id = s.id
          WHERE a.date BETWEEN $1::DATE AND $2::DATE + INTERVAL '1 day' - INTERVAL '1 second'
          ORDER BY a.date DESC
      `, [startDate, endDate]);

      // ✅ Format the results: Extract date and time separately
      const formattedResult = result.rows.map(row => {
          const dateObj = new Date(row.full_date);
          return {
              id: row.id,
              roll_no: row.roll_no,
              name: row.name,
              department: row.department,
              date: dateObj.toISOString().split("T")[0], // Extract YYYY-MM-DD
              time: dateObj.toLocaleTimeString("en-US", { hour12: true }), // Format to 12-hour time
              batch: row.batch, // ✅ Ensure batch is included
              status: row.status
          };
      });

      console.log("Formatted Query Result:", formattedResult);
      res.json(formattedResult);

  } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};


export const filterAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required." });
    }

    // Convert to PostgreSQL-compatible timestamps in UTC
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T23:59:59Z`);

    // Query with proper timezone conversion
    const result = await pool.query(
      `SELECT 
        a.roll_no, 
        s.name, 
        a.department, 
        a.date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' AS ist_date,
        a.status,
        s.batch
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE a.date >= $1 AND a.date <= $2
       ORDER BY a.date DESC`,
      [start.toISOString(), end.toISOString()]
    );

    // Format dates consistently for frontend
    const formattedRows = result.rows.map(row => ({
      ...row,
      date: new Date(row.ist_date).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: error.message });
  }
};
// Add Attendance Record
export const addAttendance = async (req, res) => {
  const { roll_no, name, department, batch } = req.body;

  if (!roll_no || !name || !department || !batch) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Fetch student_id using roll_no
    const studentResult = await pool.query(
      "SELECT id FROM students WHERE roll_no = $1",
      [roll_no]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const student_id = studentResult.rows[0].id;

    // Check if an attendance record already exists for today
    const today = new Date().toISOString().split("T")[0]; // Get today's date (YYYY-MM-DD)
    const existingRecord = await pool.query(
      "SELECT * FROM attendance WHERE student_id = $1 AND DATE(time) = $2",
      [student_id, today]
    );

    if (existingRecord.rows.length > 0) {
      // Update the last entry's time instead of inserting a new record
      await pool.query(
        "UPDATE attendance SET time = NOW() WHERE student_id = $1 AND DATE(time) = $2",
        [student_id, today]
      );

      return res.status(200).json({
        message: "Attendance updated with latest time!",
        updatedRecord: existingRecord.rows[0],
      });
    }

    // If no previous record exists, insert a new attendance record
    const result = await pool.query(
      "INSERT INTO attendance (student_id, department, status, time) VALUES ($1, $2, 'Late', NOW()) RETURNING *",
      [student_id, department]
    );

    res.status(201).json({
      message: "Attendance recorded successfully",
      record: result.rows[0],
    });
  } catch (error) {
    console.error("Error recording attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const getDepartmentReport = async (req, res) => {
    try {
        const { department, batch, startDate, endDate } = req.query;

        if (!department || !batch || !startDate || !endDate) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const query = `
    SELECT 
        s.roll_no, 
        s.name, 
        s.department, 
        s.batch, 
        a.date AT TIME ZONE 'Asia/Kolkata' AS ist_date, 
        a.status
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE 
        s.department = $1 
        AND s.batch = $2 
        AND a.date BETWEEN $3::DATE AND $4::DATE + INTERVAL '1 day' - INTERVAL '1 second'
    ORDER BY a.date ASC
`;


        const values = [department, batch, startDate, endDate];

        const { rows } = await pool.query(query, values);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching department report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Email configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Department HOD emails
const departmentEmails = {
    "CSE": "suryakesavan6@gmail.com",
    "ECE": "suryakesavan6@gmail.com",
    "MECH": "suryakesavan6@gmail.com",
    "PRINCIPAL": "suryakesavan6@gmail.com"
};

// Initialize chart generation
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 400 });

// Schedule daily reports at 11:50 AM
cron.schedule('50 11 * * *', async () => {
    await sendDailyReports();
});

// Schedule weekly reports every Sunday at 11:50 AM
cron.schedule('50 11 * * 0', async () => {
    await sendWeeklyReports();
});

// Schedule monthly reports on 1st of every month at 11:50 AM
cron.schedule('50 11 1 * *', async () => {
    await sendMonthlyReports();
});

async function generateAttendanceChart(data) {
    const config = {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Late Comers',
                data: Object.values(data),
                backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }]
        }
    };
    return await chartJSNodeCanvas.renderToBuffer(config);
}

async function sendDailyReports() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get department-wise attendance
        const deptStats = await pool.query(`
            SELECT 
                department,
                COUNT(*) FILTER (WHERE status = 'Late') as late_count,
                COUNT(*) as total_count
            FROM attendance
            WHERE DATE(date) = CURRENT_DATE
            GROUP BY department
        `);

        for (const dept of Object.keys(departmentEmails)) {
            if (dept === 'PRINCIPAL') continue;
            const deptData = deptStats.rows.find(r => r.department === dept) || { late_count: 0, total_count: 0 };
            
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: departmentEmails[dept],
                subject: `Daily Attendance Report - ${dept} (${today})`,
                html: generateDailyEmailTemplate(dept, deptData)
            });
        }



        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: departmentEmails.PRINCIPAL,
            subject: `Daily Attendance Summary - All Departments (${today})`,
            html: generatePrincipalDailyTemplate(deptStats.rows)
        });

    } catch (error) {
        console.error('Error sending daily reports:', error);
    }
}
        // Generate chart
        const chartBuffer = await generateAttendanceChart(
            Object.fromEntries(deptStats.rows.map(r => [r.department, r.late_count]))
        );

        // Send to HODs
        for (const dept of Object.keys(departmentEmails)) {
            if (dept === 'PRINCIPAL') continue;
            const deptData = deptStats.rows.find(r => r.department === dept) || { late_count: 0, total_count: 0 };
            
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: departmentEmails[dept],
                subject: `Daily Attendance Report - ${dept} (${today})`,
                html: generateDailyEmailTemplate(dept, deptData),
                attachments: [{
                    filename: 'attendance-chart.png',
                    content: chartBuffer
                }]
            });
        }

        // Send consolidated report to Principal
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: departmentEmails.PRINCIPAL,
            subject: `Daily Attendance Summary - All Departments (${today})`,
            html: generatePrincipalDailyTemplate(deptStats.rows),
            attachments: [{
                filename: 'attendance-chart.png',
                content: chartBuffer
            }]
        });

    } catch (error) {
        console.error('Error sending daily reports:', error);
    }
}

async function sendWeeklyReports() {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        // Get weekly statistics
        const weeklyStats = await pool.query(`
            SELECT 
                department,
                COUNT(*) FILTER (WHERE status = 'Late') as late_count,
                COUNT(*) as total_count,
                DATE(date) as attendance_date
            FROM attendance
            WHERE date BETWEEN $1 AND $2
            GROUP BY department, DATE(date)
            ORDER BY department, attendance_date
        `, [startDate, endDate]);

        // Generate weekly trend chart
        const chartData = {};
        weeklyStats.rows.forEach(row => {
            if (!chartData[row.department]) {
                chartData[row.department] = {
                    dates: [],
                    counts: []
                };
            }
            chartData[row.department].dates.push(row.attendance_date);
            chartData[row.department].counts.push(row.late_count);
        });

        const chartBuffer = await generateWeeklyChart(chartData);

        // Send department-specific reports
        for (const dept of Object.keys(departmentEmails)) {
            if (dept === 'PRINCIPAL') continue;
            const deptData = weeklyStats.rows.filter(r => r.department === dept);
            
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: departmentEmails[dept],
                subject: `Weekly Attendance Report - ${dept}`,
                html: generateWeeklyEmailTemplate(dept, deptData),
                attachments: [{
                    filename: 'weekly-trend.png',
                    content: chartBuffer
                }]
            });
        }

        // Send consolidated report to Principal
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: departmentEmails.PRINCIPAL,
            subject: 'Weekly Attendance Summary - All Departments',
            html: generatePrincipalWeeklyTemplate(weeklyStats.rows),
            attachments: [{
                filename: 'weekly-trend.png',
                content: chartBuffer
            }]
        });

    } catch (error) {
        console.error('Error sending weekly reports:', error);
    }
}

async function sendMonthlyReports() {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 1);

        // Get monthly statistics with detailed breakdown
        const monthlyStats = await pool.query(`
            SELECT 
                department,
                COUNT(*) FILTER (WHERE status = 'Late') as late_count,
                COUNT(*) as total_count,
                EXTRACT(WEEK FROM date) as week_number,
                COUNT(*) FILTER (WHERE EXTRACT(DOW FROM date) = 1) as monday_count,
                COUNT(*) FILTER (WHERE EXTRACT(DOW FROM date) = 2) as tuesday_count,
                COUNT(*) FILTER (WHERE EXTRACT(DOW FROM date) = 3) as wednesday_count,
                COUNT(*) FILTER (WHERE EXTRACT(DOW FROM date) = 4) as thursday_count,
                COUNT(*) FILTER (WHERE EXTRACT(DOW FROM date) = 5) as friday_count
            FROM attendance
            WHERE date BETWEEN $1 AND $2
            GROUP BY department, EXTRACT(WEEK FROM date)
            ORDER BY department, week_number
        `, [startDate, endDate]);

        // Generate monthly analytics chart
        const chartBuffer = await generateMonthlyChart(monthlyStats.rows);

        // Send department-specific reports
        for (const dept of Object.keys(departmentEmails)) {
            if (dept === 'PRINCIPAL') continue;
            const deptData = monthlyStats.rows.filter(r => r.department === dept);
            
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: departmentEmails[dept],
                subject: `Monthly Attendance Analysis - ${dept}`,
                html: generateMonthlyEmailTemplate(dept, deptData),
                attachments: [{
                    filename: 'monthly-analysis.png',
                    content: chartBuffer
                }]
            });
        }

        // Send consolidated report to Principal
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: departmentEmails.PRINCIPAL,
            subject: 'Monthly Attendance Analysis - All Departments',
            html: generatePrincipalMonthlyTemplate(monthlyStats.rows),
            attachments: [{
                filename: 'monthly-analysis.png',
                content: chartBuffer
            }]
        });

    } catch (error) {
        console.error('Error sending monthly reports:', error);
    }
}

// Add these new chart generation functions
async function generateWeeklyChart(data) {
    const config = {
        type: 'line',
        data: {
            labels: Object.keys(data)[0] ? data[Object.keys(data)[0]].dates : [],
            datasets: Object.keys(data).map(dept => ({
                label: dept,
                data: data[dept].counts,
                fill: false,
                borderColor: getRandomColor()
            }))
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Late Arrivals'
                    }
                }
            }
        }
    };
    return await chartJSNodeCanvas.renderToBuffer(config);
}

async function generateMonthlyChart(data) {
    const config = {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: Object.keys(departmentEmails)
                .filter(dept => dept !== 'PRINCIPAL')
                .map(dept => ({
                    label: dept,
                    data: data.filter(r => r.department === dept).map(r => r.late_count),
                    backgroundColor: getRandomColor(0.5)
                }))
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Late Arrivals per Week'
                    }
                }
            }
        }
    };
    return await chartJSNodeCanvas.renderToBuffer(config);
}

// Helper function for random colors
function getRandomColor(alpha = 1) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Add these new email templates
function generateWeeklyEmailTemplate(dept, stats) {
    return `
        <h2>${dept} Department - Weekly Attendance Report</h2>
        <table border="1">
            <tr>
                <th>Date</th>
                <th>Total Students</th>
                <th>Late Arrivals</th>
                <th>Percentage</th>
            </tr>
            ${stats.map(day => `
                <tr>
                    <td>${new Date(day.attendance_date).toLocaleDateString()}</td>
                    <td>${day.total_count}</td>
                    <td>${day.late_count}</td>
                    <td>${((day.late_count / day.total_count) * 100).toFixed(2)}%</td>
                </tr>
            `).join('')}
        </table>
        <p>Weekly Trend Analysis Attached</p>
    `;
}

function generateMonthlyEmailTemplate(dept, stats) {
    return `
        <h2>${dept} Department - Monthly Attendance Analysis</h2>
        <h3>Weekly Breakdown</h3>
        <table border="1">
            <tr>
                <th>Week</th>
                <th>Total</th>
                <th>Late</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
            </tr>
            ${stats.map(week => `
                <tr>
                    <td>Week ${week.week_number}</td>
                    <td>${week.total_count}</td>
                    <td>${week.late_count}</td>
                    <td>${week.monday_count}</td>
                    <td>${week.tuesday_count}</td>
                    <td>${week.wednesday_count}</td>
                    <td>${week.thursday_count}</td>
                    <td>${week.friday_count}</td>
                </tr>
            `).join('')}
        </table>
        <p>Monthly Analysis Chart Attached</p>
    `;
}

// Add this at the bottom of your exports
// Update the testEmailReports function
export const testEmailReports = async (req, res) => {
    try {
        console.log("🧪 Testing all email reports...");
        
        // Test all reports
        await Promise.all([
            sendDailyReports(),
            sendWeeklyReports(),
            sendMonthlyReports()
        ]);
        
        console.log("✅ All email reports sent successfully");
        res.json({ 
            success: true,
            message: "All email reports (daily, weekly, monthly) triggered successfully" 
        });
    } catch (error) {
        console.error("❌ Email test failed:", error);
        res.status(500).json({ 
            success: false,
            error: "Email test failed",
            details: error.message 
        });
    }
};

// Add missing email template functions
function generatePrincipalWeeklyTemplate(stats) {
    return `
        <h2>Weekly Attendance Summary - All Departments</h2>
        <table border="1">
            <tr>
                <th>Department</th>
                <th>Total Students</th>
                <th>Late Arrivals</th>
                <th>Percentage</th>
            </tr>
            ${stats.map(dept => `
                <tr>
                    <td>${dept.department}</td>
                    <td>${dept.total_count}</td>
                    <td>${dept.late_count}</td>
                    <td>${((dept.late_count / dept.total_count) * 100).toFixed(2)}%</td>
                </tr>
            `).join('')}
        </table>
        <p>Weekly Trend Analysis Attached</p>
    `;
}

function generatePrincipalMonthlyTemplate(stats) {
    return `
        <h2>Monthly Attendance Analysis - All Departments</h2>
        <table border="1">
            <tr>
                <th>Department</th>
                <th>Week</th>
                <th>Total</th>
                <th>Late</th>
                <th>Mon-Fri Distribution</th>
            </tr>
            ${stats.map(week => `
                <tr>
                    <td>${week.department}</td>
                    <td>Week ${week.week_number}</td>
                    <td>${week.total_count}</td>
                    <td>${week.late_count}</td>
                    <td>
                        M:${week.monday_count} | 
                        T:${week.tuesday_count} | 
                        W:${week.wednesday_count} | 
                        T:${week.thursday_count} | 
                        F:${week.friday_count}
                    </td>
                </tr>
            `).join('')}
        </table>
        <p>Monthly Analysis Chart Attached</p>
    `;
}

function generateDailyEmailTemplate(dept, stats) {
    return `
        <h2>${dept} Department - Daily Attendance Report</h2>
        <p>Total Students: ${stats.total_count}</p>
        <p>Late Arrivals: ${stats.late_count}</p>
        <p>Percentage: ${((stats.late_count / stats.total_count) * 100).toFixed(2)}%</p>
    `;
}

