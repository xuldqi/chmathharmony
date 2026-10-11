import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Volume2, RotateCcw, ArrowRightLeft } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

/**
 * 阿拉伯数字金额转人民币大写汉字算法
 */
function digitToChineseUppercase(n: number | string): string {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];

  let num = Number(n);
  if (isNaN(num)) return '请输入有效金额';
  if (num === 0) return '零元整';

  const head = num < 0 ? '负' : '';
  num = Math.abs(num);

  let s = '';
  // 处理小数部分（角、分）
  const decPart = Math.floor(Math.round((num % 1) * 100));
  const jiao = Math.floor(decPart / 10);
  const fen = decPart % 10;

  if (jiao === 0 && fen === 0) {
    s = '整';
  } else {
    if (jiao > 0) s += digit[jiao] + fraction[0];
    else if (fen > 0) s += '零';
    if (fen > 0) s += digit[fen] + fraction[1];
  }

  // 处理整数部分
  let intPart = Math.floor(num);
  for (let i = 0; i < unit[0].length && intPart > 0; i++) {
    let p = '';
    for (let j = 0; j < unit[1].length && intPart > 0; j++) {
      p = digit[intPart % 10] + unit[1][j] + p;
      intPart = Math.floor(intPart / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  const res = head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
  return res.startsWith('元') ? res.substring(1) : res;
}

export default function AmountWords() {
  const navigate = useNavigate();
  const { speakText } = useAudio();
  const [inputVal, setInputVal] = useState<string>('1234.56');
  const [copied, setCopied] = useState<boolean>(false);

  const uppercaseResult = useMemo(() => {
    if (!inputVal.trim()) return '';
    return digitToChineseUppercase(inputVal);
  }, [inputVal]);

  const handleCopy = () => {
    if (!uppercaseResult || uppercaseResult === '请输入有效金额') return;
    try {
      navigator.clipboard.writeText(uppercaseResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.warn('复制失败:', e);
    }
  };

  const handlePlayVoice = () => {
    if (!uppercaseResult || uppercaseResult === '请输入有效金额') return;
    void speakText(uppercaseResult);
  };

  const handleQuickNumber = (numStr: string) => {
    setInputVal(numStr);
  };

  return (
    <div className="bg-gradient-to-b from-[#FFF7ED] via-[#F8FAFC] to-[#F1F5F9] min-h-screen w-full flex flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12 text-[#334155]">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
        {/* 顶部标题栏 */}
        <AppPageHeader
          title="大写金额"
          onBack={() => navigate(-1)}
          className="mb-3"
        />

        <div className="flex-1 flex flex-col gap-4 w-full">
        {/* 输入面板 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#FED7AA]/40 flex flex-col gap-2">
          <label className="text-xs font-black text-[#EA580C] flex items-center justify-between">
            <span>输入阿拉伯数字金额 (¥)</span>
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="text-[#94A3B8] hover:text-slate-700 flex items-center gap-0.5 text-[11px]"
              >
                <RotateCcw className="w-3 h-3" /> 清空
              </button>
            )}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#EA580C]">¥</span>
            <input
              type="number"
              step="any"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="0.00"
              className="w-full text-2xl font-black text-[#1E293B] bg-transparent outline-none placeholder:text-[#CBD5E1]"
            />
          </div>

          {/* 快捷参考数值 */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto mine-hide-scrollbar">
            {['100', '520', '1314', '8888.88', '100000'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleQuickNumber(item)}
                className="text-xs font-bold text-[#64748B] bg-[#FFF7ED] hover:bg-[#FFEDD5] px-2.5 py-1 rounded-lg shrink-0 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 转换箭头 */}
        <div className="flex justify-center -my-1">
          <div className="w-8 h-8 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shadow-xs">
            <ArrowRightLeft className="w-4 h-4 rotate-90" />
          </div>
        </div>

        {/* 转换结果面板 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E2E8F0] flex flex-col gap-3">
          <span className="text-xs font-black text-[#64748B]">人民币中文大写</span>
          
          <div className="min-h-[72px] flex items-center justify-start">
            <p className="text-xl font-black text-[#1E293B] leading-relaxed break-all select-all">
              {uppercaseResult || '等待输入数字...'}
            </p>
          </div>

          {/* 操作按钮组 */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={handlePlayVoice}
              disabled={!uppercaseResult || uppercaseResult === '请输入有效金额'}
              className="flex-1 py-3 rounded-2xl bg-[#FFF7ED] text-[#EA580C] font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40"
            >
              <Volume2 className="w-4 h-4" />
              <span>大写朗读</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!uppercaseResult || uppercaseResult === '请输入有效金额'}
              className="flex-1 py-3 rounded-2xl bg-[#EA580C] text-white font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>已复制大写</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>一键复制</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 大写对照参考小卡片 */}
        <div className="bg-white/70 rounded-[20px] p-4 text-[11px] font-bold text-[#64748B] flex flex-col gap-1.5 border border-[#F1F5F9]">
          <span className="font-black text-[#334155]">标准大写对照规范：</span>
          <div className="grid grid-cols-5 gap-1 text-center py-1">
            <span>壹 (1)</span>
            <span>贰 (2)</span>
            <span>叁 (3)</span>
            <span>肆 (4)</span>
            <span>伍 (5)</span>
            <span>陆 (6)</span>
            <span>柒 (7)</span>
            <span>捌 (8)</span>
            <span>玖 (9)</span>
            <span>拾 (10)</span>
          </div>
          <p className="text-[#94A3B8] text-[10px]">
            符合国家财务收据、发票填写规范，有效防篡改。
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
