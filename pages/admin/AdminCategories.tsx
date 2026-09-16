
import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import { Category } from '../../types';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';

const AdminCategories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useMenu();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catData = {
      ...editingCategory,
      id: editingCategory.id || Math.random().toString(36).substr(2, 9),
    } as Category;

    if (editingCategory.id) {
      updateCategory(catData);
    } else {
      addCategory(catData);
    }
    setIsModalOpen(false);
    setEditingCategory({});
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingCategory({ name: '', image: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter"
          >
            KATEGORIYALAR
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1"
          >
            Menyu bo'limlarini shakllantirish
          </motion.p>
        </div>
        <Button onClick={openNew} size="lg" className="font-black uppercase italic tracking-widest gap-2">
          <Plus size={18} /> Yangi kategoriya
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
            {categories.map((cat, index) => (
            <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                key={cat.id} 
            >
              <Card className="overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-black text-slate-900 uppercase italic tracking-tighter text-lg">{cat.name}</h3>
                    <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="icon" onClick={() => openEdit(cat)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Edit2 size={16} /></Button>
                        <Button variant="outline" size="icon" onClick={() => deleteCategory(cat.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 size={16} /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
              {editingCategory.id ? 'Tahrirlash' : 'Yangi kategoriya'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nomi</Label>
                <Input 
                  required
                  value={editingCategory.name || ''} 
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="p-6 rounded-2xl font-bold text-lg"
                  placeholder="Masalan: Burgerlar"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Rasm URL</Label>
                <div className="flex gap-3">
                    <Input 
                        required
                        value={editingCategory.image || ''} 
                        onChange={e => setEditingCategory({...editingCategory, image: e.target.value})}
                        className="flex-1 p-6 rounded-2xl font-bold text-sm"
                        placeholder="https://..."
                    />
                    {editingCategory.image && (
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                            <img src={editingCategory.image} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>

            <Button type="submit" size="lg" className="w-full py-6 rounded-2xl font-black text-xl uppercase italic tracking-tighter mt-4">
                Saqlash
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
