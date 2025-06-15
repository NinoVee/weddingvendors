console.log("✅ script.js loaded");

const SUPABASE_URL = 'https://mtbwumonjqhxhkgcvdig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
function showSuccessBanner(message) {
  const banner = document.getElementById('successBanner');
  banner.textContent = message;
  banner.style.display = 'block';
  setTimeout(() => {
    banner.style.display = 'none';
  }, 4000);
}

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

async function loadApprovedVendors() {
  const { data, error } = await supabase.from('vendors').select('*').eq('approved', true);
  if (error) return console.error('Vendor load error:', error);
  const container = document.getElementById('vendorList');
  container.innerHTML = '';
  data.forEach(vendor => {
    const card = document.createElement('div');
    card.className = 'vendor-card';
    card.setAttribute('data-location', vendor.location);
    card.setAttribute('data-category', vendor.category);
    card.innerHTML = `
      <img src="${vendor.media_url || 'https://via.placeholder.com/250x150'}" />
      <h3>${vendor.name}</h3>
      <p>${vendor.category} – ${vendor.location}</p>
      <p><a href="${vendor.link}" target="_blank">${vendor.link}</a></p>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('showNewlywedModal').addEventListener('click', shownewlywedModal);
  document.getElementById('showVendorModal').addEventListener('click', showModal);

  document.getElementById('vendorForm').addEventListener('submit', async e => {
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

    const res = await fetch(`${SUPABASE_URL}/functions/v1/hyper-function`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      console.error(await res.text());
      return showSuccessBanner('Vendor submission failed.');
    }

    form.reset();
    hideModal();
    showSuccessBanner('Vendor submitted!');
  });

  document.getElementById('newlywedForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('newlywedName').value;
    const email = document.getElementById('newlywedEmail').value;
    const wedding_date = document.getElementById('weddingDate').value;
    const details = document.getElementById('weddingDetails').value;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/bright-function`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, wedding_date, details })
    });

    if (!res.ok) {
      console.error(await res.text());
      return showSuccessBanner('Newlywed submission failed.');
    }

    document.getElementById('newlywedForm').reset();
    hidenewlywedModal();
    showSuccessBanner('Newlywed application submitted!');
  });

  loadApprovedVendors();
});
