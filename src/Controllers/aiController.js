import Perplexity from '@perplexity-ai/perplexity_ai';

export const generateTasks = async (req, res) => {
  try {
    const { projectName, projectDescription } = req.body;
    
    if (!projectName?.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }
    
    if (!process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY === 'your-perplexity-api-key-here') {
      return res.status(503).json({ 
        error: "AI service not configured. Please add PERPLEXITY_API_KEY to environment variables." 
      });
    }
    
    const client = new Perplexity({
      apiKey: process.env.PERPLEXITY_API_KEY
    });
    
    const prompt = `As a software project manager, generate a comprehensive list of engineering tasks for the following project:

Project Name: ${projectName.trim()}
${projectDescription ? `Description: ${projectDescription.trim()}` : ''}

Please generate 8-12 specific, actionable tasks that cover:
- Backend development tasks
- Frontend development tasks
- Testing requirements
- Design considerations if applicable
- Documentation needs

For each task, provide:
1. A short name (2-5 words)
2. A clear title describing the task
3. A detailed description of what needs to be done
4. Suggested status: URGENT or ONGOING
5. Suggested tags: Choose from [Backend, Frontend, Testing, Design, Documentation, DevOps, Database]

Return ONLY valid JSON array format with no markdown formatting, no code blocks, no explanations. Just the raw JSON array like this:
[
  {
    "name": "Setup Database",
    "title": "Configure PostgreSQL database schema",
    "description": "Set up the database with required tables and relationships",
    "suggestedStatus": "URGENT",
    "suggestedTags": ["Backend", "Database"]
  }
]`;

    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'sonar',
    });
    
    let generatedText = response.choices?.[0]?.message?.content || '';
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let tasks;
    try {
      tasks = JSON.parse(generatedText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Generated text:", generatedText);
      return res.status(500).json({ 
        error: "Failed to parse AI response. Please try again.",
        details: "The AI returned an invalid format."
      });
    }
    
    if (!Array.isArray(tasks)) {
      return res.status(500).json({ error: "Invalid response format from AI" });
    }
    
    const validTasks = tasks.filter(task => {
      return task.name && task.title && task.description;
    }).map(task => ({
      name: task.name.substring(0, 100),
      title: task.title.substring(0, 200),
      description: task.description.substring(0, 1000),
      suggestedStatus: ['URGENT', 'ONGOING', 'COMPLETED'].includes(task.suggestedStatus) 
        ? task.suggestedStatus 
        : 'ONGOING',
      suggestedTags: Array.isArray(task.suggestedTags) 
        ? task.suggestedTags.filter(tag => 
            ['Backend', 'Frontend', 'Testing', 'Design', 'Documentation', 'DevOps', 'Database'].includes(tag)
          )
        : []
    }));
    
    if (validTasks.length === 0) {
      return res.status(500).json({ error: "No valid tasks generated" });
    }
    
    res.json({ tasks: validTasks });
    
  } catch (error) {
    console.error("Generate tasks error:", error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: "Request timeout. Please try again." });
    }
    
    if (error.response) {
      console.error("API error response:", error.response.data);
      return res.status(error.response.status).json({ 
        error: "AI service error",
        details: error.response.data.error || "Unknown error occurred"
      });
    }
    
    res.status(500).json({ error: "Failed to generate tasks" });
  }
};

export const generateProjectSummary = async (req, res) => {
  try {
    const { projectName, projectDescription, tasks } = req.body;
    
    if (!projectName?.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }
    
    if (!process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY === 'your-perplexity-api-key-here') {
      return res.status(503).json({ 
        error: "AI service not configured. Please add PERPLEXITY_API_KEY to environment variables." 
      });
    }
    
    const client = new Perplexity({
      apiKey: process.env.PERPLEXITY_API_KEY
    });
    
    const taskInfo = tasks && tasks.length > 0 
      ? `\n\nCurrent Tasks (${tasks.length} tasks):\n${tasks.map(t => `- ${t.name}: ${t.title} [${t.status}]`).join('\n')}`
      : '';
    
    const prompt = `You are a software project advisor. Provide a concise, well-structured summary for this project.

Project Name: ${projectName.trim()}
${projectDescription ? `Description: ${projectDescription.trim()}` : ''}${taskInfo}

Provide your response in this EXACT format with these 3 sections:

OVERVIEW:
[2-3 sentences about what this project is and its core purpose]

KEY RECOMMENDATIONS:
• [First actionable recommendation]
• [Second actionable recommendation]  
• [Third actionable recommendation]

POTENTIAL CHALLENGES:
• [First challenge to watch out for]
• [Second challenge to consider]

KEEP IT:
- Concise and actionable
- Free of citations or reference numbers like [1] or [2]
- Professional but conversational
- Under 200 words total`;

    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'sonar',
    });
    
    const summary = response.choices?.[0]?.message?.content || '';
    
    if (!summary || summary.trim() === '') {
      console.error("Empty summary from Perplexity. Full response:", response);
      return res.status(500).json({ 
        error: "AI returned empty response. Please try again."
      });
    }
    
    res.json({ summary: summary.trim() });
    
  } catch (error) {
    console.error("Generate summary error:", error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: "Request timeout. Please try again." });
    }
    
    if (error.response) {
      console.error("API error response:", error.response.data);
      return res.status(error.response.status).json({ 
        error: "AI service error",
        details: error.response.data.error || "Unknown error occurred"
      });
    }
    
    res.status(500).json({ error: "Failed to generate summary" });
  }
};
