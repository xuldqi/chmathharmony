import React, { useState } from 'react';

interface RestOverlayProps {
  onUnlock: () => void;
}

const RestOverlay: React.FC<RestOverlayProps> = ({ onUnlock }) => {
  const [showPinPad, setShowPinPad] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePinInput = (num: string) => {
    if (inputPin.length < 4) {
      const nextPin = inputPin + num;
      setInputPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        const savedPin = localStorage.getItem('parent_pin');
        if (savedPin && nextPin === savedPin) {
          onUnlock(); // PIN correct, unlock for this session
        } else {
          setErrorMsg('密码错误');
          setTimeout(() => setInputPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setInputPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  if (showPinPad) {
    return (
      <div className="fixed inset-0 bg-[#E8F6F1] z-[9999] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm bg-white rounded-[32px] p-8 pop-shadow">
          <h2 className="text-2xl font-black text-[#4B454E] mb-2">家长解锁</h2>
          <p className="text-[#8A8490] mb-8 text-sm font-bold">请输入家长密码临时解锁</p>
          
          <div className="flex justify-center gap-3 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  i < inputPin.length ? 'bg-[#66DDB3] scale-110' : 'bg-[#E5E7EB]'
                }`}
              />
            ))}
          </div>

          {errorMsg && <div className="text-[#EF4444] text-center text-sm font-black mb-5 animate-pulse">{errorMsg}</div>}

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePinInput(num.toString())}
                className="h-14 rounded-2xl bg-white border border-[#F1F5F9] shadow-sm text-lg font-black text-[#4B454E] active:translate-y-1 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowPinPad(false)}
              className="h-14 rounded-2xl bg-white border border-[#F1F5F9] shadow-sm text-sm font-black text-[#8A8490] active:translate-y-1 transition-all"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => handlePinInput('0')}
              className="h-14 rounded-2xl bg-white border border-[#F1F5F9] shadow-sm text-lg font-black text-[#4B454E] active:translate-y-1 transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-14 rounded-2xl bg-white border border-[#F1F5F9] shadow-sm text-lg font-black text-[#8A8490] active:translate-y-1 transition-all"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#E8F6F1] z-[9999] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
        <span className="text-lg font-bold text-indigo-200">休息中</span>
      </div>
      <h1 className="text-3xl font-black text-[#4B454E] mb-4">休息一下吧</h1>
      <p className="text-lg font-bold text-gray-500 max-w-xs mb-10">
        你今天的学习时间已达上限，眼睛需要休息哦。请联系家长解锁或明天再来挑战吧！
      </p>
      <button 
        type="button" 
        onClick={() => setShowPinPad(true)}
        className="px-6 py-3 bg-white text-[#4B454E] rounded-full shadow-sm font-black active:translate-y-1 transition-all"
      >
        家长解锁
      </button>
    </div>
  );
};

export default RestOverlay;
