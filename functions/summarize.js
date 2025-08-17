export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle API requests
    if (url.pathname === '/api/summarize') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }
      
      if (request.method === 'POST') {
        try {
          const { notes, prompt } = await request.json();
          
          const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.GROQ_API_KEY}`,
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
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Serve frontend HTML for all other routes
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>AI Meeting Notes Summarizer</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        textarea, input[type="text"] {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        textarea {
          min-height: 150px;
          resize: vertical;
        }
        button {
          background-color: #4285f4;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        button:hover {
          background-color: #3367d6;
        }
        #summary {
          min-height: 200px;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
          background-color: #f9f9f9;
        }
        .share-section {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        #emails {
          flex-grow: 1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📝 AI Meeting Summarizer</h1>
        
        <div class="input-section">
          <textarea id="notes" placeholder="Paste meeting notes here..."></textarea>
          <input type="text" id="prompt" placeholder="Custom instruction (e.g. 'Summarize in bullet points')">
          <button id="generate-btn">Generate Summary</button>
        </div>
        
        <div class="output-section">
          <div id="summary" contenteditable="true" placeholder="AI summary will appear here..."></div>
          <div class="share-section">
            <input type="text" id="emails" placeholder="Recipient emails (comma separated)">
            <button id="share-btn">Share via Email</button>
          </div>
        </div>
      </div>
      
      <script>
        const API_URL = '/api/summarize';
        
        document.getElementById('generate-btn').addEventListener('click', async () => {
          const notes = document.getElementById('notes').value;
          const prompt = document.getElementById('prompt').value;
          
          if (!notes) {
            alert('Please enter meeting notes');
            return;
          }

          try {
            const response = await fetch(API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ notes, prompt })
            });
            
            if (!response.ok) {
              throw new Error('Failed to generate summary');
            }
            
            const data = await response.json();
            document.getElementById('summary').innerHTML = data.summary;
          } catch (error) {
            alert('Error: ' + error.message);
            console.error(error);
          }
        });

        document.getElementById('share-btn').addEventListener('click', () => {
          const emails = document.getElementById('emails').value;
          const summary = document.getElementById('summary').innerText;
          
          if (!emails) {
            alert('Please enter recipient emails');
            return;
          }
          
          if (!summary) {
            alert('Please generate a summary first');
            return;
          }
          
          const subject = 'Meeting Summary';
          const body = \`Here's the meeting summary:\\n\\n\${summary}\`;
          const mailtoLink = \`mailto:\${emails}?subject=\${encodeURIComponent(subject)}&body=\${encodeURIComponent(body)}\`;
          
          window.location.href = mailtoLink;
        });
      </script>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      }
    });
  }