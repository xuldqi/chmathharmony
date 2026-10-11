import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import {
  Mic,
  ShieldCheck,
  Shield,
  Smile,
  AlertTriangle,
  FileText,
  Mail,
  ChevronRight,
  Heart,
  Star,
  Sliders,
} from 'lucide-react';
import '@/styles/settings-page.css';
import AppPageHeader from '@/components/AppPageHeader';

const SETTINGS_ITEMS = [
  { title: '底栏导航定制', desc: '自由更换前3个Tab功能、名称与图标', icon: Sliders, bg: '#8B5CF6', route: '/tab-customize' },
  { title: '语音设置', desc: '选择个性化伴读语音', icon: Mic, bg: '#2DD4BF', route: '/voice-select' },
  { title: '家长设置', desc: '家长控制与防沉迷设置', icon: ShieldCheck, bg: '#6366F1', route: '/parent-dashboard' },
  { title: '隐私政策', desc: '了解我们如何保护您的隐私', icon: Shield, bg: '#3B82F6', route: '/privacy-policy' },
  { title: '儿童隐私政策', desc: '专门为儿童用户制定的隐私保护政策', icon: Smile, bg: '#EC4899', route: '/children-privacy' },
  { title: '问题举报', desc: '举报不当内容或安全隐患', icon: AlertTriangle, bg: '#EF4444', route: '/report-issue' },
  { title: '用户协议', desc: '使用条款和服务协议', icon: FileText, bg: '#22C55E', route: '/user-agreement' },
  { title: '联系我们', desc: '反馈建议和技术支持', icon: Mail, bg: '#F97316', route: '/contact' },
];

export default function Settings() {
  const navigate = useNavigate();
  const [appVersion, setAppVersion] = useState('v1.3.4');

  useEffect(() => {
    CapacitorApp.getInfo()
      .then((info) => {
        if (info?.version) {
          setAppVersion(`v${info.version}`);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="settings-page bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] min-h-screen w-full flex flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12 text-[#4B454E]">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
        <AppPageHeader title="设置" onBack={() => navigate(-1)} className="mb-4" />

        <div className="flex flex-col gap-4 w-full pb-8">
        {SETTINGS_ITEMS.map((item) => (
          <button
            key={item.route}
            type="button"
            onClick={() => navigate(item.route)}
            className="bg-white w-full rounded-[24px] p-4 flex items-center justify-between pop-shadow pop-shadow-active transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div
                className="w-[48px] h-[48px] shrink-0 rounded-[16px] flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: item.bg }}
              >
                <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-lg font-black text-[#4B454E] truncate leading-tight">{item.title}</span>
                <span className="text-[13px] font-bold text-[#9CA3AF] truncate leading-tight">{item.desc}</span>
              </div>
            </div>
            <div className="pl-2 shrink-0">
              <ChevronRight className="w-5 h-5 text-[#D1D5DB]" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto flex justify-center w-full pb-2">
        <div className="bg-white rounded-full px-8 py-3 pop-shadow-sm flex items-center gap-3">
          <Heart className="w-4 h-4 text-[#F43F5E] fill-[#F43F5E] animate-pulse" />
          <span className="text-[13px] font-bold text-[#8A8490] tracking-wide">
            语音计算器 {appVersion}
          </span>
          <Star className="w-4 h-4 text-[#EAB308] fill-[#EAB308]" />
        </div>
      </div>
      </div>
    </div>
  );
}
