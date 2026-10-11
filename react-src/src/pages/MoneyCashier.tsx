import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import '@/styles/money-cashier-page.css';
import AppPageHeader from '@/components/AppPageHeader';

interface Product {
  id: number;
  name: string;
  tag: string;
  bg: string;
  price: number;
}

interface CartItem extends Product {
  count: number;
}

const PRODUCTS: Product[] = [
  { id: 0, name: '苹果', tag: '果', bg: 'bg-rose-400 text-white', price: 2 },
  { id: 1, name: '香蕉', tag: '蕉', bg: 'bg-amber-400 text-white', price: 3 },
  { id: 2, name: '牛奶', tag: '奶', bg: 'bg-sky-400 text-white', price: 5 },
  { id: 3, name: '面包', tag: '包', bg: 'bg-orange-400 text-white', price: 4 },
  { id: 4, name: '糖果', tag: '糖', bg: 'bg-pink-400 text-white', price: 1 },
  { id: 5, name: '小汽车', tag: '车', bg: 'bg-indigo-400 text-white', price: 10 },
];

const MoneyCashier: React.FC = () => {
  const navigate = useNavigate();
  const { playNumber, playCorrect, playWrong, isAudioEnabled, speakText } = useAudio();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [paid, setPaid] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.count, 0),
    [cart],
  );

  const canCheckout = total > 0;

  const speakAmount = (amount: number) => {
    if (!isAudioEnabled) return;
    speakText(`${amount}元`, 1.0);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, count: item.count + 1 } : item,
        );
      }
      return [...prev, { ...product, count: 1 }];
    });
    speakAmount(product.price);
  };

  const pay = (amount: number) => {
    setPaid((prev) => prev + amount);
    speakAmount(amount);
  };

  const resetGame = () => {
    setCart([]);
    setPaid(0);
    setShowModal(false);
    setToastMessage(null);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const checkout = () => {
    if (total === 0) return;

    if (paid === total) {
      playCorrect();
      setShowModal(true);
    } else if (paid > total) {
      playWrong();
      showToast(`付多了哦，多了 ¥${paid - total} !`);
    } else {
      playWrong();
      showToast(`还差 ¥${total - paid} 哦!`);
    }
  };

  const groupedCart = cart;

  return (
    <div className="money-cashier-page h-screen w-full flex flex-col relative overflow-hidden text-slate-700 selection:bg-indigo-100">
      {/* 背景光斑 */}
      <div className="fixed top-[-10%] right-[-10%] w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* 头部 */}
      <div className="pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-2 px-6 z-20 shrink-0">
        <AppPageHeader
          title="小小收银员"
          onBack={() => navigate(-1)}
          rightElement={(
            <button
              type="button"
              onClick={resetGame}
              className="bg-[#FFEF85] text-amber-900 h-11 px-4 rounded-full flex items-center gap-1.5 font-extrabold text-sm shadow-pop-yellow transition-all active:scale-95"
            >
              <span className="text-base">↺</span>
              <span>重置</span>
            </button>
          )}
        />
      </div>

      {/* 主体 */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-8 pt-4 space-y-6 z-10 scroll-smooth">
        {/* 商品货架 */}
        <section className="bg-white rounded-[32px] p-5 shadow-card relative">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-700">商品货架</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {PRODUCTS.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                className="bg-slate-50 border-2 border-slate-100 rounded-[24px] p-2 flex flex-col items-center justify-between h-32 active:scale-95 transition-transform relative group"
              >
                <div className={`w-11 h-11 rounded-2xl ${product.bg} flex items-center justify-center font-black text-base mt-2 shadow-sm group-hover:scale-105 transition-transform`}>
                  {product.tag}
                </div>
                <div className="flex flex-col items-center w-full">
                  <span className="font-bold text-slate-600 text-sm mb-1">
                    {product.name}
                  </span>
                  <div className="bg-[#66DDB3] text-white text-xs font-black px-3 py-1 rounded-full shadow-sm w-full text-center">
                    ¥{product.price}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 购物车与总额 */}
        <section className="bg-white rounded-[32px] p-5 shadow-card overflow-hidden">
          <h2 className="text-lg font-black text-slate-700 mb-4">购物车明细：</h2>

          <div className="min-h-[60px] max-h-[150px] overflow-y-auto no-scrollbar mb-4 space-y-2">
            {groupedCart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-4 animate-pop-in">
                <ShoppingCart className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-bold">购物车是空的～</p>
              </div>
            ) : (
              groupedCart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 animate-pop-in"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center font-black text-xs shadow-xs`}>{item.tag}</span>
                    <span className="font-bold text-slate-600">{item.name}</span>
                    <span className="bg-indigo-100 text-indigo-500 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                      x{item.count}
                    </span>
                  </div>
                  <span className="font-bold text-slate-700">
                    ¥{item.price * item.count}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="h-0.5 w-full bg-slate-100 mb-4 border-dashed border-t-2 border-slate-200/50" />

          <div className="flex justify-between items-end">
            <span className="font-extrabold text-slate-500 mb-1">应付总额：</span>
            <span className="font-black text-3xl text-[#4BC29A]">¥{total}</span>
          </div>
        </section>

        {/* 付款区域 */}
        <section className="bg-white rounded-[32px] p-5 shadow-card">
          <h2 className="text-lg font-black text-slate-700 mb-4">请付钱：</h2>

          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => pay(1)}
              className="w-16 h-16 rounded-full bg-[#FFEF85] shadow-pop-yellow flex items-center justify-center text-xl font-black text-amber-800 border-4 border-white active:scale-95 transition-all"
            >
              ¥1
            </button>
            <button
              type="button"
              onClick={() => pay(5)}
              className="w-16 h-16 rounded-full bg-[#66DDB3] shadow-pop-mint flex items-center justify-center text-xl font-black text-white border-4 border-white active:scale-95 transition-all"
            >
              ¥5
            </button>
            <button
              type="button"
              onClick={() => pay(10)}
              className="w-16 h-16 rounded-full bg-[#A5B4FC] shadow-pop-blue flex items-center justify-center text-xl font-black text-white border-4 border-white active:scale-95 transition-all"
            >
              ¥10
            </button>
          </div>

          <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="font-bold text-slate-500">已付金额：</span>
            <span className="font-black text-2xl text-indigo-500">¥{paid}</span>
          </div>
        </section>

        {/* 结账按钮 */}
        <button
          type="button"
          onClick={checkout}
          className={`w-full bg-[#66DDB3] text-white text-xl font-black py-4 rounded-[24px] shadow-pop-mint active:scale-[0.98] transition-all ${
            !canCheckout ? 'disabled-btn' : ''
          } ${paid >= total && total > 0 ? 'animate-pulse' : ''}`}
        >
          结账确认
        </button>

        <div className="h-4" />
      </main>

      {/* 成功弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="bg-white rounded-[40px] p-8 w-[80%] max-w-sm shadow-2xl transform scale-100 flex flex-col items-center text-center relative z-10">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">支付成功!</h3>
            <p className="text-slate-500 font-bold mb-8">
              你真是一个优秀的收银员！
            </p>
            <button
              type="button"
              onClick={resetGame}
              className="w-full bg-[#FFEF85] text-amber-900 font-black py-3 rounded-2xl shadow-pop-yellow active:translate-y-1 active:shadow-none transition-all"
            >
              再玩一次
            </button>
          </div>
        </div>
      )}

      {/* 提示气泡：仅在有消息时显示 */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#FF8585] text-white px-6 py-3 rounded-full font-bold shadow-pop-pink z-50 flex items-center gap-2 animate-pop-in">
          <AlertCircle className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default MoneyCashier;
