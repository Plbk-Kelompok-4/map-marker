const map = L.map('map', { zoomControl: true }).setView([-2.5, 118.0], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let markers = [];
let pendingLatLng = null;
let renameIndex = null;

function makeIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:22px;height:22px;
      background:#5b4fff;
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(91,79,255,0.5);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -26]
  });
}

map.on('click', function(e) {
  pendingLatLng = e.latlng;
  renameIndex = null;
  document.getElementById('modalInput').value = '';
  document.getElementById('modalCoords').textContent =
    `Lat: ${e.latlng.lat.toFixed(5)}, Lng: ${e.latlng.lng.toFixed(5)}`;
  document.getElementById('modalOverlay').classList.add('show');
  setTimeout(() => document.getElementById('modalInput').focus(), 100);
});

document.getElementById('modalInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') saveMarker();
  if (e.key === 'Escape') cancelMarker();
});

function saveMarker() {
  const name = document.getElementById('modalInput').value.trim() || 'Lokasi Baru';

  if (renameIndex !== null) {
    markers[renameIndex].name = name;
    markers[renameIndex].marker.setPopupContent(makePopupContent(name,
      markers[renameIndex].lat, markers[renameIndex].lng));
    updateList();
  } else {
    const { lat, lng } = pendingLatLng;
    const marker = L.marker([lat, lng], { icon: makeIcon() })
      .addTo(map)
      .bindPopup(makePopupContent(name, lat, lng))
      .openPopup();
    markers.push({ name, lat, lng, marker });

    const short = name.length > 10 ? name.slice(0, 10) + '…' : name;
    document.getElementById('lastAdded').textContent = short;
    updateList();
  }

  closeModal();
}

function makePopupContent(name, lat, lng) {
  return `<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:4px 2px;">
    <div style="font-weight:700;font-size:13px;color:#1a1a2e;margin-bottom:3px;">${name}</div>
    <div style="font-size:11px;color:#9da0b8;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
  </div>`;
}

function cancelMarker() { closeModal(); }

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  pendingLatLng = null;
  renameIndex = null;
}

function openRename(index) {
  renameIndex = index;
  pendingLatLng = null;
  document.getElementById('modalInput').value = markers[index].name;
  document.getElementById('modalCoords').textContent =
    `Lat: ${markers[index].lat.toFixed(5)}, Lng: ${markers[index].lng.toFixed(5)}`;
  document.getElementById('modalOverlay').classList.add('show');
  setTimeout(() => {
    const inp = document.getElementById('modalInput');
    inp.focus(); inp.select();
  }, 100);
}

function removeMarker(index) {
  map.removeLayer(markers[index].marker);
  markers.splice(index, 1);
  updateList();
}

function clearAll() {
  if (markers.length === 0) return;
  if (confirm('Hapus semua marker?')) {
    markers.forEach(m => map.removeLayer(m.marker));
    markers = [];
    document.getElementById('lastAdded').textContent = '—';
    updateList();
  }
}

function updateList() {
  const list = document.getElementById('markerList');
  const empty = document.getElementById('emptyState');
  document.getElementById('markerCount').textContent = markers.length;

  if (markers.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = '';

  markers.forEach((item, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="pin-dot"></div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-coord">${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}</div>
      </div>
      <div class="item-actions">
        <button class="btn-icon rename" onclick="openRename(${i})" title="Rename">✎</button>
        <button class="btn-icon remove" onclick="removeMarker(${i})" title="Hapus">✕</button>
      </div>
    `;
    li.onclick = (e) => {
      if (e.target.closest('.item-actions')) return;
      map.setView([item.lat, item.lng], 13);
      item.marker.openPopup();
    };
    list.appendChild(li);
  });
}

updateList();