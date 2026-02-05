import express from "express";
import { getTodos, createTodo, deleteTodo , updateTodo } from "../Controllers/todoControllers.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Import the middleware

const router = express.Router();

router.get('/getTodos', authMiddleware, getTodos);
router.post('/createTodo', authMiddleware, createTodo);
router.delete('/deleteTodo/:id', authMiddleware, deleteTodo);
router.put('/updateTodo/:id', authMiddleware, updateTodo);

export default router;