export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      
      // Handle preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }

      // API endpoint
      if (url.pathname === '/api/summarize' && request.method === 'POST') {
        const { notes, prompt } = await request.json();
        
        console.log('Processing request with notes:', notes.substring(0, 50) + '...');
        
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: `Meeting notes:\n${notes}\n\nInstructions: ${prompt || "Provide a concise summary"}`
            }],
            model: "mixtral-8x7b-32768",
            temperature: 0.7
          })
        });

        if (!groqResponse.ok) {
          const error = await groqResponse.json();
          throw new Error(`Groq API error: ${JSON.stringify(error)}`);
        }

        const data = await groqResponse.json();
        return new Response(JSON.stringify({
          summary: data.choices[0].message.content
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Frontend
      const html = `<!DOCTYPE html><html>...</html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
}