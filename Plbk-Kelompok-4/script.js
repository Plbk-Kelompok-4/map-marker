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