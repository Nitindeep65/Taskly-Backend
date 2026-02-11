import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Ensure connection
prisma.$connect().catch(err => {
  console.error('Prisma connection error in todoControllers:', err);
});


export const getTodos = async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: parseInt(req.userId) },
      include: {
        project: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTodo =  async(req ,res ) =>{
    try {
        const {name , title , status , description, projectId, tagIds}= req.body;
        if(!name?.trim() || !title?.trim()){
            return res.status(400).json({error:"Name and title required"})
        }

        if (projectId) {
          const project = await prisma.project.findUnique({
            where: { id: parseInt(projectId) }
          });
          
          if (!project) {
            return res.status(404).json({error:"Project not found"});
          }
          
          if (project.userId !== parseInt(req.userId)) {
            return res.status(403).json({error:"Unauthorized - project doesn't belong to you"});
          }
        }

        if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
          const tags = await prisma.tag.findMany({
            where: {
              id: { in: tagIds.map(id => parseInt(id)) },
              OR: [
                { userId: parseInt(req.userId) },
                { userId: null }
              ]
            }
          });
          
          if (tags.length !== tagIds.length) {
            return res.status(404).json({error:"One or more tags not found"});
          }
        }

        const todo = await prisma.todo.create({
            data : {
                name : name.trim(),
                title : title.trim(),
                status : status?.trim() || "ONGOING",
                description : description?.trim() || null ,
                projectId: projectId ? parseInt(projectId) : null,
                userId : parseInt(req.userId),
                tags: tagIds && Array.isArray(tagIds) && tagIds.length > 0 ? {
                  create: tagIds.map(tagId => ({
                    tag: { connect: { id: parseInt(tagId) } }
                  }))
                } : undefined
            },
            include: {
              project: true,
              tags: {
                include: {
                  tag: true
                }
              }
            }
        });
      return res.status(201).json(todo);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteTodo = async (req , res)=>{
  try{
    const {id } = req.params;
    const todo = await prisma.todo.findUnique({
      where : {id : parseInt(id)}
    })
    if(todo.userId !== parseInt (req.userId)){
      return res.status(403).json({error : "Unauthorized"})
    }
    await prisma.todo.delete({
      where : {id : parseInt(id)}
    })
    return res.status(200).json({message : "Todo deleted successfully"});
  }catch(error){
    console.error(error);
    return res.status(500).json({ error: "Internal server error"
    })
  }
}

export  const updateTodo = async (req , res)=>{
  try{
    const {id}= req.params;
    const {name , title , status , description, projectId, tagIds}= req.body;

    const todo = await prisma.todo.findUnique({
    where : {id :parseInt(id)}
    })
    
    if (!todo) {
      return res.status(404).json({error : "Todo not found"})
    }
    
    if(todo.userId !== parseInt(req.userId)){
      return res.status(403).json({error : "Unauthorized User"})
    }

    if (projectId !== undefined && projectId !== null) {
      const project = await prisma.project.findUnique({
        where: { id: parseInt(projectId) }
      });
      
      if (!project) {
        return res.status(404).json({error:"Project not found"});
      }
      
      if (project.userId !== parseInt(req.userId)) {
        return res.status(403).json({error:"Unauthorized - project doesn't belong to you"});
      }
    }

    let tagOperations = {};
    if (tagIds !== undefined) {
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        const tags = await prisma.tag.findMany({
          where: {
            id: { in: tagIds.map(id => parseInt(id)) },
            OR: [
              { userId: parseInt(req.userId) },
              { userId: null }
            ]
          }
        });
        
        if (tags.length !== tagIds.length) {
          return res.status(404).json({error:"One or more tags not found"});
        }
        
        tagOperations = {
          deleteMany: {},
          create: tagIds.map(tagId => ({
            tag: { connect: { id: parseInt(tagId) } }
          }))
        };
      } else {
        tagOperations = {
          deleteMany: {}
        };
      }
    }

    const updatedTodo = await prisma.todo.update({
      where : {id : parseInt (id)},
      data : {
        name : name?.trim() || todo.name,
        title : title?.trim() || todo.title,
        status : status?.trim() || todo.status,
        description : description !== undefined ? (description?.trim() || null) : todo.description,
        projectId: projectId !== undefined ? (projectId ? parseInt(projectId) : null) : todo.projectId,
        ...(tagIds !== undefined && { tags: tagOperations })
      },
      include: {
        project: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })
    return res.status(200).json(updatedTodo); 
  }catch(error){
    console.error(error);
    return res.status(500).json({ error: "Failed to update todo"
    })
  }
}