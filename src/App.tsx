import React, { useState, useEffect } from 'react';
import { ShoppingCart as CartIcon, Gamepad2, Search, Menu, Settings, LogOut, User } from 'lucide-react';
import { supabase, initializeSupabase } from './lib/supabase';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import ShoppingCart from './components/ShoppingCart';
import UserProfile from './components/UserProfile';

interface Game {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Game {
  quantity: number;
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

const DEMO_GAMES: Game[] = [
  {
    id: '1',
    title: 'FIFA 24',
    price: 299,
    image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
    category: 'رياضة'
  },
  {
    id: '2',
    title: 'Call of Duty',
    price: 259,
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
    category: 'اكشن'
  },
  {
    id: '3',
    title: 'Assassin\'s Creed',
    price: 199,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    category: 'مغامرات'
  },
  {
    id: '4',
    title: 'Grand Theft Auto',
    price: 179,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    category: 'اكشن'
  }
];

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          console.log('Supabase credentials not found, using demo mode');
          setConnectionError(true);
          setIsDemo(true);
          setGames(DEMO_GAMES);
          return;
        }

        const isConnected = await initializeSupabase();
        
        if (!isConnected) {
          console.log('Supabase connection failed, using demo mode');
          setConnectionError(true);
          setIsDemo(true);
          setGames(DEMO_GAMES);
          return;
        }

        // Only try to check auth and fetch games if we have a successful connection
        setConnectionError(false);
        setIsDemo(false);
        await checkAuth();
        await fetchGames();
      } catch (err: any) {
        console.error('Initialization error:', err);
        
        // Check if it's a network/CORS error
        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          console.warn('Network connectivity issue detected. Using demo mode.');
        }
        
        setConnectionError(true);
        setIsDemo(true);
        setGames(DEMO_GAMES);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Only set up auth listener if we're not in demo mode
    if (isDemo) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setIsLoggedIn(!!session);
        if (session?.user) {
          setUserName(session.user.user_metadata.name || session.user.email);
          
          const { data: adminRole, error: adminError } = await supabase
            .from('admin_roles')
            .select('user_id')
            .eq('user_id', session.user.id)
            .single();
            
          if (adminError && adminError.code !== 'PGRST116') {
            throw adminError;
          }
          
          setIsAdmin(!!adminRole);
        } else {
          setUserName('');
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemo]);

  const checkAuth = async () => {
    if (isDemo) return;
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        setIsLoggedIn(true);
        setUserName(session.user.user_metadata.name || session.user.email);
        
        const { data: adminRole, error: adminError } = await supabase
          .from('admin_roles')
          .select('user_id')
          .eq('user_id', session.user.id)
          .single();
          
        if (adminError && adminError.code !== 'PGRST116') {
          throw adminError;
        }
        
        setIsAdmin(!!adminRole);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  };

  const fetchGames = async () => {
    if (isDemo) return;

    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching games, using demo data:', error);
        setIsDemo(true);
        setGames(DEMO_GAMES);
        return;
      }

      setGames(data || DEMO_GAMES);
    } catch (err: any) {
      console.error('Error fetching games:', err);
      
      // Handle network errors gracefully
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        console.warn('Network error while fetching games. Using demo data.');
      }
      
      setIsDemo(true);
      setGames(DEMO_GAMES);
    }
  };

  const handleLogout = async () => {
    if (!isDemo) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowAdmin(false);
    setShowProfile(false);
  };

  const handleLoginSuccess = (adminStatus: boolean, name: string) => {
    setIsLoggedIn(true);
    setIsAdmin(adminStatus);
    setUserName(name);
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 3000);
  };

  const addToCart = (game: Game) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === game.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === game.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...game, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleCheckout = (orderDetails: OrderDetails) => {
    console.log('Order details:', orderDetails);
    setOrderSuccess(true);
    setCartItems([]);
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  const filteredGames = selectedCategory
    ? games.filter(game => game.category === selectedCategory)
    : games;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {connectionError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="text-center">
            <p className="text-lg font-semibold">وضع العرض التجريبي</p>
            <p className="text-sm mt-1">لا يمكن الاتصال بقاعدة البيانات حالياً</p>
          </div>
        </div>
      )}

      {showWelcome && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <p className="text-lg">مرحباً بك {userName}! 👋</p>
        </div>
      )}

      {orderSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          تم تأكيد طلبك بنجاح! سيتم التواصل معك قريباً
        </div>
      )}

      {/* Header */}
      <header className="bg-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Gamepad2 className="h-8 w-8" />
              <h1 className="text-xl font-bold">FarsDos Games</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن الألعاب..."
                  className="w-64 px-4 py-2 text-gray-900 rounded-lg focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <button 
                className="p-2 rounded-full hover:bg-indigo-700 relative"
                onClick={() => setShowCart(true)}
              >
                <CartIcon className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => setShowProfile(true)}
                        className="flex items-center px-4 py-2 text-white hover:bg-indigo-700 rounded-lg"
                      >
                        <User className="h-5 w-5 ml-2" />
                        <span>{userName}</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setShowAdmin(true)}
                          className="p-2 rounded-full hover:bg-indigo-700"
                          title="لوحة تحكم المدير"
                        >
                          <Settings className="h-6 w-6" />
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-white hover:bg-indigo-700 rounded-lg flex items-center"
                      >
                        <LogOut className="h-5 w-5 ml-2" />
                        تسجيل الخروج
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowLogin(true)} 
                      className="px-4 py-2 text-white hover:bg-indigo-700 rounded-lg"
                      disabled={isDemo}
                    >
                      تسجيل الدخول
                    </button>
                    <button 
                      onClick={() => setShowRegister(true)}
                      className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                      disabled={isDemo}
                    >
                      إنشاء حساب
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <button className="md:hidden p-2">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sales Banner */}
      <div className="bg-yellow-500 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <p className="text-lg font-bold">🎮 تخفيضات حصرية على جميع الألعاب! وفر حتى 50% 🎮</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex space-x-4 space-x-reverse mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === null
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            الكل
          </button>
          {['اكشن', 'رياضة', 'مغامرات', 'منوعات'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map(game => (
            <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{game.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-bold">{game.price} ريال</span>
                  <button
                    onClick={() => addToCart(game)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    إضافة للسلة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showLogin && !isDemo && (
        <Login
          onClose={() => setShowLogin(false)}
          onRegister={() => { setShowLogin(false); setShowRegister(true); }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {showRegister && !isDemo && (
        <Register
          onClose={() => setShowRegister(false)}
          onLogin={() => { setShowRegister(false); setShowLogin(true); }}
        />
      )}
      {showAdmin && isAdmin && !isDemo && (
        <AdminDashboard
          onClose={() => setShowAdmin(false)}
        />
      )}
      {showCart && (
        <ShoppingCart
          items={cartItems}
          onClose={() => setShowCart(false)}
          onRemoveItem={removeFromCart}
          onUpdateQuantity={updateCartItemQuantity}
          onCheckout={handleCheckout}
        />
      )}
      {showProfile && !isDemo && (
        <UserProfile
          onClose={() => setShowProfile(false)}
          userName={userName}
        />
      )}
    </div>
  );
}

export default App;