import React, { useState, useEffect } from 'react';
import { Save, Brain, Info, RotateCcw, Sparkles } from 'lucide-react';
import { DEFAULT_SYSTEM_INSTRUCTION, DEFAULT_LIVE_MODEL, SUPPORTED_LIVE_MODELS } from '../../constants';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const AdminKnowledgeBase = () => {
  const [instruction, setInstruction] = useState('');
  const [liveModel, setLiveModel] = useState(DEFAULT_LIVE_MODEL);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ai_system_instruction');
    setInstruction(stored || DEFAULT_SYSTEM_INSTRUCTION);
    const storedModel = localStorage.getItem('ai_live_model');
    setLiveModel(storedModel || DEFAULT_LIVE_MODEL);
  }, []);

  const handleSave = () => {
    localStorage.setItem('ai_system_instruction', instruction);
    localStorage.setItem('ai_live_model', liveModel.trim());
    setSaved(true);
    toast.success("Bilimlar bazasi va AI sozlamalari saqlandi!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setInstruction(DEFAULT_SYSTEM_INSTRUCTION);
    setLiveModel(DEFAULT_LIVE_MODEL);
    toast.info("Ko'rsatmalar va model standart holatga qaytarildi.");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Bilimlar Bazasi</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Ovozli AI yordamchi uchun ko'rsatmalar</p>
        </div>
        <div className="flex gap-2">
            <Button 
                variant="outline"
                size="icon"
                onClick={handleReset}
                title="Qayta tiklash"
            >
                <RotateCcw size={20} />
            </Button>
            <Button 
                onClick={handleSave}
                className={`font-black uppercase italic tracking-widest gap-2 ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
                {saved ? 'SAQLANDI!' : <><Save size={18} /> SAQLASH</>}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
            <Card className="rounded-[2rem] border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-red-600 font-black uppercase text-xs tracking-widest">
                      <Brain size={18} /> Tizim ko'rsatmasi (System Instruction)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      className="w-full min-h-[400px] p-5 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-red-600 focus:bg-white transition-all outline-none font-medium text-slate-800 leading-relaxed resize-y"
                      placeholder="AI uchun yo'riqnomani shu yerga yozing..."
                  />
                </CardContent>
            </Card>
        </div>

        <div className="space-y-4">
            <Card className="rounded-[2rem] border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 font-black uppercase text-[10px] tracking-widest">
                      <Sparkles size={14} /> Ovozli AI Modeli (Gemini Live)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Asosiy model: <b>gemini-3.8-live</b>. Agar Google Live API da model topilmasa, avtomatik fallback ishlaydi.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <select
                    value={liveModel}
                    onChange={(e) => setLiveModel(e.target.value)}
                    aria-label="Ovozli AI Modeli"
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-red-600 focus:bg-white transition-all outline-none font-bold text-slate-800 text-xs cursor-pointer"
                  >
                    {SUPPORTED_LIVE_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                    {!SUPPORTED_LIVE_MODELS.some(m => m.id === liveModel) && (
                      <option value={liveModel}>Maxsus: {liveModel}</option>
                    )}
                  </select>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Model ID (tahrirlash):</span>
                    <Input 
                      value={liveModel}
                      onChange={(e) => setLiveModel(e.target.value)}
                      placeholder="gemini-3.8-live"
                      className="rounded-xl bg-slate-50 border-slate-200 font-mono text-xs h-9"
                    />
                  </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest">
                      <Info size={14} /> Maslahatlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                      <li className="text-xs text-slate-500 leading-relaxed">
                          <span className="font-black text-slate-900 block mb-1">Buyurtma yakuni (Majburiy)</span>
                          Endi AI tasdiqlash uchun "Sizda X ta burger va Y ta kola, jami summa Z. Tasdiqlaysizmi?" deb aytishni o'rgangan. Shuni ko'rsatmada saqlab qoling.
                      </li>
                      <li className="text-xs text-slate-500 leading-relaxed">
                          <span className="font-black text-slate-900 block mb-1">O'chirish va Bekor qilish</span>
                          AI ga mijoz savatdan narsani bekor qilsa `removeFromCart` ishlatishini aniq uqtiring.
                      </li>
                      <li className="text-xs text-slate-500 leading-relaxed">
                          <span className="font-black text-slate-900 block mb-1">Sotuv sirlari</span>
                          Tavsiya berish qoidalarini belgilang (masalan: "Burger bilan har doim kartoshka fri taklif qil").
                      </li>
                  </ul>
                </CardContent>
            </Card>

            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
                <p className="text-[10px] text-red-600 font-black uppercase tracking-widest leading-relaxed">
                    Eslatma: O'zgarishlar saqlangandan so'ng, AI yangi ko'rsatmalar asosida ishlaydi.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKnowledgeBase;