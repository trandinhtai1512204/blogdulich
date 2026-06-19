'use client';

import { useEffect, useRef } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface Props {
  address: string;
  hotelName: string;
  cityName: string;
}

// Dùng Leaflet (miễn phí, không cần API key)
// npm install leaflet @types/leaflet (chạy trong frontend)

export function HotelMap({ address, hotelName, cityName }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const query = encodeURIComponent(`${hotelName}, ${address}, ${cityName}, Vietnam`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import để tránh SSR error
    import('leaflet').then((L) => {
      // Fix icon path issue với Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Geocode bằng Nominatim (miễn phí)
      const searchQuery = encodeURIComponent(`${address}, ${cityName}, Vietnam`);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`)
        .then((r) => r.json())
        .then((data) => {
          let lat = 21.0245; // Hà Nội default
          let lng = 105.8412;

          if (data.length > 0) {
            lat = parseFloat(data[0].lat);
            lng = parseFloat(data[0].lon);
          }

          if (!mapRef.current || mapInstanceRef.current) return;

          const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([lat, lng], 15);

          mapInstanceRef.current = map;

          // OpenStreetMap tiles (miễn phí)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
          }).addTo(map);

          // Custom marker
          const icon = L.divIcon({
            html: `
              <div style="
                background: linear-gradient(135deg, #F37021, #0A2D5B);
                width: 36px; height: 36px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(124,58,237,0.4);
                display: flex; align-items: center; justify-content: center;
              ">
                <span style="transform: rotate(45deg); color: white; font-size: 14px;">🏨</span>
              </div>
            `,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -40],
          });

          L.marker([lat, lng], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: Inter, sans-serif; padding: 4px;">
                <p style="font-weight: 700; font-size: 13px; margin: 0 0 4px; color: #1f2937;">${hotelName}</p>
                <p style="font-size: 11px; color: #6b7280; margin: 0;">${address}</p>
              </div>
            `)
            .openPopup();
        })
        .catch(() => {
          // Fallback nếu không geocode được
          if (!mapRef.current || mapInstanceRef.current) return;
          const map = L.map(mapRef.current).setView([21.0245, 105.8412], 13);
          mapInstanceRef.current = map;
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address, hotelName, cityName]);

  return (
    <div>
      <h2 className="text-gray-900 font-bold text-lg mb-3" style={{ letterSpacing: '-0.02em' }}>
        Vị trí
      </h2>

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200" style={{ height: '280px', zIndex: 0, isolation: 'isolate' }}>
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
        <div ref={mapRef} className="w-full h-full" />

        {/* Address overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow-lg flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={13} className="text-[#F37021] flex-shrink-0" />
              <p className="text-xs text-gray-700 font-medium truncate">{address}, {cityName}</p>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#F37021] font-semibold hover:text-[#d95f18] transition-colors flex-shrink-0 ml-2"
            >
              <ExternalLink size={11} />
              Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
