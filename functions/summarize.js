export async function onRequestPost({ request }) {
  const { notes, prompt } = await request.json();
  
  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "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", // Replace with your key
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