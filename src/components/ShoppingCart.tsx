import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  onClose: () => void;
  onRemoveItem: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onCheckout: (orderDetails: OrderDetails) => void;
}

interface OrderDetails {
  items: CartItem[];
  total: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export default function ShoppingCart({ items, onClose, onRemoveItem, onUpdateQuantity, onCheckout }: ShoppingCartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckout({
      items,
      total,
      customerInfo
    });
    setIsCheckingOut(false);
    onClose();
  };

  if (isCheckingOut) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end p-4 z-50">
        <div className="bg-white h-full w-full max-w-md rounded-lg shadow-xl flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">إتمام الشراء</h2>
            <button onClick={() => setIsCheckingOut(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleCheckout} className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">رقم الجوال</label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">عنوان التوصيل</label>
                <textarea
                  required
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold mb-2">ملخص الطلب</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-2">
                    <span>{item.title} (×{item.quantity})</span>
                    <span>{(item.price * item.quantity).toFixed(2)} ريال</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>المجموع:</span>
                    <span className="text-indigo-600">{total.toFixed(2)} ريال</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-6"
            >
              تأكيد الطلب
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end p-4 z-50">
      <div className="bg-white h-full w-full max-w-md rounded-lg shadow-xl flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">سلة المشتريات</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              السلة فارغة
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 space-x-reverse bg-gray-50 p-4 rounded-lg">
                  <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-indigo-600 font-bold">{item.price} ريال</p>
                    <div className="flex items-center mt-2">
                      <label className="text-sm text-gray-600 ml-2">الكمية:</label>
                      <select
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.id, Number(e.target.value))}
                        className="border rounded px-2 py-1"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold">المجموع:</span>
            <span className="font-bold text-indigo-600">{total.toFixed(2)} ريال</span>
          </div>
          <button
            onClick={() => setIsCheckingOut(true)}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            disabled={items.length === 0}
          >
            إتمام الشراء
          </button>
        </div>
      </div>
    </div>
  );
}