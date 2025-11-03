import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Read database
const readDB = () => {
  const data = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8');
  return JSON.parse(data);
};

// Write database
const writeDB = (data) => {
  fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(data, null, 2));
};

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: `jwt-token-${user.id}-${Date.now()}`
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Email atau password salah'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  const db = readDB();
  
  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email sudah terdaftar'
    });
  }
  
  const newUser = {
    id: String(db.users.length + 1),
    name,
    email,
    password,
    role: 'user',
    status: 'active',
    avatar: '',
    bio: '',
    phone: '',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.users.push(newUser);
  writeDB(db);
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    success: true,
    data: {
      user: userWithoutPassword,
      token: `jwt-token-${newUser.id}-${Date.now()}`
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout berhasil'
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan'
    });
  }
  
  const userId = token.split('-')[2];
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
});

// User endpoints
app.get('/api/user/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = token?.split('-')[2];
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  
  if (user) {
    const { password, ...userProfile } = user;
    res.json({
      success: true,
      data: userProfile
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    });
  }
});

app.put('/api/user/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = token?.split('-')[2];
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    writeDB(db);
    
    const { password, ...userProfile } = db.users[userIndex];
    res.json({
      success: true,
      data: userProfile
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    });
  }
});

// Admin endpoints
app.get('/api/admin/stats', (req, res) => {
  const db = readDB();
  const stats = db.stats[0];
  
  res.json({
    success: true,
    data: stats
  });
});

app.get('/api/admin/users', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const db = readDB();
  
  const start = (page - 1) * pageSize;
  const end = start + parseInt(pageSize);
  const paginatedUsers = db.users.slice(start, end);
  
  const usersWithoutPassword = paginatedUsers.map(({ password, ...user }) => user);
  
  res.json({
    success: true,
    data: {
      data: usersWithoutPassword,
      total: db.users.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(db.users.length / pageSize)
    }
  });
});

app.patch('/api/admin/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === id);
  
  if (userIndex !== -1) {
    db.users[userIndex] = {
      ...db.users[userIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    writeDB(db);
    
    const { password, ...userWithoutPassword } = db.users[userIndex];
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Mock API Server is running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api\n`);
  console.log('Available endpoints:');
  console.log('  POST   /api/auth/login');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/logout');
  console.log('  GET    /api/auth/me');
  console.log('  GET    /api/user/profile');
  console.log('  PUT    /api/user/profile');
  console.log('  GET    /api/admin/stats');
  console.log('  GET    /api/admin/users');
  console.log('  PATCH  /api/admin/users/:id/status\n');
  console.log('Test credentials:');
  console.log('  Admin: admin@example.com / password123');
  console.log('  User:  user@example.com / password123\n');
});
