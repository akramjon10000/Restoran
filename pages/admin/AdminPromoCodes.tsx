import React, { useState, useEffect } from 'react';
import { dbService } from '../../lib/db';
import { PromoCode } from '../../types';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminPromoCodes = () => {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCode, setEditingCode] = useState<PromoCode | null>(null);

    // Form states
    const [code, setCode] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadPromoCodes();
    }, []);

    const loadPromoCodes = async () => {
        try {
            setLoading(true);
            const codes = await dbService.getCollection<PromoCode>('promocodes');
            setPromoCodes(codes);
        } catch (error) {
            console.error('Error loading promo codes:', error);
            toast.error("Promokodlarni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || discountPercentage <= 0 || discountPercentage > 100) {
            toast.error("Iltimos barcha ma'lumotlarni to'g'ri kiriting");
            return;
        }

        try {
            setIsSubmitting(true);
            const promoData = {
                code: code.toUpperCase(),
                discountPercentage,
                isActive
            };

            if (editingCode) {
                await dbService.updateDocument('promocodes', editingCode.id, promoData);
                toast.success('Promokod yangilandi');
            } else {
                await dbService.addDocument('promocodes', promoData);
                toast.success('Yangi promokod qo\'shildi');
            }

            resetForm();
            loadPromoCodes();
        } catch (error) {
            console.error('Error saving promo code:', error);
            toast.error('Saqlashda xatolik yuz berdi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
        
        try {
            await dbService.deleteDocument('promocodes', id);
            toast.success("Promokod o'chirildi");
            loadPromoCodes();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error("O'chirishda xatolik");
        }
    };

    const resetForm = () => {
        setEditingCode(null);
        setCode('');
        setDiscountPercentage(0);
        setIsActive(true);
    };

    const editPromoCode = (pc: PromoCode) => {
        setEditingCode(pc);
        setCode(pc.code);
        setDiscountPercentage(pc.discountPercentage);
        setIsActive(pc.isActive ?? true);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    return (
        <div className="pb-20 max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter">Promokodlar</h2>
            
            <form onSubmit={handleSave} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 space-y-4">
                <h3 className="font-bold text-lg">{editingCode ? 'Promokodni tahrirlash' : 'Yangi Promokod'}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Kod (Masalan: NAVROZ20)</label>
                        <input 
                            type="text" 
                            value={code} 
                            onChange={e => setCode(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                            placeholder="PROMO CODE"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Chegirma foizi (%)</label>
                        <input 
                            type="number" 
                            min="1"
                            max="100"
                            value={discountPercentage} 
                            onChange={e => setDiscountPercentage(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                            placeholder="20"
                            required
                        />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="isActive"
                            checked={isActive} 
                            onChange={e => setIsActive(e.target.checked)}
                            className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                        />
                        <label htmlFor="isActive" className="font-bold text-slate-700">Faol</label>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        {editingCode ? 'Yangilash' : "Qo'shish"}
                    </button>
                    {editingCode && (
                        <button 
                            type="button" 
                            onClick={resetForm}
                            className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-300"
                        >
                            Bekor qilish
                        </button>
                    )}
                </div>
            </form>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Kod</th>
                                <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Chegirma (%)</th>
                                <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Status</th>
                                <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Harakatlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {promoCodes.map(pc => (
                                <tr key={pc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-black text-slate-900 tracking-wider">
                                        <div className="inline-block bg-slate-100 px-2 py-1 rounded text-red-600">
                                            {pc.code}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-slate-700">{pc.discountPercentage}%</td>
                                    <td className="p-4">
                                        {pc.isActive ? (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Faol</span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">Nofaol</span>
                                        )}
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button 
                                            onClick={() => editPromoCode(pc)}
                                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="Tahrirlash"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(pc.id)}
                                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            title="O'chirish"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {promoCodes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                                        Hozircha promokodlar kiritilmagan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPromoCodes;
