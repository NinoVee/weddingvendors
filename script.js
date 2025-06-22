console.log("✅ script.js loaded");

const SUPABASE_URL = 'https://mtbwumonjqhxhkgcvdig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Ynd1bW9uanFoeGhrZ2N2ZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzUyMTYsImV4cCI6MjA2NDY1MTIxNn0.QduNZinoGi5IeJfu0Ovi6H4Eh4kCIEeW-RGGypfN57o';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Modal Controls
function showModal() { document.getElementById('vendorModal').style.display = 'flex'; }
function hideModal() { document.getElementById('vendorModal').style.display = 'none'; }
function shownewlywedModal() { document.getElementById('newlywedModal').style.display = 'flex'; }
function hidenewlywedModal() { document.getElementById('newlywedModal').style.display = 'none'; }

// Vendor Filtering
function filterVendors() {
  const keyword = document.getElementById('vendorSearch')?.value.toLowerCase() || '';
  const location = document.getElementById('locationFilter')?.value || '';
  const category = document.getElementById('categoryFilter')?.value || '';
  const cards = document.getElementsByClassName('vendor-card');

  for (let card of cards) {
    const text = card.textContent.toLowerCase();
    const loc = card.getAttribute('data-location');
    const cat = card.getAttribute('data-category');
    card.style.display =
      text.includes(keyword) &&
      (!location || loc === location) &&
      (!category || cat === category)
        ? ''
        : 'none';
  }
}

// Load Approved Vendors
async function loadApprovedVendors() {
  const { data, error } = await supabase.from('vendors').select('*').eq('approved', true);
  if (error) {
    console.error('❌ Vendor load error:', error);
    return;
  }
  const container = document.getElementById('vendorList');
  if (!container) return;
  container.innerHTML = '';
  data.forEach(vendor => {
    const card = document.createElement('div');
    card.className = 'vendor-card';
    card.setAttribute('data-location', vendor.location);
    card.setAttribute('data-category', vendor.category);
    card.innerHTML = `
      <img src="${vendor.media_url || 'https://via.placeholder.com/250x150'}" alt="${vendor.name}" />
      <h3>${vendor.name}</h3>
      <p>${vendor.category} – ${vendor.location}</p>
      <p><a href="${vendor.link}" target="_blank">${vendor.link}</a></p>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('shownewlywedModal')?.addEventListener('click', shownewlywedModal);
  document.getElementById('showModal')?.addEventListener('click', showModal);

  const vendorForm = document.getElementById('vendorForm');
  if (vendorForm) {
    vendorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const file = document.getElementById('vendorMedia')?.files[0];
      let media_url = null;

      if (file) {
        const { data, error } = await supabase.storage
          .from('vendor-media')
          .upload(`vendors/${Date.now()}_${file.name}`, file, { upsert: false });

        if (error) {
          console.error('❌ Media upload error:', error);
          return alert('Media upload failed.');
        }

        const { data: publicUrlData } = supabase
          .storage
          .from('vendor-media')
          .getPublicUrl(data.path);
        media_url = publicUrlData.publicUrl;
      }

      const payload = {
        name: form.vendorName.value,
        email: form.vendorEmail.value,
        location: form.vendorLocation.value,
        category: form.vendorCategory.value,
        link: form.vendorLink.value,
        description: form.vendorDescription.value,
        media_url
      };

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/hyper-function`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(errorText);
          return alert('Vendor submission failed.');
        }

        form.reset();
        alert('Vendor submitted!');
        hideModal();
        loadApprovedVendors();
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('An unexpected error occurred.');
      }
    });
  }

  loadApprovedVendors();
});
