import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const getTodos = async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: parseInt(req.userId) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTodo =  async(req ,res ) =>{
    try {
        const {name , title , status , description}= req.body;
        if(!name?.trim() || !title?.trim()){
            return res.status(400).json({error:"Name and title required"})
        }

        const todo = await prisma.todo.create({
            data : {
                name : name.trim(),
                title : title.trim(),
                status : status?.trim() || "ONGOING",
                description : description?.trim() || null ,
                userId : parseInt(req.userId)
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
    const {name , title , priority ,description}= req.body;

    const todo = await prisma.todo.findUnique({
    where : {id :parseInt(id)}
    })
    if(todo.userId !== req.userId){
      return res.status(403).json({error : "Unauthorized User"})
    }

    const updatedTodo = await prisma.todo.update({
      where : {id : parseInt (id)},
      data : {
        name : name?.trim() || todo.name,
        title : title?.trim() || todo.title,
        priority : priority?.trim() || todo.priority,
        description : description?.trim() || todo.description
      }
    })
    return res.status(200).json(updatedTodo); 
  }catch(error){
    console.error(error);
    return res.status(500).json({ error: "List not updated "
    })
  }
}