import express from "express";
import { generateTasks, generateProjectSummary } from "../Controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/generate-tasks', authMiddleware, generateTasks);
router.post('/generate-summary', authMiddleware, generateProjectSummary);

export default router;
