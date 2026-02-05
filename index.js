import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";

import authRoutes from './src/Routes/authRoutes.js';
import todoRoutes from './src/Routes/todoRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/todo" , todoRoutes)


const PORT = process.env.PORT || 5001;

app.listen(PORT,()=>{
    console.log('server is running on port ' + PORT); 
})