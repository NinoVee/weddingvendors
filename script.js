console.log("✅ script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = 'https://mtbwumonjqhxhkgcvdig.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Modal functions globally accessible
  window.showModal = () => {
    document.getElementById('vendorModal').style.display = 'flex';
  };

  window.hideModal = () => {
    document.getElementById('vendorModal').style.display = 'none';
  };

  window.shownewlywedModal = () => {
    document.getElementById('newlywedModal').style.display = 'flex';
  };

  window.hidenewlywedModal = () => {
    document.getElementById('newlywedModal').style.display = 'none';
  };

  // Success banner
  function showSuccessBanner(message = 'Submission successful!') {
    const banner = document.getElementById('successBanner');
    banner.textContent = message;
    banner.style.display = 'block';
    setTimeout(() => {
      banner.style.display = 'none';
    }, 4000);
  }

  // Button listeners
  document.getElementById('showVendorBtn')?.addEventListener('click', showModal);
  document.getElementById('showNewlywedBtn')?.addEventListener('click', shownewlywedModal);

  // Filter vendors
  window.filterVendors = () => {
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
  };

  // Load approved vendors
  async function loadApprovedVendors() {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('approved', true);

    if (error) {
      console.error('Error loading vendors:', error);
      return;
    }

    const container = document.getElementById('vendorList');
    container.innerHTML = '';

    vendors.forEach(vendor => {
      const card = document.createElement('div');
      card.className = 'vendor-card';
      card.setAttribute('data-location', vendor.location);
      card.setAttribute('data-category', vendor.category);
      card.innerHTML = `
        <img src="${vendor.media_url || 'https://via.placeholder.com/250x150'}" alt="${vendor.name}" class="vendor-thumbnail" />
        <h3>${vendor.name}</h3>
        <p>Category: ${vendor.category}</p>
        <p>Location: ${vendor.location}</p>
        <p>Email: ${vendor.email}</p>
        <p>Link: <a href="${vendor.link}" target="_blank">${vendor.link}</a></p>
      `;
      container.appendChild(card);
    });
  }

  // Vendor form submission
  document.getElementById('vendorForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const fileInput = document.getElementById('vendorMedia');
    const mediaFile = fileInput.files[0];

    const formData = new FormData();
    formData.append('name', form.vendorName.value);
    formData.append('email', form.vendorEmail.value);
    formData.append('location', form.vendorLocation.value);
    formData.append('category', form.vendorCategory.value);
    formData.append('link', form.vendorLink.value);
    formData.append('description', form.vendorDescription.value);
    if (mediaFile) formData.append('media', mediaFile);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/hyper-function`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vendor function error:', errorText);
      showSuccessBanner('Vendor submission failed.');
      return;
    }

    hideModal();
    form.reset();
    showSuccessBanner('Vendor submitted!');
  });

  // Newlywed form submission
  document.getElementById('newlywedForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('n
