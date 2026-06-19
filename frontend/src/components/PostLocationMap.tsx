'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

interface Props {
  title: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export function PostLocationMap({ title, location, latitude, longitude }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const hasCoordinates =
    typeof latitude === 'number'
    && Number.isFinite(latitude)
    && typeof longitude === 'number'
    && Number.isFinite(longitude);

  const googleMapsUrl = useMemo(() => {
    if (hasCoordinates) return `https://www.google.com/maps?q=${latitude},${longitude}`;
    if (location) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    return 'https://www.google.com/maps';
  }, [hasCoordinates, latitude, longitude, location]);
  useEffect(() => {
    if (!hasCoordinates || !mapRef.current) return;

    const cssId = 'leaflet-map-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([latitude!, longitude!], 15);
      mapInstanceRef.current = map;

      // CartoDB Voyager — màu sắc gần giống Google Maps
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Pin đỏ kiểu Google Maps bằng SVG
      const redPin = L.divIcon({
        html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#EA4335"/>
          <circle cx="14" cy="14" r="6" fill="white"/>
        </svg>`,
        className: '',
        iconSize: [28, 40],
        iconAnchor: [14, 40],
        popupAnchor: [0, -42],
      });

      L.marker([latitude!, longitude!], { icon: redPin })
        .bindPopup(`<strong>${title}</strong>`, { offset: [0, -36] })
        .addTo(map);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hasCoordinates, latitude, longitude]);

  if (!hasCoordinates && !location) return null;

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
          <MapPin size={16} className="text-[#F37021]" />
          Vị trí trên bản đồ
        </h2>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[#F37021] font-semibold hover:text-[#d95f18]"
        >
          Mở Google Maps <ExternalLink size={13} />
        </a>
      </div>

      {hasCoordinates ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50" style={{ height: 320 }}>
          <div ref={mapRef} className="w-full h-full" />
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          Địa điểm: <span className="font-semibold text-gray-800">{location}</span>
        </p>
      )}
    </section>
  );
}
