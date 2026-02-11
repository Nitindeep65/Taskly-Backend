import express from "express";
import { 
  getProjects, 
  getAllProjects,
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from "../Controllers/projectControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/getProjects', authMiddleware, getProjects);
router.get('/getAllProjects', authMiddleware, getAllProjects);
router.get('/:id', authMiddleware, getProjectById);
router.post('/create', authMiddleware, createProject);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);

export default router;
