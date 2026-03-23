const Groq = require('groq-sdk');

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;

        const client = new Groq({ apiKey: process.env.GEMINI_KEY });

        const systemPrompt = `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[EXAMPLES]: ${testCases}
[startCode]: ${startCode}

## YOUR CAPABILITIES:
1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
2. **Code Reviewer**: Debug and fix code submissions with explanations
3. **Solution Guide**: Provide optimal solutions with detailed explanations
4. **Complexity Analyzer**: Explain time and space complexity trade-offs
5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
6. **Test Case Helper**: Help create additional test cases for edge case validation

## INTERACTION GUIDELINES:

### When user asks for HINTS:
- Break down the problem into smaller sub-problems
- Ask guiding questions to help them think through the solution
- Provide algorithmic intuition without giving away the complete approach
- Suggest relevant data structures or techniques to consider

### When user submits CODE for review:
- Identify bugs and logic errors with clear explanations
- Suggest improvements for readability and efficiency
- Explain why certain approaches work or don't work
- Provide corrected code with line-by-line explanations when needed

### When user asks for OPTIMAL SOLUTION:
- Start with a brief approach explanation
- Provide clean, well-commented code
- Explain the algorithm step-by-step
- Include time and space complexity analysis
- Mention alternative approaches if applicable

### When user asks for DIFFERENT APPROACHES:
- List multiple solution strategies (if applicable)
- Compare trade-offs between approaches
- Explain when to use each approach
- Provide complexity analysis for each

## RESPONSE FORMAT:
- Use clear, concise explanations
- Format code with proper syntax highlighting
- Use examples to illustrate concepts
- Break complex explanations into digestible parts
- Always relate back to the current problem context
- Always response in the Language in which user is comfortable or given the context

## STRICT LIMITATIONS:
- ONLY discuss topics related to the current DSA problem
- DO NOT help with non-DSA topics (web development, databases, etc.)
- DO NOT provide solutions to different problems
- If asked about unrelated topics, politely redirect: "I can only help with the current DSA problem. What specific aspect of this problem would you like assistance with?"

## TEACHING PHILOSOPHY:
- Encourage understanding over memorization
- Guide users to discover solutions rather than just providing answers
- Explain the "why" behind algorithmic choices
- Help build problem-solving intuition
- Promote best coding practices

Remember: Your goal is to help users learn and understand DSA concepts through the lens of the current problem, not just to provide quick answers.
`;

        const formattedMessages = messages.map(msg => ({
            role: msg.role === "model" ? "assistant" : msg.role,
            content: typeof msg.content === "string"
                ? msg.content
                : msg.parts?.[0]?.text ?? ""
        }));

        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                ...formattedMessages
            ],
        });

        const reply = response.choices[0].message.content;
        console.log(reply);
        res.status(201).json({ message: reply });

    } catch (err) {
        console.error("solveDoubt error:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// ── COMPLEXITY ANALYSER ────────────────────────────────────
const analyseComplexity = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || !language)
            return res.status(400).json({ message: 'Code and language are required' });

        const client = new Groq({ apiKey: process.env.GEMINI_KEY });

        const prompt = `Analyse the time and space complexity of this ${language} code.
Respond ONLY with a valid JSON object — no markdown, no backticks, no text outside the JSON.

{
  "timeComplexity": "O(n²)",
  "spaceComplexity": "O(n)",
  "bestCase": "O(n)",
  "worstCase": "O(n²)",
  "explanation": "2-3 sentences explaining WHY these complexities exist",
  "loops": [
    { "description": "Outer loop iterates n times", "complexity": "O(n)" },
    { "description": "Inner loop iterates n-i times", "complexity": "O(n)" }
  ],
  "optimizationTip": "One concrete suggestion to improve the complexity"
}

Code:
\`\`\`${language}
${code}
\`\`\``;

        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
        });

        const raw = response.choices[0]?.message?.content || '';
        const clean = raw.replace(/```json|```/g, '').trim();
        const result = JSON.parse(clean);

        res.status(200).json(result);

    } catch (err) {
        console.error("analyseComplexity error:", err.message);
        res.status(500).json({ message: "Analysis failed: " + err.message });
    }
};


module.exports = { solveDoubt, analyseComplexity };
