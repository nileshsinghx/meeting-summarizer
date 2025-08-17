export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Handle API requests
    if (url.pathname === '/api/summarize' && request.method === 'POST') {
      try {
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
              content: `Meeting notes: ${notes}\n\nInstructions: ${prompt || "Provide a concise summary"}`
            }],
            model: "mixtral-8x7b-32768"
          })
        });
        
        const data = await groqResponse.json();
        return new Response(JSON.stringify({ 
          summary: data.choices[0].message.content 
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: "Failed to generate summary" 
        }), { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Default response
    return new Response(JSON.stringify({ 
      message: "Meeting Summarizer API", 
      endpoints: { 
        summarize: "POST /api/summarize" 
      } 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}