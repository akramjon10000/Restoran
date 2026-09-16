
import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';

const AdminMenu = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useMenu();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...editingProduct,
      price: Number(editingProduct.price),
      id: editingProduct.id || Math.random().toString(36).substr(2, 9),
      popular: editingProduct.popular || false,
      category: editingProduct.category || (categories[0]?.id || ''),
    } as Product;

    if (editingProduct.id) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
    setEditingProduct({});
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingProduct({ category: categories[0]?.id || '', image: '', images: ['', ''] });
    setIsModalOpen(true);
  };

  const handleImageChange = (index: number, val: string) => {
      if (index === 0) {
          setEditingProduct({ ...editingProduct, image: val });
      } else {
          const newImgs = [...(editingProduct.images || ['', ''])];
          newImgs[index - 1] = val;
          setEditingProduct({ ...editingProduct, images: newImgs });
      }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black text-slate-900"
          >
            Mahsulotlar Manageri
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-xs font-bold uppercase"
          >
            Jami {products.length} ta mahsulot
          </motion.p>
        </div>
        <Button onClick={openNew} className="font-bold text-sm gap-2">
          <Plus size={16} /> Qo'shish
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <AnimatePresence>
            {products.map((product, index) => {
            const cat = categories.find(c => c.id === product.category);
            return (
                <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    key={product.id} 
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-3 flex gap-3">
                      <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                          <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-900">{product.name}</h3>
                          <div className="flex space-x-2">
                              <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => openEdit(product)}><Edit2 size={14} /></Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteProduct(product.id)}><Trash2 size={14} /></Button>
                          </div>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mb-1">{product.description}</p>
                          <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-red-600 text-sm">{formatCurrency(product.price)}</span>
                          <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold uppercase text-slate-500">{cat?.name || product.category}</span>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
            );
            })}
        </AnimatePresence>
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingProduct.id ? 'Tahrirlash' : 'Yangi mahsulot'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Nomi</Label>
                <Input 
                  required
                  value={editingProduct.name || ''} 
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="font-medium"
                />
            </div>
            
            <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Narxi (so'm)</Label>
                  <Input 
                      required
                      type="number"
                      value={editingProduct.price || ''} 
                      onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      className="font-medium"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Kategoriya</Label>
                  <Select 
                      value={editingProduct.category || ''}
                      onValueChange={val => setEditingProduct({...editingProduct, category: val})}
                  >
                    <SelectTrigger className="font-medium">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Rasmlar (3 tagacha)</Label>
                {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <span className="text-[10px] font-black text-slate-400 w-4">{idx + 1}</span>
                        <Input 
                            required={idx === 0}
                            value={idx === 0 ? (editingProduct.image || '') : (editingProduct.images?.[idx - 1] || '')} 
                            onChange={e => handleImageChange(idx, e.target.value)}
                            className="font-medium text-sm"
                            placeholder={idx === 0 ? "Asosiy rasm URL" : "Qo'shimcha rasm URL (ixtiyoriy)"}
                        />
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Tavsif</Label>
                <Textarea 
                  required
                  value={editingProduct.description || ''} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="font-medium resize-none h-24"
                />
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="popular"
                  checked={editingProduct.popular || false}
                  onCheckedChange={(checked) => setEditingProduct({...editingProduct, popular: checked === true})}
                />
                <Label htmlFor="popular" className="font-bold text-slate-700 cursor-pointer select-none">
                  Xit mahsulot sifatida belgilash
                </Label>
            </div>

            <Button type="submit" size="lg" className="w-full font-bold text-lg mt-4">
                Saqlash
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMenu;
