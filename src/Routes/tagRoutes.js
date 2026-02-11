import express from "express";
import { getTags, createTag, deleteTag } from "../Controllers/tagControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/getTags', authMiddleware, getTags);
router.post('/create', authMiddleware, createTag);
router.delete('/:id', authMiddleware, deleteTag);

export default router;
