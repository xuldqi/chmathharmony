import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

const CHN_NUMS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const CHN_UNITS = ['', '拾', '佰', '仟'];
const CHN_BIG_UNITS = ['', '万', '亿', '兆'];

// 人民币数字转标准大写
function numberToChineseMoney(num: number): string {
  if (isNaN(num) || num < 0) return '零元整';
  if (num === 0) return '零元整';
  if (num > 999999999999999.99) return '金额超出最大可转换范围';

  const parts = num.toFixed(2).split('.');
  const intPartStr = parts[0];
  const decPartStr = parts[1];

  let result = '';

  // 转换整数部分（每4位为一组：万、亿、兆）
  const intLen = intPartStr.length;
  if (parseInt(intPartStr, 10) === 0) {
    result = '零元';
  } else {
    let zeroCount = 0;
    let groupCount = Math.ceil(intLen / 4);

    for (let i = 0; i < groupCount; i++) {
      const gStart = Math.max(0, intLen - (i + 1) * 4);
      const gEnd = intLen - i * 4;
      const groupStr = intPartStr.substring(gStart, gEnd);
      let groupRes = '';
      let hasNonZero = false;

      for (let j = 0; j < groupStr.length; j++) {
        const digit = parseInt(groupStr[j], 10);
        const unitIdx = groupStr.length - 1 - j;
        if (digit !== 0) {
          if (zeroCount > 0) {
            groupRes += '零';
            zeroCount = 0;
          }
          groupRes += CHN_NUMS[digit] + CHN_UNITS[unitIdx];
          hasNonZero = true;
        } else {
          zeroCount++;
        }
      }

      if (hasNonZero) {
        groupRes += CHN_BIG_UNITS[i];
      }
      result = groupRes + result;
    }
    result += '元';
  }

  // 转换小数部分
  const jiao = parseInt(decPartStr[0], 10);
  const fen = parseInt(decPartStr[1], 10);

  if (jiao === 0 && fen === 0) {
    result += '整';
  } else {
    if (jiao !== 0) {
      result += CHN_NUMS[jiao] + '角';
    } else if (parseInt(intPartStr, 10) !== 0) {
      result += '零';
    }
    if (fen !== 0) {
      result += CHN_NUMS[fen] + '分';
    }
  }

  // 清洗连零
  return result.replace(/^零元/, '').replace(/零+/g, '零').replace(/零元/, '元');
}

export default function ChineseMoneyConverter() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [inputVal, setInputVal] = useState<string>('123456.78');
  const [copied, setCopied] = useState<boolean>(false);

  const chineseUpper = useMemo(() => {
    const n = parseFloat(inputVal);
    if (isNaN(n) || n < 0) return '零元整';
    return numberToChineseMoney(n);
  }, [inputVal]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chineseUpper);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    speakText(`人民币大写：${chineseUpper}`);
  };

  const handleSetExample = (val: string) => {
    setInputVal(val);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      {/* 顶部导航 */}
      <AppPageHeader
          title="大写金额转换器"
          subtitle="发票与财务标准规范"
          onBack={() => navigate(-1)}
          rightElement={
            <button onClick={handleSpeak} className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all">语音播报</button>
          }
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 输入数字金额 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-400">输入阿拉伯数字金额 (¥ 元)</label>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
            <span className="text-xl font-black text-slate-400 mr-2">¥</span>
            <input
              type="number"
              step="any"
              min="0"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent font-black text-2xl text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            <button
              onClick={() => handleSetExample('8888.88')}
              className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl active:scale-95 transition-all"
            >
              ¥8,888.88
            </button>
            <button
              onClick={() => handleSetExample('100050.00')}
              className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl active:scale-95 transition-all"
            >
              ¥100,050.00 (带零)
            </button>
            <button
              onClick={() => handleSetExample('10000000.50')}
              className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl active:scale-95 transition-all"
            >
              ¥一千万角分
            </button>
          </div>
        </div>

        {/* 大写金额结果卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">标准汉字大写</span>
            <button
              onClick={handleCopy}
              className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all ${
                copied
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 active:scale-95'
              }`}
            >
              {copied ? '✓ 已复制' : '复制大写'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50/40 p-4 rounded-2xl border border-rose-100 text-center">
            <div className="text-xl font-black text-rose-700 leading-relaxed tracking-wider break-all select-text">
              {chineseUpper}
            </div>
          </div>
        </div>

        {/* 银行发票规范速查对照表 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">大写对照规范</span>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { num: '0', char: '零' },
              { num: '1', char: '壹' },
              { num: '2', char: '贰' },
              { num: '3', char: '叁' },
              { num: '4', char: '肆' },
              { num: '5', char: '伍' },
              { num: '6', char: '陆' },
              { num: '7', char: '柒' },
              { num: '8', char: '捌' },
              { num: '9', char: '玖' },
              { num: '10', char: '拾' },
              { num: '100', char: '佰' },
              { num: '1k', char: '仟' },
              { num: '10k', char: '万' },
              { num: '100m', char: '亿' },
            ].map(item => (
              <div key={item.num} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">{item.num}</span>
                <span className="text-base font-black text-slate-800">{item.char}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
