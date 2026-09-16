import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useMenu } from '../../context/MenuContext';
import { TrendingUp, ShoppingBag, Package, DollarSign, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { dbService } from '../../lib/db';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const AdminDashboard = () => {
  const { orders } = useOrders();
  const { products } = useMenu();
  const [dbStatus, setDbStatus] = useState<string>(dbService.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
        setDbStatus(dbService.getStatus());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.date.startsWith(today));
  const todayRevenue = todayOrders.reduce((acc, order) => acc + order.total, 0);

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const activeOrders = orders.filter(o => o.status !== 'completed').length;
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  
  // Calculate best selling items
  const itemCounts: Record<string, { name: string, count: number, total: number }> = {};
  orders.forEach(order => {
      order.items.forEach(item => {
          if (!itemCounts[item.id]) {
              itemCounts[item.id] = { name: item.name, count: 0, total: 0 };
          }
          itemCounts[item.id].count += item.quantity;
          itemCounts[item.id].total += item.price * item.quantity;
      });
  });
  
  const bestSellers = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  
  // Prepare chart data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayOrders = orders.filter(o => o.date.startsWith(date));
    return {
      name: date.split('-').slice(1).join('/'),
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length
    };
  });

  const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-4 flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="text-white" size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase">{title}</p>
            <h3 className="text-xl font-black text-slate-900">{value}</h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter"
        >
            Boshqaruv Paneli
        </motion.h2>
        
        {/* Database Status Indicator */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <Badge variant="outline" className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
            dbStatus === 'online' ? 'bg-green-50 border-green-200 text-green-600' : 
            dbStatus === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
                {dbStatus === 'online' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                Ma'lumotlar bazasi: {dbStatus === 'online' ? 'Ulandi' : dbStatus === 'error' ? 'Ruxsat yo\'q' : 'Ulanmoqda...'}
            </Badge>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Bugungi Tushum" 
          value={formatCurrency(todayRevenue)} 
          icon={DollarSign} 
          color="bg-emerald-500 shadow-lg shadow-emerald-100" 
          delay={0.1}
        />
        <StatCard 
          title="Jami Tushum" 
          value={formatCurrency(totalRevenue)} 
          icon={Database} 
          color="bg-slate-800 shadow-lg shadow-slate-200" 
          delay={0.15}
        />
        <StatCard 
          title="O'rtacha Chek" 
          value={formatCurrency(averageOrderValue)} 
          icon={ShoppingBag} 
          color="bg-blue-500 shadow-lg shadow-blue-100" 
          delay={0.2}
        />
        <StatCard 
          title="Bugungi Buyurtmalar" 
          value={todayOrders.length} 
          icon={TrendingUp} 
          color="bg-indigo-500 shadow-lg shadow-indigo-100" 
          delay={0.25}
        />
        <StatCard 
          title="Jarayondagi (Faol)" 
          value={activeOrders} 
          icon={Package} 
          color="bg-orange-500 shadow-lg shadow-orange-100" 
          delay={0.3}
        />
        <StatCard 
          title="Mahsulotlar" 
          value={products.length} 
          icon={TrendingUp} 
          color="bg-purple-500 shadow-lg shadow-purple-100" 
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="rounded-[2rem] border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="font-black text-slate-900 uppercase italic tracking-tighter">Daromad (Oxirgi 7 kun)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(val) => `${val / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}
                      formatter={(value: number) => [formatCurrency(value), 'Daromad']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="rounded-[2rem] border-slate-100 shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="font-black text-slate-900 uppercase italic tracking-tighter">Ommabop Mahsulotlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bestSellers.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <div>
                          <span className="font-black text-slate-900 block line-clamp-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{item.count} dona sotilgan</span>
                        </div>
                        <span className="font-black text-slate-900">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                    {bestSellers.length === 0 && <p className="text-slate-400 text-sm italic font-medium">Hozircha ma'lumot yo'q.</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-slate-100 shadow-sm h-full max-h-[350px] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="font-black text-slate-900 uppercase italic tracking-tighter">Kunlik Buyurtmalar Tarixi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                     {chartData.slice().reverse().map((day, idx) => (
                         <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                             <div className="flex flex-col">
                                 <span className="font-black text-slate-900">{day.name}</span>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase">{day.orders} ta buyurtma</span>
                             </div>
                             <span className="font-black text-slate-600">{formatCurrency(day.revenue)}</span>
                         </div>
                     ))}
                  </div>
                </CardContent>
              </Card>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="h-full"
        >
          <Card className="rounded-[2rem] border-slate-100 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="font-black text-slate-900 uppercase italic tracking-tighter">So'nggi buyurtmalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order, index) => (
                  <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + (index * 0.1) }}
                      key={order.id} 
                      className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <span className="font-black text-slate-900 block">#{order.id}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(order.date).toLocaleString()}</span>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'new' ? 'bg-blue-100 text-blue-600 hover:bg-blue-100' :
                      order.status === 'cooking' ? 'bg-orange-100 text-orange-600 hover:bg-orange-100' :
                      order.status === 'delivering' ? 'bg-purple-100 text-purple-600 hover:bg-purple-100' :
                      'bg-green-100 text-green-600 hover:bg-green-100'
                    }`}>
                      {order.status}
                    </Badge>
                  </motion.div>
                ))}
                {orders.length === 0 && <p className="text-slate-400 text-sm italic font-medium">Hozircha buyurtmalar yo'q.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;