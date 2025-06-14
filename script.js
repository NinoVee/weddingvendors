const supabase = createClient(
  'https://mtbwumonjqhxhkgcvdig.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Ynd1bW9uanFoeGhrZ2N2ZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzUyMTYsImV4cCI6MjA2NDY1MTIxNn0.QduNZinoGi5IeJfu0Ovi6H4Eh4kCIEeW-RGGypfN57o'
);

// Show/hide modal helpers
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

// Show success banner
function showSuccessBanner(message = 'Submission successful!') {
  const banner = document.getElementById('successBanner');
  banner.textContent = message;
  banner.style.display = 'block';
  setTimeout(() => {
    banner.style.display = 'none';
  }, 4000);
}

// Filter vendor cards
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

window.addEventListener('DOMContentLoaded', loadApprovedVendors);

// Vendor form submission
document.getElementById('vendorForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('vendorName').value;
  const email = document.getElementById('vendorEmail').value;
  const location = document.getElementById('vendorLocation').value;
  const category = document.getElementById('vendorCategory').value;
  const link = document.getElementById('vendorLink').value;
  const description = document.getElementById('vendorDescription').value;
  const mediaFile = document.getElementById('vendorMedia').files[0];

  let media_url = '';
  if (mediaFile) {
    const filePath = `${Date.now()}_${mediaFile.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('vendor-media')
      .upload(filePath, mediaFile);

    if (storageError) {
      console.error('Upload error:', storageError);
    } else {
      const { publicUrl } = supabase.storage
        .from('vendor-media')
        .getPublicUrl(filePath).data;
      media_url = publicUrl;
    }
  }

  const { error } = await supabase
    .from('vendors')
    .insert([{ name, email, location, category, link, description, media_url, approved: false }]);

  if (error) {
    console.error('Insert failed:', error);
    return;
  }

  hideModal();
  showSuccessBanner('Vendor submitted!');

  const { error: funcError } = await supabase.functions.invoke('vendor-function', {
    body: { name, email, location, category, link, description, media_url }
  });

  if (funcError) {
    console.error('Function error:', funcError);
  }
});

// Newlywed form submission
document.getElementById('newlywedForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('newlywedName').value;
  const email = document.getElementById('newlywedEmail').value;
  const wedding_date = document.getElementById('weddingDate').value;
  const details = document.getElementById('weddingDetails').value;

  const { data, error } = await supabase.functions.invoke('newlywed-function', {
    body: { name, email, wedding_date, details }
  });

  console.log("Function response:", data);

  if (error) {
    console.error("Function call failed:", error);
    showSuccessBanner('Submission failed: ' + error.message);
    return;
  }

  showSuccessBanner('Newlywed application submitted!');
  document.getElementById('newlywedForm').reset();
  hidenewlywedModal();
});