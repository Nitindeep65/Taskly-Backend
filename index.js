import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import prisma from './src/config/prisma.js';

import authRoutes from './src/Routes/authRoutes.js';
import todoRoutes from './src/Routes/todoRoutes.js';
import projectRoutes from './src/Routes/projectRoutes.js';
import tagRoutes from './src/Routes/tagRoutes.js';
import aiRoutes from './src/Routes/aiRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'Connected', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/project", projectRoutes);
app.use("/tag", tagRoutes);
app.use("/ai", aiRoutes);


const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
    console.log('🚀 Server is running on port ' + PORT); 
    console.log('📊 Routes mounted: /auth, /todo, /project, /tag, /ai');
    console.log('🏥 Health check available at /health');
    
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }
})