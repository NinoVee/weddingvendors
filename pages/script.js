import { createClient } from '../lib/supabase.js'

console.log("✅ script.js loaded");

const SUPABASE_URL = 'https://mtbwumonjqhxhkgcvdig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Ynd1bW9uanFoeGhrZ2N2ZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzUyMTYsImV4cCI6MjA2NDY1MTIxNn0.QduNZinoGi5IeJfu0Ovi6H4Eh4kCIEeW-RGGypfN57o';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Vendor filtering
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

// Load approved vendors directly from Supabase
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

// Form and button bindings
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('shownewlywedModal')?.addEventListener('click', shownewlywedModal);
  document.getElementById('showModal')?.addEventListener('click', showModal);

  // Vendor form submission (skip file upload for now if edge function doesn't support it)
  const vendorForm = document.getElementById('vendors');
  if (vendorForm) {
    vendorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = vendorForm.vendorName.value;
      const email = vendorForm.vendorEmail.value;
      const location = vendorForm.vendorLocation.value;
      const category = vendorForm.vendorCategory.value;
      const link = vendorForm.vendorLink.value;
      const description = vendorForm.vendorDescription.value;

      try {
        const { error } = await supabase.from("vendors").insert([
          { name, email, location, category, link, description, approved: false }
        ]);
        if (error) {
          console.error(error);
          return showSuccessBanner('Vendor submission failed.');
        }
        vendorForm.reset();
        hideModal();
        showSuccessBanner('Vendor submitted!');
        loadApprovedVendors();
      } catch (err) {
        console.error('Unexpected error:', err);
        showSuccessBanner('Unexpected error occurred.');
      }
    });
  }

  // Newlywed form submission (this one uses Edge Function)
  const newlywedForm = document.getElementById('newlyweds');
  if (newlywedForm) {
    newlywedForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newlywedName')?.value;
      const email = document.getElementById('newlywedEmail')?.value;
      const wedding_date = document.getElementById('weddingDate')?.value;
      const details = document.getElementById('weddingDetails')?.value;

      try {
        const res = await fetch(`https://mtbwumonjqhxhkgcvdig.supabase.co/functions/v1/bright-function`, {
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
        showSuccessBanner('Unexpected error occurred.');
      }
    });
  }

  loadApprovedVendors();
});
