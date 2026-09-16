import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import { Share2, Download, Copy, Check, FileJson, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const AdminFeed = () => {
  const { products } = useMenu();
  const [copied, setCopied] = useState(false);

  const generateFBFeed = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return products.map(p => ({
      id: p.id,
      title: p.name,
      description: p.description,
      availability: "in stock",
      condition: "new",
      price: `${p.price} UZS`,
      link: `${baseUrl}#/product/${p.id}`,
      image_link: p.image,
      brand: "Restoran Uzbekistan",
      category: p.category
    }));
  };

  const copyToClipboard = () => {
    const feed = JSON.stringify(generateFBFeed(), null, 2);
    navigator.clipboard.writeText(feed);
    setCopied(true);
    toast.success("JSON nusxalandi!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = () => {
    const feed = generateFBFeed();
    const headers = ["id", "title", "description", "availability", "condition", "price", "link", "image_link", "brand", "category"];
    const csvRows = [
      headers.join(","),
      ...feed.map(row => headers.map(header => `"${(row as any)[header]}"`).join(","))
    ];
    
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'restoran_facebook_catalog.csv');
    a.click();
    toast.success("CSV fayl yuklab olindi!");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">ADS REKLAMA KATALOGI</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Facebook Ads va Instagram Shopping uchun mahsulotlar oqimi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm">
            <CardContent className="p-8 space-y-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
                    <FileSpreadsheet size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">CSV Format</h3>
                    <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">
                        Business Manager-da "Data Feed" orqali yuklash uchun eng qulay format.
                    </p>
                </div>
                <Button 
                    onClick={downloadCSV}
                    className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                    <Download size={18} className="mr-2" /> CSV YUKLAB OLISH
                </Button>
            </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm">
            <CardContent className="p-8 space-y-6">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center shadow-inner">
                    <FileJson size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">JSON Format</h3>
                    <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">
                        Custom integratsiyalar yoki dinamik reklamalar uchun.
                    </p>
                </div>
                <Button 
                    onClick={copyToClipboard}
                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs ${copied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                >
                    {copied ? <Check size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />} {copied ? 'NUSXALANDI!' : 'JSON NUSXALASH'}
                </Button>
            </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
          <div className="flex gap-4">
              <Share2 className="text-blue-600 shrink-0" size={24} />
              <div className="space-y-2">
                  <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest">Qanday ishlatiladi?</h4>
                  <p className="text-xs text-blue-800/70 font-medium leading-relaxed">
                      1. Facebook Business Suite-ga kiring.<br/>
                      2. <b>Commerce Manager</b> bo'limini tanlang.<br/>
                      3. <b>Catalog</b> {'->'} <b>Data Sources</b> {'->'} <b>Add Items</b> bosing.<br/>
                      4. <b>Data Feed</b> usulini tanlang va ushbu CSV faylni yuklang.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminFeed;