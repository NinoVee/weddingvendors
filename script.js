console.log("✅ script.js loaded");

// Make sure Supabase is loaded in your HTML via CDN:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Initialize Supabase client
const SUPABASE_URL = 'https://mtbwumonjqhxhkgcvdig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Ynd1bW9uanFoeGhrZ2N2ZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzUyMTYsImV4cCI6MjA2NDY1MTIxNn0.QduNZinoGi5IeJfu0Ovi6H4Eh4kCIEeW-RGGypfN57o';

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

console.log("✅ script.js loaded");

// Make sure Supabase is loaded in your HTML via CDN:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Initialize Supabase client
const SUPABASE_URL = 'https://mtbwumonjqhxhkgcvdig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Ynd1bW9uanFoeGhrZ2N2ZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzUyMTYsImV4cCI6MjA2NDY1MTIxNn0.QduNZinoGi5IeJfu0Ovi6H4Eh4kCIEeW-RGGypfN57o';

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

// Success Banner Display
function showSuccessBanner(message) {
  const banner = document.getElementById('successBanner');
  if (!banner) return;
  banner.textContent = message;
  banner.style.display = 'block';
  setTimeout(() => { banner.style.display = 'none'; }, 4000);
}

// Load Approved Vendors Dynamically
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

// DOM Ready - Main App Logic
document.addEventListener('DOMContentLoaded', () => {

  // Attach modal open buttons
  document.getElementById('showModal')?.addEventListener('click', showModal);
  document.getElementById('shownewlywedModal')?.addEventListener('click', showNewlywedModal);

  // Vendor Form Submit
  const vendorForm = document.getElementById('vendorForm');
  if (vendorForm) {
    vendorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const file = document.getElementById('vendorMedia')?.files[0];
      const formData = new FormData();

      formData.append('name', form.vendorName.value);
      formData.append('email', form.vendorEmail.value);
      formData.append('location', form.vendorLocation.value);
      formData.append('category', form.vendorCategory.value);
      formData.append('link', form.vendorLink.value);
      formData.append('description', form.vendorDescription.value);
      if (file) formData.append('media', file);

      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/hyper-function`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.success) {
          form.reset();
          hideModal();
          showSuccessBanner('Vendor submitted successfully!');
        } else {
          console.error('Vendor submission failed:', result);
          showSuccessBanner('Vendor submission failed: ' + (result.message || 'Unknown error.'));
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        showSuccessBanner('An unexpected error occurred.');
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
          return showSuccessBanner('Newlywed submission failed.');
        }

        newlywedForm.reset();
        hidenewlywedModal();
        showSuccessBanner('Newlywed application submitted!');
      } catch (err) {
        console.error('Unexpected error:', err);
        showSuccessBanner('An unexpected error occurred.');
      }
    });
  }

  // Initial vendor load
  loadApprovedVendors();
});
