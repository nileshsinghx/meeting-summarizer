export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle API requests
    if (url.pathname === '/api/summarize') {
      if (request.method === 'POST') {
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
                content: `Summarize these meeting notes: ${notes}\nInstructions: ${prompt}`
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
          return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      return new Response('Method Not Allowed', { status: 405 });
    }

    return new Response('Not Found', { status: 404 });
  }
}