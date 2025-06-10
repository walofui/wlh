import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, X, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Game {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

interface Banner {
  id: string;
  text: string;
  active: boolean;
}

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'games' | 'banners'>('games');
  const [isEditing, setIsEditing] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameFormData, setGameFormData] = useState({
    title: '',
    price: '',
    image: '',
    category: 'اكشن'
  });
  const [bannerFormData, setBannerFormData] = useState({
    text: '',
    active: true
  });

  useEffect(() => {
    fetchGames();
    fetchBanners();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('حدث خطأ أثناء تحميل الألعاب');
    }
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('حدث خطأ أثناء تحميل الإعلانات');
    }
  };

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const gameData = {
      title: gameFormData.title,
      price: parseFloat(gameFormData.price),
      image: gameFormData.image,
      category: gameFormData.category
    };

    try {
      if (editingGame) {
        const { error } = await supabase
          .from('games')
          .update(gameData)
          .eq('id', editingGame.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('games')
          .insert([gameData]);

        if (error) throw error;
      }

      await fetchGames();
      resetGameForm();
    } catch (err) {
      console.error('Error saving game:', err);
      setError('حدث خطأ أثناء حفظ اللعبة');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update(bannerFormData)
          .eq('id', editingBanner.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('banners')
          .insert([bannerFormData]);

        if (error) throw error;
      }

      await fetchBanners();
      resetBannerForm();
    } catch (err) {
      console.error('Error saving banner:', err);
      setError('حدث خطأ أثناء حفظ الإعلان');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGame = (game: Game) => {
    setIsEditing(true);
    setEditingGame(game);
    setGameFormData({
      title: game.title,
      price: game.price.toString(),
      image: game.image,
      category: game.category
    });
    setActiveTab('games');
  };

  const handleEditBanner = (banner: Banner) => {
    setIsEditing(true);
    setEditingBanner(banner);
    setBannerFormData({
      text: banner.text,
      active: banner.active
    });
    setActiveTab('banners');
  };

  const handleDeleteGame = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه اللعبة؟')) return;

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchGames();
    } catch (err) {
      console.error('Error deleting game:', err);
      setError('حدث خطأ أثناء حذف اللعبة');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBanners();
    } catch (err) {
      console.error('Error deleting banner:', err);
      setError('حدث خطأ أثناء حذف الإعلان');
    }
  };

  const resetGameForm = () => {
    setIsEditing(false);
    setEditingGame(null);
    setGameFormData({
      title: '',
      price: '',
      image: '',
      category: 'اكشن'
    });
  };

  const resetBannerForm = () => {
    setIsEditing(false);
    setEditingBanner(null);
    setBannerFormData({
      text: '',
      active: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl relative mt-8">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">لوحة تحكم المدير</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-4 space-x-reverse mb-6">
            <button
              onClick={() => setActiveTab('games')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'games'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PlusCircle className="h-5 w-5 ml-2" />
              الألعاب
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'banners'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="h-5 w-5 ml-2" />
              الإعلانات
            </button>
          </div>

          {activeTab === 'games' ? (
            <>
              {/* Games Form */}
              <form onSubmit={handleGameSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">
                  {isEditing ? 'تعديل اللعبة' : 'إضافة لعبة جديدة'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">اسم اللعبة</label>
                    <input
                      type="text"
                      value={gameFormData.title}
                      onChange={(e) => setGameFormData({ ...gameFormData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">السعر</label>
                    <input
                      type="number"
                      step="0.01"
                      value={gameFormData.price}
                      onChange={(e) => setGameFormData({ ...gameFormData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">رابط الصورة</label>
                    <input
                      type="url"
                      value={gameFormData.image}
                      onChange={(e) => setGameFormData({ ...gameFormData, image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">التصنيف</label>
                    <select
                      value={gameFormData.category}
                      onChange={(e) => setGameFormData({ ...gameFormData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="اكشن">اكشن</option>
                      <option value="رياضة">رياضة</option>
                      <option value="مغامرات">مغامرات</option>
                      <option value="منوعات">منوعات</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2 space-x-reverse">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetGameForm}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      إلغاء
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'جاري الحفظ...' : isEditing ? 'حفظ التغييرات' : 'إضافة اللعبة'}
                  </button>
                </div>
              </form>

              {/* Games List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        اللعبة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        السعر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التصنيف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {games.map((game) => (
                      <tr key={game.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <img
                              src={game.image}
                              alt={game.title}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <div>{game.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {game.price} ريال
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {game.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleEditGame(game)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGame(game.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              {/* Banners Form */}
              <form onSubmit={handleBannerSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">
                  {isEditing ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">نص الإعلان</label>
                    <input
                      type="text"
                      value={bannerFormData.text}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      checked={bannerFormData.active}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, active: e.target.checked })}
                      className="ml-2"
                    />
                    <label htmlFor="active" className="text-gray-700">
                      نشط
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2 space-x-reverse">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetBannerForm}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      إلغاء
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'جاري الحفظ...' : isEditing ? 'حفظ التغييرات' : 'إضافة الإعلان'}
                  </button>
                </div>
              </form>

              {/* Banners List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نص الإعلان
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {banners.map((banner) => (
                      <tr key={banner.id}>
                        <td className="px-6 py-4">
                          {banner.text}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            banner.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {banner.active ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleEditBanner(banner)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}