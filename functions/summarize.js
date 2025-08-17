export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle API requests
    if (url.pathname === '/api/summarize' && request.method === 'POST') {
      const { notes, prompt } = await request.json();
      
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.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}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Summarize: ${notes}\nInstructions: ${prompt}`
          }],
          model: "mixtral-8x7b-32768"
        })
      });
      
      const data = await groqResponse.json();
      return new Response(JSON.stringify({ summary: data.choices[0].message.content }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle root requests
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response('Meeting Summarizer API is running. Use POST /api/summarize to generate summaries.', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}