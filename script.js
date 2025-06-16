console.log("✅ script.js loaded");

// Initialize Supabase client (make sure the Supabase script is loaded in your HTML)
const SUPABASE_URL = 'https://mtbwumonjqhxhkgcvdig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Ynd1bW9uanFoeGhrZ2N2ZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzUyMTYsImV4cCI6MjA2NDY1MTIxNn0.QduNZinoGi5IeJfu0Ovi6H4Eh4kCIEeW-RGGypfN57o';
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

// Banner display
function showSuccessBanner(message) {
  const banner = document.getElementById('successBanner');
  if (!banner) return;
  banner.textContent = message;
  banner.style.display = 'block';
  setTimeout(() => {
    banner.style.display = 'none';
  }, 4000);
}

// Vendor Filtering
function filterVendors() {
  const keyword = document.getElementById('vendorSearch').value.toLowerCase();
  const location = document.getElementById('locationFilter').value;
  const category = document.getElementById('categoryFilter').value;
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

// Load approved vendors from Supabase
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const vendorButton = document.getElementById('showModal');
  const newlywedButton = document.getElementById('shownewlywedModal');
  const vendorForm = document.getElementById('vendorForm');
  const newlywedForm = document.getElementById('newlywedForm');

  if (vendorButton) vendorButton.addEventListener('click', showModal);
  if (newlywedButton) newlywedButton.addEventListener('click', shownewlywedModal);

  // Handle vendor form submission
  if (vendorForm) {
    vendorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const file = document.getElementById('vendorMedia').files[0];
      const formData = new FormData();

      formData.append('name', form.vendorName.value);
      formData.append('email', form.vendorEmail.value);
      formData.append('location', form.vendorLocation.value);
      formData.append('category', form.vendorCategory.value);
      formData.append('link', form.vendorLink.value);
      formData.append('description', form.vendorDescription.value);
      if (file) formData.append('media', file);

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/hyper-function`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('Vendor Error:', errorText);
          return showSuccessBanner('Vendor submission failed.');
        }

        form.reset();
        hideModal();
        showSuccessBanner('Vendor submitted!');
      } catch (err) {
        console.error('Unexpected error:', err);
        showSuccessBanner('An error occurred during vendor submission.');
      }
    });
  }

  // Handle newlywed form submission
  if (newlywedForm) {
    newlywedForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newlywedName').value;
      const email = document.getElementById('newlywedEmail').value;
      const wedding_date = document.getElementById('weddingDate').value;
      const details = document.getElementById('weddingDetails').value;

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/bright-function`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, wedding_date, details }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('Newlywed Error:', errorText);
          return showSuccessBanner('Newlywed submission failed.');
        }

        newlywedForm.reset();
        hidenewlywedModal();
        showSuccessBanner('Newlywed application submitted!');
      } catch (err) {
        console.error('Unexpected error:', err);
        showSuccessBanner('An error occurred during newlywed submission.');
      }
    });
  }

  // Load vendor cards on page load
  loadApprovedVendors();
});
