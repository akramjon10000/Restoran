import React, { useEffect } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useSearchParams } from 'react-router-dom';
import { Order } from '../../types';
import { Clock, MapPin, Phone, CheckCircle, AlertCircle, Printer } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { printReceipt } from '../../utils/receipt';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const setStatus = searchParams.get('setStatus');

    if (orderId && setStatus) {
      const orderExists = orders.find(o => o.id === orderId);
      const validStatuses = ['new', 'cooking', 'delivering', 'completed'];
      
      if (orderExists) {
        if (validStatuses.includes(setStatus) && orderExists.status !== setStatus) {
            updateOrderStatus(orderId, setStatus as Order['status']);
            toast.success(`Buyurtma #${orderId} holati muvaffaqiyatli yangilandi!`);
        }
      } else if (orders.length > 0) {
        // Faqatgina orders yuklanib bo'lgach topilmasa xato beramiz
        toast.error(`Buyurtma #${orderId} topilmadi!`);
      }
      
      // URL'ni tozalash (qayta ishga tushib ketmasligi uchun)
      setSearchParams({});
    }
  }, [searchParams, orders, updateOrderStatus, setSearchParams]);

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <Card className="mb-4 hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-black text-lg text-slate-900">#{order.id}</CardTitle>
            <CardDescription className="text-xs">{new Date(order.date).toLocaleString()}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600">{formatCurrency(order.total)}</span>
            <button
              onClick={() => printReceipt(order)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Chek chiqarish"
            >
              <Printer size={15} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {(order as any).phone && (
             <div className="flex items-center text-sm text-slate-600 space-x-2">
                <Phone size={14} /> <span>{(order as any).phone}</span>
             </div>
          )}
          {(order as any).address && (
             <div className="flex items-center text-sm text-slate-600 space-x-2">
                <MapPin size={14} /> <span className="line-clamp-1">{(order as any).address}</span>
             </div>
          )}
        </div>

        <div className="bg-slate-50 p-3 rounded-lg mb-4 space-y-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-slate-700 font-medium">
              <span>{item.quantity}x {item.name}</span>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-1">
          {['new', 'cooking', 'delivering', 'completed'].map((status) => (
             <Button
               key={status}
               variant={order.status === status ? "default" : "outline"}
               size="sm"
               onClick={() => updateOrderStatus(order.id, status as any)}
               disabled={order.status === status}
               className="text-xs font-bold uppercase whitespace-nowrap"
             >
               {status}
             </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="pb-20 relative h-[calc(100vh-80px)] flex flex-col flex-grow">
      <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter">Buyurtmalar Oqimi</h2>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Clock size={48} className="mb-4 text-slate-400" />
          <p className="font-bold">Hozircha buyurtmalar yo'q</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 w-full overflow-x-auto pb-4 h-full">
          {/* New Orders Column */}
          <div className="flex-1 min-w-[300px] h-full flex flex-col bg-slate-50/50 rounded-[2rem] p-4 border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-black text-blue-600 uppercase text-xs tracking-wider flex items-center gap-2">
                   Yangi 
                 </h3>
                 <Badge variant="secondary" className="bg-blue-100 text-blue-600">{orders.filter(o => o.status === 'new').length}</Badge>
             </div>
             <div className="flex-col gap-4 overflow-y-auto pr-2 pb-20">
               {orders.filter(o => o.status === 'new').map(o => <OrderCard key={o.id} order={o} />)}
             </div>
          </div>

          {/* Cooking Column */}
          <div className="flex-1 min-w-[300px] h-full flex flex-col bg-slate-50/50 rounded-[2rem] p-4 border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-black text-orange-600 uppercase text-xs tracking-wider flex items-center gap-2">
                   Tayyorlanmoqda 
                 </h3>
                 <Badge variant="secondary" className="bg-orange-100 text-orange-600">{orders.filter(o => o.status === 'cooking').length}</Badge>
             </div>
             <div className="flex-col gap-4 overflow-y-auto pr-2 pb-20">
               {orders.filter(o => o.status === 'cooking').map(o => <OrderCard key={o.id} order={o} />)}
             </div>
          </div>

          {/* Delivering Column */}
          <div className="flex-1 min-w-[300px] h-full flex flex-col bg-slate-50/50 rounded-[2rem] p-4 border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-black text-indigo-600 uppercase text-xs tracking-wider flex items-center gap-2">
                   Yo'lda (Yetkazilmoqda)
                 </h3>
                 <Badge variant="secondary" className="bg-indigo-100 text-indigo-600">{orders.filter(o => o.status === 'delivering').length}</Badge>
             </div>
             <div className="flex-col gap-4 overflow-y-auto pr-2 pb-20">
               {orders.filter(o => o.status === 'delivering').map(o => <OrderCard key={o.id} order={o} />)}
             </div>
          </div>

          {/* Completed Column */}
          <div className="flex-1 min-w-[300px] h-full flex flex-col bg-slate-50/50 rounded-[2rem] p-4 border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-black text-green-600 uppercase text-xs tracking-wider flex items-center gap-2">
                   Yakunlangan 
                 </h3>
                 <Badge variant="secondary" className="bg-green-100 text-green-600">{orders.filter(o => o.status === 'completed').length}</Badge>
             </div>
             <div className="flex-col gap-4 overflow-y-auto pr-2 pb-20">
               {orders.filter(o => o.status === 'completed').map(o => <OrderCard key={o.id} order={o} />)}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;