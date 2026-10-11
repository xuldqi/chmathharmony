import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Target, ShieldCheck, Save, KeyRound } from 'lucide-react';
import GameStorage from '@/lib/gameStorage';
import StudyDataStorage from '@/lib/studyDataStorage';
import AppPageHeader from '@/components/AppPageHeader';

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dailyGoal, setDailyGoal] = useState(30);
  const [isRestricted, setIsRestricted] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [avgTimePerQuestion, setAvgTimePerQuestion] = useState(0);

  const [weeklyData, setWeeklyData] = useState<{day: string, time: number, questions: number}[]>([
    { day: '一', time: 0, questions: 0 },
    { day: '二', time: 0, questions: 0 },
    { day: '三', time: 0, questions: 0 },
    { day: '四', time: 0, questions: 0 },
    { day: '五', time: 0, questions: 0 },
    { day: '六', time: 0, questions: 0 },
    { day: '日', time: 0, questions: 0 },
  ]);

  const [pinState, setPinState] = useState<'LOGIN' | 'SETUP' | 'CONFIRM_SETUP' | 'UNLOCKED' | 'VERIFY_OLD' | 'NEW_PIN' | 'CONFIRM_NEW'>('LOGIN');
  const [inputPin, setInputPin] = useState('');
  const [tempPin, setTempPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const settings = GameStorage.getParentControlSettings();
    setDailyGoal(settings.dailyGoal);
    setIsRestricted(settings.isRestricted);

    const savedPin = localStorage.getItem('parent_pin');
    if (!savedPin) {
      setPinState('SETUP');
    }

    const progress = StudyDataStorage.getDailyProgress(7);
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const newWeeklyData = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = StudyDataStorage.getLocalDateStr(d);
      const p = progress.find(x => x.date === dateStr);
      return {
        day: dayNames[d.getDay()],
        time: p ? p.timeSpent : 0,
        questions: p ? p.questionsAnswered : 0
      };
    });
    setWeeklyData(newWeeklyData);

    const studyStats = StudyDataStorage.getStudyStats();
    if (studyStats) {
      setTotalQuestions(studyStats.totalQuestions || 0);
      if (studyStats.totalQuestions > 0) {
        setAvgTimePerQuestion(Math.round((studyStats.totalTime * 60) / studyStats.totalQuestions));
      }
    }
  }, []);

  const handlePinInput = (num: string) => {
    if (inputPin.length < 4) {
      const nextPin = inputPin + num;
      setInputPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        processPinAction(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setInputPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const processPinAction = (pin: string) => {
    const savedPin = localStorage.getItem('parent_pin');

    switch (pinState) {
      case 'LOGIN':
        if (pin === savedPin) {
          setPinState('UNLOCKED');
          setInputPin('');
        } else {
          setErrorMsg('密码错误，请重试');
          setTimeout(() => setInputPin(''), 500);
        }
        break;

      case 'SETUP':
        setTempPin(pin);
        setPinState('CONFIRM_SETUP');
        setInputPin('');
        break;

      case 'CONFIRM_SETUP':
        if (pin === tempPin) {
          localStorage.setItem('parent_pin', pin);
          setPinState('UNLOCKED');
          setInputPin('');
        } else {
          setErrorMsg('两次密码不一致，请重新设置');
          setTimeout(() => {
            setPinState('SETUP');
            setInputPin('');
            setTempPin('');
          }, 1000);
        }
        break;

      case 'VERIFY_OLD':
        if (pin === savedPin) {
          setPinState('NEW_PIN');
          setInputPin('');
        } else {
          setErrorMsg('旧密码错误');
          setTimeout(() => setInputPin(''), 500);
        }
        break;

      case 'NEW_PIN':
        setTempPin(pin);
        setPinState('CONFIRM_NEW');
        setInputPin('');
        break;

      case 'CONFIRM_NEW':
        if (pin === tempPin) {
          localStorage.setItem('parent_pin', pin);
          setPinState('UNLOCKED');
          setInputPin('');
          setSaveMessage('密码修改成功');
        } else {
          setErrorMsg('两次密码不一致，请重试');
          setTimeout(() => {
            setPinState('NEW_PIN');
            setInputPin('');
            setTempPin('');
          }, 1000);
        }
        break;
      default:
        break;
    }
  };

  const handleChangePassword = () => {
    setPinState('VERIFY_OLD');
    setInputPin('');
    setErrorMsg('');
  };

  const handleSaveSettings = () => {
    localStorage.removeItem('parent_unlocked_date');
    GameStorage.setParentControlSettings({ dailyGoal, isRestricted });
    setSaveMessage('配置已保存');
  };

  useEffect(() => {
    if (!saveMessage) return;
    const timer = window.setTimeout(() => setSaveMessage(null), 1800);
    return () => window.clearTimeout(timer);
  }, [saveMessage]);

  const PinPad = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="max-w-md mx-auto w-full flex flex-col items-center justify-center min-h-[68vh]">
      <div className="w-full bg-white rounded-[32px] p-8 pop-shadow border border-white/70">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#EBFBF7] border border-[#D1FAE5] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-9 h-9 text-[#3CC9A0]" />
          </div>
          <h2 className="text-2xl font-black text-[#4B454E]">{title}</h2>
          {subtitle && <p className="text-[#8A8490] mt-2 text-sm font-bold">{subtitle}</p>}
        </div>

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
              className="h-14 rounded-2xl bg-white border border-[#F1F5F9] pop-shadow-sm pop-shadow-sm-active text-lg font-black text-[#4B454E]"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setInputPin('');
              setErrorMsg('');
            }}
            className="h-14 rounded-2xl bg-white border border-[#F1F5F9] pop-shadow-sm pop-shadow-sm-active text-sm font-black text-[#8A8490]"
          >
            重设
          </button>
          <button
            type="button"
            onClick={() => handlePinInput('0')}
            className="h-14 rounded-2xl bg-white border border-[#F1F5F9] pop-shadow-sm pop-shadow-sm-active text-lg font-black text-[#4B454E]"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-white border border-[#F1F5F9] pop-shadow-sm pop-shadow-sm-active text-lg font-black text-[#8A8490]"
          >
            ⌫
          </button>
        </div>

        {pinState !== 'LOGIN' && pinState !== 'SETUP' && (
          <button
            type="button"
            onClick={() => {
              setPinState(localStorage.getItem('parent_pin') ? 'UNLOCKED' : 'SETUP');
              setInputPin('');
            }}
            className="w-full mt-6 text-[#8A8490] text-sm font-black hover:text-[#4B454E]"
          >
            取消
          </button>
        )}
      </div>
    </div>
  );

  const Header = ({ title }: { title: string }) => (
    <AppPageHeader title={title} onBack={() => navigate(-1)} className="mb-4" />
  );

  if (pinState !== 'UNLOCKED') {
    let title = '请输入密码';
    let subtitle = '访问家长控制中心需要验证';

    if (pinState === 'SETUP') {
      title = '设置新密码';
      subtitle = '为了防止误操作，请设置4位管理密码';
    } else if (pinState === 'CONFIRM_SETUP') {
      title = '确认密码';
      subtitle = '请再次输入以确认';
    } else if (pinState === 'VERIFY_OLD') {
      title = '验证旧密码';
      subtitle = '修改密码前请先验证身份';
    } else if (pinState === 'NEW_PIN') {
      title = '输入新密码';
      subtitle = '';
    } else if (pinState === 'CONFIRM_NEW') {
      title = '确认新密码';
      subtitle = '请再次输入新密码';
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
        <Header title={title} />
        <PinPad title={title} subtitle={subtitle} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-28 relative">
      {saveMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
          {saveMessage}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <Header title="家长控制中心" />

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleChangePassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full pop-shadow-sm pop-shadow-sm-active text-[#4B454E] font-black"
          >
            <KeyRound className="w-4 h-4" />
            修改密码
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-[32px] pop-shadow">
              <h3 className="text-lg font-black text-[#4B454E] mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#66DDB3]" />
                本周学习时长（分钟）
              </h3>
              <div className="flex items-end justify-between h-48 gap-2">
                {weeklyData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(d.time > 0 ? 5 : 0, (d.time / 60) * 100)}%` }}
                      className="w-full bg-[#EBFBF7] rounded-t-2xl relative group"
                    >
                      <div
                        className="absolute inset-x-0 bottom-0 bg-[#66DDB3] rounded-t-2xl transition-all"
                        style={{ height: '100%' }}
                      />
                      {d.time > 0 && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-0.5 px-1.5 rounded whitespace-nowrap">
                          {Math.ceil(d.time)}分
                        </div>
                      )}
                    </motion.div>
                    <span className="text-xs font-bold text-[#8A8490]">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[32px] pop-shadow-sm flex items-center gap-4">
                <div className="bg-[#FFF7ED] p-4 rounded-2xl text-[#F97316]">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-[#8A8490] text-sm font-bold">累计解题</div>
                  <div className="text-2xl font-black text-[#4B454E]">{totalQuestions.toLocaleString()}</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[32px] pop-shadow-sm flex items-center gap-4">
                <div className="bg-[#ECFDF5] p-4 rounded-2xl text-[#10B981]">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-[#8A8490] text-sm font-bold">平均用时/题</div>
                  <div className="text-2xl font-black text-[#4B454E]">{avgTimePerQuestion > 0 ? `${avgTimePerQuestion}秒` : '-'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] pop-shadow">
              <h3 className="text-lg font-black text-[#4B454E] mb-6">管理设置</h3>

              <div className="space-y-8">
                <div>
                  <label className="flex justify-between items-center mb-4">
                    <span className="font-black text-[#4B454E]">每日时长限制</span>
                    <span className="text-[#3CC9A0] font-black">{dailyGoal} 分钟</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-[#EEF2F7] rounded-lg appearance-none cursor-pointer accent-[#66DDB3]"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#EEF2F7]">
                  <div className="flex flex-col">
                    <span className="font-black text-[#4B454E]">强制休息模式</span>
                    <span className="text-xs text-[#8A8490] font-bold">达到限时后锁定应用</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRestricted(!isRestricted)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isRestricted ? 'bg-[#66DDB3]' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isRestricted ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="w-full h-14 bg-[#66DDB3] text-white rounded-[20px] pop-shadow-btn-primary active-press flex items-center justify-center gap-2 font-black"
                >
                  <Save className="w-5 h-5" />
                  保存配置
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
