// script.js
const supabase = createClient('https://mtbwumonjqhxhkgcvdig.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Ynd1bW9uanFoeGhrZ2N2ZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzUyMTYsImV4cCI6MjA2NDY1MTIxNn0.QduNZinoGi5IeJfu0Ovi6H4Eh4kCIEeW-RGGypfN57o');

function showModal() {
  document.getElementById('vendorModal').style.display = 'flex';
}
function hideModal() {
  document.getElementById('vendorModal').style.display = 'none';
}
function shownewlywedModal() {
  document.getElementById('newlywedModal').style.display = 'flex';
}
function hidenewlywedModal() {
  document.getElementById('newlywedModal').style.display = 'none';
}

function filterVendors() {
  const keyword = document.getElementById('vendorSearch').value.toLowerCase();
  const location = document.getElementById('locationFilter').value;
  const category = document.getElementById('categoryFilter').value;

  const cards = document.getElementsByClassName('vendor-card');
  for (let card of cards) {
    const text = card.textContent.toLowerCase();
    const cardLocation = card.getAttribute('data-location');
    const cardCategory = card.getAttribute('data-category');
    const matchText = text.includes(keyword);
    const matchLocation = !location || cardLocation === location;
    const matchCategory = !category || cardCategory === category;
    card.style.display = (matchText && matchLocation && matchCategory) ? '' : 'none';
  }
}

document.getElementById('vendorForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('vendorName').value;
  const email = document.getElementById('vendorEmail').value;
  const location = document.getElementById('vendorLocation').value;
  const category = document.getElementById('vendorCategory').value;
  const link = document.getElementById('vendorLink').value;
  const description = document.getElementById('vendorDescription').value;

  const { data, error } = await supabase.from('vendors').insert([{ name, email, location, category, link, description }]);
  if (error) {
    alert('Submission failed!');
  } else {
    alert('Vendor submitted!');
    hideModal();
    await fetch('https://mtbwumonjqhxhkgcvdig.supabase.co/functions/v1/hyper-function', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, location, category, link, description })
    });
  }
});

document.getElementById('newlywedForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('newlywedName').value;
  const email = document.getElementById('newlywedEmail').value;
  const wedding_date = document.getElementById('weddingDate').value;
  const details = document.getElementById('weddingDetails').value;
  
  const { data, error } = await supabase.from('vendors').insert([{ name, email, wedding_date, details }]);
  if (error) {
    alert('Submission failed!');
} else {
  alert('Vendor submitted!');
  hideModal();
  await fetch('https://mtbwumonjqhxhkgcvdig.supabase.co/functions/v1/bright-function', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, wedding_date, details })
    });
  }
});
