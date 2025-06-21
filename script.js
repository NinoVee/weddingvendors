console.log("✅ script.js loaded");

const SUPABASE_URL = 'https://mtbwumonjqhxhkgcvdig.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Modal Controls
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
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('approved', true);

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

   // When page loads
  document.addEventListener('DOMContentLoaded', () => {

  // Modal Buttons
  document.getElementById('shownewlywedModal')?.addEventListener('click', shownewlywedModal);
  document.getElementById('showModal')?.addEventListener('click', showModal);

  // Vendor Form Submit
  const vendorForm = document.getElementById('vendorForm');
  if (vendorForm) {
    vendorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;

      const payload = {
        name: form.vendorName.value,
        email: form.vendorEmail.value,
        company_name: form.vendorCompany.value,
        category: form.vendorCategory.value,
        location: form.vendorLocation.value,
        details: form.vendorDescription.value
      };

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/vendor-submission`, {
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
        alert('Vendor submitted successfully!');
        hideModal();
        loadApprovedVendors();
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('An unexpected error occurred.');
      }
    });
  }

  // Newlywed Form
  const newlywedForm = document.getElementById('newlywedForm');
  if (newlywedForm) {
    newlywedForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newlywedName')?.value;
      const email = document.getElementById('newlywedEmail')?.value;
      const wedding_date = document.getElementById('weddingDate')?.value;
      const details = document.getElementById('weddingDetails')?.value;

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/bright-function`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, wedding_date, details })
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(errorText);
          return alert('Newlywed submission failed.');
        }

        newlywedForm.reset();
        alert('Newlywed application submitted!');
        hidenewlywedModal();
        loadApprovedVendors();
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('An unexpected error occurred.');
      }
    });
  }

  loadApprovedVendors();
});
