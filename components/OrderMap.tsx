import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Default restaurant location
const RESTAURANT_LOCATION = { lat: 41.311151, lng: 69.279737 }; // Tashkent center (Oshxona)

function LeafletOrderMap({ address, height = "300px" }: { address: string, height?: string }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (!address) return;
        // Try to geocode destination address via Nominatim
        const query = address.includes('Toshkent') || address.includes('Tashkent') ? address : `${address}, Tashkent`;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setDestinationCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                } else {
                    // Default slightly offset from restaurant
                    setDestinationCoords([41.3200, 69.2900]);
                }
            })
            .catch(() => {
                setDestinationCoords([41.3200, 69.2900]);
            });
    }, [address]);

    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng],
                zoom: 13,
                zoomControl: true,
                attributionControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);

            mapInstanceRef.current = map;
        }

        const map = mapInstanceRef.current;
        if (map && destinationCoords) {
            // Clear existing markers/polylines
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                    map.removeLayer(layer);
                }
            });

            const restaurantIcon = L.divIcon({
                className: 'bg-transparent border-none',
                html: `<div class="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full shadow-lg border-2 border-white font-bold text-xs">🍔</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const destIcon = L.divIcon({
                className: 'bg-transparent border-none',
                html: `<div class="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white font-bold text-xs">📍</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const restMarker = L.marker([RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng], { icon: restaurantIcon }).addTo(map);
            restMarker.bindPopup("<b>Oshxona</b>");

            const destMarker = L.marker(destinationCoords, { icon: destIcon }).addTo(map);
            destMarker.bindPopup(`<b>Yetkazish manzili:</b><br/>${address}`);

            const polyline = L.polyline([
                [RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng],
                destinationCoords
            ], { color: '#E4002B', weight: 4, dashArray: '8, 8' }).addTo(map);

            const bounds = L.latLngBounds([
                [RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng],
                destinationCoords
            ]);
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [destinationCoords, address]);

    return (
        <div className="relative overflow-hidden rounded-[1.2rem] border border-slate-200 shadow-sm" style={{ height, width: '100%' }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
            <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 border border-slate-100 text-xs">
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-semibold text-red-600 hover:underline"
                >
                    Google Maps-da ochish <ExternalLink size={12} />
                </a>
            </div>
        </div>
    );
}

function OrderRoute({ destinationAddress }: { destinationAddress: string }) {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
            map,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#E4002B',
                strokeWeight: 4,
            }
        }));
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer || !destinationAddress) return;

        directionsService.route({
            origin: RESTAURANT_LOCATION,
            destination: destinationAddress,
            travelMode: google.maps.TravelMode.DRIVING,
        }).then(response => {
            directionsRenderer.setDirections(response);
        }).catch(err => {
            console.error("Directions request failed", err);
        });
    }, [directionsService, directionsRenderer, destinationAddress]);

    return null;
}

function AddressMarker({ address }: { address: string }) {
    const placesLib = useMapsLibrary('places');
    const map = useMap();
    const [location, setLocation] = useState<google.maps.LatLngLiteral | null>(null);

    useEffect(() => {
        if (!placesLib || !address) return;
        
        placesLib.Place.searchByText({
            textQuery: address,
            fields: ['location'],
            maxResultCount: 1,
        }).then(({ places }) => {
            if (places && places.length > 0 && places[0].location) {
                const loc = { lat: places[0].location.lat(), lng: places[0].location.lng() };
                setLocation(loc);
                if (map) {
                    map.panTo(loc);
                    map.setZoom(13);
                }
            }
        }).catch(err => console.error("Error finding address location:", err));
    }, [placesLib, address, map]);

    if (!location) return null;

    return (
        <AdvancedMarker position={location}>
            <Pin background="#E4002B" glyphColor="#fff" borderColor="#E4002B" />
        </AdvancedMarker>
    );
}

export default function OrderMap({ address, height = "300px", showRoute = true }: { address: string, height?: string, showRoute?: boolean }) {
    return <LeafletOrderMap address={address} height={height} />;
}


