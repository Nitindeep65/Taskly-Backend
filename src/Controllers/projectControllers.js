import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: parseInt(req.userId) },
      include: {
        _count: {
          select: { todos: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: parseInt(req.userId) },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(projects);
  } catch (error) {
    console.error("Get all projects error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        todos: {
          include: {
            tags: {
              include: {
                tag: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    if (project.userId !== parseInt(req.userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    res.json(project);
  } catch (error) {
    console.error("Get project by id error:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }
    
    if (name.trim().length > 100) {
      return res.status(400).json({ error: "Project name must be 100 characters or less" });
    }
    
    if (description && description.length > 1000) {
      return res.status(400).json({ error: "Description must be 1000 characters or less" });
    }
    
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: "Invalid color format. Use hex color (e.g., #FF5733)" });
    }
    
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        userId: parseInt(req.userId)
      }
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    
    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    if (existingProject.userId !== parseInt(req.userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    if (name && name.trim().length > 100) {
      return res.status(400).json({ error: "Project name must be 100 characters or less" });
    }
    
    if (description && description.length > 1000) {
      return res.status(400).json({ error: "Description must be 1000 characters or less" });
    }
    
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: "Invalid color format. Use hex color (e.g., #FF5733)" });
    }
    
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        name: name?.trim() || existingProject.name,
        description: description?.trim() || existingProject.description,
        color: color || existingProject.color
      }
    });
    
    res.json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    if (project.userId !== parseInt(req.userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    await prisma.project.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};
