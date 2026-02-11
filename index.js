import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";

import authRoutes from './src/Routes/authRoutes.js';
import todoRoutes from './src/Routes/todoRoutes.js';
import projectRoutes from './src/Routes/projectRoutes.js';
import tagRoutes from './src/Routes/tagRoutes.js';
import aiRoutes from './src/Routes/aiRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/project", projectRoutes);
app.use("/tag", tagRoutes);
app.use("/ai", aiRoutes);


const PORT = process.env.PORT || 5001;

app.listen(PORT,()=>{
    console.log('🚀 Server is running on port ' + PORT); 
    console.log('📊 Routes mounted: /auth, /todo, /project, /tag, /ai');
})