import React, { useState, useEffect } from 'react';
import { dbService } from '../../lib/db';
import { Review } from '../../types';
import { Loader2, Star } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

const AdminReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await dbService.getCollection<Review>('reviews');
                setReviews(res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    return (
        <div className="pb-20 max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter">Fikr-mulohazalar</h2>
            
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-8 text-center border border-slate-100">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Hozircha baholar yo'q</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-800">{review.userName}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formatDate(review.date)}</p>
                                </div>
                                <div className="flex bg-yellow-50 px-3 py-1 rounded-full text-yellow-500">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={14} fill={review.rating >= s ? "currentColor" : "none"} className={review.rating >= s ? "" : "text-yellow-200"} />
                                    ))}
                                </div>
                            </div>
                            {review.comment && (
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl font-medium text-sm">
                                    "{review.comment}"
                                </p>
                            )}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>Buyurtma: #{review.orderId.slice(0, 5).toUpperCase()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
