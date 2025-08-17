async function generateSummary() {
  const notes = document.getElementById('notes').value;
  const prompt = document.getElementById('prompt').value;
  
const response = await fetch('/api/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notes, prompt })
});
  const data = await response.json();
  document.getElementById('summary').innerHTML = data.summary;
}

function shareSummary() {
  const emails = document.getElementById('email').value;
  const summary = document.getElementById('summary').innerText;
  window.location.href = `mailto:${emails}?subject=Meeting Summary&body=${encodeURIComponent(summary)}`;
}