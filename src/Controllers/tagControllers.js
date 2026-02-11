import prisma from "../config/prisma.js";

export const getTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      where: {
        OR: [
          { userId: null },
          { userId: parseInt(req.userId) }
        ]
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });
    
    res.json(tags);
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

export const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: "Tag name is required" });
    }
    
    if (name.trim().length > 30) {
      return res.status(400).json({ error: "Tag name must be 30 characters or less" });
    }
    
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: name.trim(),
        OR: [
          { userId: parseInt(req.userId) },
          { userId: null }
        ]
      }
    });
    
    if (existingTag) {
      return res.status(400).json({ error: "A tag with this name already exists" });
    }
    
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: "Invalid color format. Use hex color (e.g., #FF5733)" });
    }
    
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || '#6B7280',
        type: 'CUSTOM',
        userId: parseInt(req.userId)
      }
    });
    
    res.status(201).json(tag);
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }
    
    if (tag.type === 'PREDEFINED' || tag.userId === null) {
      return res.status(403).json({ error: "Cannot delete predefined tags" });
    }
    
    if (tag.userId !== parseInt(req.userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    await prisma.tag.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
};
