const API_URL = 'https://90ca4418-meeting-summarizer.nileshdotin.workers.dev/api/summarize';

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
  const body = `Here's the meeting summary:\n\n${summary}`;
  const mailtoLink = `mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  window.location.href = mailtoLink;
});