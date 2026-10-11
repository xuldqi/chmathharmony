import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] p-5 text-[#4B454E]">
      <AppPageHeader title="关于我们" onBack={() => navigate(-1)} className="mb-4" />

      <div className="bg-white rounded-[24px] p-6 pop-shadow space-y-6">
        <section>
          <h3 className="text-lg font-black text-[#4B454E] mb-2">我们的使命</h3>
          <p className="text-[#9CA3AF] text-sm font-bold leading-relaxed">
            让每个孩子都能在快乐中学习数学，通过语音交互和游戏化的方式培养数学思维和计算能力。
          </p>
        </section>
        <section>
          <h3 className="text-lg font-black text-[#4B454E] mb-2">产品特色</h3>
          <p className="text-[#9CA3AF] text-sm font-bold leading-relaxed whitespace-pre-line">
            语音交互计算器、数学练习功能、数学大冒险游戏、自定义语音方案、学习进度跟踪
          </p>
        </section>
        <section>
          <h3 className="text-lg font-black text-[#4B454E] mb-2">开发理念</h3>
          <p className="text-[#9CA3AF] text-sm font-bold leading-relaxed">
            我们相信学习应该是快乐的。通过语音交互和精心设计的游戏机制，让孩子在探索中学习，在挑战中成长。
          </p>
        </section>
      </div>
    </div>
  );
}
