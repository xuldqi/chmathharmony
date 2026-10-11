import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

export default function ContactUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12 text-[#4B454E]">
      <AppPageHeader title="联系我们" onBack={() => navigate(-1)} className="mb-4" />

      <div className="max-w-md mx-auto w-full"><div className="bg-white rounded-[24px] p-6 pop-shadow space-y-6">
        <section>
          <h3 className="text-lg font-black text-[#4B454E] mb-2">反馈建议</h3>
          <p className="text-[#9CA3AF] text-sm font-bold leading-relaxed">
            如果您在使用过程中有任何建议或发现问题，欢迎通过以下方式联系我们。
          </p>
        </section>
        <section>
          <h3 className="text-lg font-black text-[#4B454E] mb-2">技术支持</h3>
          <p className="text-[#9CA3AF] text-sm font-bold leading-relaxed">
            遇到技术问题？我们的技术团队随时为您提供帮助。请详细描述问题，我们会尽快回复。
          </p>
        </section>
        <section>
          <h3 className="text-lg font-black text-[#4B454E] mb-2">合作洽谈</h3>
          <p className="text-[#9CA3AF] text-sm font-bold leading-relaxed">
            如果您有合作意向或商务咨询，欢迎与我们联系。我们期待与您的合作。
          </p>
        </section>
        <section>
          <h3 className="text-lg font-black text-[#4B454E] mb-2">联系方式</h3>
          <p className="text-[#9CA3AF] text-sm font-bold leading-relaxed whitespace-pre-line">
            邮箱：970951698@qq.com
            工作时间：周一至周五 9:00-18:00
          </p>
        </section>
      </div></div></div>);}
