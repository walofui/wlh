import React from 'react';
import { X, User } from 'lucide-react';

interface UserProfileProps {
  onClose: () => void;
  userName: string;
}

export default function UserProfile({ onClose, userName }: UserProfileProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="p-8">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{userName}</h2>
            <p className="text-gray-600 mb-6">عضو في FarsDos Games</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">معلومات الحساب</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">الاسم:</span> {userName}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">تاريخ الانضمام:</span> {new Date().toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">إحصائيات</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">0</p>
                  <p className="text-gray-600">الطلبات</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">0</p>
                  <p className="text-gray-600">المراجعات</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}