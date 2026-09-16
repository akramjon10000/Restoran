
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { X, MapPin, Navigation, Loader2, Search, Clock, CheckCircle2, Mic } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { BRANCHES, Branch } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string, lat?: number, lng?: number) => void;
}

const AddressModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const { t } = useLanguage();
  const { orderType, selectedBranch, setSelectedBranch } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(t.moveMap);
  const [currentLatLng, setCurrentLatLng] = useState<[number, number]>([41.311081, 69.240562]);
  const [canConfirm, setCanConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Details Form State
  const [details, setDetails] = useState({
    entrance: '',
    floor: '',
    apartment: '',
    comment: ''
  });

  // Initialize Map
  useEffect(() => {
    if (!isOpen || orderType !== 'delivery' || !mapContainerRef.current) return;
    
    const defaultCenter: [number, number] = [41.311081, 69.240562];

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      mapInstanceRef.current = map;

      map.on('movestart', () => {
        setIsDragging(true);
        setCanConfirm(false);
      });

      map.on('moveend', () => {
        setIsDragging(false);
        const center = map.getCenter();
        resolveAddress(center.lat, center.lng);
      });
      
      setTimeout(() => { map.invalidateSize(); }, 200);
      handleLocateMe(undefined, true);
      resolveAddress(defaultCenter[0], defaultCenter[1]);

    } else {
        setTimeout(() => { mapInstanceRef.current?.invalidateSize(); }, 200);
    }
  }, [isOpen, orderType]);

  const updateUserMarker = (lat: number, lng: number) => {
      if (!mapInstanceRef.current) return;
      const userIcon = L.divIcon({
          className: 'bg-transparent border-none',
          html: `<div class="relative flex items-center justify-center w-6 h-6"><span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-50 animate-ping"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-sm"></span></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
      });
      if (userMarkerRef.current) { userMarkerRef.current.setLatLng([lat, lng]); } 
      else { userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(mapInstanceRef.current); }
  };

  const resolveAddress = async (lat: number, lng: number) => {
    setLoading(true);
    setCurrentLatLng([lat, lng]);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'uz-UZ,uz;q=0.9,en;q=0.8' }
        });
        const data = await response.json();
        let formatted = t.moveMap;
        if (data.address) {
            const { road, house_number, amenity, shop, city, town } = data.address;
            const place = amenity || shop;
            const street = road;
            const parts = [];
            if (place) parts.push(place);
            if (street) parts.push(`${street}${house_number ? ', ' + house_number : ''}`);
            if (parts.length === 0) parts.push(city || town);
            formatted = parts.join(', ');
        }
        setCurrentAddress(formatted);
        setCanConfirm(true);
    } catch (e) {
        setCurrentAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setCanConfirm(true);
    } finally { setLoading(false); }
  };

  const handleConfirm = () => {
    if (orderType === 'delivery') {
        const { entrance, floor, apartment, comment } = details;
        let finalAddress = currentAddress;
        const extras = [];
        if (entrance) extras.push(`${t.entrance}: ${entrance}`);
        if (floor) extras.push(`${t.floor}: ${floor}`);
        if (apartment) extras.push(`${t.apartment}: ${apartment}`);
        
        if (extras.length > 0) finalAddress += ` (${extras.join(', ')})`;
        if (comment) finalAddress += `. Izoh: ${comment}`;
        
        onConfirm(finalAddress, currentLatLng[0], currentLatLng[1]);
    } else if (selectedBranch) {
        onConfirm(selectedBranch.name);
    }
  };

  const handleLocateMe = (e?: React.MouseEvent, silent: boolean = false) => {
    e?.stopPropagation();
    if (!navigator.geolocation) return;
    if (!silent) setLoading(true);
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([latitude, longitude], 18);
                updateUserMarker(latitude, longitude);
                resolveAddress(latitude, longitude);
            }
            setLoading(false);
        },
        () => setLoading(false),
        { enableHighAccuracy: true }
    );
  };

  const handleBranchSelect = (branch: Branch) => {
      setSelectedBranch(branch);
      setCanConfirm(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-slide-up">
        {/* Header */}
        <div className="p-4 flex items-center gap-4 bg-white border-b border-slate-100 shrink-0">
             <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-900 bg-slate-50 rounded-xl">
                <X size={24} />
             </button>
             <h2 className="font-black text-lg uppercase tracking-tight italic">
                 {orderType === 'delivery' ? 'YETKAZIB BERISH MANZILI' : 'Filialni tanlang'}
             </h2>
        </div>

        {orderType === 'delivery' ? (
            /* DELIVERY UI */
            <div className="flex-grow flex flex-col overflow-hidden relative">
                {/* Search overlay inside map area */}
                <div className="absolute top-4 left-4 right-4 z-20">
                    <div className="w-full h-14 bg-white/95 backdrop-blur shadow-lg rounded-2xl flex items-center px-4 border border-slate-100 focus-within:ring-2 focus-within:ring-red-500 transition-all">
                        <Search className="text-slate-400 mr-3" size={20} />
                        <input 
                            type="text" 
                            placeholder={t.searchAddress}
                            className="flex-1 h-full outline-none text-sm bg-transparent font-medium"
                        />
                    </div>
                </div>
                
                <div className="flex-grow relative">
                    <div ref={mapContainerRef} className="w-full h-full bg-slate-100 z-0"></div>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center transition-all duration-300 ${isDragging ? '-translate-y-[calc(50%+15px)] scale-110' : '-translate-y-1/2'}`}>
                        <MapPin size={48} className="text-red-600 fill-red-600 drop-shadow-2xl" />
                    </div>
                    <button 
                        onClick={(e) => handleLocateMe(e)}
                        className="absolute bottom-6 right-4 z-10 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-red-600 border border-slate-50 active:scale-90 transition-transform"
                    >
                        <Navigation size={28} className="fill-current" />
                    </button>
                </div>

                {/* Bottom Sheet Details */}
                <div className="p-5 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[2.5rem] relative z-20">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">YETKAZIB BERISH</label>
                            <p className="text-lg font-black text-slate-900 leading-tight">
                                <span className="text-red-600 border-b-2 border-red-100">{currentAddress.split(',')[0]}</span>
                                {currentAddress.includes(',') ? currentAddress.substring(currentAddress.indexOf(',')) : ''}
                            </p>
                        </div>

                        {/* Detail Inputs Row */}
                        <div className="grid grid-cols-3 gap-3">
                             <input 
                                type="text" 
                                placeholder={t.entrance} 
                                className="p-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:bg-white focus:border-red-500 outline-none transition-all" 
                                value={details.entrance} 
                                onChange={e=>setDetails({...details, entrance: e.target.value})} 
                             />
                             <input 
                                type="text" 
                                placeholder={t.floor} 
                                className="p-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:bg-white focus:border-red-500 outline-none transition-all" 
                                value={details.floor} 
                                onChange={e=>setDetails({...details, floor: e.target.value})} 
                             />
                             <input 
                                type="text" 
                                placeholder={t.apartment} 
                                className="p-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:bg-white focus:border-red-500 outline-none transition-all" 
                                value={details.apartment} 
                                onChange={e=>setDetails({...details, apartment: e.target.value})} 
                             />
                        </div>

                        {/* Comment Field - Full Width */}
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder={t.comment} 
                                className="w-full p-4 pr-14 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:bg-white focus:border-red-500 outline-none transition-all" 
                                value={details.comment} 
                                onChange={e=>setDetails({...details, comment: e.target.value})} 
                            />
                            {/* Voice button icon as seen in screenshot */}
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-200 active:scale-95 transition-transform">
                                <Mic size={20} />
                            </button>
                        </div>

                        <button 
                            onClick={handleConfirm} 
                            disabled={!canConfirm || loading} 
                            className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-tighter shadow-xl shadow-red-100 active:scale-95 transition-all disabled:opacity-50 text-xl"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'TASDIQLASH'}
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            /* PICKUP UI */
            <div className="flex-grow flex flex-col bg-slate-50 overflow-y-auto">
                <div className="p-4 space-y-3">
                    {BRANCHES.map((branch) => (
                        <button 
                            key={branch.id}
                            onClick={() => handleBranchSelect(branch)}
                            className={`w-full text-left p-5 rounded-[2rem] border transition-all flex items-center justify-between ${
                                selectedBranch?.id === branch.id 
                                ? 'bg-white border-red-600 shadow-xl ring-2 ring-red-500/10' 
                                : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${selectedBranch?.id === branch.id ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <MapPin size={28} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase italic tracking-tighter text-lg leading-tight">{branch.name}</h4>
                                    <p className="text-xs text-slate-500 font-bold mb-2 opacity-70">{branch.address}</p>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Clock size={12} className="text-red-500" /> <span>{branch.workTime}</span>
                                    </div>
                                </div>
                            </div>
                            {selectedBranch?.id === branch.id && (
                                <CheckCircle2 size={32} className="text-red-600 fill-red-50 shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
                
                <div className="mt-auto p-6 bg-white border-t border-slate-100">
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedBranch}
                        className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-tighter shadow-xl shadow-red-100 disabled:opacity-50 text-xl"
                    >
                        TANLASH
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default AddressModal;
