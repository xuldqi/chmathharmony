import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import '@/styles/report-issue-page.css';
import AppPageHeader from '@/components/AppPageHeader';
import { isHarmonyOS } from '@/lib/platform';

interface ReportForm {
  type: string;
  description: string;
  contact: string;
}

const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ReportForm>({
    type: '',
    description: '',
    contact: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const reportTypes = [
    { value: 'inappropriate', label: '不当内容', dotColor: 'border-[#FF8585]' },
    { value: 'privacy', label: '隐私问题', dotColor: 'border-[#C9B8FA]' },
    { value: 'technical', label: '技术问题', dotColor: 'border-[#66DDB3]' },
    { value: 'security', label: '安全隐患', dotColor: 'border-[#FFEF85]' },
    { value: 'other', label: '其他问题', dotColor: 'border-gray-400' },
  ];

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.error('Clipboard API failed, using fallback:', err);
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.type || !form.description) {
      setFeedback('请先选择举报类型并填写问题描述');
      return;
    }

    if (isHarmonyOS()) {
      // 鸿蒙端直接复制邮箱，并提示用户手动发送
      const copied = await copyToClipboard('970951698@qq.com');
      if (copied) {
        setFeedback('已复制邮箱 970951698@qq.com 到剪贴板，请手动发送邮件');
      } else {
        setFeedback('请复制邮箱地址发送：970951698@qq.com');
      }
      return;
    }

    // 构建邮件内容
    const selectedType = reportTypes.find((type) => type.value === form.type);
    const subject = `儿童应用举报 - ${selectedType?.label}`;
    const body = `举报类型：${selectedType?.label}

问题描述：
${form.description}

联系方式：${form.contact || '未提供'}

举报时间：${new Date().toLocaleString()}

设备信息：${'HarmonyOS'}`;

    try {
      // 构建 mailto 链接，鸿蒙端由原生层拦截并调起邮件客户端
      const mailtoUrl = `mailto:970951698@qq.com?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;

      // window.location.href 触发 mailto:，WebContainer.ets 的 onLoadIntercept 会拦截并用 startAbility 打开
      window.location.href = mailtoUrl;

      // 显示成功提示
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setForm({ type: '', description: '', contact: '' });
      }, 3000);

    } catch (error) {
      console.error('发送举报邮件失败:', error);
      setFeedback('发送失败，请直接发送邮件至 970951698@qq.com');
    }
  };

  if (isHarmonyOS()) {
    return (
      <div className="report-issue-page w-full h-full overflow-x-hidden relative selection:bg-[#66DDB3] selection:text-white">
        <div className="fixed -top-[150px] -left-[150px] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply blur-[80px] opacity-40 pointer-events-none z-0" />
        <div className="fixed -bottom-[150px] -right-[150px] w-[500px] h-[500px] bg-green-100 rounded-full mix-blend-multiply blur-[80px] opacity-60 pointer-events-none z-0" />

        {feedback && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#4B454E] text-white text-xs font-black z-30">
            {feedback}
          </div>
        )}

      <div className="relative z-10 max-w-md mx-auto min-h-screen px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12 flex flex-col">
        <AppPageHeader
          title="问题举报"
          onBack={() => navigate(-1)}
          className="mb-4"
        />

          <main className="flex-1 px-5 flex flex-col gap-6 pb-20 pt-4">
            {/* 重要提示 */}
            <div className="bg-white rounded-[32px] shadow-pop-card p-6 border-l-[6px] border-[#FFEF85] relative overflow-hidden transition-transform hover:scale-[1.01]">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-[#4B454E]/90">重要提示</span>
                <p className="text-sm text-gray-500 leading-relaxed font-bold">
                  如果您发现应用中有任何不当内容或安全隐患，请通过此页面进行举报。我们会认真处理每一个举报并及时回复。
                </p>
              </div>
            </div>

            {/* 举报邮箱 */}
            <section className="bg-white rounded-[32px] shadow-pop-card p-6">
              <div className="flex flex-col gap-4">
                <div 
                  className="flex items-center justify-between cursor-pointer active:opacity-70 group/row"
                  onClick={async () => {
                    const copied = await copyToClipboard('970951698@qq.com');
                    if (copied) {
                      setFeedback('邮箱已复制到剪贴板');
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#66DDB3]" />
                    <span className="text-sm font-black text-[#4B454E] group-hover/row:text-[#66DDB3] transition-colors">举报邮箱</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#66DDB3] font-mono tracking-tight group-hover/row:underline">
                      970951698@qq.com
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">(点击复制)</span>
                  </div>
                </div>
                <div className="h-px bg-gray-100 w-full" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C9B8FA]" />
                    <span className="text-sm font-black text-[#4B454E]">工作时间</span>
                  </div>
                  <span className="text-sm font-bold text-gray-400">周一至周五 9:00-18:00</span>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="report-issue-page w-full h-full overflow-x-hidden relative selection:bg-[#66DDB3] selection:text-white">
      <div className="fixed -top-[150px] -left-[150px] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply blur-[80px] opacity-40 pointer-events-none z-0" />
      <div className="fixed -bottom-[150px] -right-[150px] w-[500px] h-[500px] bg-green-100 rounded-full mix-blend-multiply blur-[80px] opacity-60 pointer-events-none z-0" />

      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#4B454E] text-white text-xs font-black z-30">
          {feedback}
        </div>
      )}

      <div className="relative z-10 max-w-md mx-auto min-h-screen px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12 flex flex-col">
        <AppPageHeader
          title="问题举报"
          onBack={() => navigate(-1)}
          className="mb-4"
        />

        <main className="flex-1 px-5 space-y-6 pb-8">
          <div className="bg-white rounded-[32px] shadow-pop-card p-6 border-l-[6px] border-[#FFEF85] relative overflow-hidden transition-transform hover:scale-[1.01]">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-[#4B454E]/90">重要提示</span>
              <p className="text-sm text-gray-500 leading-relaxed font-bold">
                如果您发现应用中有任何不当内容或安全隐患，请通过此页面进行举报。我们会认真处理每一个举报并及时回复。
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <label className="block text-sm font-black ml-4 tracking-wide text-[#4B454E]/80">
              举报类型 <span className="text-[#FF8585]">*</span>
            </label>
            <div className="bg-white rounded-[32px] shadow-pop-card p-3">
              <div className="flex flex-col space-y-1">
                {reportTypes.map((type, index) => {
                  const selected = form.type === type.value;
                  const baseButton =
                    'w-full flex items-center justify-between p-4 rounded-[20px] transition-all duration-200 group';
                  const stateCls = selected ? 'bg-[#EBFBF7]' : 'hover:bg-gray-50';
                  return (
                    <React.Fragment key={type.value}>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, type: type.value }))}
                        className={`${baseButton} ${stateCls}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-[3px] ${type.dotColor} ${
                              selected ? 'bg-current' : 'bg-transparent'
                            } transition-colors duration-200`}
                          />
                          <span
                            className={`text-base font-bold ${
                              selected ? 'text-[#4B454E] font-black' : 'text-gray-500'
                            } transition-colors`}
                          >
                            {type.label}
                          </span>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          stroke="currentColor"
                          className={`w-4 h-4 ${
                            selected ? 'text-[#66DDB3]' : 'text-gray-300'
                          } transition-colors`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12l-7.5 7.5" />
                        </svg>
                      </button>
                      {index < reportTypes.length - 1 && <div className="h-px bg-gray-100 mx-4" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <label className="block text-sm font-black ml-4 tracking-wide text-[#4B454E]/80">
              问题描述 <span className="text-[#FF8585]">*</span>
            </label>
            <div className="bg-white rounded-[24px] shadow-pop-card p-5 group focus-within:ring-2 focus-within:ring-[#66DDB3] focus-within:ring-offset-2 transition-all">
              <textarea
                className="w-full h-32 bg-transparent outline-none resize-none text-base font-bold text-[#4B454E] placeholder-gray-400 leading-relaxed"
                placeholder="请详细描述您发现的问题，包括发生的时间、位置等信息..."
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
          </section>

          <section className="space-y-3">
            <label className="block text-sm font-black ml-4 tracking-wide text-[#4B454E]/80">
              您的联系方式（选填）
            </label>
            <div className="bg-white rounded-[24px] shadow-pop-card px-5 py-1 group focus-within:ring-2 focus-within:ring-[#66DDB3] focus-within:ring-offset-2 transition-all">
              <input
                type="text"
                className="w-full h-14 bg-transparent outline-none text-base font-bold text-[#4B454E] placeholder-gray-400"
                placeholder="邮箱或电话号码（可选）"
                value={form.contact}
                onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
              />
            </div>
            <p className="text-[11px] text-gray-400 font-bold ml-5">* 您的联系方式将被严格保密</p>
          </section>

          <section className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full h-16 bg-[#66DDB3] rounded-[24px] shadow-pop-submit flex items-center justify-center gap-3 text-white transition-all hover:brightness-[1.02] active:brightness-[0.98] group"
            >
              {isHarmonyOS() ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25M8.25 19.75V3.75c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v12.75c0 .621-.504 1.125-1.125 1.125H12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
              <span className="text-lg font-black tracking-wide">
                {isHarmonyOS() ? '复制举报邮箱' : '发送举报邮件'}
              </span>
            </button>
          </section>

          <section className="bg-white rounded-[32px] shadow-pop-card p-6 mt-2">
            <div className="flex flex-col gap-4">
              <div
                className="flex items-center justify-between cursor-pointer active:opacity-70 group/row"
                onClick={async () => {
                  const copied = await copyToClipboard('970951698@qq.com');
                  if (copied) {
                    setFeedback('邮箱已复制到剪贴板');
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#66DDB3]" />
                  <span className="text-sm font-black text-[#4B454E] group-hover/row:text-[#66DDB3] transition-colors">举报邮箱</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-extrabold text-[#66DDB3] font-mono tracking-tight underline decoration-dotted">
                    970951698@qq.com
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">(点击复制)</span>
                </div>
              </div>
              <div className="h-px bg-gray-100 w-full" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C9B8FA]" />
                  <span className="text-sm font-black text-[#4B454E]">工作时间</span>
                </div>
                <span className="text-sm font-bold text-gray-400">周一至周五 9:00-18:00</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* 成功提示弹窗 */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-lg">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">举报已发送</h3>
            <p className="text-gray-600">感谢您的举报，我们会尽快处理并回复。</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportIssue;
