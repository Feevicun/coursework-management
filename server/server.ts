import express from "express";
import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import pool from './db.js';
import bcrypt from 'bcrypt';
import { fileURLToPath } from "url";
import jwt from 'jsonwebtoken';
import type { JwtUserPayload } from './types';
import ChatWebSocketServer from './websocket-server.ts';



// __dirname для ES-модулів
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 4000;



// JWT секрет (поки що тут, пізніше краще винести в env)
const JWT_SECRET = "super_secret_key_change_this";

// Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());


// Структури проектів
const PROJECT_STRUCTURES = {
  diploma: [
    { key: 'intro', name: 'Вступ' },
    { key: 'theory', name: 'Теоретична частина' },
    { key: 'design', name: 'Проектна частина' },
    { key: 'implementation', name: 'Реалізація' },
    { key: 'conclusion', name: 'Висновки' },
    { key: 'sources', name: 'Список літератури' },
    { key: 'appendix', name: 'Додатки' },
    { key: 'abstract', name: 'Реферат' },
    { key: 'cover', name: 'Титульна сторінка' },
    { key: 'content', name: 'Зміст' }
  ],
  coursework: [
    { key: 'intro', name: 'Вступ' },
    { key: 'theory', name: 'Теоретична частина' },
    { key: 'design', name: 'Практична частина' },
    { key: 'conclusion', name: 'Висновки' },
    { key: 'sources', name: 'Список літератури' },
    { key: 'appendix', name: 'Додатки' },
    { key: 'cover', name: 'Титульна сторінка' },
    { key: 'content', name: 'Зміст' }
  ],
  practice: [
    { key: 'intro', name: 'Вступ' },
    { key: 'tasks', name: 'Завдання практики' },
    { key: 'diary', name: 'Щоденник практики' },
    { key: 'report', name: 'Звіт про практику' },
    { key: 'conclusion', name: 'Висновки' },
    { key: 'sources', name: 'Список літератури' },
    { key: 'appendix', name: 'Додатки' }
  ]
};

interface Topic {
  title: string;
  category: string;
  description: string;
  relevance: number;
}

interface StructureItem {
  id: number;
  key: string;
  progress: number;
  status: string;
  content: string;
}

// Додайте тип ChatMember у ваші типи
interface ChatMember {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  email: string;
  type: 'supervisor' | 'student';
  isOnline: boolean;
}


// Тип ключів структури
type ProjectType = keyof typeof PROJECT_STRUCTURES; // "diploma" | "coursework" | "practice"

// Функція для ініціалізації структури проекту
async function initializeProjectStructure(userId: number, projectType: ProjectType) {
  const structure = PROJECT_STRUCTURES[projectType];
  if (!structure) {
    throw new Error(`Unknown project type: ${projectType}`);
  }

  // Видаляємо існуючі записи для цього користувача та типу проекту
  await pool.query(
    'DELETE FROM user_chapters WHERE user_id = $1 AND project_type = $2',
    [userId, projectType]
  );

  // Створюємо нові записи для всіх глав
  for (const chapter of structure) {
    await pool.query(
      `INSERT INTO user_chapters 
       (user_id, project_type, chapter_key, progress, status, student_note, created_at, updated_at)
       VALUES ($1, $2, $3, 0, 'pending', '', NOW(), NOW())
       ON CONFLICT (user_id, project_type, chapter_key) 
       DO NOTHING`,
      [userId, projectType, chapter.key]
    );
  }
}



// ============ API ROUTES ============

// Middleware для аутентифікації через JWT
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "Токен не надано" });
    }

    console.log("🔑 Token received, verifying...");
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("❌ Invalid token:", err.message);
        return res.status(403).json({ message: "Невалідний токен" });
      }

      // Типізація decoded об'єкта
      const decodedObj = decoded as JwtUserPayload;
      
      // Детальне логування декодованого токена
      console.log("🔍 Decoded token payload:", {
        userId: decodedObj.userId,
        email: decodedObj.email,
        role: decodedObj.role,
        allFields: Object.keys(decodedObj)
      });
      
      // Перевіряємо, чи є userId в токені
      if (!decodedObj.userId) {
        console.error("❌ No userId in token payload");
        console.error("Available fields:", Object.keys(decodedObj));
        return res.status(403).json({ 
          message: "Невалідний токен: відсутній userId" 
        });
      }

      // Створюємо об'єкт користувача
      req.user = decodedObj;
      
      console.log(`✅ Authenticated user: userId=${req.user.userId}, email=${req.user.email}, role=${req.user.role}`);
      next();
    });
  } catch (error) {
    console.error("❌ Authentication middleware error:", error);
    return res.status(500).json({ message: "Помилка аутентифікації" });
  }
}

// Отримати всіх користувачів
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, faculty_id, department_id FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Database error fetching users" });
  }
});



// Оновлений API для реєстрації
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, facultyId, departmentId, specialtyId, groupId, role } = req.body;
    
    console.log('🔍 Registration attempt:', { firstName, lastName, email, role, facultyId, departmentId, specialtyId, groupId });
    
    // Валідація обов'язкових полів
    if (!firstName || !lastName || !email || !password || !facultyId || !departmentId) {
      return res.status(400).json({ message: 'Будь ласка, заповніть всі обовʼязкові поля' });
    }

    if (role === 'student' && (!specialtyId || !groupId)) {
      return res.status(400).json({ message: 'Для студента обовʼязкові спеціальність та група' });
    }

    // Перевірка унікальності email
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ message: 'Користувач з таким email вже існує' });
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Для викладачів встановлюємо null для спеціальності та групи
    const finalSpecialtyId = role === 'teacher' ? null : specialtyId;
    const finalGroupId = role === 'teacher' ? null : groupId;

    // Додавання користувача
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, faculty_id, department_id, specialty_id, group_id, registeredat, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
       RETURNING id, name, email, role, faculty_id, department_id, specialty_id, group_id`,
      [
        `${firstName} ${lastName}`, 
        email, 
        hashedPassword, 
        role, 
        facultyId, 
        departmentId, 
        finalSpecialtyId, 
        finalGroupId
      ]
    );

    const user = result.rows[0];
    
    // Використовуємо константу JWT_SECRET замість process.env.JWT_SECRET
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h' // Додаємо термін дії токена
    });

    console.log('✅ User registered successfully:', user.id);
    
    res.json({
      message: 'Користувач успішно зареєстрований',
      token,
      user: {
        id: user.id,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        role: user.role,
        facultyId: user.faculty_id,
        departmentId: user.department_id,
        specialtyId: user.specialty_id,
        groupId: user.group_id
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Помилка сервера при реєстрації' });
  }
});




// GET /api/faculties
app.get("/api/faculties", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM faculties ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// GET /api/faculties/:facultyId/departments
app.get("/api/faculties/:facultyId/departments", async (req: Request, res: Response) => {
  try {
    const facultyId = Number(req.params.facultyId);

    if (isNaN(facultyId)) {
      return res.status(400).json({ message: "Invalid faculty ID" });
    }

    const result = await pool.query(
      "SELECT id, name FROM departments WHERE faculty_id = $1 ORDER BY id",
      [facultyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Departments not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});



// POST /api/login
app.post("/api/login", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    console.log('🔍 Login attempt:', { email, role });

    // Спочатку знаходимо користувача з email та role
    const result = await pool.query(
      `SELECT id, name, email, password, role, faculty_id, department_id, specialty_id, group_id 
       FROM users 
       WHERE email = $1 AND role = $2`,
      [email.trim(), role]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found or role mismatch');
      return res.status(401).json({ message: "Invalid email, password or role" });
    }

    const user = result.rows[0];
    
    // Порівнюємо пароль з хешованим паролем у базі
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: "Invalid email, password or role" });
    }

    // Генеруємо JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    await pool.query("UPDATE users SET lastLoginAt = NOW() WHERE email = $1", [email.trim()]);

    console.log('✅ Login successful for user:', user.id);

    // Повертаємо ту саму структуру, що і при реєстрації
    res.json({ 
      message: "Login successful", 
      token,
      user: {
        id: user.id,
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ')[1] || '',
        email: user.email,
        role: user.role,
        facultyId: user.faculty_id,
        departmentId: user.department_id,
        specialtyId: user.specialty_id,
        groupId: user.group_id
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: "Database error" });
  }
});



// GET /api/current-user 
app.get('/api/current-user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
        u.id,
        u.name, 
        u.email, 
        u.role, 
        u.faculty_id,
        u.department_id,
        u.specialty_id,
        u.group_id,
        f.name as faculty_name,
        d.name as department_name,
        s.name as specialty_name,
        s.code as specialty_code,
        g.name as group_name,
        g.course as course,
        g.education_level
       FROM users u
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN specialties s ON u.specialty_id = s.id
       LEFT JOIN groups g ON u.group_id = g.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = result.rows[0];
    
    // Розділяємо ім'я на частини
    const [firstName, ...lastNameParts] = userData.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    res.json({
      user: {
        id: userData.id,
        firstName,
        lastName,
        email: userData.email,
        role: userData.role,
        faculty_id: userData.faculty_id,
        department_id: userData.department_id,
        specialty_id: userData.specialty_id,
        group_id: userData.group_id,
        faculty_name: userData.faculty_name,
        department_name: userData.department_name,
        specialty_name: userData.specialty_name,
        specialty_code: userData.specialty_code,
        group_name: userData.group_name,
        course: userData.course,
        education_level: userData.education_level
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});



// POST /api/logout
app.post("/api/logout", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      "UPDATE users SET lastLogoutAt = NOW() WHERE email = $1 RETURNING email, lastLogoutAt",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Logout successful", ...result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


// API для отримання спеціальностей факультету
app.get('/api/faculties/:facultyId/specialties', async (req, res) => {
  try {
    const { facultyId } = req.params;
    console.log(`🔍 Fetching specialties for faculty ID: ${facultyId}`);
    
    const result = await pool.query(
      'SELECT id, code, name FROM specialties WHERE faculty_id = $1 ORDER BY code',
      [facultyId]
    );
    
    console.log(`✅ Found ${result.rows.length} specialties for faculty ${facultyId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching specialties:', error);
    res.status(500).json({ message: 'Помилка сервера при отриманні спеціальностей' });
  }
});

// API для отримання груп спеціальності
app.get('/api/specialties/:specialtyId/groups', async (req, res) => {
  try {
    const { specialtyId } = req.params;
    console.log(`🔍 Fetching groups for specialty ID: ${specialtyId}`);
    
    const result = await pool.query(
      'SELECT id, name, course, education_level FROM groups WHERE specialty_id = $1 ORDER BY course, name',
      [specialtyId]
    );
    
    console.log(`✅ Found ${result.rows.length} groups for specialty ${specialtyId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching groups:', error);
    res.status(500).json({ message: 'Помилка сервера при отриманні груп' });
  }
});


// API для перевірки користувача при забутому паролі
app.post("/api/forgot-password/verify", async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    // Перевіряємо чи існує користувач з такою поштою та роллю
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE email = $1 AND role = $2",
      [email, role]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Повертаємо успішну відповідь (без паролю!)
    res.json({ 
      message: "User found", 
      user: { 
        id: result.rows[0].id,
        email: result.rows[0].email, 
        role: result.rows[0].role 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// API для зміни паролю
// API для зміни пароля - ВИПРАВЛЕНИЙ ВАРІАНТ
app.post("/api/forgot-password/reset", async (req: Request, res: Response) => {
  try {
    const { email, role, newPassword } = req.body;

    if (!email || !role || !newPassword) {
      return res.status(400).json({ message: "Email, role and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Знаходимо користувача
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND role = $2",
      [email, role]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = userResult.rows[0].id;

    // ХЕШУЄМО НОВИЙ ПАРОЛЬ перед збереженням
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Оновлюємо пароль в БД з ХЕШОВАНИМ паролем
    await pool.query(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


// POST /api/events - створення події
app.post("/api/events", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, date, type, time, location, link, description, completed } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail || !title || !date || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO events ("userEmail", title, date, type, time, location, link, description, completed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [userEmail, title, date, type, time, location, link, description, completed || false]
    );

    res.status(201).json({ message: "Event created successfully", event: result.rows[0] });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Database error creating event" });
  }
});

// GET /api/events - отримання подій
app.get("/api/events", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) return res.status(401).json({ message: "Unauthorized" });

    const result = await pool.query(
      `SELECT id, title, date, type, time, location, link, description, completed
       FROM events 
       WHERE "userEmail" = $1 
       ORDER BY date`,
      [userEmail]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Database error fetching events" });
  }
});

// PUT /api/events/:id - оновлення події
app.put("/api/events/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const { title, date, type, time, location, link, description, completed } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingEvent = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND "userEmail" = $2',
      [eventId, userEmail]
    );

    if (existingEvent.rows.length === 0) {
      return res.status(404).json({ message: "Event not found or access denied" });
    }

    const result = await pool.query(
      `UPDATE events 
       SET title = $1, date = $2, type = $3, time = $4, location = $5, link = $6, description = $7, completed = $8
       WHERE id = $9 AND "userEmail" = $10
       RETURNING *`,
      [title, date, type, time, location, link, description, completed, eventId, userEmail]
    );

    res.json({ message: "Event updated successfully", event: result.rows[0] });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Database error updating event" });
  }
});

// DELETE /api/events/:id - видалення події
app.delete("/api/events/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingEvent = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND "userEmail" = $2',
      [eventId, userEmail]
    );

    if (existingEvent.rows.length === 0) {
      return res.status(404).json({ message: "Event not found or access denied" });
    }

    await pool.query(
      'DELETE FROM events WHERE id = $1 AND "userEmail" = $2',
      [eventId, userEmail]
    );

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Database error deleting event" });
  }
});

// GET /api/user-project - отримати активний тип проекту користувача
app.get("/api/user-project", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      'SELECT active_project_type FROM user_projects WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ projectType: null });
    }

    res.json({ projectType: result.rows[0].active_project_type });
  } catch (err) {
    console.error('Error getting project type:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// POST /api/user-project - встановити активний тип проекту
app.post("/api/user-project", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { projectType } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!projectType || !['diploma', 'coursework', 'practice'].includes(projectType)) {
      return res.status(400).json({ message: "Invalid project type" });
    }

    // Оновлюємо або створюємо запис користувача з активним типом проекту
    await pool.query(
      `INSERT INTO user_projects (user_id, active_project_type, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET active_project_type = $2, updated_at = NOW()`,
      [userId, projectType]
    );

    // Ініціалізуємо структуру проекту
    await initializeProjectStructure(userId, projectType);

    res.json({ 
      message: "Project type set successfully", 
      projectType 
    });
  } catch (err) {
    console.error('Error setting project type:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.get("/api/user-chapters", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { projectType } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!projectType) {
      return res.status(400).json({ message: "Project type is required" });
    }

    // ✅ ОНОВЛЕНО: Додаємо отримання інформації про проект
    const result = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY 
          CASE chapter_key 
            WHEN 'intro' THEN 1
            WHEN 'theory' THEN 2  
            WHEN 'design' THEN 3
            WHEN 'implementation' THEN 4
            WHEN 'tasks' THEN 2
            WHEN 'diary' THEN 3
            WHEN 'conclusion' THEN 5
            WHEN 'report' THEN 6
            WHEN 'appendix' THEN 7
            WHEN 'sources' THEN 8
            WHEN 'abstract' THEN 9
            WHEN 'cover' THEN 10
            WHEN 'content' THEN 11
            ELSE 99 
          END
        ) as id,
        chapter_key as key,
        progress,
        status,
        student_note,
        uploaded_file_name,
        uploaded_file_date,
        uploaded_file_size,
        work_type,   -- ✅ НОВЕ ПОЛЕ
        project_title, -- ✅ НОВЕ ПОЛЕ
        supervisor,    -- ✅ НОВЕ ПОЛЕ
        project_start_date, -- ✅ НОВЕ ПОЛЕ
        project_deadline    -- ✅ НОВЕ ПОЛЕ
       FROM user_chapters 
       WHERE user_id = $1 AND project_type = $2
       ORDER BY 
         CASE chapter_key 
           WHEN 'intro' THEN 1
           WHEN 'theory' THEN 2  
           WHEN 'design' THEN 3
           WHEN 'implementation' THEN 4
           WHEN 'tasks' THEN 2
           WHEN 'diary' THEN 3
           WHEN 'conclusion' THEN 5
           WHEN 'report' THEN 6
           WHEN 'appendix' THEN 7
           WHEN 'sources' THEN 8
           WHEN 'abstract' THEN 9
           WHEN 'cover' THEN 10
           WHEN 'content' THEN 11
           ELSE 99 
         END`,
      [userId, projectType]
    );

    // Форматуємо дані для фронтенду
    const chapters = result.rows.map((row: any) => ({
      id: row.id,
      key: row.key,
      progress: row.progress,
      status: row.status,
      studentNote: row.student_note || '',
      uploadedFile: row.uploaded_file_name ? {
        name: row.uploaded_file_name,
        uploadDate: row.uploaded_file_date ? new Date(row.uploaded_file_date).toLocaleDateString('uk-UA') : '',
        size: row.uploaded_file_size || ''
      } : undefined,
      teacherComments: [],
      // ✅ Додаємо інформацію про проект
      projectInfo: {
        workType: row.work_type || projectType, // ✅ workType
        title: row.project_title || '',
        supervisor: row.supervisor || '',
        startDate: row.project_start_date,
        deadline: row.project_deadline
      }
    }));

    res.json(chapters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// PUT /api/user-chapters/:chapterKey - оновити главу
app.put("/api/user-chapters/:chapterKey", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chapterKey } = req.params;
    const { projectType, progress, status, studentNote, uploadedFile } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let query = `UPDATE user_chapters SET updated_at = NOW()`;
    const values = [userId, projectType, chapterKey];
    let paramIndex = 4;

    if (progress !== undefined) {
      query += `, progress = $${paramIndex}`;
      values.push(progress);
      paramIndex++;
    }

    if (status !== undefined) {
      query += `, status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (studentNote !== undefined) {
      query += `, student_note = $${paramIndex}`;
      values.push(studentNote);
      paramIndex++;
    }

    if (uploadedFile) {
      query += `, uploaded_file_name = $${paramIndex}, uploaded_file_date = $${paramIndex + 1}, uploaded_file_size = $${paramIndex + 2}`;
      values.push(uploadedFile.name, new Date(), uploadedFile.size);
      paramIndex += 3;
    }

    query += ` WHERE user_id = $1 AND project_type = $2 AND chapter_key = $3`;

    await pool.query(query, values);

    res.json({ message: "Chapter updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// DELETE /api/user-chapters/:chapterKey/file - видалити файл глави
app.delete("/api/user-chapters/:chapterKey/file", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chapterKey } = req.params;
    const { projectType } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await pool.query(
      `UPDATE user_chapters 
       SET uploaded_file_name = NULL, uploaded_file_date = NULL, uploaded_file_size = NULL, 
           progress = 0, status = 'pending', updated_at = NOW()
       WHERE user_id = $1 AND project_type = $2 AND chapter_key = $3`,
      [userId, projectType, chapterKey]
    );

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});


// POST /api/notify-teacher - сповістити викладача про нову роботу
app.post("/api/notify-teacher", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { chapterId, chapterKey, projectType, studentName } = req.body;

    if (!chapterId || !studentName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Отримуємо ID студента та його викладача
    const studentResult = await pool.query(
      `SELECT uc.user_id as student_id, ts.teacher_id
       FROM user_chapters uc
       JOIN teacher_students ts ON uc.user_id = ts.student_id
       WHERE uc.id = $1`,
      [chapterId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: "Student or teacher not found" });
    }

    const { student_id, teacher_id } = studentResult.rows[0];

    // Створюємо сповіщення для викладача
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_entity, related_entity_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        teacher_id,
        'submission',
        'Нова робота на перевірку',
        `Студент ${studentName} надіслав роботу "${chapterKey}" для перевірки`,
        'chapter',
        chapterId
      ]
    );

    // Оновлюємо поле submitted_for_review_at
    await pool.query(
      `UPDATE user_chapters 
       SET submitted_for_review_at = NOW(), status = 'review'
       WHERE id = $1`,
      [chapterId]
    );

    res.json({ 
      message: "Teacher notified successfully",
      notification: {
        teacherId: teacher_id,
        studentId: student_id,
        chapterId,
        chapterKey,
        projectType
      }
    });
  } catch (err) {
    console.error('Error notifying teacher:', err);
    res.status(500).json({ message: 'Database error' });
  }
});


// POST /api/notify-student - сповістити студента про оцінку
app.post("/api/notify-student", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { studentId, chapterId, grade, teacherName } = req.body;

    if (!studentId || !chapterId || grade === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Отримуємо дані студента
    const studentResult = await pool.query(
      `SELECT u.id, u.name, u.email, uc.chapter_key, up.active_project_type
       FROM users u
       JOIN user_chapters uc ON uc.user_id = u.id
       JOIN user_projects up ON up.user_id = u.id
       WHERE u.id = $1 AND uc.id = $2`,
      [studentId, chapterId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: "Student or chapter not found" });
    }

    const student = studentResult.rows[0];

    // Створюємо сповіщення
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_entity, related_entity_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        studentId,
        'grade',
        'Нова оцінка',
        `Викладач ${teacherName} виставив оцінку ${grade} балів за розділ "${student.chapter_key}"`,
        'chapter',
        chapterId
      ]
    );

    // Оновлюємо статус глави
    await pool.query(
      `UPDATE user_chapters 
       SET status = 'completed', graded_at = NOW(), graded_by = $1
       WHERE id = $2 AND user_id = $3`,
      [teacherName, chapterId, studentId]
    );

    res.json({ 
      message: "Student notified successfully",
      notification: {
        studentId,
        chapterId,
        grade,
        projectType: student.active_project_type
      }
    });
  } catch (err) {
    console.error('Error notifying student:', err);
    res.status(500).json({ message: 'Database error' });
  }
});






// GET /api/project-topic - отримати тему проекту
app.get("/api/project-topic", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectType } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT * FROM student_topics 
       WHERE student_id = $1 AND project_type = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [userId, projectType]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const topic = result.rows[0];
    res.json({
      topic: {
        id: topic.id,
        title: topic.topic,
        description: topic.description,
        goals: topic.goals,
        requirements: topic.requirements,
        teacherId: topic.teacher_id,
        teacherName: topic.teacher_name,
        status: topic.status,
        createdAt: topic.created_at,
        approvedAt: topic.approved_at
      }
    });
  } catch (err) {
    console.error('Error fetching project topic:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// POST /api/project-topic - зберегти тему проекту
app.post("/api/project-topic", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectType, topic } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!topic || !topic.title) {
      return res.status(400).json({ message: "Topic title is required" });
    }

    // Зберігаємо тему
    const result = await pool.query(
      `INSERT INTO student_topics 
       (student_id, project_type, topic, description, goals, requirements, teacher_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id`,
      [
        userId, 
        projectType, 
        topic.title,
        topic.description,
        topic.goals,
        topic.requirements,
        topic.teacherId,
        topic.status || 'pending'
      ]
    );

    // Оновлюємо перший розділ
    await pool.query(
      `UPDATE user_chapters 
       SET title = $1, status = 'inProgress', progress = 10, updated_at = NOW()
       WHERE user_id = $2 AND chapter_key = 'intro' AND project_type = $3`,
      [topic.title, userId, projectType]
    );

    res.json({ 
      message: "Topic saved successfully",
      topicId: result.rows[0].id
    });
  } catch (err) {
    console.error('Error saving project topic:', err);
    res.status(500).json({ message: 'Database error' });
  }
});


// PUT /api/thesis-tracker/chapter/:chapterId/grade - оцінити розділ
app.put("/api/thesis-tracker/chapter/:chapterId/grade", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const { grade, feedback, status, gradedBy, gradedAt } = req.body;
    const teacherId = req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!chapterId || grade === undefined) {
      return res.status(400).json({ message: "Chapter ID and grade are required" });
    }

    // Отримуємо інформацію про главу
    const chapterResult = await pool.query(
      `SELECT uc.*, u.id as student_id, u.name as student_name
       FROM user_chapters uc
       JOIN users u ON uc.user_id = u.id
       WHERE uc.id = $1`,
      [chapterId]
    );

    if (chapterResult.rows.length === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const chapter = chapterResult.rows[0];

    // Оновлюємо оцінку
    await pool.query(
      `UPDATE user_chapters 
       SET grade = $1, status = $2, graded_by = $3, graded_at = $4, updated_at = NOW()
       WHERE id = $5`,
      [grade, status || 'completed', gradedBy || 'Викладач', gradedAt || new Date(), chapterId]
    );

    // Додаємо коментар з оцінкою, якщо є feedback
    if (feedback) {
      await pool.query(
        `INSERT INTO teacher_comments (chapter_id, teacher_id, text, status, type, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [chapterId, teacherId, feedback, grade >= 60 ? 'success' : 'error', 'feedback']
      );
    }

    // Розраховуємо середню оцінку студента
    const avgGradeResult = await pool.query(
      `SELECT AVG(grade) as average_grade 
       FROM user_chapters 
       WHERE user_id = $1 AND grade IS NOT NULL`,
      [chapter.student_id]
    );

    const averageGrade = Math.round(avgGradeResult.rows[0].average_grade || 0);

    res.json({ 
      message: "Grade submitted successfully",
      grade: {
        chapterId,
        grade,
        averageGrade,
        studentId: chapter.student_id
      }
    });
  } catch (err) {
    console.error('Error submitting grade:', err);
    res.status(500).json({ message: 'Database error' });
  }
});



// GET /api/thesis-tracker/chapter/:chapterId/comments - отримати коментарі розділу
app.get("/api/thesis-tracker/chapter/:chapterId/comments", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;

    const result = await pool.query(
      `SELECT 
        tc.id,
        tc.text,
        tc.status,
        tc.type,
        tc.created_at as date,
        u.name as author
       FROM teacher_comments tc
       JOIN users u ON tc.teacher_id = u.id
       WHERE tc.chapter_id = $1
       ORDER BY tc.created_at DESC`,
      [chapterId]
    );

    const comments = result.rows.map(row => ({
      id: row.id.toString(),
      text: row.text,
      author: row.author,
      date: new Date(row.date).toLocaleDateString('uk-UA'),
      type: row.type,
      status: row.status
    }));

    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// POST /api/thesis-tracker/chapter/:chapterId/comments - додати коментар
app.post("/api/thesis-tracker/chapter/:chapterId/comments", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const { text, status, type } = req.body;
    const teacherId = req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!text || !status) {
      return res.status(400).json({ message: "Text and status are required" });
    }

    // Перевіряємо, чи існує глава
    const chapterResult = await pool.query(
      `SELECT id FROM user_chapters WHERE id = $1`,
      [chapterId]
    );

    if (chapterResult.rows.length === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Додаємо коментар
    const result = await pool.query(
      `INSERT INTO teacher_comments (chapter_id, teacher_id, text, status, type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [chapterId, teacherId, text, status, type || 'feedback']
    );

    // Оновлюємо статус глави, якщо коментар вимагає виправлень
    if (status === 'error') {
      await pool.query(
        `UPDATE user_chapters SET status = 'review', updated_at = NOW() WHERE id = $1`,
        [chapterId]
      );
    }

    res.status(201).json({ 
      message: "Comment added successfully",
      comment: {
        id: result.rows[0].id.toString(),
        text,
        author: 'Викладач',
        date: new Date().toLocaleDateString('uk-UA'),
        type: type || 'feedback',
        status
      }
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Database error' });
  }
});




// GET /api/thesis-tracker/student/:studentId/chapters - отримати глави студента
app.get("/api/thesis-tracker/student/:studentId/chapters", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const teacherId = req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо, чи має викладач доступ до цього студента
    const accessResult = await pool.query(
      `SELECT id FROM teacher_students WHERE teacher_id = $1 AND student_id = $2`,
      [teacherId, studentId]
    );

    if (accessResult.rows.length === 0) {
      return res.status(403).json({ message: "Access denied to this student" });
    }

    const result = await pool.query(
      `SELECT 
        uc.id,
        uc.chapter_key,
        uc.progress,
        uc.status,
        uc.grade,
        uc.student_note,
        uc.uploaded_file_name,
        uc.uploaded_file_date,
        uc.uploaded_file_size,
        uc.graded_by,
        uc.graded_at,
        uc.submitted_for_review_at,
        up.active_project_type as project_type
       FROM user_chapters uc
       JOIN user_projects up ON uc.user_id = up.user_id
       WHERE uc.user_id = $1
       ORDER BY 
         CASE uc.chapter_key 
           WHEN 'intro' THEN 1
           WHEN 'theory' THEN 2  
           WHEN 'design' THEN 3
           WHEN 'implementation' THEN 4
           WHEN 'tasks' THEN 2
           WHEN 'diary' THEN 3
           WHEN 'conclusion' THEN 5
           WHEN 'report' THEN 6
           WHEN 'appendix' THEN 7
           WHEN 'sources' THEN 8
           WHEN 'abstract' THEN 9
           WHEN 'cover' THEN 10
           WHEN 'content' THEN 11
           ELSE 99 
         END`,
      [studentId]
    );

    // Отримуємо коментарі для кожної глави
    const chaptersWithComments = await Promise.all(
      result.rows.map(async (row) => {
        const commentsResult = await pool.query(
          `SELECT 
            tc.id,
            tc.text,
            tc.status,
            tc.type,
            tc.created_at as date,
            u.name as author
           FROM teacher_comments tc
           JOIN users u ON tc.teacher_id = u.id
           WHERE tc.chapter_id = $1
           ORDER BY tc.created_at DESC`,
          [row.id]
        );

        const comments = commentsResult.rows.map(comment => ({
          id: comment.id.toString(),
          text: comment.text,
          author: comment.author,
          date: new Date(comment.date).toLocaleDateString('uk-UA'),
          type: comment.type,
          status: comment.status
        }));

        return {
          id: row.id,
          key: row.chapter_key,
          title: getChapterTitle(row.chapter_key),
          description: getChapterDescription(row.chapter_key),
          progress: row.progress,
          status: row.status,
          studentGrade: row.grade,
          studentNote: row.student_note || '',
          uploadedFile: row.uploaded_file_name ? {
            name: row.uploaded_file_name,
            uploadDate: row.uploaded_file_date ? new Date(row.uploaded_file_date).toLocaleDateString('uk-UA') : '',
            size: row.uploaded_file_size || '',
            currentVersion: 1
          } : undefined,
          teacherComments: comments,
          projectType: row.project_type,
          gradedBy: row.graded_by,
          gradedAt: row.graded_at,
          submittedForReviewAt: row.submitted_for_review_at
        };
      })
    );

    res.json({ chapters: chaptersWithComments });
  } catch (err) {
    console.error('Error fetching student chapters:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// Допоміжні функції для назв розділів
function getChapterTitle(key: string): string {
  const titles: Record<string, string> = {
    'intro': 'Вступ',
    'theory': 'Теоретична частина',
    'design': 'Проектування',
    'implementation': 'Реалізація',
    'tasks': 'Завдання',
    'diary': 'Щоденник практики',
    'conclusion': 'Висновки',
    'report': 'Звіт',
    'appendix': 'Додатки',
    'sources': 'Джерела',
    'abstract': 'Анотація',
    'cover': 'Титульна сторінка',
    'content': 'Зміст'
  };
  return titles[key] || key;
}

function getChapterDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'intro': 'Вступна частина роботи',
    'theory': 'Огляд наукових джерел та літератури',
    'design': 'Методи дослідження та проектування',
    'implementation': 'Реалізація та результати дослідження',
    'tasks': 'Постановка завдань практики',
    'diary': 'Щоденні записи проходження практики',
    'conclusion': 'Висновки та рекомендації',
    'report': 'Звіт про виконану роботу',
    'appendix': 'Додаткові матеріали',
    'sources': 'Список використаних джерел',
    'abstract': 'Анотація роботи',
    'cover': 'Титульна сторінка роботи',
    'content': 'Зміст роботи'
  };
  return descriptions[key] || 'Опис розділу';
}




// GET /api/teacher/new-submissions - отримати нові роботи на перевірку
app.get("/api/teacher/new-submissions", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { teacher_id } = req.query;
    const teacherId = teacher_id || req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Отримуємо студентів викладача з роботами на перевірці
    const result = await pool.query(
      `SELECT 
        uc.id as chapter_id,
        uc.chapter_key,
        uc.submitted_for_review_at,
        uc.uploaded_file_name,
        u.id as student_id,
        u.name as student_name,
        u.email as student_email,
        up.active_project_type
       FROM user_chapters uc
       JOIN users u ON uc.user_id = u.id
       JOIN user_projects up ON u.id = up.user_id
       JOIN teacher_students ts ON u.id = ts.student_id
       WHERE ts.teacher_id = $1 
         AND uc.status = 'review'
         AND uc.submitted_for_review_at >= NOW() - INTERVAL '7 days'
       ORDER BY uc.submitted_for_review_at DESC`,
      [teacherId]
    );

    const newSubmissions = result.rows.map(row => ({
      chapterId: row.chapter_id,
      chapterKey: row.chapter_key,
      studentId: row.student_id,
      studentName: row.student_name,
      studentEmail: row.student_email,
      projectType: row.active_project_type,
      submittedAt: row.submitted_for_review_at,
      fileName: row.uploaded_file_name
    }));

    res.json(newSubmissions);
  } catch (err) {
    console.error('Error fetching new submissions:', err);
    res.status(500).json({ message: 'Database error' });
  }
});



// GET /api/teacher/pending-reviews - отримати роботи на перевірці
app.get("/api/teacher/pending-reviews", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { teacher_id } = req.query;
    const teacherId = teacher_id || req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
        uc.id as chapter_id,
        uc.chapter_key,
        uc.submitted_for_review_at,
        u.id as student_id,
        u.name as student_name,
        up.active_project_type,
        COUNT(tc.id) as comment_count
       FROM user_chapters uc
       JOIN users u ON uc.user_id = u.id
       JOIN user_projects up ON u.id = up.user_id
       JOIN teacher_students ts ON u.id = ts.student_id
       LEFT JOIN teacher_comments tc ON uc.id = tc.chapter_id
       WHERE ts.teacher_id = $1 
         AND uc.status = 'review'
       GROUP BY uc.id, uc.chapter_key, uc.submitted_for_review_at, u.id, u.name, up.active_project_type
       ORDER BY uc.submitted_for_review_at ASC`,
      [teacherId]
    );

    const pendingReviews = result.rows.map(row => ({
      chapterId: row.chapter_id,
      chapterKey: row.chapter_key,
      studentId: row.student_id,
      studentName: row.student_name,
      projectType: row.active_project_type,
      submittedAt: row.submitted_for_review_at,
      commentCount: parseInt(row.comment_count)
    }));

    res.json(pendingReviews);
  } catch (err) {
    console.error('Error fetching pending reviews:', err);
    res.status(500).json({ message: 'Database error' });
  }
});





app.post("/api/generate-topics", async (req: Request, res: Response) => {
  try {
    const { idea } = req.body;
    
    console.log("Generate topics request:", { idea: idea?.substring(0, 100) });
    
    if (!idea || typeof idea !== "string") {
      return res.status(400).json({ message: "Idea is required and should be a string." });
    }

    // Динамічна генерація тем на основі ідеї
    const topics = generateDynamicTopics(idea);
    
    console.log(`Generated ${topics.length} topics for idea:`, idea.substring(0, 50));
    res.json({ topics });

  } catch (error) {
    console.error("Error in generate-topics:", error);
    // Fallback з динамічною генерацією
    const fallbackTopics = generateDynamicTopics("освітній проект");
    res.json({ topics: fallbackTopics });
  }
});

// Типи для аналізу ідеї
interface IdeaComponents {
  action: string;
  target: string;
  domain: string;
  technologies: string[];
  purpose: string;
  scale: string;
  audience: string;
}

interface IdeaAnalysis {
  original: string;
  components: IdeaComponents;
  projectType: string;
  keywords: string[];
  complexity: number;
}

// Покращена функція для динамічної генерації тем
function generateDynamicTopics(idea: string) {
  const analysis = analyzeIdea(idea);
  
  // Динамічно визначаємо скільки тем згенерувати (від 3 до 8)
  const topicCount = determineTopicCount(analysis);
  const topics: any[] = [];
  
  // Генеруємо унікальні теми
  const usedTitles = new Set<string>();
  
  for (let i = 0; i < topicCount; i++) {
    const topic = generateUniqueTopic(analysis, i, usedTitles);
    if (topic) {
      topics.push(topic);
      usedTitles.add(topic.title);
    }
  }
  
  return topics;
}

// Функція для визначення кількості тем на основі складності ідеї
function determineTopicCount(analysis: IdeaAnalysis): number {
  const { complexity, keywords, components } = analysis;
  
  let count = 3; // мінімум
  
  // Більше ключових слів = більше потенційних тем
  if (keywords.length > 3) count++;
  if (keywords.length > 6) count++;
  
  // Складніші ідеї мають більше аспектів для розгляду
  if (complexity > 6) count++;
  if (complexity > 8) count++;
  
  // Якщо багато технологій - більше технічних тем
  if (components.technologies.length > 1) count++;
  
  return Math.min(count, 8); // не більше 8 тем
}

// Функція для глибокого аналізу ідеї
function analyzeIdea(idea: string): IdeaAnalysis {
  const lowercaseIdea = idea.toLowerCase();
  
  // Визначаємо ключові компоненти
  const components: IdeaComponents = {
    action: extractAction(lowercaseIdea),
    target: extractTarget(lowercaseIdea),
    domain: extractDomain(lowercaseIdea),
    technologies: extractTechnologies(lowercaseIdea),
    purpose: extractPurpose(lowercaseIdea),
    scale: extractScale(lowercaseIdea),
    audience: extractAudience(lowercaseIdea)
  };

  // Визначаємо тип проекту
  const projectType = determineProjectTypeFromComponents(components);
  const complexity = calculateComplexity(lowercaseIdea, components);
  
  return {
    original: idea,
    components,
    projectType,
    keywords: extractKeywords(lowercaseIdea),
    complexity
  };
}

// Нова функція для визначення масштабу проекту
function extractScale(idea: string): string {
  const scales = [
    { pattern: /персональн|особист|мої/, value: 'персональний' },
    { pattern: /груп|команд|спільн/, value: 'груповий' },
    { pattern: /інститут|універ|факультет/, value: 'інституційний' },
    { pattern: /глобальн|загальн|всіх/, value: 'глобальний' }
  ];

  for (const scale of scales) {
    if (scale.pattern.test(idea)) return scale.value;
  }
  return 'локальний';
}

// Нова функція для визначення аудиторії
function extractAudience(idea: string): string {
  const audiences = [
    { pattern: /студент|учн|школяр/, value: 'студенти' },
    { pattern: /викладач|вчитель|професор/, value: 'викладачі' },
    { pattern: /адмін|керівник|декан/, value: 'адміністрація' },
    { pattern: /абітур|вступник/, value: 'абітурієнти' },
    { pattern: /дослідник|науков/, value: 'дослідники' }
  ];

  for (const audience of audiences) {
    if (audience.pattern.test(idea)) return audience.value;
  }
  return 'користувачі';
}

// Функція для оцінки складності ідеї
function calculateComplexity(idea: string, components: IdeaComponents): number {
  let complexity = 3; // базова складність
  
  // Довжина ідеї
  if (idea.length > 50) complexity += 1;
  if (idea.length > 100) complexity += 1;
  
  // Кількість технологій
  complexity += Math.min(components.technologies.length, 3);
  
  // Специфічність цілі
  if (components.target !== 'навчального процесу') complexity += 1;
  if (components.purpose !== 'підвищення якості') complexity += 1;
  
  // Масштаб
  if (components.scale === 'глобальний') complexity += 2;
  if (components.scale === 'інституційний') complexity += 1;
  
  return Math.min(complexity, 10);
}

// Допоміжні функції для аналізу (залишаються подібними, але можна розширити)
function extractAction(idea: string): string {
  const actions = [
    { pattern: /створити|розробити|зробити|побудувати/, value: 'розробка' },
    { pattern: /вдосконалити|покращити|оптимізувати/, value: 'оптимізація' },
    { pattern: /дослідити|проаналізувати|вивчити/, value: 'дослідження' },
    { pattern: /автоматизувати|систематизувати/, value: 'автоматизація' },
    { pattern: /рекомендувати|підбирати/, value: 'рекомендації' },
    { pattern: /організувати|структурувати/, value: 'організація' },
    { pattern: /візуалізувати|представити/, value: 'візуалізація' }
  ];

  for (const action of actions) {
    if (action.pattern.test(idea)) return action.value;
  }
  return 'розробка';
}

function extractTarget(idea: string): string {
  const targets = [
    { pattern: /студент|учн|школяр/, value: 'студентів' },
    { pattern: /викладач|вчитель|викладач/, value: 'викладачів' },
    { pattern: /універ|колег|заклад/, value: 'навчальних закладів' },
    { pattern: /книг|літератур|підручник/, value: 'книг та літератури' },
    { pattern: /розклад|графік|розпорядок/, value: 'навчального розкладу' },
    { pattern: /завданн|проект/, value: 'навчальних завдань' },
    { pattern: /оцінк|рейтинг|успішн/, value: 'академічних оцінок' },
    { pattern: /курс|дисциплин|предмет/, value: 'навчальних курсів' }
  ];

  for (const target of targets) {
    if (target.pattern.test(idea)) return target.value;
  }
  return 'навчального процесу';
}

function extractDomain(idea: string): string {
  const domains = [
    { pattern: /книг|літератур|читан/, value: 'літератури' },
    { pattern: /розклад|графік|час/, value: 'планування часу' },
    { pattern: /навчан|освіт|учб/, value: 'освіти' },
    { pattern: /технолог|програм|додаток/, value: 'технологій' },
    { pattern: /рекомендац|підбір/, value: 'рекомендаційних систем' },
    { pattern: /оцінк|тест|екзамен/, value: 'оцінювання' },
    { pattern: /комунікац|спілкуван/, value: 'комунікації' }
  ];

  for (const domain of domains) {
    if (domain.pattern.test(idea)) return domain.value;
  }
  return 'освітніх технологій';
}

function extractTechnologies(idea: string): string[] {
  const techs: string[] = [];
  const technologyPatterns = [
    { pattern: /ai|штучн|машинн|нейрон/, name: 'AI' },
    { pattern: /мобіл|телефон|додаток/, name: 'мобільні технології' },
    { pattern: /веб|сайт|браузер/, name: 'веб-технології' },
    { pattern: /баз|дані|sql/, name: 'бази даних' },
    { pattern: /хмар|cloud/, name: 'хмарні технології' },
    { pattern: /блокчейн|крипто/, name: 'блокчейн' },
    { pattern: /vr|ar|віртуал|доповнен/, name: 'VR/AR' },
    { pattern: /iot|інтернет речей/, name: 'IoT' }
  ];

  for (const tech of technologyPatterns) {
    if (tech.pattern.test(idea)) techs.push(tech.name);
  }
  
  return techs.length > 0 ? techs : ['сучасні технології'];
}

function extractPurpose(idea: string): string {
  const purposes = [
    { pattern: /допомог|полегш|зручн/, value: 'покращення ефективності' },
    { pattern: /організ|порядок|структур/, value: 'організації процесів' },
    { pattern: /економ|збереж|оптиміз/, value: 'оптимізації ресурсів' },
    { pattern: /навч|освіт|знань/, value: 'покращення навчання' },
    { pattern: /мотив|зацікав/, value: 'підвищення мотивації' },
    { pattern: /доступ|відкрит/, value: 'забезпечення доступності' }
  ];

  for (const purpose of purposes) {
    if (purpose.pattern.test(idea)) return purpose.value;
  }
  return 'підвищення якості';
}

function extractKeywords(idea: string): string[] {
  const stopWords = ['я', 'хочу', 'створити', 'розробити', 'зробити', 'для', 'щоб', 'який', 'допоможе', 'краще', 'більш', 'дуже', 'просто'];
  const words = idea
    .replace(/[^\w\sа-яіїєґ]/gi, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  return [...new Set(words)];
}

function determineProjectTypeFromComponents(components: IdeaComponents): string {
  if (components.action === 'рекомендації') return 'recommendation';
  if (components.technologies.includes('AI')) return 'ai';
  if (components.action === 'дослідження') return 'research';
  if (components.target.includes('книг')) return 'literature';
  if (components.target.includes('розклад')) return 'scheduling';
  if (components.domain.includes('планування')) return 'planning';
  if (components.action === 'візуалізація') return 'visualization';
  if (components.technologies.includes('VR/AR')) return 'vr_ar';
  
  return 'development';
}

// Головна функція генерації унікальних тем
function generateUniqueTopic(analysis: IdeaAnalysis, index: number, usedTitles: Set<string>): Topic | null {
  const { projectType, keywords, complexity } = analysis;
  
  // Log usage of variables to avoid unused warnings
  console.log(`Generating topic ${index} for ${projectType} with complexity ${complexity}`);
  if (keywords.length > 0) {
    console.log(`Keywords: ${keywords.join(', ')}`);
  }
  
  const topicGenerators = [
    generateTechnicalTopic,
    generateResearchTopic,
    generateUserExperienceTopic,
    generateBusinessTopic,
    generateInnovationTopic,
    generateImplementationTopic,
    generateSocialTopic,
    generateFutureTopic
  ];
  
  // Вибираємо генератор на основі індексу та складності
  const generatorIndex = index % Math.min(topicGenerators.length, Math.max(4, Math.floor(complexity / 2)));
  const topic = topicGenerators[generatorIndex](analysis);
  
  if (topic && !usedTitles.has(topic.title)) {
    return topic;
  }
  
  for (let i = 0; i < topicGenerators.length; i++) {
    const altTopic = topicGenerators[(generatorIndex + i) % topicGenerators.length](analysis);
    if (altTopic && !usedTitles.has(altTopic.title)) {
      return altTopic;
    }
  }
  
  return null;
}

// Різноманітні генератори тем
function generateTechnicalTopic(analysis: IdeaAnalysis) {
  const { components } = analysis;
  const tech = components.technologies[Math.floor(Math.random() * components.technologies.length)];
  
  const templates = [
    `Архітектура системи ${components.action} ${components.target} на основі ${tech}`,
    `Алгоритми ${components.purpose} для ${components.domain}`,
    `Технології обробки даних в системі ${components.action} ${components.target}`,
    `Оптимізація продуктивності рішення для ${components.target}`,
    `Інтеграція ${tech} в існуючу інфраструктуру ${components.domain}`
  ];
  
  return {
    title: templates[Math.floor(Math.random() * templates.length)],
    category: 'Технічна реалізація',
    description: `Технічні аспекти розробки та впровадження рішення для ${components.purpose}`,
    relevance: 85 + Math.floor(Math.random() * 10)
  };
}

function generateResearchTopic(analysis: IdeaAnalysis) {
  const { components } = analysis;
  
  const templates = [
    `Дослідження ефективності ${components.action} для ${components.target}`,
    `Аналіз потреб ${components.audience} в контексті ${components.domain}`,
    `Методологія оцінки якості ${components.action} ${components.target}`,
    `Порівняльний аналіз існуючих рішень для ${components.purpose}`,
    `Вплив цифровізації на ${components.domain} для ${components.audience}`
  ];
  
  return {
    title: templates[Math.floor(Math.random() * templates.length)],
    category: 'Наукове дослідження',
    description: `Академічне дослідження аспектів ${components.domain} та ${components.purpose}`,
    relevance: 82 + Math.floor(Math.random() * 12)
  };
}

function generateUserExperienceTopic(analysis: IdeaAnalysis) {
  const { components } = analysis;
  
  const templates = [
    `Інтерфейс користувача для системи ${components.action} ${components.target}`,
    `Юзабіліті та доступність рішення для ${components.audience}`,
    `Гейміфікація в системі ${components.action} для підвищення мотивації`,
    `Персоналізація досвіду користувача в ${components.domain}`,
    `Ергономіка взаємодії з системою ${components.action} ${components.target}`
  ];
  
  return {
    title: templates[Math.floor(Math.random() * templates.length)],
    category: 'Користувацький досвід',
    description: `Аспекти взаємодії користувача з системою та покращення досвіду використання`,
    relevance: 80 + Math.floor(Math.random() * 15)
  };
}

function generateBusinessTopic(analysis: IdeaAnalysis) {
  const { components } = analysis;
  
  const templates = [
    `Бізнес-модель впровадження рішення для ${components.target}`,
    `Економічна ефективність ${components.action} ${components.target}`,
    `Маркетингова стратегія просування рішення в ${components.domain}`,
    `Управління проектом ${components.action} ${components.target}`,
    `Аналіз ROI системи ${components.action} для ${components.audience}`
  ];
  
  return {
    title: templates[Math.floor(Math.random() * templates.length)],
    category: 'Бізнес-аспекти',
    description: `Економічні та організаційні аспекти реалізації та впровадження рішення`,
    relevance: 78 + Math.floor(Math.random() * 16)
  };
}

function generateInnovationTopic(analysis: IdeaAnalysis) {
  const { components } = analysis;
  
  const templates = [
    `Інноваційні підходи до ${components.action} ${components.target}`,
    `Використання новітніх технологій в ${components.domain}`,
    `Креативні рішення проблем ${components.purpose}`,
    `Футуристичний погляд на розвиток ${components.domain}`,
    `Експериментальні методи ${components.action} для ${components.audience}`
  ];
  
  return {
    title: templates[Math.floor(Math.random() * templates.length)],
    category: 'Інновації',
    description: `Передові та експериментальні підходи до вирішення проблем у ${components.domain}`,
    relevance: 88 + Math.floor(Math.random() * 8)
  };
}

function generateImplementationTopic(analysis: IdeaAnalysis) {
  const { components } = analysis;
  
  const templates = [
    `Практичне впровадження системи ${components.action} ${components.target}`,
    `Тестування та валідація рішення для ${components.audience}`,
    `Масштабування рішення ${components.action} на рівні ${components.scale}`,
    `Підтримка та обслуговування системи після впровадження`,
    `Інтеграція з існуючими системами в ${components.domain}`
  ];
  
  return {
    title: templates[Math.floor(Math.random() * templates.length)],
    category: 'Практична реалізація',
    description: `Аспекти практичного впровадження, тестування та підтримки рішення`,
    relevance: 83 + Math.floor(Math.random() * 12)
  };
}

function generateSocialTopic(analysis: IdeaAnalysis) {
  const { components } = analysis;
  
  const templates = [
    `Соціальний вплив ${components.action} на ${components.audience}`,
    `Етичні аспекти використання технологій в ${components.domain}`,
    `Культурний контекст впровадження рішення для ${components.target}`,
    `Освітні зміни через технологізацію ${components.domain}`,
    `Психологічні аспекти взаємодії з системою ${components.action}`
  ];
  
  return {
    title: templates[Math.floor(Math.random() * templates.length)],
    category: 'Соціальні аспекти',
    description: `Соціальні, культурні та етичні наслідки впровадження технологій у ${components.domain}`,
    relevance: 75 + Math.floor(Math.random() * 20)
  };
}

function generateFutureTopic(analysis: IdeaAnalysis) {
  const { components } = analysis;
  
  const templates = [
    `Майбутній розвиток технологій в ${components.domain}`,
    `Перспективи вдосконалення ${components.action} ${components.target}`,
    `Тенденції розвитку ${components.domain} в наступні 5 років`,
    `Адаптація системи до майбутніх викликів в ${components.domain}`,
    `Стратегія розвитку рішення для ${components.target}`
  ];
  
  return {
    title: templates[Math.floor(Math.random() * templates.length)],
    category: 'Перспективи розвитку',
    description: `Довгострокові перспективи та стратегії розвитку рішення в контексті ${components.domain}`,
    relevance: 80 + Math.floor(Math.random() * 15)
  };
}

// POST /api/teachers/match - пошук викладачів з фільтрацією за факультетом та доступними місцями
app.post("/api/teachers/match", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { 
      topic, 
      idea, 
      facultyId, 
      workType = 'coursework',
      includeAvailablePlaces = false,
      studentInfo = {},
      filters = {},
      includePlaceDetails = false
    } = req.body;
    
    console.log("=== TEACHER MATCH REQUEST ===");
    console.log("Teacher match request details:", { 
      topic: topic?.substring(0, 100),
      idea: idea?.substring(0, 100),
      facultyId,
      workType,
      includeAvailablePlaces,
      includePlaceDetails,
      studentInfo: {
        specialty_id: studentInfo?.specialty_id,
        specialty_code: studentInfo?.specialty_code,
        course: studentInfo?.course,
        faculty_id: studentInfo?.faculty_id
      },
      filters,
      user: (req as any).user?.id
    });

    if (!topic && !idea) {
      console.log("ERROR: No topic or idea provided");
      return res.status(400).json({ message: "Topic or idea is required" });
    }

    const searchQuery = (topic || idea) as string;
    
    if (searchQuery.length < 3) {
      console.log("ERROR: Query too short");
      return res.status(400).json({ message: "Query must be at least 3 characters long" });
    }

    const decodedQuery = decodeURIComponent(searchQuery);
    console.log("Search query for teacher matching:", decodedQuery);

    // Перевіримо, чи існує факультет, якщо вказано
    let facultyInfo = null;
    if (facultyId !== null && facultyId !== undefined && facultyId !== '') {
      const facultyIdNum = parseInt(facultyId);
      if (!isNaN(facultyIdNum)) {
        console.log(`Checking faculty with ID: ${facultyIdNum}`);
        const facultyCheck = await pool.query('SELECT id, name FROM faculties WHERE id = $1', [facultyIdNum]);
        
        if (facultyCheck.rows.length === 0) {
          console.warn(`⚠️ Faculty with ID ${facultyIdNum} does not exist!`);
          facultyInfo = { id: facultyIdNum, name: 'Невідомий факультет', exists: false };
        } else {
          facultyInfo = { ...facultyCheck.rows[0], exists: true };
          console.log(`✅ Faculty exists: ${facultyInfo.name} (ID: ${facultyInfo.id})`);
        }
      } else {
        console.log(`❌ Invalid facultyId format: ${facultyId}`);
        facultyInfo = { id: null, name: 'Некоректний ID', exists: false };
      }
    }

    console.log("🔍 DEBUG: Starting teacher search...");

    // ПОКРАЩЕНИЙ запит для отримання викладачів
    let teachersQuery = `
      SELECT 
        t.id,
        COALESCE(t.full_name, u.name) as name,
        t.skills,
        d.name as department_name,
        d.id as department_id,
        f.name as faculty_name,
        f.id as faculty_id,
        u.email,
        u.name as user_name,
        tp.title,
        tp.bio,
        tp.avatar_url,
        tp.office_hours,
        tp.phone,
        tp.website
      FROM teachers t
      INNER JOIN users u ON t.id = u.id
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN faculties f ON d.faculty_id = f.id
      LEFT JOIN teacher_profiles tp ON t.id = tp.user_id
      WHERE u.role = 'teacher'
    `;

    const queryParams: any[] = [];
    let paramCount = 0;
    
    // Додаємо фільтрацію за факультетом
    if (facultyInfo && facultyInfo.exists) {
      paramCount++;
      teachersQuery += ` AND f.id = $${paramCount}`;
      queryParams.push(facultyInfo.id);
      console.log(`🔍 Filtering by faculty ID: ${facultyInfo.id} (${facultyInfo.name})`);
    }

    teachersQuery += ` ORDER BY t.full_name`;
    console.log("Final SQL query for teachers:", teachersQuery);
    console.log("Query parameters:", queryParams);

    const teachersResult = await pool.query(teachersQuery, queryParams);

    console.log(`📊 Found ${teachersResult.rows.length} teachers for faculty: ${facultyInfo?.name || 'all faculties'}`);
    
    if (teachersResult.rows.length === 0) {
      return res.json({
        teachers: [],
        searchQuery: decodedQuery,
        totalCount: 0,
        facultyFilter: facultyInfo || facultyId,
        summary: {
          totalTeachers: 0,
          matchingTeachers: 0,
          facultyName: facultyInfo?.name || "Не знайдено",
          facultyExists: facultyInfo?.exists || false
        },
        message: "Не знайдено викладачів за даними критеріями"
      });
    }

    console.log(`🔎 Starting relevance calculation for ${teachersResult.rows.length} teachers...`);

    // Для кожного викладача шукаємо відповідність
    const teachersWithMatches = await Promise.all(
      teachersResult.rows.map(async (teacher: any) => {
        const teacherId = teacher.id;
        let skills: string[] = [];
        
        // Парсимо skills
        try {
          if (typeof teacher.skills === 'string') {
            skills = JSON.parse(teacher.skills);
          } else if (Array.isArray(teacher.skills)) {
            skills = teacher.skills;
          }
        } catch (err) {
          console.error('Error parsing skills for teacher', teacher.name, ':', err);
          skills = [];
        }

        console.log(`\n📋 Processing teacher: ${teacher.name}`);

        // ========== ПОШУК ДОСТУПНИХ МІСЦЬ ==========
        let availablePlacesData = null;
        
        if (includeAvailablePlaces) {
          try {
            console.log(`🔍 Fetching available places for teacher ${teacher.name} (ID: ${teacherId})`);
            
            let placesQuery = `
              SELECT 
                ap.id,
                ap.type,
                ap.available_spots,
                ap.course,
                ap.specialty_id,
                COALESCE(s.name, 'Невідома спеціальність') as specialty_name,
                COALESCE(s.code, 'N/A') as specialty_code,
                s.faculty_id,
                COALESCE(f.name, 'Невідомий факультет') as faculty_name,
                COALESCE(ap.max_students, 5) as max_students,
                COALESCE(ap.current_students, 0) as current_students,
                COALESCE(ap.requirements, '') as requirements,
                COALESCE(ap.description, '') as description
              FROM available_places ap
              LEFT JOIN specialties s ON ap.specialty_id = s.id
              LEFT JOIN faculties f ON s.faculty_id = f.id
              WHERE ap.teacher_id = $1
            `;
            
            const placesParams: any[] = [teacherId];
            let paramIndex = 2;
            
            // Фільтруємо за типом роботи
            if (workType && workType !== 'all') {
              placesQuery += ` AND ap.type = $${paramIndex}`;
              placesParams.push(workType);
              paramIndex++;
            }
            
            // Фільтруємо за спеціальністю студента для точного пошуку
            if (studentInfo?.specialty_id && filters?.exactMatchOnly) {
              placesQuery += ` AND ap.specialty_id = $${paramIndex}`;
              placesParams.push(studentInfo.specialty_id);
              paramIndex++;
            }
            
            // Фільтруємо за курсом студента для точного пошуку
            if (studentInfo?.course && filters?.exactMatchOnly) {
              placesQuery += ` AND ap.course = $${paramIndex}`;
              placesParams.push(studentInfo.course);
              paramIndex++;
            }
            
            // Фільтр для показу всіх місць або тільки доступних
            if (filters?.includeAllPlaces === false) {
              placesQuery += ` AND ap.available_spots > 0`;
            }
            
            placesQuery += ` ORDER BY ap.type, ap.course, ap.specialty_id`;
            
            console.log(`📋 Available places query:`, placesQuery);
            console.log(`📋 Parameters:`, placesParams);
            
            const placesResult = await pool.query(placesQuery, placesParams);
            
            console.log(`✅ Found ${placesResult.rows.length} available places for ${teacher.name}`);
            
            if (placesResult.rows.length > 0) {
              // Перевіряємо, чи є точні співпадіння для студента
              const placesWithExactMatch = placesResult.rows.map((place: any) => {
                const isExactMatch = studentInfo?.specialty_id && studentInfo?.course ?
                  place.specialty_id === studentInfo.specialty_id && place.course === studentInfo.course :
                  false;
                
                return {
                  id: place.id.toString(),
                  type: place.type,
                  availableSpots: place.available_spots,
                  course: place.course,
                  specialty_id: place.specialty_id,
                  specialty_name: place.specialty_name,
                  specialty_code: place.specialty_code,
                  faculty_id: place.faculty_id,
                  faculty_name: place.faculty_name,
                  max_students: place.max_students,
                  current_students: place.current_students,
                  requirements: place.requirements,
                  description: place.description,
                  matchScore: isExactMatch ? 100 : 50,
                  isExactMatch
                };
              });
              
              // Рахуємо статистику
              const totalAvailable = placesResult.rows.reduce((sum, place) => sum + place.available_spots, 0);
              
              const courseworkCount = placesResult.rows
                .filter(p => p.type === 'coursework')
                .reduce((sum, p) => sum + p.available_spots, 0);
              
              const diplomaCount = placesResult.rows
                .filter(p => p.type === 'diploma')
                .reduce((sum, p) => sum + p.available_spots, 0);
                
              const practiceCount = placesResult.rows
                .filter(p => p.type === 'practice')
                .reduce((sum, p) => sum + p.available_spots, 0);
              
              availablePlacesData = {
                totalAvailable,
                coursework: courseworkCount,
                diploma: diplomaCount,
                practice: practiceCount,
                details: placesWithExactMatch
              };
              
              console.log(`📊 Availability summary: Total: ${totalAvailable}, Exact matches: ${placesWithExactMatch.filter(p => p.isExactMatch).length}`);
            }
          } catch (placesError) {
            console.error(`❌ Error fetching available places:`, placesError);
          }
        }
        // ========== КІНЕЦЬ ПОШУКУ ДОСТУПНИХ МІСЦЬ ==========

        // Пошук у роботах викладача
        const worksResult = await pool.query(
          `SELECT id, title, description, type, year
           FROM teacher_works 
           WHERE user_id = $1 
           AND (title ILIKE $2 OR description ILIKE $2 OR $2 = '')
           ORDER BY year DESC
           LIMIT 5`,
          [teacherId, `%${decodedQuery}%`]
        );

        // Пошук у напрямках досліджень
        const directionsResult = await pool.query(
          `SELECT id, area, description
           FROM teacher_research_directions 
           WHERE user_id = $1 
           AND (area ILIKE $2 OR description ILIKE $2 OR $2 = '')
           LIMIT 5`,
          [teacherId, `%${decodedQuery}%`]
        );

        // Пошук у майбутніх темах
        const topicsResult = await pool.query(
          `SELECT id, topic, description
           FROM teacher_future_topics 
           WHERE user_id = $1 
           AND (topic ILIKE $2 OR description ILIKE $2 OR $2 = '')
           LIMIT 5`,
          [teacherId, `%${decodedQuery}%`]
        );

        console.log(`   Found: ${worksResult.rows.length} works, ${directionsResult.rows.length} directions, ${topicsResult.rows.length} topics`);

        // Розраховуємо релевантність
        const skillsRelevance = calculateSkillsRelevance(decodedQuery, skills);
        const worksRelevance = calculateWorksRelevance(decodedQuery, worksResult.rows);
        const directionsRelevance = calculateDirectionsRelevance(decodedQuery, directionsResult.rows);
        const topicsRelevance = calculateTopicsRelevance(decodedQuery, topicsResult.rows);

        // Загальна релевантність
        const totalRelevance = Math.min(100, 
          skillsRelevance * 0.4 +
          worksRelevance * 0.3 +
          directionsRelevance * 0.2 +
          topicsRelevance * 0.1
        );

        // Формуємо результати пошуку
        const searchResults = [
          ...skills
            .filter(skill => skill.toLowerCase().includes(decodedQuery.toLowerCase()))
            .slice(0, 3)
            .map(skill => ({
              type: 'skill' as const,
              id: `skill-${skill}-${teacherId}`,
              title: skill,
              description: `Навичка викладача`
            })),
          ...worksResult.rows.map((work: any) => ({
            type: 'work' as const,
            id: work.id.toString(),
            title: work.title,
            description: work.description,
            subtype: work.type,
            year: work.year
          })),
          ...directionsResult.rows.map((direction: any) => ({
            type: 'direction' as const,
            id: direction.id.toString(),
            title: direction.area,
            description: direction.description
          })),
          ...topicsResult.rows.map((topic: any) => ({
            type: 'future_topic' as const,
            id: topic.id.toString(),
            title: topic.topic,
            description: topic.description
          }))
        ].slice(0, 8);

        console.log(`   Relevance: ${Math.round(totalRelevance)}%`);

        // Формуємо результат для викладача
        const teacherResult: any = {
          teacher: {
            id: teacher.id.toString(),
            name: teacher.name,
            title: teacher.title || "Викладач",
            department: teacher.department_name || "Кафедра не вказана",
            faculty: teacher.faculty_name || "Факультет не вказаний",
            facultyId: teacher.faculty_id,
            bio: teacher.bio || "",
            avatarUrl: teacher.avatar_url,
            email: teacher.email,
            officeHours: teacher.office_hours || "",
            phone: teacher.phone || "",
            website: teacher.website || "",
            skills: skills,
            rating: 4.5,
            studentCount: 0,
            projectsCompleted: 0,
            isAvailable: availablePlacesData ? availablePlacesData.totalAvailable > 0 : true,
            expertise: skills.slice(0, 5)
          },
          relevanceScore: Math.round(totalRelevance),
          matchCount: searchResults.length,
          searchResults: searchResults,
          matchBreakdown: {
            skills: skills.filter(skill => skill.toLowerCase().includes(decodedQuery.toLowerCase())).length,
            works: worksResult.rows.length,
            directions: directionsResult.rows.length,
            topics: topicsResult.rows.length
          },
          detailedRelevance: {
            skills: Math.round(skillsRelevance),
            works: Math.round(worksRelevance),
            directions: Math.round(directionsRelevance),
            topics: Math.round(topicsRelevance)
          }
        };

        // Додаємо дані про доступні місця
        if (availablePlacesData) {
          teacherResult.availablePlaces = availablePlacesData;
          
          if (studentInfo) {
            teacherResult.studentFilters = {
              specialtyId: studentInfo.specialty_id,
              specialtyCode: studentInfo.specialty_code,
              course: studentInfo.course,
              facultyId: studentInfo.faculty_id
            };
          }
        }

        return teacherResult;
      })
    );

    // Фільтруємо та сортуємо викладачів
    const filteredTeachers = teachersWithMatches
      .filter(teacher => teacher.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 15);

    console.log(`\n🎯 FINAL RESULTS:`);
    console.log(`   Total teachers: ${filteredTeachers.length}`);
    
    const teachersWithPlaces = filteredTeachers.filter(t => t.availablePlaces);
    console.log(`   Teachers with available places: ${teachersWithPlaces.length}`);

    res.json({
      teachers: filteredTeachers,
      searchQuery: decodedQuery,
      totalCount: filteredTeachers.length,
      facultyFilter: facultyInfo || facultyId,
      summary: {
        totalTeachers: teachersResult.rows.length,
        matchingTeachers: filteredTeachers.length,
        topMatch: filteredTeachers[0]?.relevanceScore || 0,
        facultyName: facultyInfo?.name || teachersResult.rows[0]?.faculty_name || "Не вказано",
        facultyExists: facultyInfo?.exists ?? true,
        availablePlaces: {
          totalTeachersWithPlaces: teachersWithPlaces.length,
          totalAvailableSpots: teachersWithPlaces.reduce((sum, t) => sum + (t.availablePlaces?.totalAvailable || 0), 0),
          exactMatches: teachersWithPlaces.filter(t => 
            t.availablePlaces?.details?.some((d: any) => d.isExactMatch)
          ).length
        }
      }
    });

  } catch (err) {
    console.error("❌ ERROR in teacher matching:", err);
    res.status(500).json({ 
      message: "Database error matching teachers",
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Допоміжні функції для розрахунку релевантності
function calculateSkillsRelevance(query: string, skills: string[]): number {
  if (!skills || skills.length === 0) return 0;
  
  const queryWords = query.toLowerCase().split(/\s+/);
  let matches = 0;
  
  skills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (queryWords.some(word => skillLower.includes(word))) {
      matches++;
    }
  });
  
  return Math.min(100, (matches / skills.length) * 100);
}

function calculateWorksRelevance(query: string, works: any[]): number {
  if (!works || works.length === 0) return 0;
  
  const queryLower = query.toLowerCase();
  let totalRelevance = 0;
  
  works.forEach(work => {
    const title = work.title?.toLowerCase() || '';
    const description = work.description?.toLowerCase() || '';
    
    if (title.includes(queryLower) || description.includes(queryLower)) {
      totalRelevance += 100;
    } else {
      const queryWords = queryLower.split(/\s+/);
      let wordMatches = 0;
      
      queryWords.forEach(word => {
        if (title.includes(word) || description.includes(word)) {
          wordMatches++;
        }
      });
      
      totalRelevance += (wordMatches / queryWords.length) * 50;
    }
  });
  
  return Math.min(100, totalRelevance / works.length);
}

function calculateDirectionsRelevance(query: string, directions: any[]): number {
  if (!directions || directions.length === 0) return 0;
  
  const queryLower = query.toLowerCase();
  let totalRelevance = 0;
  
  directions.forEach(direction => {
    const area = direction.area?.toLowerCase() || '';
    const description = direction.description?.toLowerCase() || '';
    
    if (area.includes(queryLower) || description.includes(queryLower)) {
      totalRelevance += 100;
    } else {
      const queryWords = queryLower.split(/\s+/);
      let wordMatches = 0;
      
      queryWords.forEach(word => {
        if (area.includes(word) || description.includes(word)) {
          wordMatches++;
        }
      });
      
      totalRelevance += (wordMatches / queryWords.length) * 50;
    }
  });
  
  return Math.min(100, totalRelevance / directions.length);
}

function calculateTopicsRelevance(query: string, topics: any[]): number {
  if (!topics || topics.length === 0) return 0;
  
  const queryLower = query.toLowerCase();
  let totalRelevance = 0;
  
  topics.forEach(topic => {
    const topicName = topic.topic?.toLowerCase() || '';
    const description = topic.description?.toLowerCase() || '';
    
    if (topicName.includes(queryLower) || description.includes(queryLower)) {
      totalRelevance += 100;
    } else {
      const queryWords = queryLower.split(/\s+/);
      let wordMatches = 0;
      
      queryWords.forEach(word => {
        if (topicName.includes(word) || description.includes(word)) {
          wordMatches++;
        }
      });
      
      totalRelevance += (wordMatches / queryWords.length) * 50;
    }
  });
  
  return Math.min(100, totalRelevance / topics.length);
}

app.post("/api/generate-structure", async (req: Request, res: Response) => {
  try {
    const { idea, topic } = req.body;
    
    console.log("Generate structure request:", { 
      idea: idea?.substring(0, 100),
      topic: topic?.substring(0, 100)
    });
    
    if (!idea || typeof idea !== "string") {
      return res.status(400).json({ message: "Idea is required and should be a string." });
    }

    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ message: "Topic is required and should be a string." });
    }

    // Генерація специфічної структури для теми
    const structure = generateSpecificStructure(idea, topic);
    
    console.log("Returning specific structure for topic:", topic.substring(0, 50));
    return res.status(200).json({ structure });

  } catch (error) {
    console.error("Error generating structure:", error);
    const fallbackStructure = generateSpecificStructure("освітній проект", "додаток для планування навчання");
    return res.status(200).json({ structure: fallbackStructure });
  }
});

// Покращена функція для генерації специфічної структури
function generateSpecificStructure(idea: string, topic: string) {
  const analysis = analyzeTopicAndIdea(idea, topic);
  const projectType = determineProjectTypeFromTopic(topic);
  
  const structure = generateStructureByType(analysis, projectType);
  
  // Додаємо загальні розділи в кінці
  return [
    ...structure,
    {
      id: structure.length + 1,
      key: "sources",
      progress: 0,
      status: "pending",
      content: "Список використаних джерел. Наукові публікації, документація технологій, аналітичні звіти, нормативні документи, інтернет-ресурси."
    },
    {
      id: structure.length + 2,
      key: "appendix",
      progress: 0,
      status: "pending",
      content: "Додатки. Додаткові матеріали, кодові фрагменти, схеми, таблиці, результати тестування, анкети, інструкції."
    }
  ];
}

// Аналіз теми та ідеї для адаптації структури
interface StructureAnalysis {
  idea: string;
  topic: string;
  domain: string;
  technologies: string[];
  audience: string;
  purpose: string;
  complexity: number;
}

function analyzeTopicAndIdea(idea: string, topic: string): StructureAnalysis {
  const lowercaseTopic = topic.toLowerCase();
  
  return {
    idea,
    topic,
    domain: extractDomainFromTopic(lowercaseTopic),
    technologies: extractTechnologiesFromTopic(lowercaseTopic),
    audience: extractAudienceFromTopic(lowercaseTopic),
    purpose: extractPurposeFromTopic(lowercaseTopic),
    complexity: calculateTopicComplexity(lowercaseTopic)
  };
}

function extractDomainFromTopic(topic: string): string {
  const domains = [
    { pattern: /плануванн|тайм-менеджмент|розклад/, value: 'планування часу' },
    { pattern: /навчанн|освіт|учб/, value: 'освіти' },
    { pattern: /книг|літератур|читан/, value: 'літератури' },
    { pattern: /рекомендац|підбір/, value: 'рекомендаційних систем' },
    { pattern: /ai|штучн|машинн/, value: 'штучного інтелекту' },
    { pattern: /мобіл|додаток/, value: 'мобільних додатків' },
    { pattern: /баз.*дані|sql/, value: 'баз даних' },
    { pattern: /веб|сайт/, value: 'веб-розробки' },
    { pattern: /оптимізац|продуктивн/, value: 'оптимізації продуктивності' },
    { pattern: /управлінн|менеджмент/, value: 'управління проектами' },
    { pattern: /безпек|захист/, value: 'кібербезпеки' },
    { pattern: /аналіз|дослідженн/, value: 'наукових досліджень' }
  ];

  for (const domain of domains) {
    if (domain.pattern.test(topic)) return domain.value;
  }
  return 'технологій';
}

function extractTechnologiesFromTopic(topic: string): string[] {
  const techs: string[] = [];
  const techPatterns = [
    { pattern: /ai|штучн|машинн|нейрон/, name: 'AI/ML' },
    { pattern: /react|angular|vue/, name: 'Frontend фреймворки' },
    { pattern: /node|python|java|php/, name: 'Backend технології' },
    { pattern: /баз.*дані|mysql|mongodb|postgres/, name: 'Бази даних' },
    { pattern: /мобіл|android|ios|flutter/, name: 'Мобільні технології' },
    { pattern: /хмарн|cloud|aws|azure|gcp/, name: 'Хмарні технології' },
    { pattern: /блокчейн|blockchain/, name: 'Блокчейн' },
    { pattern: /docker|kubernetes|container/, name: 'Контейнеризація' },
    { pattern: /api|rest|graphql/, name: 'API технології' }
  ];

  for (const tech of techPatterns) {
    if (tech.pattern.test(topic)) techs.push(tech.name);
  }
  
  return techs.length > 0 ? techs : ['сучасні технології'];
}

function extractAudienceFromTopic(topic: string): string {
  const audiences = [
    { pattern: /студент|учн/, value: 'студентів' },
    { pattern: /викладач|вчитель|професор/, value: 'викладачів' },
    { pattern: /школяр|учнів/, value: 'школярів' },
    { pattern: /адмін|керівник|декан/, value: 'адміністрації' },
    { pattern: /користувач/, value: 'користувачів' },
    { pattern: /розробник|програміст/, value: 'розробників' },
    { pattern: /менеджер|керівник/, value: 'менеджерів' }
  ];

  for (const audience of audiences) {
    if (audience.pattern.test(topic)) return audience.value;
  }
  return 'користувачів';
}

function extractPurposeFromTopic(topic: string): string {
  const purposes = [
    { pattern: /покращенн|удосконаленн/, value: 'покращення якості' },
    { pattern: /оптимізац|ефективн/, value: 'оптимізації продуктивності' },
    { pattern: /автоматизац|систематизац/, value: 'автоматизації процесів' },
    { pattern: /дослідженн|аналіз/, value: 'наукового дослідження' },
    { pattern: /розробк|створенн/, value: 'розробки рішення' },
    { pattern: /впровадженн|реалізац/, value: 'впровадження системи' },
    { pattern: /оцінк|тестуванн/, value: 'оцінки ефективності' },
    { pattern: /безпек|захист/, value: 'забезпечення безпеки' }
  ];

  for (const purpose of purposes) {
    if (purpose.pattern.test(topic)) return purpose.value;
  }
  return 'розвитку системи';
}

function calculateTopicComplexity(topic: string): number {
  let complexity = 3;
  const words = topic.split(/\s+/).length;
  
  if (words > 5) complexity++;
  if (words > 8) complexity++;
  
  if (topic.includes('AI') || topic.includes('машинн')) complexity += 2;
  if (topic.includes('архітектур') || topic.includes('систем')) complexity++;
  if (topic.includes('аналіз') || topic.includes('дослідженн')) complexity++;
  if (topic.includes('оптимізац') || topic.includes('продуктивн')) complexity++;
  
  return Math.min(complexity, 10);
}

function determineProjectTypeFromTopic(topic: string): string {
  const lowercaseTopic = topic.toLowerCase();
  
  if (/(мобільн|додаток|ios|android)/i.test(lowercaseTopic)) return 'mobile';
  if (/(ai|штучн|машинн|нейрон|ml|dl|nlp)/i.test(lowercaseTopic)) return 'ai';
  if (/(досліджен|аналіз|наук|експеримент)/i.test(lowercaseTopic)) return 'research';
  if (/(веб|сайт|web|інтернет|браузер)/i.test(lowercaseTopic)) return 'web';
  if (/(систем|платформ|архітектур)/i.test(lowercaseTopic)) return 'system';
  if (/(рекомендац|підбір|персоналізац)/i.test(lowercaseTopic)) return 'recommendation';
  if (/(плануванн|розклад|тайм-менеджмент|графік)/i.test(lowercaseTopic)) return 'planning';
  if (/(оптимізац|продуктивн|ефективн)/i.test(lowercaseTopic)) return 'optimization';
  
  return 'general';
}

// Генерація структури за типом проекту
function generateStructureByType(analysis: StructureAnalysis, projectType: string): StructureItem[] {
  const baseStructure = getBaseStructure(analysis);
  
  // Use the analysis data
  console.log(`Generating structure for ${projectType} project: ${analysis.topic}`);
  
  switch (projectType) {
    case 'mobile':
      return adaptForMobileApp(baseStructure, analysis);
    case 'ai':
      return adaptForAIProject(baseStructure, analysis);
    case 'research':
      return adaptForResearch(baseStructure);
    case 'web':
      return adaptForWebProject(baseStructure, analysis);
    case 'system':
      return adaptForSystem(baseStructure);
    case 'recommendation':
      return adaptForRecommendation(baseStructure, analysis);
    case 'planning':
      return adaptForPlanning(baseStructure, analysis);
    case 'optimization':
      return adaptForOptimization(baseStructure);
    default:
      return adaptForGeneral(baseStructure);
  }
}

// Базова структура
function getBaseStructure(analysis: StructureAnalysis): StructureItem[] {
  const { topic, domain, audience, purpose } = analysis;
  
  return [
    {
      id: 1,
      key: "intro",
      progress: 0,
      status: "pending",
      content: `Вступ. Актуальність теми "${topic}" в сучасних умовах. Мета роботи: ${purpose} у сфері ${domain}. Основні завдання: аналіз потреб ${audience}, розробка концепції, практична реалізація, оцінка ефективності. Об'єкт дослідження: ${domain}. Предмет: методи та засоби ${purpose}.`
    },
    {
      id: 2,
      key: "theory",
      progress: 0,
      status: "pending", 
      content: `Теоретичні основи ${domain}. Сучасний стан розвитку технологій у галузі ${domain}. Критичний аналіз існуючих підходів та методологій. Основні поняття, термінологія та класифікації. Наукові праці вітчизняних та зарубіжних авторів з даної проблематики.`
    },
    {
      id: 3,
      key: "analysis",
      progress: 0,
      status: "pending",
      content: `Аналіз вимог та потреб. Дослідження потреб ${audience} у контексті ${purpose}. Аналіз конкурентних рішень на ринку. Визначення функціональних та нефункціональних вимог. SWOT-аналіз предметної області. Визначення критеріїв успішності рішення.`
    }
  ];
}

// Адаптації для різних типів проектів
function adaptForMobileApp(baseStructure: StructureItem[], analysis: StructureAnalysis): StructureItem[] {
  const { technologies, audience } = analysis;
  
  return [
    ...baseStructure,
    {
      id: 4,
      key: "design_mobile",
      progress: 0,
      status: "pending",
      content: `Архітектура мобільного додатку. Вибір платформи (iOS/Android/Cross-platform). Проектування інтерфейсу з урахуванням мобільних паттернів. Вибір технологічного стеку: ${technologies.join(', ')}. Дизайн навігації та користувацького досвіду для ${audience}. Офлайн-функціонал та синхронізація.`
    },
    {
      id: 5,
      key: "development_mobile",
      progress: 0,
      status: "pending",
      content: `Розробка мобільного додатку. Імплементація інтерфейсу користувача (Swift/Kotlin/React Native). Розробка бізнес-логіки. Робота з анімаціями та жестами. Локальне сховище даних. Push-сповіщення. Оптимізація споживання батареї.`
    },
    {
      id: 6,
      key: "testing_mobile",
      progress: 0,
      status: "pending",
      content: `Тестування мобільного додатку. Юніт-тести компонентів. Тестування на різних пристроях та версіях ОС. Юзабіліті тестування з ${audience}. Тестування продуктивності та споживання ресурсів. Тестування в різних мережевих умовах.`
    },
    {
      id: 7,
      key: "publication",
      progress: 0,
      status: "pending",
      content: `Публікація та підтримка. Підготовка до публікації в App Store/Google Play. Створення опису, скріншотів та відео. Налаштування CI/CD. Моніторинг та аналітика використання. Збір зворотного зв'язку від користувачів.`
    }
  ];
}

function adaptForAIProject(baseStructure: StructureItem[], analysis: StructureAnalysis): StructureItem[] {
  const { audience } = analysis;
  
  return [
    ...baseStructure,
    {
      id: 4,
      key: "ai_methodology",
      progress: 0,
      status: "pending",
      content: `Методологія штучного інтелекту. Аналіз завдання та вибір підходу (ML, DL, NLP). Огляд алгоритмів та архітектур. Вибір фреймворків та інструментів. Критерії оцінки якості моделей. Етичні аспекти використання AI.`
    },
    {
      id: 5,
      key: "data_preparation",
      progress: 0,
      status: "pending",
      content: `Підготовка даних для навчання. Збір та розмітка даних. Попередня обробка та очищення. Feature engineering. Розділення на тренувальну/валідаційну/тестову вибірки. Аналіз якості даних. Методи боротьби з дисбалансом.`
    },
    {
      id: 6,
      key: "model_development",
      progress: 0,
      status: "pending",
      content: `Розробка та навчання моделі. Вибір архітектури нейронної мережі. Налаштування гіперпараметрів. Процес навчання та валідації. Боротьба з перенавчанням. Оптимізація продуктивності. Інтерпретація результатів.`
    },
    {
      id: 7,
      key: "integration",
      progress: 0,
      status: "pending",
      content: `Інтеграція AI моделі в систему. Розробка API для моделі. Обробка вхідних/вихідних даних. Масштабування рішення. Моніторинг дрейфу даних. Оновлення та перетренування моделі. Система обробки помилок.`
    },
    {
      id: 8,
      key: "evaluation",
      progress: 0,
      status: "pending",
      content: `Оцінка ефективності AI рішення. Метрики якості (accuracy, precision, recall, F1). A/B тестування. Користувацьке тестування з ${audience}. Аналіз помилок та аномалій. Порівняння з baseline підходами.`
    }
  ];
}

function adaptForResearch(baseStructure: StructureItem[]): StructureItem[] {
  return [
    ...baseStructure,
    {
      id: 4,
      key: "research_methodology",
      progress: 0,
      status: "pending",
      content: `Методологія дослідження. Вибір методів дослідження (анкетування, інтерв'ю, експеримент). Формування вибірки. Розробка інструментів збору даних. Етичні аспекти дослідження. Гіпотези дослідження.`
    },
    {
      id: 5,
      key: "data_collection",
      progress: 0,
      status: "pending",
      content: `Збір та підготовка даних. Проведення польових досліджень. Збір емпіричних даних. Попередня обробка та очищення даних. Формування наборів даних для аналізу. Контроль якості даних.`
    },
    {
      id: 6,
      key: "data_analysis",
      progress: 0,
      status: "pending",
      content: `Аналіз даних. Застосування статистичних методів. Якісний та кількісний аналіз. Інтерпретація результатів. Візуалізація даних та результатів. Перевірка статистичних гіпотез.`
    },
    {
      id: 7,
      key: "results_research",
      progress: 0,
      status: "pending",
      content: `Результати дослідження. Основні знахідки та відкриття. Аналіз отриманих результатів. Порівняння з теоретичними передбаченнями. Обговорення обмежень дослідження. Практичне значення результатів.`
    }
  ];
}

function adaptForWebProject(baseStructure: StructureItem[], analysis: StructureAnalysis): StructureItem[] {
  const { technologies, audience } = analysis;
  
  return [
    ...baseStructure,
    {
      id: 4,
      key: "design_web",
      progress: 0,
      status: "pending",
      content: `Архітектура веб-додатку. Вибір технологічного стеку: ${technologies.join(', ')}. Проектування клієнт-серверної архітектури. Дизайн бази даних та API. UI/UX дизайн для ${audience}. Прототипування інтерфейсу. Вибір хостингу та інфраструктури.`
    },
    {
      id: 5,
      key: "frontend_development",
      progress: 0,
      status: "pending",
      content: `Розробка клієнтської частини. Імплементація користувацького інтерфейсу. Робота з станом додатку. Маршрутизація та навігація. Адаптивний дизайн для різних пристроїв. Оптимізація швидкодії та завантаження. Інтеграція з бекенд-сервісами.`
    },
    {
      id: 6,
      key: "backend_development",
      progress: 0,
      status: "pending",
      content: `Розробка серверної частини. Створення RESTful/graphQL API. Реалізація бізнес-логіки. Робота з базою даних. Система автентифікації та авторизації. Обробка та валідація даних. Логування та моніторинг.`
    },
    {
      id: 7,
      key: "testing_web",
      progress: 0,
      status: "pending",
      content: `Комплексне тестування веб-додатку. Юніт-тестування компонентів. Інтеграційне тестування API. End-to-end тестування критичних сценаріїв. Тестування безпеки (OWASP). Навантажувальне тестування. Юзабіліті тестування з ${audience}.`
    },
    {
      id: 8,
      key: "deployment",
      progress: 0,
      status: "pending",
      content: `Розгортання та впровадження. Налаштування production середовища. CI/CD пайплайн. Домене імена та SSL сертифікати. Моніторинг продуктивності (Google Analytics, Hotjar). Резервне копіювання та відновлення. SEO оптимізація.`
    }
  ];
}

function adaptForSystem(baseStructure: StructureItem[]): StructureItem[] {
  return [
    ...baseStructure,
    {
      id: 4,
      key: "system_architecture",
      progress: 0,
      status: "pending",
      content: `Архітектура системи. Проектування системної архітектури. Вибір технологій та інфраструктури. Проектування модулів та їх взаємодії. Схема бази даних. Проектування API та мікросервісів. Масштабованість та надійність.`
    },
    {
      id: 5,
      key: "development_system",
      progress: 0,
      status: "pending",
      content: `Розробка системи. Імплементація основних модулів. Розробка бізнес-логіки. Інтеграція зовнішніх сервісів. Реалізація системи безпеки. Налаштування конфігурації та середовищ. Документування архітектури.`
    },
    {
      id: 6,
      key: "integration",
      progress: 0,
      status: "pending",
      content: `Інтеграція та тестування. Інтеграція модулів системи. Тестування взаємодії компонентів. Навантажувальне тестування. Тестування безпеки. Валідація роботи системи в різних сценаріях. Тестування відмовостійкості.`
    },
    {
      id: 7,
      key: "deployment_system",
      progress: 0,
      status: "pending",
      content: `Впровадження системи. Розгортання на production серверах. Міграція даних. Навчання користувачів. Технічна підтримка. Моніторинг продуктивності та помилок. План обслуговування.`
    }
  ];
}

function adaptForRecommendation(baseStructure: StructureItem[], analysis: StructureAnalysis): StructureItem[] {
  const { audience } = analysis;
  
  return [
    ...baseStructure,
    {
      id: 4,
      key: "recommendation_algorithms",
      progress: 0,
      status: "pending",
      content: `Алгоритми рекомендацій. Аналіз методів рекомендаційних систем (колаборативна фільтрація, контент-базована, гібридна). Вибір та адаптація алгоритмів. Розробка моделі рекомендацій. Критерії релевантності.`
    },
    {
      id: 5,
      key: "data_processing",
      progress: 0,
      status: "pending",
      content: `Обробка даних. Збір та підготовка даних для навчання моделі. Feature engineering. Обробка відсутніх даних. Нормалізація та стандартизація. Створення наборів даних для тренування та тестування. Аналіз якості даних.`
    },
    {
      id: 6,
      key: "model_implementation",
      progress: 0,
      status: "pending",
      content: `Реалізація моделі. Імплементація алгоритмів рекомендацій. Навчання моделі на підготовлених даних. Оптимізація гіперпараметрів. Валідація якості рекомендацій. Інтеграція моделі в систему. Моніторинг якості рекомендацій.`
    },
    {
      id: 7,
      key: "evaluation_recommendation",
      progress: 0,
      status: "pending",
      content: `Оцінка ефективності. Метрики оцінки якості рекомендацій (precision, recall, F1-score). A/B тестування різних підходів. Аналіз релевантності рекомендацій для ${audience}. Користувацьке тестування. Аналіз конверсії.`
    }
  ];
}

function adaptForPlanning(baseStructure: StructureItem[], analysis: StructureAnalysis): StructureItem[] {
  const { audience } = analysis;
  
  return [
    ...baseStructure,
    {
      id: 4,
      key: "system_design",
      progress: 0,
      status: "pending",
      content: `Проектування системи планування. Архітектура системи управління завданнями. Алгоритми оптимізації розкладу. Модель даних для ${audience}. Дизайн інтерфейсу планування. Інтеграція з календарними системами. Синхронізація між пристроями.`
    },
    {
      id: 5,
      key: "algorithm_development",
      progress: 0,
      status: "pending",
      content: `Розробка алгоритмів планування. Алгоритми розподілу ресурсів. Оптимізація навантаження. Прогнозування часу виконання. Персоналізація рекомендацій. Конфлікт розкладів. Адаптивне планування на основі історії.`
    },
    {
      id: 6,
      key: "implementation",
      progress: 0,
      status: "pending",
      content: `Реалізація функціоналу планування. Модуль створення та редагування завдань. Система сповіщень та нагадувань. Статистика та аналітика продуктивності. Експорт/імпорт даних. Офлайн-режим роботи. Синхронізація даних.`
    },
    {
      id: 7,
      key: "testing_optimization",
      progress: 0,
      status: "pending",
      content: `Тестування та оптимізація. Тестування алгоритмів на реальних даних. Юзабіліті тестування з ${audience}. Навантажувальне тестування. Оптимізація швидкодії. Тестування точності прогнозів. Порівняння з існуючими рішеннями.`
    }
  ];
}

function adaptForOptimization(baseStructure: StructureItem[]): StructureItem[] {
  return [
    ...baseStructure,
    {
      id: 4,
      key: "analysis_current_state",
      progress: 0,
      status: "pending",
      content: `Аналіз поточного стану. Діагностика проблем продуктивності. Вимірювання ключових показників. Аналіз bottlenecks. Benchmarking існуючих рішень. Визначення цілей оптимізації. Критерії оцінки успішності.`
    },
    {
      id: 5,
      key: "optimization_strategy",
      progress: 0,
      status: "pending",
      content: `Стратегія оптимізації. Вибір методів та підходів. Пріоритизація напрямів оптимізації. Оцінка ресурсів та ризиків. План впровадження змін. Критерії прийняття рішень. Методика контролю якості.`
    },
    {
      id: 6,
      key: "implementation_optimization",
      progress: 0,
      status: "pending",
      content: `Реалізація оптимізаційних заходів. Технічні вдосконалення. Алгоритмічні оптимізації. Оптимізація баз даних. Кешування та мемоізація. Паралелізація обчислень. Оптимізація мережевих запитів.`
    },
    {
      id: 7,
      key: "performance_testing",
      progress: 0,
      status: "pending",
      content: `Тестування продуктивності. Load testing та stress testing. Вимірювання показників до/після оптимізації. Аналіз впливу на користувацький досвід. Виявлення нових bottlenecks. Валідація стабільності рішення.`
    }
  ];
}

// Додайте також адаптацію для загального типу проектів
function adaptForGeneral(baseStructure: StructureItem[]): StructureItem[] {
  return [
    ...baseStructure,
    {
      id: 4,
      key: "design_general",
      progress: 0,
      status: "pending",
      content: `Проектування рішення. Розробка архітектури проекту. Вибір технологій та інструментів. Проектування інтерфейсу користувача. Планування робочих процесів. Визначення критеріїв успіху. Управління ризиками.`
    },
    {
      id: 5,
      key: "implementation_general",
      progress: 0,
      status: "pending",
      content: `Реалізація проекту. Розробка основних функціональних модулів. Інтеграція компонентів. Тестування функціональності. Оптимізація продуктивності. Документування коду та процесів. Контроль якості розробки.`
    },
    {
      id: 6,
      key: "testing_general",
      progress: 0,
      status: "pending",
      content: `Тестування та валідація. Комплексне тестування системи. Перевірка відповідності вимогам. Юзабіліті тестування. Виправлення помилок та доопрацювання. Підготовка до впровадження. Приймальні випробування.`
    },
    {
      id: 7,
      key: "deployment_general",
      progress: 0,
      status: "pending",
      content: `Впровадження рішення. Розгортання в робочому середовищі. Навчання користувачів. Технічна підтримка. Збір зворотного зв'язку. Моніторинг роботи системи. Обслуговування та оновлення.`
    }
  ];
}

// Type definitions (додайте ці типи в ваш код)
interface StructureAnalysis {
  topic: string;
  domain: string;
  audience: string;
  purpose: string;
  technologies: string[];
}

interface StructureItem {
  id: number;
  key: string;
  progress: number;
  status: string;
  content: string;
}



app.post("/api/analyze-text", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    console.log("Analyzing text:", text?.substring(0, 100));
    
    if (!text || typeof text !== "string") {
      return res.status(400).json({ 
        message: "Text is required and should be a string.",
        analysis: generateFallbackAnalysis("")
      });
    }

    let analysis;
    try {
      analysis = await analyzeWithHuggingFace(text);
      console.log("Hugging Face analysis successful");
    } catch (error) {
      console.error("Hugging Face analysis failed, using fallback:", error);
      analysis = generateFallbackAnalysis(text);
    }
    
    console.log("Returning analysis result");
    return res.status(200).json(analysis);

  } catch (error) {
    console.error("Error analyzing text:", error);
    const text = req.body.text || "";
    const fallbackAnalysis = generateFallbackAnalysis(text);
    return res.status(200).json(fallbackAnalysis);
  }
});

// Hugging Face analysis function
async function analyzeWithHuggingFace(text: string): Promise<TextAnalysisResult> {
  // Check if API token is available
  if (!process.env.HF_TOKEN) {
    console.warn('Hugging Face token not found, using fallback analysis');
    throw new Error('Hugging Face token not configured');
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            candidate_labels: [
              "well structured",
              "poorly structured", 
              "academic writing",
              "informal writing",
              "coherent logic",
              "confusing logic",
              "good vocabulary",
              "poor vocabulary",
              "clear arguments",
              "unclear arguments",
              "proper formatting",
              "needs formatting improvement"
            ]
          }
        })
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Hugging Face API: Invalid token (401)');
        throw new Error('Authentication failed - check HF_TOKEN');
      } else if (response.status === 503) {
        console.error('Hugging Face API: Model is loading (503)');
        throw new Error('Model is loading, please try again later');
      }
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data: HuggingFaceAnalysisResponse = await response.json();
    return processHuggingFaceResults(data, text);
    
  } catch (error) {
    console.error('Hugging Face analysis failed:', error);
    throw error;
  }
}

// Process Hugging Face results
function processHuggingFaceResults(data: HuggingFaceAnalysisResponse, originalText: string): TextAnalysisResult {
  const { labels, scores } = data;
  
  // Calculate basic metrics
  const words = originalText.split(/\s+/).filter(word => word.length > 0).length;
  const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = originalText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  
  // Analyze classification results
  const positiveLabels = [
    "well structured", 
    "academic writing", 
    "coherent logic", 
    "good vocabulary", 
    "clear arguments",
    "proper formatting"
  ];
  
  const negativeLabels = [
    "poorly structured",
    "informal writing", 
    "confusing logic",
    "poor vocabulary",
    "unclear arguments",
    "needs formatting improvement"
  ];

  let positiveScore = 0;
  let negativeScore = 0;
  const strengths: string[] = [];
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Analyze each label and its score
  labels.forEach((label, index) => {
    const score = scores[index];
    
    if (positiveLabels.includes(label) && score > 0.3) {
      positiveScore += score;
      const strength = mapLabelToStrength(label);
      if (strength && !strengths.includes(strength)) {
        strengths.push(strength);
      }
    }
    
    if (negativeLabels.includes(label) && score > 0.3) {
      negativeScore += score;
      const issue = mapLabelToIssue(label);
      const suggestion = mapLabelToSuggestion(label);
      
      if (issue && !issues.includes(issue)) {
        issues.push(issue);
      }
      
      if (suggestion && !suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }
  });

  // Calculate overall score
  const totalScore = positiveScore + negativeScore;
  const overallScore = totalScore > 0 
    ? Math.round((positiveScore / totalScore) * 100)
    : 50;

  // Fallback content if no strengths/issues detected
  if (strengths.length === 0) {
    strengths.push('Текст має потенціал для розвитку');
  }

  if (issues.length === 0 && words < 10) {
    issues.push('Текст занадто короткий для глибокого аналізу');
    suggestions.push('Додайте більше деталей та пояснень');
  }

  return {
    metrics: {
      wordCount: words,
      sentenceCount: sentences,
      paragraphCount: paragraphs,
      characterCount: originalText.length,
      averageSentenceLength: sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0,
      averageWordLength: words > 0 ? Math.round((originalText.replace(/\s/g, '').length / words) * 10) / 10 : 0,
      readabilityScore: Math.max(30, Math.min(95, overallScore)),
      coherenceScore: Math.max(30, Math.min(95, overallScore - 10))
    },
    strengths: strengths.slice(0, 3),
    issues: issues.slice(0, 3),
    suggestions: suggestions.slice(0, 4),
    overallScore: Math.max(20, Math.min(95, overallScore))
  };
}

// Label mapping functions
function mapLabelToStrength(label: string): string {
  const mapping: { [key: string]: string } = {
    "well structured": "Гарна структура тексту",
    "academic writing": "Академічний стиль викладу",
    "coherent logic": "Логічна послідовність думок",
    "good vocabulary": "Багатий словниковий запас",
    "clear arguments": "Чіткі та переконливі аргументи",
    "proper formatting": "Правильне форматування"
  };
  return mapping[label] || "";
}

function mapLabelToIssue(label: string): string {
  const mapping: { [key: string]: string } = {
    "poorly structured": "Погана структура тексту",
    "informal writing": "Неформальний стиль викладу",
    "confusing logic": "Нелогічна послідовність думок",
    "poor vocabulary": "Обмежений словниковий запас",
    "unclear arguments": "Нечіткі аргументи",
    "needs formatting improvement": "Потребує покращення форматування"
  };
  return mapping[label] || "";
}

function mapLabelToSuggestion(label: string): string {
  const mapping: { [key: string]: string } = {
    "poorly structured": "Покращте структуру тексту - додайте вступ, основну частину та висновки",
    "informal writing": "Використовуйте більш академічний стиль викладу",
    "confusing logic": "Переконайтесь у логічній послідовності ваших думок",
    "poor vocabulary": "Використовуйте більш різноманітну лексику",
    "unclear arguments": "Уточніть та розкрийте ваші аргументи",
    "needs formatting improvement": "Зверніть увагу на форматування тексту"
  };
  return mapping[label] || "Працюйте над покращенням якості тексту";
}

// Fallback analysis function (when Hugging Face is unavailable)
function generateFallbackAnalysis(text: string): TextAnalysisResult {
  if (!text || typeof text !== 'string') {
    text = '';
  }
  
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const characters = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, '').length;
  
  const avgSentenceLength = sentences > 0 ? words / sentences : 0;
  const avgWordLength = words > 0 ? charactersWithoutSpaces / words : 0;
  
  let qualityScore = 50;
  const suggestions: string[] = [];
  let strengths: string[] = [];
  const issues: string[] = [];

  // Character repetition analysis
  const repeatedChars = text.match(/(.)\1{3,}/g);
  if (repeatedChars && repeatedChars.length > 0) {
    qualityScore -= 20;
    issues.push('Виявлено надмірне повторення символів');
    suggestions.push('Уникніть повторення однакових символів підряд');
  }

  // Text length analysis
  if (words < 10) {
    qualityScore -= 15;
    issues.push('Текст занадто короткий для аналізу');
    suggestions.push('Додайте більше змістовного тексту для кращого аналізу');
  } else if (words < 50) {
    qualityScore -= 5;
    issues.push('Текст може бути недостатньо детальним');
    suggestions.push('Розкрийте тему більш детально');
  } else if (words > 200) {
    qualityScore += 10;
    strengths.push('Достатній обсяг тексту для розкриття теми');
  }

  // Sentence structure analysis
  if (sentences === 0 && words > 0) {
    qualityScore -= 10;
    issues.push('Відсутні розділові знаки');
    suggestions.push('Використовуйте крапки, знаки оклику чи питання для розділення речень');
  }

  if (avgSentenceLength > 25 && sentences > 0) {
    qualityScore -= 8;
    issues.push('Речення занадто довгі');
    suggestions.push('Розбийте довгі речення на коротші для кращої читабельності');
  }
  
  if (avgSentenceLength < 5 && sentences > 2) {
    qualityScore -= 5;
    issues.push('Речення занадто короткі');
    suggestions.push('Об\'єднайте надто короткі речення для покращення плавності тексту');
  }

  // Paragraph analysis
  if (paragraphs < 2 && words > 100) {
    qualityScore -= 5;
    issues.push('Текст потребує розділення на абзаци');
    suggestions.push('Розділіть текст на абзаци для кращої структуризації');
  } else if (paragraphs >= 3) {
    qualityScore += 5;
    strengths.push('Гарна структура з чіткими абзацами');
  }

  // Vocabulary diversity analysis
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/).filter(word => word.length > 2));
  const diversityRatio = uniqueWords.size / Math.max(1, words);
  
  if (diversityRatio < 0.3 && words > 20) {
    qualityScore -= 10;
    issues.push('Низька лексична різноманітність');
    suggestions.push('Використовуйте більш різноманітну лексику');
  } else if (diversityRatio > 0.6) {
    qualityScore += 10;
    strengths.push('Висока лексична різноманітність');
  }

  // Key elements check for longer texts
  if (words > 50) {
    const hasIntroduction = /вступ|актуальність|мета|завдання/i.test(text);
    const hasConclusion = /висновок|результат|підсумок|висновки/i.test(text);
    const hasExamples = /наприклад|приклад|як приклад/i.test(text);
    
    if (hasIntroduction) {
      qualityScore += 5;
      strengths.push('Наявний вступ або постановка задачі');
    } else {
      suggestions.push('Розгляньте можливість додати вступну частину');
    }
    
    if (hasConclusion) {
      qualityScore += 5;
      strengths.push('Чіткі висновки або підсумки');
    } else {
      suggestions.push('Додайте висновки або підсумки');
    }

    if (hasExamples) {
      qualityScore += 5;
      strengths.push('Використання прикладів для ілюстрації');
    } else if (words > 100) {
      suggestions.push('Використовуйте приклади для ілюстрації ваших думок');
    }
  }

  // Determine strengths based on quality score
  if (qualityScore > 70) {
    if (diversityRatio > 0.6) {
      strengths.push('Висока лексична різноманітність');
    }
    
    if (avgSentenceLength >= 8 && avgSentenceLength <= 20) {
      strengths.push('Оптимальна довжина речень');
    }
  } else if (qualityScore > 50) {
    strengths.push('Текст має потенціал для покращення');
    strengths.push('Базова структура присутня');
  } else {
    strengths.push('Текст потребує серйозної роботи над структурою та змістом');
  }

  // Additional checks for very short texts
  if (words <= 3) {
    issues.push('Недостатньо інформації для аналізу');
    suggestions.push('Напишіть більш розгорнутий текст для отримання корисних рекомендацій');
    strengths = ['Початок роботи над текстом'];
  }

  // Meaningful words check
  const meaningfulWords = text.split(/\s+/).filter(word => 
    word.length > 2 && 
    !/^[0-9\W_]+$/.test(word) &&
    !/(.)\1{2,}/.test(word)
  ).length;

  if (meaningfulWords < words * 0.7 && words > 10) {
    qualityScore -= 10;
    issues.push('Багато незмістовних слів або символів');
    suggestions.push('Зосередьтеся на змістовному викладі думок');
  }

  // Normalize score
  qualityScore = Math.max(10, Math.min(95, qualityScore));

  // Ensure we have content in each array
  if (strengths.length === 0) {
    strengths.push('Текст успішно проаналізовано');
  }
  
  if (issues.length === 0 && qualityScore < 80) {
    issues.push('Можливі незначні проблеми з форматуванням');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Продовжуйте роботу над вдосконаленням тексту');
  }

  return {
    metrics: {
      wordCount: words,
      sentenceCount: sentences,
      paragraphCount: paragraphs,
      characterCount: characters,
      averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      averageWordLength: Math.round(avgWordLength * 10) / 10,
      readabilityScore: Math.max(10, Math.min(95, qualityScore)),
      coherenceScore: Math.max(20, Math.min(90, qualityScore - 10))
    },
    suggestions: suggestions.slice(0, 5),
    strengths: strengths,
    issues: issues.length > 0 ? issues : ['Основних проблем не виявлено'],
    overallScore: qualityScore
  };
}

// Type definitions (make sure these are defined elsewhere in your types file)
interface HuggingFaceAnalysisResponse {
  labels: string[];
  scores: number[];
  sequence: string;
}

interface TextAnalysisResult {
  metrics: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    characterCount: number;
    averageSentenceLength: number;
    averageWordLength: number;
    readabilityScore: number;
    coherenceScore: number;
  };
  strengths: string[];
  issues: string[];
  suggestions: string[];
  overallScore: number;
}



// GET /api/teacher/profile/:id - отримати профіль викладача за ID
app.get("/api/teacher/profile/:id", async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id;

    // Валідація ID
    if (!teacherId || isNaN(Number(teacherId))) {
      return res.status(400).json({ message: "Invalid teacher ID" });
    }

    const result = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.faculty_id,
        u.department_id,
        d.name as department_name,
        f.name as faculty_name,
        tp.title,
        tp.bio,
        tp.avatar_url,
        tp.office_hours,
        tp.phone,
        tp.website,
        tp.created_at,
        tp.updated_at
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       WHERE u.id = $1 AND u.role = 'teacher'`,
      [teacherId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const teacherData = result.rows[0];
    
    // Розділяємо ім'я на частини
    const nameParts = teacherData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    res.json({
      id: teacherData.id,
      name: teacherData.name,
      firstName,
      lastName,
      title: teacherData.title || "",
      department: teacherData.department_name || "Кафедра не вказана",
      departmentId: teacherData.department_id,
      faculty: teacherData.faculty_name || "Факультет не вказаний",
      facultyId: teacherData.faculty_id,
      email: teacherData.email,
      bio: teacherData.bio || "",
      avatarUrl: teacherData.avatar_url,
      officeHours: teacherData.office_hours || "",
      phone: teacherData.phone || "",
      website: teacherData.website || "",
      createdAt: teacherData.created_at,
      updatedAt: teacherData.updated_at
    });
  } catch (err) {
    console.error("Error fetching teacher profile:", err);
    res.status(500).json({ message: "Database error fetching teacher profile" });
  }
});



// GET /api/faculties/:id - отримати факультет за ID
app.get("/api/faculties/:id", async (req: Request, res: Response) => {
  try {
    const facultyId = req.params.id;

    if (!facultyId || isNaN(Number(facultyId))) {
      return res.status(400).json({ message: "Invalid faculty ID" });
    }

    const result = await pool.query(
      "SELECT id, name FROM faculties WHERE id = $1",
      [facultyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching faculty:", err);
    res.status(500).json({ message: "Database error fetching faculty" });
  }
});


// GET всіх ресурсів
app.get("/api/resources", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT r.*, u.name as created_by_name FROM resources r LEFT JOIN users u ON r.created_by = u.id ORDER BY r.created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching resources:", err);
    res.status(500).json({ message: "Database error fetching resources" });
  }
});

// GET ресурсу за ID
app.get("/api/resources/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT r.*, u.name as created_by_name FROM resources r LEFT JOIN users u ON r.created_by = u.id WHERE r.id = $1",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ресурс не знайдено" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching resource:", err);
    res.status(500).json({ message: "Database error fetching resource" });
  }
});

// POST новий ресурс
app.post("/api/resources", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, description, link, category } = req.body;
    
    // Type guard for req.user
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Перевірка, що користувач - викладач
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: "Доступ заборонено" });
    }
    
    // Валідація даних
    if (!title || !link) {
      return res.status(400).json({ message: "Назва та посилання обов'язкові" });
    }

    // Додаткова перевірка userId
    if (!req.user.userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const result = await pool.query(
      `INSERT INTO resources (title, description, link, category, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, link, category || 'other', req.user.userId]
    );

    // Отримуємо повну інформацію про ресурс з іменем користувача
    const fullResource = await pool.query(
      "SELECT r.*, u.name as created_by_name FROM resources r LEFT JOIN users u ON r.created_by = u.id WHERE r.id = $1",
      [result.rows[0].id]
    );

    res.status(201).json({
      message: "Ресурс додано успішно",
      resource: fullResource.rows[0] // Повертаємо ресурс з created_by_name
    });
  } catch (err) {
    console.error("Error adding resource:", err);
    res.status(500).json({ message: "Помилка бази даних" });
  }
});


// PUT оновлення ресурсу
app.put("/api/resources/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, link, category } = req.body;
    
    console.log(`Updating resource ${id} with:`, { title, description, link, category });
    
    // Type guard for req.user
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Перевірка прав власності - вибираємо тільки created_by
    const resourceCheck = await pool.query(
      "SELECT created_by FROM resources WHERE id = $1",
      [id]
    );
    
    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({ message: "Ресурс не знайдено" });
    }
    
    if (resourceCheck.rows[0].created_by !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Доступ заборонено" });
    }

    // Валідація даних
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Назва обов'язкова" });
    }
    
    if (!link || !link.trim()) {
      return res.status(400).json({ message: "Посилання обов'язкове" });
    }

    // Форматування посилання
    let formattedLink = link.trim();
    if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = 'https://' + formattedLink;
    }

    const result = await pool.query(
      `UPDATE resources
       SET title = $1, description = $2, link = $3, category = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title.trim(), description?.trim() || '', formattedLink, category || 'other', id]
    );

    console.log('Resource updated successfully:', result.rows[0]);
    
    // Отримуємо повну інформацію про ресурс з іменем користувача
    const fullResource = await pool.query(
      "SELECT r.*, u.name as created_by_name FROM resources r LEFT JOIN users u ON r.created_by = u.id WHERE r.id = $1",
      [id]
    );
    
    res.json({
      message: "Ресурс оновлено успішно",
      resource: fullResource.rows[0] // Повертаємо ресурс з created_by_name
    });
  } catch (err) {
    console.error("Error updating resource:", err);
    res.status(500).json({ message: "Помилка бази даних при оновленні ресурсу" });
  }
});

// DELETE видалення ресурсу
app.delete("/api/resources/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Type guard for req.user
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Перевірка прав власності
    const resourceCheck = await pool.query(
      "SELECT created_by FROM resources WHERE id = $1",
      [id]
    );
    
    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({ message: "Ресурс не знайдено" });
    }
    
    if (resourceCheck.rows[0].created_by !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Доступ заборонено" });
    }

    await pool.query("DELETE FROM resources WHERE id = $1", [id]);
    res.json({ message: "Ресурс видалено успішно" });
  } catch (err) {
    console.error("Error deleting resource:", err);
    res.status(500).json({ message: "Помилка мережі" });
  }
});



// ============ CHAT ENDPOINTS ============

// GET /api/chat - отримати список чатів користувача
app.get("/api/chat", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
        c.id,
        c.name,
        c.type,
        c.avatar_url,
        c.description,
        c.last_message,
        c.last_message_at,
        c.created_at,
        cm.unread_count,
        u.is_online,
        u.last_seen
       FROM chat_members cm
       JOIN chats c ON cm.chat_id = c.id
       LEFT JOIN users u ON c.type != 'group' AND c.id = (
         SELECT CASE 
           WHEN cm1.user_id = $1 THEN cm2.user_id 
           ELSE cm1.user_id 
         END
         FROM chat_members cm1
         JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
         WHERE cm1.chat_id = c.id AND cm1.user_id != cm2.user_id
         LIMIT 1
       )
       WHERE cm.user_id = $1
       ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC`,
      [userId]
    );

    const chats = await Promise.all(result.rows.map(async (row: any) => {
      // Для групових чатів отримуємо список учасників
      if (row.type === 'group') {
        const membersResult = await pool.query(
          `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.is_online
           FROM chat_members cm
           JOIN users u ON cm.user_id = u.id
           WHERE cm.chat_id = $1`,
          [row.id]
        );

        const members: ChatMember[] = membersResult.rows.map((member: { 
          id: number; 
          name: string; 
          email: string; 
          role: string; 
          avatar_url: string; 
          is_online: boolean 
        }) => ({
          id: member.id.toString(),
          name: member.name,
          avatar: member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          avatarUrl: member.avatar_url ?? undefined,
          email: member.email,
          type: member.role === 'teacher' ? 'supervisor' : 'student',
          isOnline: member.is_online
        }));

        return {
          id: row.id.toString(),
          name: row.name,
          avatar: row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          avatarUrl: row.avatar_url ?? undefined,
          type: row.type,
          isOnline: row.is_online || false,
          lastSeen: row.last_seen ? new Date(row.last_seen).toLocaleString('uk-UA') : undefined,
          unreadCount: row.unread_count || 0,
          lastMessage: row.last_message,
          members: members, // Використовуємо отриманих учасників для групових чатів
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
          description: row.description
        };
      }

      // Для особистих чатів повертаємо без списку учасників
      return {
        id: row.id.toString(),
        name: row.name,
        avatar: row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        avatarUrl: row.avatar_url ?? undefined,
        type: row.type,
        isOnline: row.is_online || false,
        lastSeen: row.last_seen ? new Date(row.last_seen).toLocaleString('uk-UA') : undefined,
        unreadCount: row.unread_count || 0,
        lastMessage: row.last_message,
        members: undefined, // Для не групових чатів members = undefined
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
        description: row.description
      };
    }));

    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "Database error fetching chats" });
  }
});


// GET /api/chat/:chatId/messages - отримати повідомлення чату
app.get("/api/chat/:chatId/messages", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевірка доступу до чату
    const accessCheck = await pool.query(
      'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "No access to this chat" });
    }

    const result = await pool.query(
      `SELECT 
        m.id,
        m.chat_id as "chatId",
        m.sender_id as "sender",
        u.name,
        m.content,
        m.message_type as "type",
        m.reply_to as "replyTo",
        m.attachment_data as "attachment",
        m.created_at as "timestamp",
        false as "isPinned",
        false as "isEdited",
        'sent' as "status"
       FROM chat_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [chatId, parseInt(limit as string), parseInt(offset as string)]
    );

    const messages = result.rows.map((row: any) => ({
      ...row,
      id: row.id.toString(),
      sender: row.sender.toString(),
      timestamp: new Date(row.timestamp).toLocaleTimeString('uk-UA', {
        hour: '2-digit', minute: '2-digit'
      })
    }));

    // Оновлюємо лічильник непрочитаних
    await pool.query(
      `UPDATE chat_members 
       SET unread_count = 0 
       WHERE chat_id = $1 AND user_id = $2`,
      [chatId, userId]
    );

    res.json(messages.reverse()); // Повертаємо в хронологічному порядку
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Database error fetching messages" });
  }
});

// POST /api/chat/create - створити приватний чат
app.post("/api/chat/create", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { participantId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!participantId) {
      return res.status(400).json({ message: "Participant ID is required" });
    }

    // Перевіряємо чи існує вже приватний чат
    const existingChat = await pool.query(
      `SELECT c.id FROM chats c
       JOIN chat_members cm1 ON c.id = cm1.chat_id
       JOIN chat_members cm2 ON c.id = cm2.chat_id
       WHERE c.type = 'private' 
       AND cm1.user_id = $1 AND cm2.user_id = $2`,
      [userId, participantId]
    );

    if (existingChat.rows.length > 0) {
      return res.json({ 
        chatId: existingChat.rows[0].id.toString(),
        message: "Chat already exists" 
      });
    }

    // Отримуємо ім'я учасника для назви чату
    const participantResult = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [participantId]
    );

    if (participantResult.rows.length === 0) {
      return res.status(404).json({ message: "Participant not found" });
    }

    const participantName = participantResult.rows[0].name;

    // Створюємо новий чат з назвою тільки учасника
    const chatResult = await pool.query(
      `INSERT INTO chats (name, type, created_by, created_at)
       VALUES ($1, 'private', $2, NOW())
       RETURNING id`,
      [participantName, userId] // Тільки ім'я учасника
    );

    const chatId = chatResult.rows[0].id.toString();

    // Додаємо учасників
    await pool.query(
      'INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES ($1, $2, NOW())',
      [chatId, userId]
    );
    await pool.query(
      'INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES ($1, $2, NOW())',
      [chatId, participantId]
    );

    res.status(201).json({ 
      chatId,
      message: "Chat created successfully" 
    });
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ message: "Database error creating chat" });
  }
});

// POST /api/chat/create-group - створити груповий чат
app.post("/api/chat/create-group", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, memberIds, description, settings } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ message: "Name and memberIds are required" });
    }

    // Створюємо груповий чат
    const chatResult = await pool.query(
      `INSERT INTO chats (name, type, description, settings, created_by, created_at)
       VALUES ($1, 'group', $2, $3, $4, NOW())
       RETURNING id`,
      [name, description || '', JSON.stringify(settings || {}), userId]
    );

    const chatId = chatResult.rows[0].id.toString();

    // Додаємо всіх учасників (включаючи творця)
    const allMembers = [userId, ...memberIds];
    
    for (const memberId of allMembers) {
      await pool.query(
        'INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES ($1, $2, NOW())',
        [chatId, memberId]
      );
    }

    res.status(201).json({ 
      chatId,
      message: "Group chat created successfully" 
    });
  } catch (err) {
    console.error("Error creating group chat:", err);
    res.status(500).json({ message: "Database error creating group chat" });
  }
});

// POST /api/chat/:chatId/messages - надіслати повідомлення (альтернатива WebSocket)
app.post("/api/chat/:chatId/messages", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;
    const { content, type = 'text', replyTo, attachment } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content && !attachment) {
      return res.status(400).json({ message: "Content or attachment is required" });
    }

    // Перевірка доступу до чату
    const accessCheck = await pool.query(
      'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "No access to this chat" });
    }

    // Зберігаємо повідомлення
    const messageResult = await pool.query(
      `INSERT INTO chat_messages 
       (chat_id, sender_id, content, message_type, reply_to, attachment_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, created_at`,
      [
        chatId, 
        userId, 
        content, 
        type, 
        replyTo ? JSON.stringify(replyTo) : null,
        attachment ? JSON.stringify(attachment) : null
      ]
    );

    const dbMessage = messageResult.rows[0];

    // Оновлюємо останнє повідомлення в чаті
    await pool.query(
      `UPDATE chats SET last_message = $1, last_message_at = NOW() WHERE id = $2`,
      [content || '📎 Вкладення', chatId]
    );

    // Отримуємо інформацію про відправника
    const userResult = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [userId]
    );

    const message = {
      id: dbMessage.id.toString(),
      sender: userId.toString(),
      name: userResult.rows[0].name,
      content,
      timestamp: new Date(dbMessage.created_at).toLocaleTimeString('uk-UA', {
        hour: '2-digit', minute: '2-digit'
      }),
      type: type || 'text',
      chatId,
      status: 'sent',
      replyTo,
      attachment
    };

    res.status(201).json({ 
      message: "Message sent successfully",
      messages: message
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Database error sending message" });
  }
});

// PUT /api/messages/:messageId - редагувати повідомлення
app.put("/api/messages/:messageId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { messageId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Перевіряємо чи користувач є автором повідомлення
    const messageCheck = await pool.query(
      'SELECT sender_id FROM chat_messages WHERE id = $1',
      [messageId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (messageCheck.rows[0].sender_id !== userId) {
      return res.status(403).json({ message: "Can only edit your own messages" });
    }

    // Оновлюємо повідомлення
    await pool.query(
      `UPDATE chat_messages 
       SET content = $1, is_edited = true, updated_at = NOW()
       WHERE id = $2`,
      [content, messageId]
    );

    res.json({ message: "Message updated successfully" });
  } catch (err) {
    console.error("Error updating message:", err);
    res.status(500).json({ message: "Database error updating message" });
  }
});

// DELETE /api/messages/:messageId - видалити повідомлення
app.delete("/api/messages/:messageId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи користувач є автором повідомлення
    const messageCheck = await pool.query(
      'SELECT sender_id, chat_id FROM chat_messages WHERE id = $1',
      [messageId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (messageCheck.rows[0].sender_id !== userId) {
      return res.status(403).json({ message: "Can only delete your own messages" });
    }

    // Видаляємо повідомлення
    await pool.query('DELETE FROM chat_messages WHERE id = $1', [messageId]);

    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ message: "Database error deleting message" });
  }
});

// POST /api/messages/:messageId/read - позначити повідомлення як прочитане
app.post("/api/messages/:messageId/read", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Додаємо запис про прочитання
    await pool.query(
      `INSERT INTO message_read_receipts (message_id, user_id, read_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (message_id, user_id)
       DO UPDATE SET read_at = NOW()`,
      [messageId, userId]
    );

    res.json({ message: "Message marked as read" });
  } catch (err) {
    console.error("Error marking message as read:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// GET /api/chat/:chatId/media - отримати медіафайли чату
app.get("/api/chat/:chatId/media", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевірка доступу до чату
    const accessCheck = await pool.query(
      'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "No access to this chat" });
    }

    const result = await pool.query(
      `SELECT 
        m.id as message_id,
        m.attachment_data as attachment,
        m.message_type as type,
        m.created_at as timestamp
       FROM chat_messages m
       WHERE m.chat_id = $1 
       AND (m.attachment_data IS NOT NULL OR m.message_type IN ('image', 'video', 'file', 'voice'))
       ORDER BY m.created_at DESC`,
      [chatId]
    );

    const media = result.rows
      .filter((row: any) => row.attachment || row.type !== 'text')
      .map((row: any) => {
        const attachment = row.attachment ? JSON.parse(row.attachment) : null;
        
        let mediaType: 'image' | 'video' | 'file' | 'voice' = 'file';
        if (row.type === 'voice') {
          mediaType = 'voice';
        } else if (attachment?.type?.startsWith('image/')) {
          mediaType = 'image';
        } else if (attachment?.type?.startsWith('video/')) {
          mediaType = 'video';
        }

        return {
          type: mediaType,
          url: attachment?.url || '',
          name: attachment?.name || 'Файл',
          timestamp: new Date(row.timestamp).toLocaleTimeString('uk-UA', {
            hour: '2-digit', minute: '2-digit'
          }),
          messageId: row.message_id.toString(),
          thumbnail: attachment?.previewUrl
        };
      });

    res.json(media);
  } catch (err) {
    console.error("Error fetching media:", err);
    res.status(500).json({ message: "Database error fetching media" });
  }
});

// GET /api/chat/:chatId/search - пошук повідомлень
app.get("/api/chat/:chatId/search", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;
    const { q, type, sender, date } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Перевірка доступу до чату
    const accessCheck = await pool.query(
      'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "No access to this chat" });
    }

    let query = `
      SELECT 
        m.id,
        m.chat_id as "chatId",
        m.sender_id as "sender",
        u.name,
        m.content,
        m.message_type as "type",
        m.attachment_data as "attachment",
        m.created_at as "timestamp"
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1 AND m.content ILIKE $2
    `;
    
    const params: any[] = [chatId, `%${q}%`];
    let paramIndex = 3;

    if (type && type !== 'all') {
      query += ` AND m.message_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (sender) {
      query += ` AND m.sender_id = $${paramIndex}`;
      params.push(sender);
      paramIndex++;
    }

    if (date) {
      query += ` AND DATE(m.created_at) = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    query += ` ORDER BY m.created_at DESC`;

    const result = await pool.query(query, params);

    const messages = result.rows.map((row: any) => ({
      ...row,
      id: row.id.toString(),
      sender: row.sender.toString(),
      timestamp: new Date(row.timestamp).toLocaleTimeString('uk-UA', {
        hour: '2-digit', minute: '2-digit'
      })
    }));

    res.json(messages);
  } catch (err) {
    console.error("Error searching messages:", err);
    res.status(500).json({ message: "Database error searching messages" });
  }
});

// POST /api/upload/chat - завантажити файл для чату
app.post("/api/upload/chat", authenticateToken, async (req: Request, res: Response) => {
  try {
    // Тут має бути логіка завантаження файлів
    // Для демонстрації повертаємо фейкові дані
    res.json({
      url: `/uploads/chat-${Date.now()}.file`,
      name: req.body.name || 'file',
      type: req.body.type || 'application/octet-stream',
      size: req.body.size || 0
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// PUT /api/chat/:chatId/mute - заглушити/відключити сповіщення чату
app.put("/api/chat/:chatId/mute", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;
    const { muted } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await pool.query(
      `UPDATE chat_members 
       SET is_muted = $1 
       WHERE chat_id = $2 AND user_id = $3`,
      [muted, chatId, userId]
    );

    res.json({ 
      message: muted ? "Chat muted" : "Chat unmuted",
      muted 
    });
  } catch (err) {
    console.error("Error muting chat:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// DELETE /api/chat/:chatId/leave - покинути груповий чат
app.delete("/api/chat/:chatId/leave", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи це груповий чат
    const chatCheck = await pool.query(
      'SELECT type FROM chats WHERE id = $1',
      [chatId]
    );

    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chatCheck.rows[0].type !== 'group') {
      return res.status(400).json({ message: "Can only leave group chats" });
    }

    // Видаляємо користувача з учасників
    await pool.query(
      'DELETE FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    res.json({ message: "Left group chat successfully" });
  } catch (err) {
    console.error("Error leaving chat:", err);
    res.status(500).json({ message: "Database error" });
  }
});




// ============ TEACHER PROFILE ENDPOINTS ============

// GET /api/teachers/:id - отримати основну інформацію про викладача
app.get("/api/teachers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Отримуємо основну інформацію про викладача
    const teacherResult = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.faculty_id,
        u.department_id,
        d.name as department_name,
        f.name as faculty_name,
        tp.title,
        tp.bio,
        tp.avatar_url,
        tp.office_hours,
        tp.phone,
        tp.website,
        t.skills,
        tp.created_at,
        tp.updated_at
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       LEFT JOIN teachers t ON u.id = t.id
       WHERE u.id = $1 AND u.role = 'teacher'`,
      [id]
    );

    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ message: "Викладача не знайдено" });
    }

    const teacherData = teacherResult.rows[0];
    
    // Розділяємо ім'я на частини
    const nameParts = teacherData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Форматуємо skills
    let skills = [];
    if (teacherData.skills && Array.isArray(teacherData.skills)) {
      skills = teacherData.skills;
    } else if (typeof teacherData.skills === 'string') {
      try {
        skills = JSON.parse(teacherData.skills);
      } catch {
        skills = teacherData.skills.split(',').map(s => s.trim());
      }
    }

    res.json({
      id: teacherData.id,
      name: teacherData.name,
      firstName,
      lastName,
      title: teacherData.title || "",
      department: teacherData.department_name || "Кафедра не вказана",
      departmentId: teacherData.department_id,
      faculty: teacherData.faculty_name || "Факультет не вказаний",
      facultyId: teacherData.faculty_id,
      email: teacherData.email,
      bio: teacherData.bio || "",
      avatarUrl: teacherData.avatar_url,
      officeHours: teacherData.office_hours || "",
      phone: teacherData.phone || "",
      website: teacherData.website || "",
      skills: skills,
      createdAt: teacherData.created_at,
      updatedAt: teacherData.updated_at
    });
  } catch (err) {
    console.error("Error fetching teacher:", err);
    res.status(500).json({ message: "Database error fetching teacher" });
  }
});

// GET /api/faculty/:facultyId/teachers - отримати всіх викладачів факультету (коректна версія)
app.get("/api/faculty/:facultyId/teachers", async (req: Request, res: Response) => {
  try {
    const { facultyId } = req.params;
    console.log(`🔍 Fetching teachers for faculty ID: ${facultyId}`);

    // Основний запит для отримання інформації про викладачів
    const teachersResult = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.faculty_id,
        u.department_id,
        d.name as department_name,
        f.name as faculty_name,
        COALESCE(tp.title, 'Викладач') as title,
        COALESCE(tp.bio, '') as bio,
        COALESCE(tp.avatar_url, u.avatar) as avatar_url,
        COALESCE(tp.office_hours, '') as office_hours,
        COALESCE(tp.phone, '') as phone,
        COALESCE(tp.website, '') as website,
        COALESCE(t.skills, '[]'::jsonb) as skills,
        tp.created_at,
        tp.updated_at
       FROM users u
       JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN teachers t ON u.id = t.id
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       WHERE u.role = 'teacher' 
         AND u.faculty_id = $1
       ORDER BY u.name`,
      [facultyId]
    );

    console.log(`✅ Found ${teachersResult.rows.length} teachers`);

    const teacherIds = teachersResult.rows.map(row => row.id);

    // Отримуємо кількість студентів для кожного викладача
    let studentCountsMap = new Map<number, number>();
    if (teacherIds.length > 0) {
      try {
        const studentCountsResult = await pool.query(
          `SELECT teacher_id, COUNT(*) as student_count 
           FROM teacher_students 
           WHERE teacher_id = ANY($1::int[])
           GROUP BY teacher_id`,
          [teacherIds]
        );

        studentCountsResult.rows.forEach(row => {
          studentCountsMap.set(row.teacher_id, parseInt(row.student_count));
        });
      } catch (error) {
        console.warn("Could not fetch student counts:", error);
      }
    }

    // Отримуємо кількість робіт (проектів) для кожного викладача
    let worksCountMap = new Map<number, number>();
    if (teacherIds.length > 0) {
      try {
        const worksCountResult = await pool.query(
          `SELECT user_id, COUNT(*) as works_count 
           FROM teacher_works 
           WHERE user_id = ANY($1::int[])
           GROUP BY user_id`,
          [teacherIds]
        );

        worksCountResult.rows.forEach(row => {
          worksCountMap.set(row.user_id, parseInt(row.works_count));
        });
      } catch (error) {
        console.warn("Could not fetch works counts:", error);
      }
    }

    // Формуємо відповідь
    const teachers = teachersResult.rows.map(row => {
      const nameParts = row.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Форматуємо skills - безпечна обробка JSON
      let skills: string[] = [];
      try {
        if (row.skills) {
          if (Array.isArray(row.skills)) {
            skills = row.skills;
          } else if (typeof row.skills === 'string') {
            // Спробуємо розпарсити JSON
            const parsed = JSON.parse(row.skills);
            if (Array.isArray(parsed)) {
              skills = parsed;
            }
          } else if (row.skills && typeof row.skills === 'object') {
            // Якщо це вже об'єкт JSONB
            skills = Object.values(row.skills).filter((s): s is string => typeof s === 'string');
          }
        }
      } catch (error) {
        console.warn(`Could not parse skills for teacher ${row.id}:`, row.skills);
        skills = [];
      }

      // Визначаємо доступність на основі office_hours
      const isAvailable = row.office_hours && row.office_hours.trim() !== '';
      
      // Отримуємо статистику
      const studentCount = studentCountsMap.get(row.id) || 0;
      const worksCount = worksCountMap.get(row.id) || 0;

      return {
        id: row.id.toString(),
        name: row.name,
        firstName,
        lastName,
        title: row.title,
        department: row.department_name || "Кафедра не вказана",
        departmentId: row.department_id,
        faculty: row.faculty_name || "Факультет не вказаний",
        facultyId: row.faculty_id,
        email: row.email,
        bio: row.bio || "Опис відсутній",
        avatarUrl: row.avatar_url,
        officeHours: row.office_hours || "Не вказано",
        phone: row.phone || "",
        website: row.website || "",
        skills: skills,
        rating: 4.5, // Статичний рейтинг поки що
        studentCount: studentCount,
        projectsCompleted: worksCount, // Використовуємо кількість робіт як projectsCompleted
        isAvailable: isAvailable,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    res.json(teachers);
  } catch (err) {
    console.error("Error fetching faculty teachers:", err);
    res.status(500).json({ 
      message: "Database error fetching faculty teachers",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
});

// GET /api/teachers/:id/works - отримати роботи викладача
app.get("/api/teachers/:id/works", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Перевіряємо чи користувач є викладачем
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
      return res.status(404).json({ message: "Викладача не знайдено" });
    }

    const result = await pool.query(
      `SELECT 
        id,
        title,
        type,
        year,
        description,
        file_url,
        publication_url,
        created_at
       FROM teacher_works 
       WHERE user_id = $1 
       ORDER BY year DESC, created_at DESC`,
      [id]
    );

    const works = result.rows.map((row: any) => ({
      id: row.id.toString(),
      title: row.title,
      type: row.type,
      year: row.year,
      description: row.description,
      fileUrl: row.file_url,
      publicationUrl: row.publication_url,
      createdAt: row.created_at
    }));

    res.json(works);
  } catch (err) {
    console.error("Error fetching teacher works:", err);
    res.status(500).json({ message: "Database error fetching teacher works" });
  }
});

// GET /api/teachers/:id/directions - отримати напрямки досліджень викладача
app.get("/api/teachers/:id/directions", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Перевіряємо чи користувач є викладачем
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
      return res.status(404).json({ message: "Викладача не знайдено" });
    }

    const result = await pool.query(
      `SELECT 
        id,
        area,
        description,
        created_at
       FROM teacher_research_directions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    const directions = result.rows.map((row: any) => ({
      id: row.id.toString(),
      area: row.area,
      description: row.description,
      createdAt: row.created_at
    }));

    res.json(directions);
  } catch (err) {
    console.error("Error fetching teacher directions:", err);
    res.status(500).json({ message: "Database error fetching teacher directions" });
  }
});

// GET /api/teachers/:id/topics - отримати майбутні теми викладача
app.get("/api/teachers/:id/topics", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Перевіряємо чи користувач є викладачем
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
      return res.status(404).json({ message: "Викладача не знайдено" });
    }

    const result = await pool.query(
      `SELECT 
        id,
        topic,
        description,
        created_at
       FROM teacher_future_topics 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    const topics = result.rows.map((row: any) => ({
      id: row.id.toString(),
      topic: row.topic,
      description: row.description,
      createdAt: row.created_at
    }));

    res.json(topics);
  } catch (err) {
    console.error("Error fetching teacher topics:", err);
    res.status(500).json({ message: "Database error fetching teacher topics" });
  }
});


// GET /api/teacher/profile - отримати профіль викладача
app.get("/api/teacher/profile", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи користувач є викладачем
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userResult.rows[0].role !== 'teacher') {
      return res.status(403).json({ message: "Access denied. Teacher role required" });
    }

    // Отримуємо основну інформацію про викладача
    const teacherResult = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.faculty_id,
        u.department_id,
        d.name as department_name,
        f.name as faculty_name,
        tp.title,
        tp.bio,
        tp.avatar_url,
        tp.office_hours,
        tp.phone,
        tp.website,
        tp.created_at,
        tp.updated_at
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (teacherResult.rows.length === 0) {
      // Якщо профіль ще не створений, повертаємо базову інформацію
      const userInfo = await pool.query(
        `SELECT 
          u.id,
          u.name,
          u.email,
          u.faculty_id,
          u.department_id,
          d.name as department_name,
          f.name as faculty_name
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN faculties f ON u.faculty_id = f.id
         WHERE u.id = $1`,
        [userId]
      );

      if (userInfo.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = userInfo.rows[0];
      
      // Розділяємо ім'я на частини
      const nameParts = userData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      res.json({
        id: userData.id,
        name: userData.name,
        firstName,
        lastName,
        title: "",
        department: userData.department_name || "Кафедра не вказана",
        departmentId: userData.department_id,
        faculty: userData.faculty_name || "Факультет не вказаний",
        facultyId: userData.faculty_id,
        email: userData.email,
        bio: "",
        avatarUrl: null,
        officeHours: "",
        phone: "",
        website: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      const teacherData = teacherResult.rows[0];
      
      // Розділяємо ім'я на частини
      const nameParts = teacherData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      res.json({
        id: teacherData.id,
        name: teacherData.name,
        firstName,
        lastName,
        title: teacherData.title || "",
        department: teacherData.department_name || "Кафедра не вказана",
        departmentId: teacherData.department_id,
        faculty: teacherData.faculty_name || "Факультет не вказаний",
        facultyId: teacherData.faculty_id,
        email: teacherData.email,
        bio: teacherData.bio || "",
        avatarUrl: teacherData.avatar_url,
        officeHours: teacherData.office_hours || "",
        phone: teacherData.phone || "",
        website: teacherData.website || "",
        createdAt: teacherData.created_at,
        updatedAt: teacherData.updated_at
      });
    }
  } catch (err) {
    console.error("Error fetching teacher profile:", err);
    res.status(500).json({ message: "Database error fetching teacher profile" });
  }
});


// PUT /api/teacher/profile - оновити профіль викладача
app.put("/api/teacher/profile", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      title,
      bio,
      avatarUrl,
      officeHours,
      phone,
      website
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи користувач є викладачем
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userResult.rows[0].role !== 'teacher') {
      return res.status(403).json({ message: "Access denied. Teacher role required" });
    }

    // Перевіряємо чи профіль вже існує
    const existingProfile = await pool.query(
      'SELECT user_id FROM teacher_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      // Оновлюємо існуючий профіль
      await pool.query(
        `UPDATE teacher_profiles 
         SET title = $1, bio = $2, avatar_url = $3, office_hours = $4, phone = $5, website = $6, updated_at = NOW()
         WHERE user_id = $7`,
        [title, bio, avatarUrl, officeHours, phone, website, userId]
      );
    } else {
      // Створюємо новий профіль
      await pool.query(
        `INSERT INTO teacher_profiles 
         (user_id, title, bio, avatar_url, office_hours, phone, website, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [userId, title, bio, avatarUrl, officeHours, phone, website]
      );
    }

    // Отримуємо оновлені дані з повною інформацією
    const updatedProfile = await pool.query(
      `SELECT 
        u.name,
        u.email,
        d.name as department_name,
        f.name as faculty_name,
        tp.title,
        tp.bio,
        tp.avatar_url,
        tp.office_hours,
        tp.phone,
        tp.website,
        tp.created_at,
        tp.updated_at
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       WHERE u.id = $1`,
      [userId]
    );

    res.json({ 
      message: "Teacher profile updated successfully",
      profile: updatedProfile.rows[0]
    });
  } catch (err) {
    console.error("Error updating teacher profile:", err);
    res.status(500).json({ message: "Database error updating teacher profile" });
  }
});

// GET /api/teacher/works - отримати роботи викладача
app.get("/api/teacher/works", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи користувач є викладачем
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
      return res.status(403).json({ message: "Access denied. Teacher role required" });
    }

    // ДОДАНО ФІЛЬТРАЦІЮ ПО user_id
    const result = await pool.query(
      `SELECT 
        id,
        title,
        type,
        year,
        description,
        file_url,
        publication_url,
        created_at
       FROM teacher_works 
       WHERE user_id = $1 
       ORDER BY year DESC, created_at DESC`,
      [userId] // Використовуємо userId для фільтрації
    );

    const works = result.rows.map((row: any) => ({
      id: row.id.toString(),
      title: row.title,
      type: row.type,
      year: row.year,
      description: row.description,
      fileUrl: row.file_url,
      publicationUrl: row.publication_url,
      createdAt: row.created_at
    }));

    res.json(works);
  } catch (err) {
    console.error("Error fetching teacher works:", err);
    res.status(500).json({ message: "Database error fetching teacher works" });
  }
});

// POST /api/teacher/works - додати роботу викладача
app.post("/api/teacher/works", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      title,
      type,
      year,
      description,
      fileUrl,
      publicationUrl
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи користувач є викладачем
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
      return res.status(403).json({ message: "Access denied. Teacher role required" });
    }

    if (!title || !type || !year) {
      return res.status(400).json({ message: "Title, type and year are required" });
    }

    const result = await pool.query(
      `INSERT INTO teacher_works 
       (user_id, title, type, year, description, file_url, publication_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [userId, title, type, year, description || '', fileUrl, publicationUrl]
    );

    const newWork = {
      id: result.rows[0].id.toString(),
      title: result.rows[0].title,
      type: result.rows[0].type,
      year: result.rows[0].year,
      description: result.rows[0].description,
      fileUrl: result.rows[0].file_url,
      publicationUrl: result.rows[0].publication_url,
      createdAt: result.rows[0].created_at
    };

    res.status(201).json({
      message: "Work added successfully",
      work: newWork
    });
  } catch (err) {
    console.error("Error adding teacher work:", err);
    res.status(500).json({ message: "Database error adding teacher work" });
  }
});

// PUT /api/teacher/works/:workId - оновити роботу викладача
app.put("/api/teacher/works/:workId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workId } = req.params;
    const {
      title,
      type,
      year,
      description,
      fileUrl,
      publicationUrl
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !type || !year) {
      return res.status(400).json({ message: "Title, type and year are required" });
    }

    // Перевіряємо чи робота належить користувачу
    const workCheck = await pool.query(
      'SELECT id FROM teacher_works WHERE id = $1 AND user_id = $2',
      [workId, userId]
    );

    if (workCheck.rows.length === 0) {
      return res.status(404).json({ message: "Work not found or access denied" });
    }

    const result = await pool.query(
      `UPDATE teacher_works 
       SET title = $1, type = $2, year = $3, description = $4, file_url = $5, publication_url = $6, updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, type, year, description || '', fileUrl, publicationUrl, workId, userId]
    );

    const updatedWork = {
      id: result.rows[0].id.toString(),
      title: result.rows[0].title,
      type: result.rows[0].type,
      year: result.rows[0].year,
      description: result.rows[0].description,
      fileUrl: result.rows[0].file_url,
      publicationUrl: result.rows[0].publication_url,
      createdAt: result.rows[0].created_at
    };

    res.json({
      message: "Work updated successfully",
      work: updatedWork
    });
  } catch (err) {
    console.error("Error updating teacher work:", err);
    res.status(500).json({ message: "Database error updating teacher work" });
  }
});

// DELETE /api/teacher/works/:workId - видалити роботу викладача
app.delete("/api/teacher/works/:workId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи робота належить користувачу
    const workCheck = await pool.query(
      'SELECT id FROM teacher_works WHERE id = $1 AND user_id = $2',
      [workId, userId]
    );

    if (workCheck.rows.length === 0) {
      return res.status(404).json({ message: "Work not found or access denied" });
    }

    await pool.query(
      'DELETE FROM teacher_works WHERE id = $1 AND user_id = $2',
      [workId, userId]
    );

    res.json({ message: "Work deleted successfully" });
  } catch (err) {
    console.error("Error deleting teacher work:", err);
    res.status(500).json({ message: "Database error deleting teacher work" });
  }
});


// GET /api/teacher/directions - отримати напрямки досліджень
app.get("/api/teacher/directions", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи користувач є викладачем
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
      return res.status(403).json({ message: "Access denied. Teacher role required" });
    }

    // ДОДАНО ФІЛЬТРАЦІЮ ПО user_id
    const result = await pool.query(
      `SELECT 
        id,
        area,
        description,
        created_at
       FROM teacher_research_directions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId] // Використовуємо userId для фільтрації
    );

    const directions = result.rows.map((row: any) => ({
      id: row.id.toString(),
      area: row.area,
      description: row.description,
      createdAt: row.created_at
    }));

    res.json(directions);
  } catch (err) {
    console.error("Error fetching teacher directions:", err);
    res.status(500).json({ message: "Database error fetching teacher directions" });
  }
});

// POST /api/teacher/directions - додати напрямок досліджень
app.post("/api/teacher/directions", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      area,
      description
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи користувач є викладачем
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
      return res.status(403).json({ message: "Access denied. Teacher role required" });
    }

    if (!area || !description) {
      return res.status(400).json({ message: "Area and description are required" });
    }

    const result = await pool.query(
      `INSERT INTO teacher_research_directions 
       (user_id, area, description, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, area, description]
    );

    const newDirection = {
      id: result.rows[0].id.toString(),
      area: result.rows[0].area,
      description: result.rows[0].description,
      createdAt: result.rows[0].created_at
    };

    res.status(201).json({
      message: "Research direction added successfully",
      direction: newDirection
    });
  } catch (err) {
    console.error("Error adding teacher direction:", err);
    res.status(500).json({ message: "Database error adding teacher direction" });
  }
});

// PUT /api/teacher/directions/:directionId - оновити напрямок досліджень
app.put("/api/teacher/directions/:directionId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { directionId } = req.params;
    const {
      area,
      description
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!area || !description) {
      return res.status(400).json({ message: "Area and description are required" });
    }

    // Перевіряємо чи напрямок належить користувачу
    const directionCheck = await pool.query(
      'SELECT id FROM teacher_research_directions WHERE id = $1 AND user_id = $2',
      [directionId, userId]
    );

    if (directionCheck.rows.length === 0) {
      return res.status(404).json({ message: "Direction not found or access denied" });
    }

    const result = await pool.query(
      `UPDATE teacher_research_directions 
       SET area = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [area, description, directionId, userId]
    );

    const updatedDirection = {
      id: result.rows[0].id.toString(),
      area: result.rows[0].area,
      description: result.rows[0].description,
      createdAt: result.rows[0].created_at
    };

    res.json({
      message: "Research direction updated successfully",
      direction: updatedDirection
    });
  } catch (err) {
    console.error("Error updating teacher direction:", err);
    res.status(500).json({ message: "Database error updating teacher direction" });
  }
});

// DELETE /api/teacher/directions/:directionId - видалити напрямок досліджень
app.delete("/api/teacher/directions/:directionId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { directionId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи напрямок належить користувачу
    const directionCheck = await pool.query(
      'SELECT id FROM teacher_research_directions WHERE id = $1 AND user_id = $2',
      [directionId, userId]
    );

    if (directionCheck.rows.length === 0) {
      return res.status(404).json({ message: "Direction not found or access denied" });
    }

    await pool.query(
      'DELETE FROM teacher_research_directions WHERE id = $1 AND user_id = $2',
      [directionId, userId]
    );

    res.json({ message: "Research direction deleted successfully" });
  } catch (err) {
    console.error("Error deleting teacher direction:", err);
    res.status(500).json({ message: "Database error deleting teacher direction" });
  }
});

// GET /api/teacher/topics - отримати майбутні теми досліджень
app.get("/api/teacher/topics", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи користувач є викладачем
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
      return res.status(403).json({ message: "Access denied. Teacher role required" });
    }

    // ДОДАНО ФІЛЬТРАЦІЮ ПО user_id
    const result = await pool.query(
      `SELECT 
        id,
        topic,
        description,
        created_at
       FROM teacher_future_topics 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId] // Використовуємо userId для фільтрації
    );

    const topics = result.rows.map((row: any) => ({
      id: row.id.toString(),
      topic: row.topic,
      description: row.description,
      createdAt: row.created_at
    }));

    res.json(topics);
  } catch (err) {
    console.error("Error fetching teacher topics:", err);
    res.status(500).json({ message: "Database error fetching teacher topics" });
  }
});

// POST /api/teacher/topics - додати майбутню тему досліджень
app.post("/api/teacher/topics", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      topic,
      description
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи користувач є викладачем
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
      return res.status(403).json({ message: "Access denied. Teacher role required" });
    }

    if (!topic || !description) {
      return res.status(400).json({ message: "Topic and description are required" });
    }

    const result = await pool.query(
      `INSERT INTO teacher_future_topics 
       (user_id, topic, description, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, topic, description]
    );

    const newTopic = {
      id: result.rows[0].id.toString(),
      topic: result.rows[0].topic,
      description: result.rows[0].description,
      createdAt: result.rows[0].created_at
    };

    res.status(201).json({
      message: "Future topic added successfully",
      topic: newTopic
    });
  } catch (err) {
    console.error("Error adding teacher topic:", err);
    res.status(500).json({ message: "Database error adding teacher topic" });
  }
});

// PUT /api/teacher/topics/:topicId - оновити майбутню тему досліджень
app.put("/api/teacher/topics/:topicId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { topicId } = req.params;
    const {
      topic,
      description
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!topic || !description) {
      return res.status(400).json({ message: "Topic and description are required" });
    }

    // Перевіряємо чи тема належить користувачу
    const topicCheck = await pool.query(
      'SELECT id FROM teacher_future_topics WHERE id = $1 AND user_id = $2',
      [topicId, userId]
    );

    if (topicCheck.rows.length === 0) {
      return res.status(404).json({ message: "Topic not found or access denied" });
    }

    const result = await pool.query(
      `UPDATE teacher_future_topics 
       SET topic = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [topic, description, topicId, userId]
    );

    const updatedTopic = {
      id: result.rows[0].id.toString(),
      topic: result.rows[0].topic,
      description: result.rows[0].description,
      createdAt: result.rows[0].created_at
    };

    res.json({
      message: "Future topic updated successfully",
      topic: updatedTopic
    });
  } catch (err) {
    console.error("Error updating teacher topic:", err);
    res.status(500).json({ message: "Database error updating teacher topic" });
  }
});

// DELETE /api/teacher/topics/:topicId - видалити майбутню тему досліджень
app.delete("/api/teacher/topics/:topicId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { topicId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи тема належить користувачу
    const topicCheck = await pool.query(
      'SELECT id FROM teacher_future_topics WHERE id = $1 AND user_id = $2',
      [topicId, userId]
    );

    if (topicCheck.rows.length === 0) {
      return res.status(404).json({ message: "Topic not found or access denied" });
    }

    await pool.query(
      'DELETE FROM teacher_future_topics WHERE id = $1 AND user_id = $2',
      [topicId, userId]
    );

    res.json({ message: "Future topic deleted successfully" });
  } catch (err) {
    console.error("Error deleting teacher topic:", err);
    res.status(500).json({ message: "Database error deleting teacher topic" });
  }
});



// ============ STUDENT PROFILE ENDPOINTS ============

// GET /api/student/profile
app.get("/api/student/profile", authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log("GET /api/student/profile - userId:", req.user?.userId);
    
    const userId = req.user?.userId;

    if (!userId) {
      console.log("No user ID found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.faculty_id,
        u.department_id,
        u.specialty_id,
        u.group_id,
        f.name as faculty_name,
        d.name as department_name,
        s.name as specialty_name,
        s.code as specialty_code,
        g.name as group_name,
        g.course as group_course,
        g.education_level,
        sp.bio,
        sp.student_group as "group",
        sp.course,
        sp.avatar_url,
        sp.phone,
        sp.linkedin_url,
        sp.github_url
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN faculties f ON u.faculty_id = f.id 
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN specialties s ON u.specialty_id = s.id
       LEFT JOIN groups g ON u.group_id = g.id
       WHERE u.id = $1`,
      [userId]
    );

    console.log("Query result:", result.rows);

    if (result.rows.length === 0) {
      console.log("User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    const profileData = result.rows[0];
    
    // Визначаємо курс: пріоритет має курс з groups, потім з student_profiles
    const course = profileData.group_course || profileData.course;
    
    // Визначаємо групу: пріоритет має назва з groups, потім з student_profiles
    const group = profileData.group_name || profileData.group;
    
    // Формуємо відповідь з правильними назвами полів
    const response = {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      role: profileData.role,
      faculty: profileData.faculty_name,
      faculty_id: profileData.faculty_id,
      department: profileData.department_name,
      department_id: profileData.department_id,
      specialty: profileData.specialty_name,
      specialty_code: profileData.specialty_code,
      specialty_id: profileData.specialty_id,
      group: group,
      group_id: profileData.group_id,
      course: course,
      education_level: profileData.education_level,
      bio: profileData.bio,
      avatar_url: profileData.avatar_url,
      phone: profileData.phone,
      linkedin_url: profileData.linkedin_url,
      github_url: profileData.github_url
    };

    console.log("Sending profile data:", response);
    res.json(response);
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).json({ message: "Database error fetching student profile" });
  }
});


// PUT /api/student/profile - оновити профіль студента
app.put("/api/student/profile", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      name,
      bio,
      phone,
      linkedin_url,
      github_url,
      // group та course тепер не оновлюємо тут, бо вони беруться з реєстрації
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Updating profile for user:", userId, "Data:", req.body);

    // Отримуємо поточні дані користувача
    const currentUser = await pool.query(
      `SELECT name, email, group_id, specialty_id 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (currentUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentName = currentUser.rows[0].name;
    const currentEmail = currentUser.rows[0].email;

    // Використовуємо поточні значення, якщо не надано нових
    const updatedName = name || currentName;

    // Оновлюємо основну інформацію в users (тільки name)
    await pool.query(
      `UPDATE users 
       SET name = $1, updated_at = NOW()
       WHERE id = $2`,
      [updatedName, userId]
    );

    // Перевіряємо чи профіль вже існує
    const existingProfile = await pool.query(
      'SELECT user_id FROM student_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      // Оновлюємо існуючий профіль
      await pool.query(
        `UPDATE student_profiles 
         SET bio = $1, phone = $2, linkedin_url = $3, github_url = $4,
             updated_at = NOW()
         WHERE user_id = $5`,
        [bio, phone, linkedin_url, github_url, userId]
      );
    } else {
      // Створюємо новий профіль
      await pool.query(
        `INSERT INTO student_profiles 
         (user_id, bio, phone, linkedin_url, github_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, bio, phone, linkedin_url, github_url]
      );
    }

    // Повертаємо повні оновлені дані
    const updatedResult = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.faculty_id,
        u.department_id,
        u.specialty_id,
        u.group_id,
        f.name as faculty_name,
        d.name as department_name,
        s.name as specialty_name,
        s.code as specialty_code,
        g.name as group_name,
        g.course as group_course,
        g.education_level,
        sp.bio,
        sp.student_group as "group",
        sp.course,
        sp.avatar_url,
        sp.phone,
        sp.linkedin_url,
        sp.github_url
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN specialties s ON u.specialty_id = s.id
       LEFT JOIN groups g ON u.group_id = g.id
       WHERE u.id = $1`,
      [userId]
    );

    const updatedProfile = updatedResult.rows[0];
    
    // Формуємо відповідь
    const response = {
      id: updatedProfile.id,
      name: updatedProfile.name,
      email: updatedProfile.email,
      role: updatedProfile.role,
      faculty: updatedProfile.faculty_name,
      faculty_id: updatedProfile.faculty_id,
      department: updatedProfile.department_name,
      department_id: updatedProfile.department_id,
      specialty: updatedProfile.specialty_name,
      specialty_code: updatedProfile.specialty_code,
      specialty_id: updatedProfile.specialty_id,
      group: updatedProfile.group_name || updatedProfile.group,
      group_id: updatedProfile.group_id,
      course: updatedProfile.group_course || updatedProfile.course,
      education_level: updatedProfile.education_level,
      bio: updatedProfile.bio,
      avatar_url: updatedProfile.avatar_url,
      phone: updatedProfile.phone,
      linkedin_url: updatedProfile.linkedin_url,
      github_url: updatedProfile.github_url
    };

    res.json({
      message: "Student profile updated successfully",
      profile: response
    });
  } catch (err) {
    console.error("Error updating student profile:", err);
    res.status(500).json({ 
      message: "Database error updating student profile",
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// GET /api/student/projects - отримати проєкти студента
app.get("/api/student/projects", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
        id,
        title,
        type,
        status,
        description,
        technologies,
        project_url,
        github_url,
        start_date,
        end_date,
        created_at
       FROM student_projects 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    const projects = result.rows.map((row: any) => ({
      id: row.id.toString(),
      title: row.title,
      type: row.type,
      status: row.status,
      description: row.description,
      technologies: row.technologies ? row.technologies.split(',') : [],
      projectUrl: row.project_url,
      githubUrl: row.github_url,
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt: row.created_at
    }));

    res.json(projects);
  } catch (err) {
    console.error("Error fetching student projects:", err);
    res.status(500).json({ message: "Database error fetching student projects" });
  }
});

// POST /api/student/projects - додати проєкт студента
app.post("/api/student/projects", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      title,
      type,
      status,
      description,
      technologies,
      projectUrl,
      githubUrl,
      startDate,
      endDate
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !type || !status) {
      return res.status(400).json({ message: "Title, type and status are required" });
    }

    const result = await pool.query(
      `INSERT INTO student_projects 
       (user_id, title, type, status, description, technologies, project_url, github_url, start_date, end_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id`,
      [userId, title, type, status, description || '', 
       technologies ? technologies.join(',') : null, projectUrl, githubUrl, startDate, endDate]
    );

    const newProject = {
      id: result.rows[0].id.toString(),
      title,
      type,
      status,
      description: description || '',
      technologies: technologies || [],
      projectUrl,
      githubUrl,
      startDate,
      endDate,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      message: "Project added successfully",
      project: newProject
    });
  } catch (err) {
    console.error("Error adding student project:", err);
    res.status(500).json({ message: "Database error adding student project" });
  }
});

// PUT /api/student/projects/:projectId - оновити проєкт студента
app.put("/api/student/projects/:projectId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { projectId } = req.params;
    const {
      title,
      type,
      status,
      description,
      technologies,
      projectUrl,
      githubUrl,
      startDate,
      endDate
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !type || !status) {
      return res.status(400).json({ message: "Title, type and status are required" });
    }

    // Перевіряємо чи проєкт належить користувачу
    const projectCheck = await pool.query(
      'SELECT id FROM student_projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found or access denied" });
    }

    await pool.query(
      `UPDATE student_projects 
       SET title = $1, type = $2, status = $3, description = $4, technologies = $5, 
           project_url = $6, github_url = $7, start_date = $8, end_date = $9, updated_at = NOW()
       WHERE id = $10`,
      [title, type, status, description || '', 
       technologies ? technologies.join(',') : null, projectUrl, githubUrl, startDate, endDate, projectId]
    );

    res.json({ message: "Project updated successfully" });
  } catch (err) {
    console.error("Error updating student project:", err);
    res.status(500).json({ message: "Database error updating student project" });
  }
});

// DELETE /api/student/projects/:projectId - видалити проєкт студента
app.delete("/api/student/projects/:projectId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи проєкт належить користувачу
    const projectCheck = await pool.query(
      'SELECT id FROM student_projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found or access denied" });
    }

    await pool.query('DELETE FROM student_projects WHERE id = $1', [projectId]);

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting student project:", err);
    res.status(500).json({ message: "Database error deleting student project" });
  }
});

// GET /api/student/achievements - отримати досягнення студента
app.get("/api/student/achievements", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
        id,
        title,
        description,
        date,
        type,
        organization,
        certificate_url,
        created_at
       FROM student_achievements 
       WHERE user_id = $1 
       ORDER BY date DESC, created_at DESC`,
      [userId]
    );

    const achievements = result.rows.map((row: any) => ({
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      date: row.date,
      type: row.type,
      organization: row.organization,
      certificateUrl: row.certificate_url,
      createdAt: row.created_at
    }));

    res.json(achievements);
  } catch (err) {
    console.error("Error fetching student achievements:", err);
    res.status(500).json({ message: "Database error fetching student achievements" });
  }
});

// POST /api/student/achievements - додати досягнення студента
app.post("/api/student/achievements", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      title,
      description,
      date,
      type,
      organization,
      certificateUrl
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Please use YYYY-MM-DD format." });
    }

    // Format date to YYYY-MM-DD for PostgreSQL
    const formattedDate = dateObj.toISOString().split('T')[0];

    const result = await pool.query(
      `INSERT INTO student_achievements 
       (user_id, title, description, date, type, organization, certificate_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [userId, title, description || '', formattedDate, type, organization, certificateUrl]
    );

    const newAchievement = {
      id: result.rows[0].id.toString(),
      title,
      description: description || '',
      date: formattedDate,
      type,
      organization,
      certificateUrl,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      message: "Achievement added successfully",
      achievement: newAchievement
    });
  } catch (err) {
    console.error("Error adding student achievement:", err);
    res.status(500).json({ message: "Database error adding student achievement" });
  }
});

// PUT /api/student/achievements/:achievementId - оновити досягнення студента
app.put("/api/student/achievements/:achievementId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { achievementId } = req.params;
    const {
      title,
      description,
      date,
      type,
      organization,
      certificateUrl
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    // Перевіряємо чи досягнення належить користувачу
    const achievementCheck = await pool.query(
      'SELECT id FROM student_achievements WHERE id = $1 AND user_id = $2',
      [achievementId, userId]
    );

    if (achievementCheck.rows.length === 0) {
      return res.status(404).json({ message: "Achievement not found or access denied" });
    }

    await pool.query(
      `UPDATE student_achievements 
       SET title = $1, description = $2, date = $3, type = $4, organization = $5, certificate_url = $6, updated_at = NOW()
       WHERE id = $7`,
      [title, description || '', date, type, organization, certificateUrl, achievementId]
    );

    res.json({ message: "Achievement updated successfully" });
  } catch (err) {
    console.error("Error updating student achievement:", err);
    res.status(500).json({ message: "Database error updating student achievement" });
  }
});

// DELETE /api/student/achievements/:achievementId - видалити досягнення студента
app.delete("/api/student/achievements/:achievementId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { achievementId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи досягнення належить користувачу
    const achievementCheck = await pool.query(
      'SELECT id FROM student_achievements WHERE id = $1 AND user_id = $2',
      [achievementId, userId]
    );

    if (achievementCheck.rows.length === 0) {
      return res.status(404).json({ message: "Achievement not found or access denied" });
    }

    await pool.query('DELETE FROM student_achievements WHERE id = $1', [achievementId]);

    res.json({ message: "Achievement deleted successfully" });
  } catch (err) {
    console.error("Error deleting student achievement:", err);
    res.status(500).json({ message: "Database error deleting student achievement" });
  }
});

// GET /api/student/goals - отримати цілі студента
app.get("/api/student/goals", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
        id,
        goal,
        description,
        deadline,
        status,
        priority,
        progress,
        created_at
       FROM student_goals 
       WHERE user_id = $1 
       ORDER BY 
         CASE priority
           WHEN 'high' THEN 1
           WHEN 'medium' THEN 2
           WHEN 'low' THEN 3
           ELSE 4
         END,
         deadline ASC`,
      [userId]
    );

    const goals = result.rows.map((row: any) => ({
      id: row.id.toString(),
      goal: row.goal,
      description: row.description,
      deadline: row.deadline,
      status: row.status,
      priority: row.priority,
      progress: row.progress,
      createdAt: row.created_at
    }));

    res.json(goals);
  } catch (err) {
    console.error("Error fetching student goals:", err);
    res.status(500).json({ message: "Database error fetching student goals" });
  }
});

// POST /api/student/goals - додати ціль студента
app.post("/api/student/goals", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      goal,
      description,
      deadline,
      status = 'active',
      priority = 'medium',
      progress = 0
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!goal || !deadline) {
      return res.status(400).json({ message: "Goal and deadline are required" });
    }

    // Validate deadline format
    const deadlineObj = new Date(deadline);
    if (isNaN(deadlineObj.getTime())) {
      return res.status(400).json({ message: "Invalid deadline format. Please use YYYY-MM-DD format." });
    }

    // Format deadline to YYYY-MM-DD for PostgreSQL
    const formattedDeadline = deadlineObj.toISOString().split('T')[0];

    const result = await pool.query(
      `INSERT INTO student_goals 
       (user_id, goal, description, deadline, status, priority, progress, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [userId, goal, description || '', formattedDeadline, status, priority, progress]
    );

    const newGoal = {
      id: result.rows[0].id.toString(),
      goal,
      description: description || '',
      deadline: formattedDeadline,
      status,
      priority,
      progress,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      message: "Goal added successfully",
      goal: newGoal
    });
  } catch (err) {
    console.error("Error adding student goal:", err);
    res.status(500).json({ message: "Database error adding student goal" });
  }
});

// PUT /api/student/goals/:goalId - оновити ціль студента
app.put("/api/student/goals/:goalId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { goalId } = req.params;
    const {
      goal,
      description,
      deadline,
      status,
      priority,
      progress
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!goal || !deadline) {
      return res.status(400).json({ message: "Goal and deadline are required" });
    }

    // Перевіряємо чи ціль належить користувачу
    const goalCheck = await pool.query(
      'SELECT id FROM student_goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalCheck.rows.length === 0) {
      return res.status(404).json({ message: "Goal not found or access denied" });
    }

    await pool.query(
      `UPDATE student_goals 
       SET goal = $1, description = $2, deadline = $3, status = $4, priority = $5, progress = $6, updated_at = NOW()
       WHERE id = $7`,
      [goal, description || '', deadline, status, priority, progress, goalId]
    );

    res.json({ message: "Goal updated successfully" });
  } catch (err) {
    console.error("Error updating student goal:", err);
    res.status(500).json({ message: "Database error updating student goal" });
  }
});

// DELETE /api/student/goals/:goalId - видалити ціль студента
app.delete("/api/student/goals/:goalId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { goalId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи ціль належить користувачу
    const goalCheck = await pool.query(
      'SELECT id FROM student_goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalCheck.rows.length === 0) {
      return res.status(404).json({ message: "Goal not found or access denied" });
    }

    await pool.query('DELETE FROM student_goals WHERE id = $1', [goalId]);

    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("Error deleting student goal:", err);
    res.status(500).json({ message: "Database error deleting student goal" });
  }
});


app.post("/api/student/applications", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userCheck = await pool.query(
      'SELECT id, role, name, email, specialty_id, faculty_id FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userCheck.rows[0];
    
    if (user.role !== 'student') {
      return res.status(403).json({ 
        message: "Only students can create applications",
        userRole: user.role 
      });
    }

    const {
      topic,
      description,
      goals,
      requirements,
      teacherId,
      deadline,
      workType = 'coursework',
      student_name = user.name,
      student_email = user.email,
      student_phone = req.body.student_phone || '',
      student_program = req.body.student_program || '',
      student_year = req.body.student_year || '',
      student_group = req.body.student_group || '',
      student_specialty_id = user.specialty_id || req.body.student_specialty_id,
      student_specialty_code = req.body.student_specialty_code || '',
      student_faculty_id = user.faculty_id || req.body.student_faculty_id,
      student_id = user.id || req.body.student_id,
      student_id_number = req.body.student_id_number || user.id // Може бути числом
    } = req.body;

    // Перевірка обов'язкових полів
    const requiredFields = ['topic', 'description', 'goals', 'requirements', 'teacherId', 'deadline'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        missingFields 
      });
    }

    // Перевірка викладача
    const teacherCheck = await pool.query(
      'SELECT id FROM teachers WHERE id = $1',
      [teacherId]
    );

    if (teacherCheck.rows.length === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Перевірка максимальної кількості заявок (3 активних)
    const activeApplications = await pool.query(
      `SELECT COUNT(*) as count FROM student_applications 
       WHERE student_id = $1 AND status = 'pending'`,
      [user.id]
    );

    if (parseInt(activeApplications.rows[0].count) >= 3) {
      return res.status(400).json({ 
        message: "Maximum number of applications reached (3)", 
        code: "MAX_APPLICATIONS" 
      });
    }

    // Перевірка, чи вже є активна заявка до цього викладача
    const existingApplication = await pool.query(
      `SELECT id FROM student_applications 
       WHERE student_id = $1 AND teacher_id = $2 AND status = 'pending'`,
      [user.id, teacherId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ 
        message: "You already have an active application to this teacher", 
        code: "DUPLICATE_APPLICATION" 
      });
    }

    // Визначення типу (type) на основі workType
    const type = workType === 'coursework' ? 'course' : 
                workType === 'diploma' ? 'diploma' : 'practice';

    // ВИПРАВЛЕНО: Обробка student_id_number (може бути числом)
    const studentIdNumberStr = student_id_number ? 
      (typeof student_id_number === 'string' ? student_id_number.trim() : 
       student_id_number.toString().trim()) : '';

    // Створення заявки
    const result = await pool.query(
      `INSERT INTO student_applications (
        topic, description, goals, requirements, teacher_id,
        deadline, student_id, student_name, student_email,
        student_phone, student_program, student_year, student_group,
        work_type, type, student_specialty_id, student_specialty_code,
        student_faculty_id, student_id_number, application_date, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), 'pending', NOW())
      RETURNING *`,
      [
        topic.trim(),
        description.trim(),
        goals.trim(),
        requirements.trim(),
        teacherId,
        deadline,
        user.id,
        student_name.trim(),
        student_email.trim(),
        student_phone.trim(),
        student_program.trim(),
        student_year.toString().trim(),
        student_group.trim(),
        workType,
        type,
        student_specialty_id,
        student_specialty_code.trim(),
        student_faculty_id,
        studentIdNumberStr // Використовуємо оброблене значення
      ]
    );

    const newApplication = result.rows[0];

    // Оновлення доступних місць у викладача
    try {
      if (student_year && student_specialty_id) {
        await pool.query(
          `UPDATE teacher_available_places 
           SET current_students = current_students + 1,
               available_spots = GREATEST(0, available_spots - 1),
               updated_at = NOW()
           WHERE teacher_id = $1 
             AND type = $2 
             AND specialty_id = $3 
             AND course = $4`,
          [teacherId, workType, student_specialty_id, parseInt(student_year)]
        );
      }
    } catch (error) {
      console.log('Note: Teacher available places update failed:', error.message);
    }

    // Повернення успішної відповіді
    const remainingApplications = 3 - (parseInt(activeApplications.rows[0].count) + 1);

    res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication,
      remainingApplications,
      success: true
    });

  } catch (err) {
    console.error('❌ Error creating application:', err);
    res.status(500).json({ 
      message: "Internal server error", 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

app.get("/api/student/applications", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Отримання заявок студента
    const result = await pool.query(
      `SELECT 
        sa.*,
        t.name as teacher_name,
        t.title as teacher_title,
        t.department as teacher_department,
        t.email as teacher_email,
        t.avatar as teacher_avatar
       FROM student_applications sa
       LEFT JOIN teachers t ON sa.teacher_id = t.id
       WHERE sa.student_id = $1
       ORDER BY sa.created_at DESC`,
      [userId]
    );

    // Форматування дат
    const applications = result.rows.map(app => ({
      id: app.id,
      topic: app.topic,
      description: app.description,
      goals: app.goals,
      requirements: app.requirements,
      teacherId: app.teacher_id,
      teacher_name: app.teacher_name,
      teacher_title: app.teacher_title,
      teacher_department: app.teacher_department,
      teacher_email: app.teacher_email,
      teacher_avatar: app.teacher_avatar,
      deadline: app.deadline,
      status: app.status,
      studentName: app.student_name,
      studentEmail: app.student_email,
      studentPhone: app.student_phone,
      studentProgram: app.student_program,
      studentYear: app.student_year,
      studentGroup: app.student_group,
      workType: app.work_type,
      type: app.type,
      rejection_reason: app.rejection_reason,
      created_at: app.created_at,
      updated_at: app.updated_at
    }));

    res.json({
      applications,
      count: applications.length,
      success: true
    });

  } catch (err) {
    console.error('❌ Error fetching student applications:', err);
    res.status(500).json({ 
      message: "Internal server error", 
      error: err.message 
    });
  }
});


app.get("/api/student/applications/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const applicationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Отримання заявки з перевіркою власника
    const result = await pool.query(
      `SELECT 
        sa.*,
        t.name as teacher_name,
        t.title as teacher_title,
        t.department as teacher_department,
        t.email as teacher_email,
        t.avatar as teacher_avatar
       FROM student_applications sa
       LEFT JOIN teachers t ON sa.teacher_id = t.id
       WHERE sa.id = $1 AND sa.student_id = $2`,
      [applicationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const application = result.rows[0];
    const applicationResponse = {
      id: application.id.toString(),
      topic: application.topic,
      description: application.description,
      goals: application.goals,
      requirements: application.requirements,
      teacherId: application.teacher_id ? application.teacher_id.toString() : null,
      teacher_name: application.teacher_name,
      teacher_title: application.teacher_title,
      teacher_department: application.teacher_department,
      teacher_email: application.teacher_email,
      teacher_avatar: application.teacher_avatar,
      deadline: application.deadline,
      status: application.status,
      studentName: application.student_name,
      studentEmail: application.student_email,
      studentPhone: application.student_phone,
      studentProgram: application.student_program,
      studentYear: application.student_year,
      studentGroup: application.student_group,
      studentIdNumber: application.student_id_number,
      studentSpecialtyId: application.student_specialty_id,
      studentSpecialtyCode: application.student_specialty_code,
      studentFacultyId: application.student_faculty_id,
      feedback: application.feedback,
      rejectionReason: application.rejection_reason,
      createdAt: application.created_at,
      updatedAt: application.updated_at,
      workType: application.work_type,
      type: application.type
    };

    res.json(applicationResponse);
  } catch (err) {
    console.error("Error fetching student application:", err);
    res.status(500).json({ 
      message: "Database error fetching student application",
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});


app.delete("/api/student/applications/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const applicationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевірка, чи заявка належить студенту
    const applicationCheck = await pool.query(
      'SELECT id, status FROM student_applications WHERE id = $1 AND student_id = $2',
      [applicationId, userId]
    );

    if (applicationCheck.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const application = applicationCheck.rows[0];
    
    // Не дозволяємо видаляти прийняті або відхилені заявки
    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: "Cannot delete application that is already processed",
        currentStatus: application.status
      });
    }

    // Видалення заявки
    await pool.query(
      'DELETE FROM student_applications WHERE id = $1 AND student_id = $2',
      [applicationId, userId]
    );

    res.json({
      message: "Application deleted successfully",
      success: true
    });

  } catch (err) {
    console.error('❌ Error deleting application:', err);
    res.status(500).json({ 
      message: "Internal server error", 
      error: err.message 
    });
  }
});


// Middleware для перевірки, чи є користувач викладачем
const requireTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = result.rows[0].role;
    
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return res.status(403).json({ 
        message: "Access denied. Teacher role required.",
        userRole: userRole
      });
    }

    next();
  } catch (err: unknown) {
    console.error("Error checking user role:", err);
    res.status(500).json({ message: "Server error" });
  }
};


app.get("/api/teacher/applications", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const teacherId = req.query.teacher_id as string;

    console.log('🔍 Fetching teacher applications:', { userId, teacherId });

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо, чи користувач є викладачем
    const userCheck = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = userCheck.rows[0].role;
    if (userRole !== 'teacher') {
      return res.status(403).json({ 
        message: "Access denied. Only for teachers.",
        userRole: userRole
      });
    }

    // Отримуємо ID викладача
    let finalTeacherId;
    
    if (teacherId) {
      // Якщо передано teacher_id в query параметрі
      finalTeacherId = parseInt(teacherId);
      if (isNaN(finalTeacherId)) {
        return res.status(400).json({ message: "Invalid teacher_id format" });
      }
      
      // Перевіряємо, чи цей викладач існує
      const teacherCheck = await pool.query(
        'SELECT id FROM teachers WHERE id = $1',
        [finalTeacherId]
      );
      
      if (teacherCheck.rows.length === 0) {
        return res.status(404).json({ message: "Teacher not found" });
      }
    } else {
      // Якщо teacher_id не передано, отримуємо ID викладача за user_id
      const teacherResult = await pool.query(
        'SELECT id FROM teachers WHERE user_id = $1',
        [userId]
      );

      if (teacherResult.rows.length === 0) {
        return res.status(404).json({ message: "Teacher not found for this user" });
      }
      
      finalTeacherId = teacherResult.rows[0].id;
    }

    console.log('✅ Final teacher ID:', finalTeacherId);

    // Отримуємо заявки викладача
    const result = await pool.query(
      `SELECT 
        sa.*,
        u.avatar as student_avatar,
        sp.name as student_specialty_name,
        sp.code as student_specialty_code,
        f.name as student_faculty_name
      FROM student_applications sa
      LEFT JOIN users u ON sa.student_id = u.id
      LEFT JOIN specialties sp ON sa.student_specialty_id = sp.id
      LEFT JOIN faculties f ON sa.student_faculty_id = f.id
      WHERE sa.teacher_id = $1
      ORDER BY sa.created_at DESC`,
      [finalTeacherId]
    );

    console.log(`✅ Found ${result.rows.length} applications for teacher ${finalTeacherId}`);

    // Форматування дат
    const formatDate = (dateString: string) => {
      if (!dateString) return 'Not specified';
      try {
        return new Date(dateString).toLocaleDateString('uk-UA', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return dateString;
      }
    };

    const applications = result.rows.map(app => ({
      id: app.id,
      studentName: app.student_name,
      studentEmail: app.student_email,
      studentPhone: app.student_phone,
      studentAvatar: app.student_avatar,
      program: app.student_program,
      year: app.student_year,
      topic: app.topic,
      workType: app.work_type,
      type: app.type,
      status: app.status,
      date: formatDate(app.application_date),
      description: app.description,
      goals: app.goals,
      requirements: app.requirements,
      deadline: app.deadline ? formatDate(app.deadline) : null,
      teacherId: app.teacher_id,
      studentId: app.student_id,
      rejection_reason: app.rejection_reason,
      created_at: app.created_at,
      application_date: app.application_date,
      student_specialty_name: app.student_specialty_name,
      student_specialty_code: app.student_specialty_code,
      student_faculty_name: app.student_faculty_name
    }));

    res.json({
      applications,
      count: applications.length,
      success: true
    });

  } catch (err) {
    console.error('❌ Error fetching teacher applications:', err);
    res.status(500).json({ 
      message: "Internal server error", 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});



app.patch("/api/teacher/applications/:id/status", authenticateToken, async (req: Request, res: Response) => {
  let client;
  try {
    const userId = req.user?.userId;
    const applicationId = parseInt(req.params.id);
    const { status, rejection_reason } = req.body;

    console.log('🔍 Updating application status:', { userId, applicationId, status });

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be 'accepted' or 'rejected'" 
      });
    }

    // Перевірка, чи користувач є викладачем
    const teacherCheck = await pool.query(
      'SELECT id FROM teachers WHERE user_id = $1',
      [userId]
    );

    if (teacherCheck.rows.length === 0) {
      return res.status(403).json({ 
        message: "Only teachers can update application status" 
      });
    }

    const teacherId = teacherCheck.rows[0].id;

    // Транзакція для безпеки
    client = await pool.connect();
    await client.query('BEGIN');

    // Отримання поточної заявки
    const applicationResult = await client.query(
      `SELECT * FROM student_applications 
       WHERE id = $1 AND teacher_id = $2`,
      [applicationId, teacherId]
    );

    if (applicationResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ 
        message: "Application not found or access denied" 
      });
    }

    const application = applicationResult.rows[0];

    // Оновлення статусу заявки
    const updateQuery = `
      UPDATE student_applications 
      SET status = $1, 
          processed_at = NOW(),
          processed_by = $2,
          rejection_reason = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      status,
      userId,
      status === 'rejected' ? (rejection_reason || 'Application rejected by teacher') : null,
      applicationId
    ]);

    const updatedApplication = result.rows[0];

    // Якщо заявка прийнята - створюємо запис у teacher_students
    if (status === 'accepted') {
      const determineWorkType = (app: any): 'coursework' | 'diploma' | 'practice' => {
        if (app.work_type && ['coursework', 'diploma', 'practice'].includes(app.work_type)) {
          return app.work_type;
        }
        
        if (app.type === 'diploma') return 'diploma';
        if (app.type === 'practice') return 'practice';
        
        const topicLower = app.topic?.toLowerCase() || '';
        if (topicLower.includes('диплом') || topicLower.includes('diploma')) {
          return 'diploma';
        }
        if (topicLower.includes('практик') || topicLower.includes('practice')) {
          return 'practice';
        }
        return 'coursework';
      };

      const workType = determineWorkType(application);

      // Перевірка наявності таблиці teacher_students
      const tableExists = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'teacher_students'
        )`
      );

      if (tableExists.rows[0].exists) {
        // Перевірка, чи запис вже існує
        const existingRecord = await client.query(
          `SELECT id FROM teacher_students 
           WHERE teacher_id = $1 AND student_id = $2`,
          [application.teacher_id, application.student_id]
        );

        if (existingRecord.rows.length === 0) {
          await client.query(
            `INSERT INTO teacher_students (
              teacher_id, student_id, student_name, student_email,
              student_phone, course, faculty, specialty, work_type,
              work_title, start_date, deadline, status, application_id,
              confirmed_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                     NOW()::date, $11, 'active', $12, NOW())`,
            [
              application.teacher_id,
              application.student_id,
              application.student_name,
              application.student_email,
              application.student_phone || '',
              parseInt(application.student_year) || 1,
              application.student_program || 'Not specified',
              application.student_program || 'Not specified',
              workType,
              application.topic,
              application.deadline,
              application.id
            ]
          );
        }
      }
    }

    await client.query('COMMIT');

    res.json({
      message: `Application ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`,
      application: updatedApplication,
      success: true
    });

  } catch (err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      } finally {
        client.release();
      }
    }
    
    console.error('❌ Error updating application status:', err);
    res.status(500).json({ 
      message: "Internal server error", 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});


// GET /api/teacher/places - отримати доступні місця поточного викладача
app.get("/api/teacher/places", authenticateToken, async (req: Request, res: Response) => {
  try {
    // Перевіряємо наявність req.user
    if (!req.user) {
      console.log("❌ No user in request");
      return res.status(401).json({ message: "Користувач не авторизований" });
    }
    
    // Тепер можемо безпечно звертатися до req.user.userId
    const userId = req.user.userId;
    
    console.log(`🔄 Fetching available places for user ID: ${userId}`);
    
    // Перевіряємо, чи користувач є викладачем
    const teacherCheck = await pool.query(
      'SELECT id FROM teachers WHERE id = $1',
      [userId]
    );
    
    if (teacherCheck.rows.length === 0) {
      console.log(`❌ User ${userId} is not a teacher`);
      return res.json([]);
    }
    
    const teacherId = teacherCheck.rows[0].id;
    console.log(`👨‍🏫 Found teacher ID: ${teacherId} for user ID: ${userId}`);
    
    const result = await pool.query(`
      SELECT 
        ap.id,
        ap.type,
        ap.available_spots,
        ap.course,
        ap.specialty_id,
        s.name as specialty_name,
        s.code as specialty_code,
        s.faculty_id,
        f.name as faculty_name,
        COALESCE(ap.max_students, 5) as max_students,
        COALESCE(ap.current_students, 0) as current_students,
        COALESCE(ap.requirements, '') as requirements,
        COALESCE(ap.description, '') as description,
        ap.created_at,
        ap.updated_at
      FROM available_places ap
      LEFT JOIN specialties s ON ap.specialty_id = s.id
      LEFT JOIN faculties f ON s.faculty_id = f.id
      WHERE ap.teacher_id = $1
      ORDER BY 
        CASE ap.type 
          WHEN 'coursework' THEN 1 
          WHEN 'diploma' THEN 2 
          WHEN 'practice' THEN 3 
          ELSE 4 
        END,
        ap.course,
        s.code
    `, [teacherId]);
    
    console.log(`✅ Found ${result.rows.length} places for teacher ${teacherId}`);
    
    const formattedPlaces = result.rows.map((place: any) => ({
      id: place.id.toString(),
      teacher_id: teacherId,
      type: place.type,
      availableSpots: place.available_spots,
      available_spots: place.available_spots,
      course: place.course,
      specialty_id: place.specialty_id,
      specialty_name: place.specialty_name,
      specialty_code: place.specialty_code,
      faculty_id: place.faculty_id,
      faculty_name: place.faculty_name,
      max_students: place.max_students,
      current_students: place.current_students,
      requirements: place.requirements,
      description: place.description,
      created_at: place.created_at,
      updated_at: place.updated_at,
      createdAt: place.created_at,
      updatedAt: place.updated_at
    }));
    
    res.json(formattedPlaces);
    
  } catch (err: unknown) {
    console.error("❌ Error fetching teacher places:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: "Failed to fetch available places", details: errorMessage });
  }
});

// POST /api/teacher/places - додати нове доступне місце
app.post("/api/teacher/places", authenticateToken, async (req: Request, res: Response) => {
  try {
    // Перевіряємо наявність req.user
    if (!req.user) {
      console.log("❌ No user in request");
      return res.status(401).json({ message: "Користувач не авторизований" });
    }
    
    const { 
      type, 
      availableSpots, 
      course, 
      specialty_id, 
      max_students, 
      current_students,
      requirements, 
      description 
    } = req.body;
    
    const userId = req.user.userId;
    
    console.log("🔄 Adding new available place for user:", userId);
    
    // Перевіряємо, чи користувач є викладачем
    const teacherCheck = await pool.query(
      'SELECT id FROM teachers WHERE id = $1',
      [userId]
    );
    
    if (teacherCheck.rows.length === 0) {
      console.log(`❌ User ${userId} is not a teacher`);
      return res.status(403).json({ 
        message: "Користувач не є викладачем" 
      });
    }
    
    const teacherId = teacherCheck.rows[0].id;
    
    console.log("📝 Adding new available place:", {
      teacherId,
      type,
      availableSpots,
      course,
      specialty_id,
      max_students,
      current_students,
      requirements,
      description
    });
    
    // Валідація
    if (!type || !availableSpots || !course || !specialty_id) {
      return res.status(400).json({ 
        message: "Тип, кількість місць, курс та спеціальність обов'язкові" 
      });
    }
    
    // Перевірка, чи існує спеціальність
    const specialtyCheck = await pool.query(
      'SELECT id, name, code FROM specialties WHERE id = $1',
      [specialty_id]
    );
    
    if (specialtyCheck.rows.length === 0) {
      return res.status(400).json({ 
        message: "Спеціальність не знайдена" 
      });
    }
    
    // Перевірка, чи не існує вже такого місця
    const existingPlace = await pool.query(
      `SELECT id FROM available_places 
       WHERE teacher_id = $1 AND type = $2 AND course = $3 AND specialty_id = $4`,
      [teacherId, type, course, specialty_id]
    );
    
    if (existingPlace.rows.length > 0) {
      return res.status(400).json({ 
        message: "Така пропозиція вже існує для цього курсу та спеціальності" 
      });
    }
    
    // Додаємо нове місце
    const result = await pool.query(
      `INSERT INTO available_places 
       (teacher_id, type, available_spots, course, specialty_id, 
        max_students, current_students, requirements, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        teacherId, 
        type, 
        availableSpots, 
        course, 
        specialty_id,
        max_students || 5,
        current_students || 0,
        requirements || '',
        description || ''
      ]
    );
    
    const place = result.rows[0];
    
    // Отримуємо додаткову інформацію
    const specialtyInfo = await pool.query(
      `SELECT s.name as specialty_name, s.code as specialty_code,
              f.name as faculty_name, f.id as faculty_id
       FROM specialties s
       LEFT JOIN faculties f ON s.faculty_id = f.id
       WHERE s.id = $1`,
      [specialty_id]
    );
    
    const formattedPlace = {
      ...place,
      id: place.id.toString(),
      teacher_id: teacherId,
      specialty_name: specialtyInfo.rows[0]?.specialty_name || 'Невідома спеціальність',
      specialty_code: specialtyInfo.rows[0]?.specialty_code || 'N/A',
      faculty_name: specialtyInfo.rows[0]?.faculty_name || 'Невідомий факультет',
      faculty_id: specialtyInfo.rows[0]?.faculty_id,
      available_spots: place.available_spots,
      availableSpots: place.available_spots,
      created_at: place.created_at,
      updated_at: place.updated_at,
      createdAt: place.created_at,
      updatedAt: place.updated_at
    };
    
    console.log(`✅ Added new place with ID: ${formattedPlace.id}`);
    
    res.status(201).json({ 
      message: "Місце успішно додано",
      place: formattedPlace 
    });
    
  } catch (err: unknown) {
    console.error("❌ Error adding available place:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ 
      error: "Failed to add available place",
      details: errorMessage
    });
  }
});

// PUT /api/teacher/places/update - оновити кількість доступних місць
app.put("/api/teacher/places/update", authenticateToken, async (req: Request, res: Response) => {
  try {
    // Перевіряємо наявність req.user
    if (!req.user) {
      console.log("❌ No user in request");
      return res.status(401).json({ message: "Користувач не авторизований" });
    }
    
    const { 
      teacherId, 
      type, 
      specialty_id, 
      course, 
      action = 'decrement' 
    } = req.body;
    
    console.log("🔄 Updating available spots:", {
      teacherId,
      type,
      specialty_id,
      course,
      action
    });
    
    // Валідація
    if (!teacherId || !type || !specialty_id || !course) {
      return res.status(400).json({ 
        message: "Відсутні обов'язкові поля: teacherId, type, specialty_id, course" 
      });
    }
    
    // Знайти місце за параметрами
    const placeResult = await pool.query(`
      SELECT 
        ap.id,
        ap.available_spots,
        ap.current_students,
        ap.max_students
      FROM available_places ap
      WHERE ap.teacher_id = $1 
        AND ap.type = $2 
        AND ap.specialty_id = $3 
        AND ap.course = $4
    `, [teacherId, type, specialty_id, course]);
    
    if (placeResult.rows.length === 0) {
      // Якщо не знайдено точне місце, шукаємо будь-яке місце для цього викладача
      // з таким типом роботи (без фільтрації за спеціальністю/курсом)
      const fallbackResult = await pool.query(`
        SELECT 
          ap.id,
          ap.available_spots,
          ap.current_students,
          ap.max_students
        FROM available_places ap
        WHERE ap.teacher_id = $1 
          AND ap.type = $2
        ORDER BY ap.available_spots DESC
        LIMIT 1
      `, [teacherId, type]);
      
      if (fallbackResult.rows.length === 0) {
        return res.status(404).json({ 
          message: "Місць для даного типу роботи не знайдено",
          details: "Викладач не має доступних місць для цього типу роботи"
        });
      }
      
      const place = fallbackResult.rows[0];
      const newAvailableSpots = action === 'decrement' 
        ? Math.max(0, place.available_spots - 1)
        : place.available_spots + 1;
      
      const newCurrentStudents = action === 'decrement'
        ? Math.min(place.max_students || 5, place.current_students + 1)
        : Math.max(0, place.current_students - 1);
      
      // Оновлюємо перше доступне місце цього типу
      await pool.query(`
        UPDATE available_places 
        SET available_spots = $1,
            current_students = $2,
            updated_at = NOW()
        WHERE id = $3
      `, [newAvailableSpots, newCurrentStudents, place.id]);
      
      console.log(`✅ Updated fallback place ID: ${place.id}, available spots: ${newAvailableSpots}`);
      
      return res.json({
        message: "Кількість місць оновлено (використано перше доступне місце)",
        place: {
          id: place.id,
          available_spots: newAvailableSpots,
          current_students: newCurrentStudents,
          previous_available_spots: place.available_spots,
          previous_current_students: place.current_students,
          action: action
        }
      });
    }
    
    const place = placeResult.rows[0];
    
    // Перевіряємо, чи є доступні місця
    if (action === 'decrement' && place.available_spots <= 0) {
      return res.status(400).json({ 
        message: "Немає доступних місць",
        details: "Усі місця для цієї пропозиції вже зайняті"
      });
    }
    
    // Обчислюємо нові значення
    const newAvailableSpots = action === 'decrement' 
      ? place.available_spots - 1
      : place.available_spots + 1;
    
    const newCurrentStudents = action === 'decrement'
      ? (place.current_students || 0) + 1
      : Math.max(0, (place.current_students || 0) - 1);
    
    // Оновлюємо місце
    await pool.query(`
      UPDATE available_places 
      SET available_spots = $1,
          current_students = $2,
          updated_at = NOW()
      WHERE id = $3
    `, [newAvailableSpots, newCurrentStudents, place.id]);
    
    console.log(`✅ Updated place ID: ${place.id}, available spots: ${newAvailableSpots}`);
    
    res.json({
      message: "Кількість місць успішно оновлено",
      place: {
        id: place.id,
        available_spots: newAvailableSpots,
        current_students: newCurrentStudents,
        previous_available_spots: place.available_spots,
        previous_current_students: place.current_students,
        action: action
      }
    });
    
  } catch (err: unknown) {
    console.error("❌ Error updating available spots:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ 
      error: "Failed to update available spots",
      details: errorMessage
    });
  }
});

// PUT /api/teacher/places/:id - оновити доступне місце
app.put("/api/teacher/places/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    // Перевіряємо наявність req.user
    if (!req.user) {
      console.log("❌ No user in request");
      return res.status(401).json({ message: "Користувач не авторизований" });
    }
    
    const placeId = req.params.id;
    const { 
      type, 
      availableSpots, 
      course, 
      specialty_id, 
      max_students, 
      current_students,
      requirements, 
      description 
    } = req.body;
    
    const userId = req.user.userId;
    
    console.log("🔄 Updating available place for user:", userId);
    
    // Перевіряємо, чи користувач є викладачем
    const teacherCheck = await pool.query(
      'SELECT id FROM teachers WHERE id = $1',
      [userId]
    );
    
    if (teacherCheck.rows.length === 0) {
      console.log(`❌ User ${userId} is not a teacher`);
      return res.status(403).json({ 
        message: "Користувач не є викладачем" 
      });
    }
    
    const teacherId = teacherCheck.rows[0].id;
    
    console.log("📝 Updating available place:", {
      placeId,
      teacherId,
      type,
      availableSpots,
      course,
      specialty_id,
      max_students,
      current_students
    });
    
    // Перевіряємо, чи існує місце та чи належить воно викладачу
    const existingPlace = await pool.query(
      `SELECT id FROM available_places WHERE id = $1 AND teacher_id = $2`,
      [placeId, teacherId]
    );
    
    if (existingPlace.rows.length === 0) {
      return res.status(404).json({ 
        message: "Місце не знайдено або ви не маєте доступу" 
      });
    }
    
    // Перевіряємо, чи не конфліктує оновлення з іншими записами
    const conflictCheck = await pool.query(
      `SELECT id FROM available_places 
       WHERE teacher_id = $1 AND type = $2 AND course = $3 AND specialty_id = $4 AND id != $5`,
      [teacherId, type, course, specialty_id, placeId]
    );
    
    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: "Така пропозиція вже існує для цього курсу та спеціальності" 
      });
    }
    
    // Оновлюємо місце
    const result = await pool.query(
      `UPDATE available_places 
       SET type = $1, 
           available_spots = $2, 
           course = $3, 
           specialty_id = $4,
           max_students = $5,
           current_students = $6,
           requirements = $7,
           description = $8,
           updated_at = NOW()
       WHERE id = $9 AND teacher_id = $10
       RETURNING *`,
      [
        type, 
        availableSpots, 
        course, 
        specialty_id,
        max_students || 5,
        current_students || 0,
        requirements || '',
        description || '',
        placeId,
        teacherId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: "Місце не знайдено" 
      });
    }
    
    const place = result.rows[0];
    
    // Отримуємо додаткову інформацію
    const specialtyInfo = await pool.query(
      `SELECT s.name as specialty_name, s.code as specialty_code,
              f.name as faculty_name, f.id as faculty_id
       FROM specialties s
       LEFT JOIN faculties f ON s.faculty_id = f.id
       WHERE s.id = $1`,
      [specialty_id]
    );
    
    const formattedPlace = {
      ...place,
      id: place.id.toString(),
      teacher_id: teacherId,
      specialty_name: specialtyInfo.rows[0]?.specialty_name || 'Невідома спеціальність',
      specialty_code: specialtyInfo.rows[0]?.specialty_code || 'N/A',
      faculty_name: specialtyInfo.rows[0]?.faculty_name || 'Невідомий факультет',
      faculty_id: specialtyInfo.rows[0]?.faculty_id,
      available_spots: place.available_spots,
      availableSpots: place.available_spots,
      created_at: place.created_at,
      updated_at: place.updated_at,
      createdAt: place.created_at,
      updatedAt: place.updated_at
    };
    
    console.log(`✅ Updated place with ID: ${formattedPlace.id}`);
    
    res.json({ 
      message: "Місце успішно оновлено",
      place: formattedPlace 
    });
    
  } catch (err: unknown) {
    console.error("❌ Error updating available place:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ 
      error: "Failed to update available place",
      details: errorMessage
    });
  }
});

// DELETE /api/teacher/places/:id - видалити доступне місце
app.delete("/api/teacher/places/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    // Перевіряємо наявність req.user
    if (!req.user) {
      console.log("❌ No user in request");
      return res.status(401).json({ message: "Користувач не авторизований" });
    }
    
    const placeId = req.params.id;
    const userId = req.user.userId;
    
    console.log(`🔄 Deleting place ${placeId} for user ${userId}`);
    
    // Перевіряємо, чи користувач є викладачем
    const teacherCheck = await pool.query(
      'SELECT id FROM teachers WHERE id = $1',
      [userId]
    );
    
    if (teacherCheck.rows.length === 0) {
      console.log(`❌ User ${userId} is not a teacher`);
      return res.status(403).json({ 
        message: "Користувач не є викладачем" 
      });
    }
    
    const teacherId = teacherCheck.rows[0].id;
    
    // Перевіряємо, чи існує місце та чи належить воно викладачу
    const existingPlace = await pool.query(
      `SELECT id FROM available_places WHERE id = $1 AND teacher_id = $2`,
      [placeId, teacherId]
    );
    
    if (existingPlace.rows.length === 0) {
      return res.status(404).json({ 
        message: "Місце не знайдено або ви не маєте доступу" 
      });
    }
    
    // Видаляємо місце
    const result = await pool.query(
      `DELETE FROM available_places WHERE id = $1 AND teacher_id = $2 RETURNING id`,
      [placeId, teacherId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: "Місце не знайдено" 
      });
    }
    
    console.log(`✅ Deleted place with ID: ${placeId}`);
    
    res.json({ 
      message: "Місце успішно видалено",
      deletedId: placeId 
    });
    
  } catch (err: unknown) {
    console.error("❌ Error deleting available place:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ 
      error: "Failed to delete available place",
      details: errorMessage
    });
  }
});

// GET /api/teacher/:teacherId/available-places - отримати доступні місця конкретного викладача
app.get("/api/teacher/:teacherId/available-places", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;
    const { workType, specialtyId, course, includeAll = false } = req.query;
    
    console.log(`🔄 Fetching available places for teacher ${teacherId}`);
    
    // Перевіряємо, чи користувач існує як викладач
    const teacherCheck = await pool.query(
      'SELECT id FROM teachers WHERE id = $1',
      [teacherId]
    );
    
    if (teacherCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: "Викладача не знайдено" 
      });
    }
    
    let query = `
      SELECT 
        ap.id,
        ap.type,
        ap.available_spots,
        ap.course,
        ap.specialty_id,
        s.name as specialty_name,
        s.code as specialty_code,
        s.faculty_id,
        f.name as faculty_name,
        COALESCE(ap.max_students, 5) as max_students,
        COALESCE(ap.current_students, 0) as current_students,
        ap.requirements,
        ap.description,
        ap.created_at,
        ap.updated_at
      FROM available_places ap
      LEFT JOIN specialties s ON ap.specialty_id = s.id
      LEFT JOIN faculties f ON s.faculty_id = f.id
      WHERE ap.teacher_id = $1
    `;
    
    const params: any[] = [teacherId];
    let paramIndex = 2;
    
    // Додаємо фільтри
    if (workType) {
      query += ` AND ap.type = $${paramIndex}`;
      params.push(workType);
      paramIndex++;
    }
    
    if (specialtyId) {
      query += ` AND ap.specialty_id = $${paramIndex}`;
      params.push(specialtyId);
      paramIndex++;
    }
    
    if (course) {
      query += ` AND ap.course = $${paramIndex}`;
      params.push(course);
      paramIndex++;
    }
    
    // Фільтр за доступністю
    if (includeAll === 'false' || includeAll === false) {
      query += ` AND ap.available_spots > 0`;
    }
    
    query += ` ORDER BY ap.type, ap.course, s.code`;
    
    const result = await pool.query(query, params);
    
    // Форматуємо результат
    const formattedPlaces = result.rows.map((place: any) => ({
      id: place.id.toString(),
      teacher_id: parseInt(teacherId),
      type: place.type,
      availableSpots: place.available_spots,
      available_spots: place.available_spots,
      course: place.course,
      specialty_id: place.specialty_id,
      specialty_name: place.specialty_name,
      specialty_code: place.specialty_code,
      faculty_id: place.faculty_id,
      faculty_name: place.faculty_name,
      max_students: place.max_students,
      current_students: place.current_students,
      requirements: place.requirements,
      description: place.description,
      created_at: place.created_at,
      updated_at: place.updated_at,
      createdAt: place.created_at,
      updatedAt: place.updated_at
    }));
    
    res.json({
      teacherId,
      places: formattedPlaces,
      total: formattedPlaces.length,
      availableSpots: formattedPlaces.reduce((sum, place) => sum + place.availableSpots, 0),
      summary: {
        coursework: formattedPlaces.filter(p => p.type === 'coursework').length,
        diploma: formattedPlaces.filter(p => p.type === 'diploma').length,
        practice: formattedPlaces.filter(p => p.type === 'practice').length
      }
    });
    
  } catch (err: unknown) {
    console.error("❌ Error fetching available places:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ 
      error: "Failed to fetch available places",
      details: errorMessage
    });
  }
});

// GET /api/teacher/specialties - отримання спеціальностей викладача
app.get("/api/teacher/specialties", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const teacherId = decoded.userId;

    // Отримуємо факультет викладача з таблиці teachers
    const teacherResult = await pool.query(
      'SELECT department_id FROM teachers WHERE id = $1',
      [teacherId]
    );

    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const departmentId = teacherResult.rows[0].department_id;

    // Отримуємо факультет викладача
    const departmentResult = await pool.query(
      'SELECT faculty_id FROM departments WHERE id = $1',
      [departmentId]
    );

    if (departmentResult.rows.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    const facultyId = departmentResult.rows[0].faculty_id;

    // Отримуємо всі спеціальності цього факультету
    const specialtiesResult = await pool.query(`
      SELECT 
        s.id,
        s.code,
        s.name,
        f.name as faculty_name
      FROM specialties s
      LEFT JOIN faculties f ON s.faculty_id = f.id
      WHERE s.faculty_id = $1
      ORDER BY s.code
    `, [facultyId]);

    res.json(specialtiesResult.rows);
  } catch (error) {
    console.error('Error fetching teacher specialties:', error);
    res.status(500).json({ message: "Database error" });
  }
});



// Отримати всі нотатки поточного користувача
app.get("/api/notes", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    const result = await pool.query(
      `SELECT 
        id, title, content, tags, category, is_bookmarked, is_public, 
        updated_at, word_count, background_color, text_color, images
       FROM notes 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [userId]
    );
    
    res.json(result.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      tags: row.tags || [],
      category: row.category,
      isBookmarked: row.is_bookmarked,
      isPublic: row.is_public,
      updatedAt: row.updated_at,
      wordCount: row.word_count,
      backgroundColor: row.background_color,
      textColor: row.text_color,
      images: row.images || []
    })));
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Database error fetching notes" });
  }
});

// Створити нову нотатку
app.post("/api/notes", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      title,
      content,
      tags,
      category,
      isBookmarked,
      isPublic,
      backgroundColor,
      textColor,
      images
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;

    const result = await pool.query(
      `INSERT INTO notes (
        user_id, title, content, tags, category, is_bookmarked, is_public,
        word_count, background_color, text_color, images
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        title,
        content,
        tags || [],
        category || 'personal',
        isBookmarked || false,
        isPublic || false,
        wordCount,
        backgroundColor || '#ffffff',
        textColor || '#000000',
        images || []
      ]
    );

    const note = result.rows[0];
    res.status(201).json({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      category: note.category,
      isBookmarked: note.is_bookmarked,
      isPublic: note.is_public,
      updatedAt: note.updated_at,
      wordCount: note.word_count,
      backgroundColor: note.background_color,
      textColor: note.text_color,
      images: note.images || []
    });
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ message: "Database error creating note" });
  }
});

// Оновити нотатку
app.put("/api/notes/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const noteId = req.params.id;
    const {
      title,
      content,
      tags,
      category,
      isBookmarked,
      isPublic,
      backgroundColor,
      textColor,
      images
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Перевіряємо, чи нотатка належить користувачу
    const ownershipCheck = await pool.query(
      "SELECT id FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ message: "Note not found or access denied" });
    }

    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;

    const result = await pool.query(
      `UPDATE notes SET 
        title = $1, content = $2, tags = $3, category = $4, 
        is_bookmarked = $5, is_public = $6, updated_at = CURRENT_TIMESTAMP,
        word_count = $7, background_color = $8, text_color = $9, images = $10
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        title,
        content,
        tags || [],
        category || 'personal',
        isBookmarked || false,
        isPublic || false,
        wordCount,
        backgroundColor || '#ffffff',
        textColor || '#000000',
        images || [],
        noteId,
        userId
      ]
    );

    const note = result.rows[0];
    res.json({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      category: note.category,
      isBookmarked: note.is_bookmarked,
      isPublic: note.is_public,
      updatedAt: note.updated_at,
      wordCount: note.word_count,
      backgroundColor: note.background_color,
      textColor: note.text_color,
      images: note.images || []
    });
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ message: "Database error updating note" });
  }
});

// Видалити нотатку
app.delete("/api/notes/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const noteId = req.params.id;

    // Перевіряємо, чи нотатка належить користувачу
    const ownershipCheck = await pool.query(
      "SELECT id FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ message: "Note not found or access denied" });
    }

    await pool.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ message: "Database error deleting note" });
  }
});

// Оновити статус закладки
app.patch("/api/notes/:id/bookmark", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const noteId = req.params.id;
    const { isBookmarked } = req.body;

    const ownershipCheck = await pool.query(
      "SELECT id FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ message: "Note not found or access denied" });
    }

    const result = await pool.query(
      "UPDATE notes SET is_bookmarked = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [isBookmarked, noteId, userId]
    );

    const note = result.rows[0];
    res.json({
      id: note.id,
      isBookmarked: note.is_bookmarked
    });
  } catch (err) {
    console.error("Error updating bookmark:", err);
    res.status(500).json({ message: "Database error updating bookmark" });
  }
});

// Оновити статус публічності
app.patch("/api/notes/:id/visibility", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const noteId = req.params.id;
    const { isPublic } = req.body;

    const ownershipCheck = await pool.query(
      "SELECT id FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ message: "Note not found or access denied" });
    }

    const result = await pool.query(
      "UPDATE notes SET is_public = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [isPublic, noteId, userId]
    );

    const note = result.rows[0];
    res.json({
      id: note.id,
      isPublic: note.is_public
    });
  } catch (err) {
    console.error("Error updating visibility:", err);
    res.status(500).json({ message: "Database error updating visibility" });
  }
});

// Оновити порядок нотаток
app.put("/api/notes/order", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { noteOrder } = req.body;

    if (!noteOrder || !Array.isArray(noteOrder)) {
      return res.status(400).json({ message: "Note order array is required" });
    }

    // Оновлюємо порядок для кожної нотатки
    for (let i = 0; i < noteOrder.length; i++) {
      await pool.query(
        "UPDATE notes SET display_order = $1 WHERE id = $2 AND user_id = $3",
        [i, noteOrder[i], userId]
      );
    }

    res.json({ message: "Note order updated successfully" });
  } catch (err) {
    console.error("Error updating note order:", err);
    res.status(500).json({ message: "Database error updating note order" });
  }
});

// GET /api/analytics/student/progress - отримати прогрес студента
app.get("/api/analytics/student/progress", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Отримуємо розділи студента
    const projectResult = await pool.query(
      'SELECT active_project_type FROM user_projects WHERE user_id = $1',
      [userId]
    );
    
    const projectType = projectResult.rows[0]?.active_project_type || 'coursework';
    
    const chaptersResult = await pool.query(
      `SELECT 
        chapter_key as key,
        progress,
        status,
        student_note,
        uploaded_file_name,
        uploaded_file_date,
        uploaded_file_size
       FROM user_chapters 
       WHERE user_id = $1 AND project_type = $2
       ORDER BY 
         CASE chapter_key 
           WHEN 'intro' THEN 1
           WHEN 'theory' THEN 2  
           WHEN 'design' THEN 3
           WHEN 'implementation' THEN 4
           WHEN 'tasks' THEN 2
           WHEN 'diary' THEN 3
           WHEN 'conclusion' THEN 5
           WHEN 'report' THEN 6
           WHEN 'appendix' THEN 7
           WHEN 'sources' THEN 8
           WHEN 'abstract' THEN 9
           WHEN 'cover' THEN 10
           WHEN 'content' THEN 11
           ELSE 99 
         END`,
      [userId, projectType]
    );

    const chapters = chaptersResult.rows.map((row: any) => ({
      id: row.id,
      key: row.key,
      progress: row.progress,
      status: row.status,
      studentNote: row.student_note || '',
      uploadedFile: row.uploaded_file_name ? {
        name: row.uploaded_file_name,
        uploadDate: row.uploaded_file_date ? new Date(row.uploaded_file_date).toLocaleDateString('uk-UA') : '',
        size: row.uploaded_file_size || ''
      } : undefined
    }));

    // Розраховуємо загальний прогрес
    const overallProgress = chapters.length > 0 
      ? Math.round(chapters.reduce((sum: number, ch: any) => sum + ch.progress, 0) / chapters.length)
      : 0;

    // Отримуємо коментарі викладача
    const feedbackResult = await pool.query(
      `SELECT 
        tc.id,
        tc.chapter_id,
        tc.text as comment,
        tc.created_at as date,
        tc.type,
        tc.status,
        u.name as supervisor_name
       FROM teacher_comments tc
       JOIN users u ON tc.teacher_id = u.id
       WHERE tc.chapter_id IN (
         SELECT id FROM user_chapters WHERE user_id = $1
       )
       ORDER BY tc.created_at DESC`,
      [userId]
    );

    const feedback = feedbackResult.rows.map((row: any) => ({
      chapter: row.chapter_id,
      comment: row.text,
      date: new Date(row.date).toLocaleDateString('uk-UA'),
      type: row.type,
      status: row.status,
      supervisorName: row.supervisor_name
    }));

    // Отримуємо метрики якості
    const qualityResult = await pool.query(
      `SELECT 
        AVG(CASE WHEN progress >= 80 THEN 90 WHEN progress >= 50 THEN 75 ELSE 60 END) as structure_score,
        AVG(CASE WHEN uploaded_file_name IS NOT NULL THEN 85 ELSE 70 END) as content_score,
        AVG(CASE WHEN student_note IS NOT NULL THEN 80 ELSE 65 END) as formatting_score,
        AVG(progress) as citation_score
       FROM user_chapters 
       WHERE user_id = $1`,
      [userId]
    );

    const qualityRow = qualityResult.rows[0];

    res.json({
      chapters,
      overallProgress,
      feedback,
      qualityMetrics: {
        structureScore: Math.round(qualityRow.structure_score || 75),
        contentScore: Math.round(qualityRow.content_score || 70),
        formattingScore: Math.round(qualityRow.formatting_score || 65),
        citationScore: Math.round(qualityRow.citation_score || 70)
      }
    });
  } catch (err) {
    console.error('Error fetching student progress:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET /api/analytics/student/activity - активність студента
app.get("/api/analytics/student/activity", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Отримуємо сесії активності за останні 14 днів
    const sessionsResult = await pool.query(
      `SELECT 
        start_time,
        end_time,
        duration,
        activity_type,
        chapters_worked,
        focus_score,
        time_of_day
       FROM student_activity_sessions 
       WHERE user_id = $1 AND start_time >= NOW() - INTERVAL '14 days'
       ORDER BY start_time DESC`,
      [userId]
    );

    const studySessions = sessionsResult.rows.map((row: any) => ({
      date: new Date(row.start_time).toISOString(),
      duration: row.duration || 0,
      activity: row.activity_type || 'writing',
      chapters: row.chapters_worked || [],
      focusScore: row.focus_score || 70,
      timeOfDay: row.time_of_day || 'afternoon'
    }));

    // Отримуємо дедлайни
    const deadlinesResult = await pool.query(
      `SELECT 
        milestone,
        deadline_date,
        status,
        priority,
        submitted_at
       FROM student_deadlines 
       WHERE user_id = $1 AND deadline_date >= CURRENT_DATE
       ORDER BY deadline_date ASC`,
      [userId]
    );

    const deadlines = deadlinesResult.rows.map((row: any) => {
      const deadlineDate = new Date(row.deadline_date);
      const today = new Date();
      const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        milestone: row.milestone,
        deadline: deadlineDate.toISOString(),
        status: row.status,
        submitted: row.submitted_at ? new Date(row.submitted_at).toISOString() : undefined,
        priority: row.priority,
        daysUntil: Math.max(0, daysUntil)
      };
    });

    // Аналітика часу
    const timeAnalyticsResult = await pool.query(
      `SELECT 
        EXTRACT(HOUR FROM start_time) as hour,
        COUNT(*) as sessions,
        AVG(focus_score) as productivity
       FROM student_activity_sessions 
       WHERE user_id = $1 AND start_time >= NOW() - INTERVAL '30 days'
       GROUP BY EXTRACT(HOUR FROM start_time)
       ORDER BY hour`,
      [userId]
    );

    const timeAnalytics = timeAnalyticsResult.rows.map((row: any) => ({
      hour: `${Math.floor(row.hour)}:00`,
      sessions: parseInt(row.sessions),
      productivity: Math.round(row.productivity || 70)
    }));

    // Остання активність
    const lastActivityResult = await pool.query(
      `SELECT 
        MAX(start_time) as last_session,
        MAX(uploaded_file_date) as last_edit
       FROM user_chapters 
       WHERE user_id = $1`,
      [userId]
    );

    const lastActivityRow = lastActivityResult.rows[0];

    res.json({
      sessions: studySessions,
      deadlines,
      recentActivity: {
        lastLogin: lastActivityRow.last_session ? new Date(lastActivityRow.last_session).toISOString() : new Date().toISOString(),
        lastEdit: lastActivityRow.last_edit ? new Date(lastActivityRow.last_edit).toISOString() : new Date().toISOString()
      },
      timeAnalytics: {
        productiveHours: timeAnalytics.slice().sort((a, b) => b.productivity - a.productivity).slice(0, 3).map((item: any) => item.hour),
        weeklyStreak: Math.floor(Math.random() * 7) + 1, // Тимчасово, поки не реалізуємо стрік
        averageSessionLength: sessionsResult.rows.length > 0 
          ? Math.round(sessionsResult.rows.reduce((sum: number, row: any) => sum + (row.duration || 0), 0) / sessionsResult.rows.length / 60)
          : 45,
        focusScore: sessionsResult.rows.length > 0 
          ? Math.round(sessionsResult.rows.reduce((sum: number, row: any) => sum + (row.focus_score || 0), 0) / sessionsResult.rows.length)
          : 75,
        bestTimeOfDay: timeAnalytics.length > 0 
          ? timeAnalytics.reduce((prev: any, current: any) => (prev.productivity > current.productivity) ? prev : current).hour
          : 'afternoon'
      }
    });
  } catch (err) {
    console.error('Error fetching student activity:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET /api/analytics/student/writing-stats - статистика написання
app.get("/api/analytics/student/writing-stats", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Отримуємо статистику написання
    const writingStatsResult = await pool.query(
      `SELECT 
        SUM(word_count) as total_words,
        SUM(characters_count) as total_characters,
        SUM(images_count) as total_images,
        SUM(time_spent) as total_time
       FROM writing_statistics 
       WHERE user_id = $1`,
      [userId]
    );

    const statsRow = writingStatsResult.rows[0];



    const totalPages = Math.round((statsRow.total_words || 0) / 250); // ~250 слів на сторінку

    res.json({
      wordCount: statsRow.total_words || 0,
      pagesCount: totalPages,
      imagesCount: statsRow.total_images || 0,
      citationsCount: Math.round((statsRow.total_words || 0) / 500), // ~1 цитата на 500 слів
      plagiarismScore: 2, // Тимчасово, поки не інтегруємо антиплагіат
      readabilityScore: 75, // Тимчасово
      vocabularyDiversity: 68 // Тимчасово
    });
  } catch (err) {
    console.error('Error fetching writing stats:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// POST /api/analytics/activity/start - початок сесії активності
app.post("/api/analytics/activity/start", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { activityType = 'writing', chapters = [] } = req.body;

    const result = await pool.query(
      `INSERT INTO student_activity_sessions 
       (user_id, activity_type, chapters_worked, time_of_day) 
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, activityType, chapters, getTimeOfDay()]
    );

    // Зберігаємо ID сесії в сесії користувача
    req.session.activitySessionId = result.rows[0].id;

    res.json({ 
      success: true, 
      sessionId: result.rows[0].id 
    });
  } catch (err) {
    console.error('Error starting activity session:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// POST /api/analytics/activity/end - завершення сесії активності
app.post("/api/analytics/activity/end", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.session.activitySessionId;

    if (!userId || !sessionId) {
      return res.status(400).json({ message: "No active session" });
    }

    const { focusScore = 70, wordsWritten = 0, chapters = [] } = req.body;

    // Оновлюємо сесію
    await pool.query(
      `UPDATE student_activity_sessions 
       SET end_time = NOW(), 
           duration = EXTRACT(EPOCH FROM (NOW() - start_time)),
           focus_score = $1
       WHERE id = $2 AND user_id = $3`,
      [focusScore, sessionId, userId]
    );

    // Додаємо статистику написання
    if (wordsWritten > 0) {
      await pool.query(
        `INSERT INTO writing_statistics 
         (user_id, chapter_key, word_count, characters_count, time_spent) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, chapters[0] || 'general', wordsWritten, wordsWritten * 6, 3600] // Припускаємо 1 годину
      );
    }

    // Очищаємо сесію
    delete req.session.activitySessionId;

    res.json({ success: true });
  } catch (err) {
    console.error('Error ending activity session:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET /api/analytics/supervisor/students-progress - прогрес студентів для викладача
app.get("/api/analytics/supervisor/students-progress", authenticateToken, requireTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Отримуємо студентів викладача
    const studentsResult = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        d.name as department_name,
        f.name as faculty_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN faculties f ON u.faculty_id = f.id
       WHERE u.role = 'student'
       AND u.id IN (
         SELECT student_id FROM teacher_students WHERE teacher_id = $1
       )`,
      [teacherId]
    );

    const students = await Promise.all(
      studentsResult.rows.map(async (student: any) => {
        // Отримуємо прогрес кожного студента
        const progressResult = await pool.query(
          `SELECT 
            AVG(progress) as avg_progress,
            COUNT(*) as total_chapters,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_chapters,
            COUNT(CASE WHEN uploaded_file_name IS NOT NULL THEN 1 END) as uploaded_files
           FROM user_chapters 
           WHERE user_id = $1`,
          [student.id]
        );

        const progressRow = progressResult.rows[0];

        // Остання активність
        const activityResult = await pool.query(
          `SELECT MAX(start_time) as last_activity 
           FROM student_activity_sessions 
           WHERE user_id = $1`,
          [student.id]
        );

        return {
          id: student.id.toString(),
          name: student.name,
          group: student.department_name || 'Не вказано',
          email: student.email,
          progress: Math.round(progressRow.avg_progress || 0),
          completedChapters: parseInt(progressRow.completed_chapters || 0),
          uploadedFiles: parseInt(progressRow.uploaded_files || 0),
          lastActivity: activityResult.rows[0]?.last_activity || new Date().toISOString(),
          faculty_name: student.faculty_name,
          department_name: student.department_name
        };
      })
    );

    res.json({
      students,
      totalStudents: students.length
    });
  } catch (err) {
    console.error('Error fetching students progress:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// Допоміжна функція для визначення часу доби
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}


// ===== Serve frontend =====
const frontendPath = path.join(__dirname, "../dist");

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ===== Start server =====
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

// Ініціалізація WebSocket сервера
new ChatWebSocketServer(server);