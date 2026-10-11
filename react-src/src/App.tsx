import { useEffect, useRef, useState } from "react";
import { BrowserRouter, HashRouter, MemoryRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { App as CapacitorApp } from '@capacitor/app';
import { PrivacyProvider, usePrivacy } from "@/contexts/PrivacyContext";
import PrivacyDialog from "@/components/PrivacyDialog";
import RestOverlay from "@/components/RestOverlay";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import Calculator from "@/pages/Calculator";
import ScientificCalculator from "@/pages/ScientificCalculator";
import Learn from "@/pages/Learn";
import Growth from "@/pages/Growth";
import Practice from "@/pages/Practice";
import Game from "@/pages/Game";
import Report from "@/pages/Report";
import ReportIssue from "@/pages/ReportIssue";
import Settings from "@/pages/Settings";
import TabCustomize from "@/pages/TabCustomize";
import VoiceSelect from "@/pages/VoiceSelect";
import VisualMath from "@/pages/VisualMath";
import MoneyCashier from "@/pages/MoneyCashier";
import TimeMaster from "@/pages/TimeMaster";
import CalcHistory from "@/pages/CalcHistory";
import AmountWords from "@/pages/AmountWords";
import Shop from "@/pages/Shop";
import My from "@/pages/My";
import ParentDashboard from "@/pages/ParentDashboard";
import Savings from "@/pages/Savings";
import SavingsDetail from "@/pages/SavingsDetail";
import SavingsNew from "@/pages/SavingsNew";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ChildrenPrivacyPolicy from "@/pages/ChildrenPrivacyPolicy";
import UserAgreement from "@/pages/UserAgreement";
import AboutUs from "@/pages/AboutUs";
import ContactUs from "@/pages/ContactUs";
import FractionCalculator from "@/pages/FractionCalculator";
import PercentageCalculator from "@/pages/PercentageCalculator";
import DiscountCalculator from "@/pages/DiscountCalculator";
import UnitConverter from "@/pages/UnitConverter";
import DateCalculator from "@/pages/DateCalculator";
import MortgageCalculator from "@/pages/MortgageCalculator";
import TaxCalculator from "@/pages/TaxCalculator";
import OvertimeCalculator from "@/pages/OvertimeCalculator";
import KinshipCalculator from "@/pages/KinshipCalculator";
import BmiCalculator from "@/pages/BmiCalculator";
import PensionCalculator from "@/pages/PensionCalculator";
import CompoundInterestCalculator from "@/pages/CompoundInterestCalculator";
import CarLoanCalculator from "@/pages/CarLoanCalculator";
import CalorieCalculator from "@/pages/CalorieCalculator";
import BillSplitCalculator from "@/pages/BillSplitCalculator";
import CountdownCalculator from "@/pages/CountdownCalculator";
import CurrencyConverter from "@/pages/CurrencyConverter";
import UtilityCalculator from "@/pages/UtilityCalculator";
import AgeZodiacCalculator from "@/pages/AgeZodiacCalculator";
import KitchenConverter from "@/pages/KitchenConverter";
import Game2048 from "@/pages/Game2048";
import SudokuGame from "@/pages/SudokuGame";
import Game24 from "@/pages/Game24";
import KlotskiNumber from "@/pages/KlotskiNumber";
import MentalSpeedMath from "@/pages/MentalSpeedMath";
import GcdLcmCalculator from "@/pages/GcdLcmCalculator";
import EquationSolver from "@/pages/EquationSolver";
import BaseConverter from "@/pages/BaseConverter";
import GeometryCalculator from "@/pages/GeometryCalculator";
import StatisticsCalculator from "@/pages/StatisticsCalculator";
import RandomPicker from "@/pages/RandomPicker";
import PythagoreanCalculator from "@/pages/PythagoreanCalculator";
import PermutationCombination from "@/pages/PermutationCombination";
import SequenceCalculator from "@/pages/SequenceCalculator";
import ChineseMoneyConverter from "@/pages/ChineseMoneyConverter";
import TrigCalculator from "@/pages/TrigCalculator";
import ComplexNumberCalculator from "@/pages/ComplexNumberCalculator";
import HanoiTowerGame from "@/pages/HanoiTowerGame";
import MagicSquareGame from "@/pages/MagicSquareGame";
import NimThirtyGame from "@/pages/NimThirtyGame";
import GoldenRatioCalculator from "@/pages/GoldenRatioCalculator";
import PhysicsCalculator from "@/pages/PhysicsCalculator";
import WaterHeartRateCalculator from "@/pages/WaterHeartRateCalculator";
import BankDepositCalculator from "@/pages/BankDepositCalculator";
import SeveranceCalculator from "@/pages/SeveranceCalculator";
import SalaryHourlyCalculator from "@/pages/SalaryHourlyCalculator";
import QuadraticEquationSolver from "@/pages/QuadraticEquationSolver";
import IrrCalculator from "@/pages/IrrCalculator";
import AnnualLeaveCalculator from "@/pages/AnnualLeaveCalculator";
import VectorCalculator from "@/pages/VectorCalculator";
import PediatricDosageCalculator from "@/pages/PediatricDosageCalculator";
import EarlyRepaymentCalculator from "@/pages/EarlyRepaymentCalculator";
import CombinedMortgageCalculator from "@/pages/CombinedMortgageCalculator";
import LinearSystem2Solver from "@/pages/LinearSystem2Solver";
import FuelTripCalculator from "@/pages/FuelTripCalculator";
import GameStorage from "@/lib/gameStorage";
import StudyDataStorage from "@/lib/studyDataStorage";
import { isHarmonyOS, isCapacitor } from "@/lib/platform";
import { AdControl } from "@/native/adControl";

let lastBackPressTime = 0;
const INTERSTITIAL_ROUTE_INTERVAL_MS = 120_000;
const INTERSTITIAL_BOOT_GRACE_MS = 8_000;
const INTERSTITIAL_RETRY_INTERVAL_MS = 12_000;
const INTERSTITIAL_LAST_SHOWN_KEY = "chmath_last_interstitial_shown_at_v2";
const INTERSTITIAL_EXCLUDED_PATH_PREFIXES = [
  "/privacy-policy",
  "/children-privacy",
  "/user-agreement",
  "/settings",
  "/about",
  "/contact",
  "/report-issue",
];

// 内部组件，用于处理返回键逻辑
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasAccepted, isLoading, showPrivacyDialog } = usePrivacy();
  const [permissionNotice, setPermissionNotice] = useState<{ message: string; level: 'info' | 'warning' | 'error' } | null>(null);
  const permissionNoticeTimerRef = useRef<number | null>(null);
  const [showForcedRest, setShowForcedRest] = useState(false);
  const bootTimeRef = useRef(Date.now());
  const interstitialTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const checkRest = () => {
      const settings = GameStorage.getParentControlSettings();
      if (!settings.isRestricted) {
        setShowForcedRest(false);
        return;
      }
      
      const today = StudyDataStorage.getLocalDateStr();
      if (localStorage.getItem('parent_unlocked_date') === today) {
        setShowForcedRest(false);
        return;
      }
      
      const stats = StudyDataStorage.getDailyProgress(1);
      const todayData = stats.find(s => s.date === today);
      
      const totalTime = todayData?.timeSpent || 0;
      
      if (totalTime >= settings.dailyGoal) {
        setShowForcedRest(true);
      } else {
        setShowForcedRest(false);
      }
    };

    const timer = window.setInterval(checkRest, 10000); // 每10秒检查一次，更及时
    checkRest(); // 初始检查

    return () => window.clearInterval(timer);
  }, [location.pathname]);

  useEffect(() => {
    // 确保首次打开应用就生成本地账号资料
    GameStorage.getOrCreateLocalProfile();
  }, []);

  useEffect(() => {
    // 打开任何页面时，滚动到顶部，避免继承上个页面的滚动位置
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (e) {
      window.scrollTo(0, 0); // fallback for extremely old webviews
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isLoading || showPrivacyDialog || !hasAccepted) {
      return;
    }
    if (!isCapacitor() && !isHarmonyOS()) {
      return;
    }
    if (INTERSTITIAL_EXCLUDED_PATH_PREFIXES.some(prefix => location.pathname.startsWith(prefix))) {
      return;
    }

    const clearInterstitialTimer = () => {
      if (interstitialTimerRef.current) {
        window.clearTimeout(interstitialTimerRef.current);
        interstitialTimerRef.current = null;
      }
    };

    const scheduleAttempt = (delayMs: number, retryCount: number) => {
      clearInterstitialTimer();
      interstitialTimerRef.current = window.setTimeout(() => {
        const lastShownAt = Number(localStorage.getItem(INTERSTITIAL_LAST_SHOWN_KEY) || "0");
        if (Number.isFinite(lastShownAt) && Date.now() - lastShownAt < INTERSTITIAL_ROUTE_INTERVAL_MS) {
          return;
        }

        AdControl.showInterstitial()
          .then(result => {
            if (result && result.status === "shown") {
              localStorage.setItem(INTERSTITIAL_LAST_SHOWN_KEY, String(Date.now()));
              return;
            }
            if (retryCount < 4) {
              scheduleAttempt(INTERSTITIAL_RETRY_INTERVAL_MS, retryCount + 1);
            }
          })
          .catch(error => {
            console.warn("[App] showInterstitial failed:", error);
          });
      }, delayMs);
    };

    const bootDelay = Math.max(INTERSTITIAL_BOOT_GRACE_MS - (Date.now() - bootTimeRef.current), 0);
    scheduleAttempt(bootDelay, 0);

    return clearInterstitialTimer;
  }, [hasAccepted, isLoading, location.pathname, showPrivacyDialog]);

  useEffect(() => {
    // 根据平台设置返回键处理
    const setupBackHandler = async () => {
      // 鸿蒙环境：使用 HarmonyBridge 或监听 popstate
      if (isHarmonyOS()) {
        console.log('[App] 运行在鸿蒙环境，使用 HarmonyBridge 处理返回键');
        
        // 监听浏览器的 popstate 事件（历史记录导航）
        const handlePopState = () => {
          console.log('[App] popstate 事件触发');
        };
        window.addEventListener('popstate', handlePopState);
        
        return () => {
          window.removeEventListener('popstate', handlePopState);
        };
      }
      
      // Capacitor 环境（Android/iOS）：使用 Capacitor 返回键监听
      if (isCapacitor()) {
        console.log('[App] 运行在 Capacitor 环境');
        
        try {
          const handler = await CapacitorApp.addListener('backButton', () => {
            if (showPrivacyDialog) return;

            // 优先检查是否有 modal 弹窗需要消费返回键
            const modalEvent = new CustomEvent<{ handled: boolean }>('chmath:modal-back', {
              detail: { handled: false },
              cancelable: true,
            });
            window.dispatchEvent(modalEvent);
            if (modalEvent.defaultPrevented || modalEvent.detail?.handled) {
              return;
            }

            const mainTabs = ['/', '/calculator', '/scientific', '/savings', '/learn', '/my'];
            if (mainTabs.includes(location.pathname)) {
              // 在一级 Tab 页且无弹窗时，双击退出应用
              const now = Date.now();
              if (now - lastBackPressTime < 2000) {
                CapacitorApp.exitApp();
              } else {
                lastBackPressTime = now;
                window.dispatchEvent(new CustomEvent('chmath:permission-notice', {
                  detail: { message: '再按一次退出应用', level: 'info' }
                }));
              }
            } else {
              if (location.pathname === '/voice-select') {
                const event = new CustomEvent<{ handled: boolean }>('chmath:voice-select-back', {
                  detail: { handled: false }
                });
                window.dispatchEvent(event);
                if (event.detail?.handled) {
                  return;
                }
              }
              // 不在主 Tab 页，返回上一页
              navigate(-1);
            }
          });
          return handler;
        } catch (error) {
          console.warn('[App] Capacitor 返回键监听失败:', error);
          return undefined;
        }
      }
      
      // Web 环境：不需要特殊处理
      console.log('[App] 运行在 Web 环境');
      return undefined;
    };

    const listenerPromise = setupBackHandler();

    return () => {
      listenerPromise.then(h => {
        if (h) {
          // Capacitor PluginListenerHandle 或 cleanup 函数
          if (typeof h === 'object' && 'remove' in h && typeof h.remove === 'function') {
            h.remove();
          } else if (typeof h === 'function') {
            h();
          }
        }
      });
    };
  }, [location.pathname, navigate, showPrivacyDialog]);

  useEffect(() => {
    const handlePermissionNotice = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string; level?: 'info' | 'warning' | 'error' }>;
      const message = customEvent.detail?.message;
      const level = customEvent.detail?.level ?? 'warning';
      if (!message) return;

      setPermissionNotice({ message, level });
      if (permissionNoticeTimerRef.current) {
        window.clearTimeout(permissionNoticeTimerRef.current);
      }
      permissionNoticeTimerRef.current = window.setTimeout(() => {
        setPermissionNotice(null);
        permissionNoticeTimerRef.current = null;
      }, 2400);
    };

    window.addEventListener('chmath:permission-notice', handlePermissionNotice as EventListener);
    
    // 监听鸿蒙原生容器发送的 hash 变化
    const handleHashChange = () => {
      if (isHarmonyOS() && window.location.hash) {
        const targetPath = window.location.hash.replace('#', '');
        console.log('[App] Received hash change from native, navigating to:', targetPath);
        if (targetPath) {
          navigate(targetPath, { replace: true });
        }
      }
    };
    
    // 初始化时也检查一次
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('chmath:permission-notice', handlePermissionNotice as EventListener);
      window.removeEventListener('hashchange', handleHashChange);
      if (permissionNoticeTimerRef.current) {
        window.clearTimeout(permissionNoticeTimerRef.current);
      }
    };
  }, []);

  // 启动阶段不再显示额外加载层，避免双层启动画面
  if (isLoading) {
    return null;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Calculator />} />
        <Route path="/home" element={<Home />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/scientific" element={<ScientificCalculator />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/game" element={<Game />} />
        <Route path="/report" element={<Report />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/tab-customize" element={<TabCustomize />} />
        <Route path="/voice-select" element={<VoiceSelect />} />
        <Route path="/calc-history" element={<CalcHistory />} />
        <Route path="/amount-words" element={<AmountWords />} />
        <Route path="/visual-math" element={<VisualMath />} />
        <Route path="/money-cashier" element={<MoneyCashier />} />
        <Route path="/time-master" element={<TimeMaster />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/my" element={<My />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/savings/new" element={<SavingsNew />} />
        <Route path="/savings/:goalId" element={<SavingsDetail />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/children-privacy" element={<ChildrenPrivacyPolicy />} />
        <Route path="/user-agreement" element={<UserAgreement />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/fraction" element={<FractionCalculator />} />
        <Route path="/percentage" element={<PercentageCalculator />} />
        <Route path="/discount" element={<DiscountCalculator />} />
        <Route path="/unit-converter" element={<UnitConverter />} />
        <Route path="/date-calc" element={<DateCalculator />} />
        <Route path="/mortgage" element={<MortgageCalculator />} />
        <Route path="/tax" element={<TaxCalculator />} />
        <Route path="/overtime" element={<OvertimeCalculator />} />
        <Route path="/kinship" element={<KinshipCalculator />} />
        <Route path="/bmi" element={<BmiCalculator />} />
        <Route path="/pension" element={<PensionCalculator />} />
        <Route path="/compound" element={<CompoundInterestCalculator />} />
        <Route path="/car-loan" element={<CarLoanCalculator />} />
        <Route path="/calorie" element={<CalorieCalculator />} />
        <Route path="/bill-split" element={<BillSplitCalculator />} />
        <Route path="/countdown" element={<CountdownCalculator />} />
        <Route path="/currency" element={<CurrencyConverter />} />
        <Route path="/utility" element={<UtilityCalculator />} />
        <Route path="/age-zodiac" element={<AgeZodiacCalculator />} />
        <Route path="/kitchen" element={<KitchenConverter />} />
        <Route path="/game-2048" element={<Game2048 />} />
        <Route path="/sudoku" element={<SudokuGame />} />
        <Route path="/game-24" element={<Game24 />} />
        <Route path="/klotski" element={<KlotskiNumber />} />
        <Route path="/mental-math" element={<MentalSpeedMath />} />
        <Route path="/gcd-lcm" element={<GcdLcmCalculator />} />
        <Route path="/equation" element={<EquationSolver />} />
        <Route path="/base-convert" element={<BaseConverter />} />
        <Route path="/geometry" element={<GeometryCalculator />} />
        <Route path="/statistics" element={<StatisticsCalculator />} />
        <Route path="/random-picker" element={<RandomPicker />} />
        <Route path="/pythagorean" element={<PythagoreanCalculator />} />
        <Route path="/permutation" element={<PermutationCombination />} />
        <Route path="/sequence" element={<SequenceCalculator />} />
        <Route path="/chinese-money" element={<ChineseMoneyConverter />} />
        <Route path="/trig" element={<TrigCalculator />} />
        <Route path="/complex" element={<ComplexNumberCalculator />} />
        <Route path="/hanoi" element={<HanoiTowerGame />} />
        <Route path="/magic-square" element={<MagicSquareGame />} />
        <Route path="/nim-thirty" element={<NimThirtyGame />} />
        <Route path="/golden-ratio" element={<GoldenRatioCalculator />} />
        <Route path="/physics" element={<PhysicsCalculator />} />
        <Route path="/water-heart" element={<WaterHeartRateCalculator />} />
        <Route path="/bank-deposit" element={<BankDepositCalculator />} />
        <Route path="/severance" element={<SeveranceCalculator />} />
        <Route path="/salary-hourly" element={<SalaryHourlyCalculator />} />
        <Route path="/quadratic" element={<QuadraticEquationSolver />} />
        <Route path="/irr" element={<IrrCalculator />} />
        <Route path="/annual-leave" element={<AnnualLeaveCalculator />} />
        <Route path="/vector" element={<VectorCalculator />} />
        <Route path="/pediatric-dosage" element={<PediatricDosageCalculator />} />
        <Route path="/early-repayment" element={<EarlyRepaymentCalculator />} />
        <Route path="/combined-mortgage" element={<CombinedMortgageCalculator />} />
        <Route path="/linear-system-2" element={<LinearSystem2Solver />} />
        <Route path="/fuel-trip" element={<FuelTripCalculator />} />
        <Route path="*" element={<Calculator />} />
      </Routes>
      
      {/* 隐私弹窗 - 始终渲染，组件内部控制是否显示 */}
      <PrivacyDialog />

      {permissionNotice && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[70] pointer-events-none">
          <div className={`px-4 py-2 rounded-full text-xs font-black shadow-lg ${
            permissionNotice.level === 'error'
              ? 'bg-[#FF8585] text-white'
              : permissionNotice.level === 'info'
                ? 'bg-[#4BC29A] text-white'
                : 'bg-[#4B454E] text-white'
          }`}>
            {permissionNotice.message}
          </div>
        </div>
      )}

      {showForcedRest && (
        <RestOverlay onUnlock={() => {
          localStorage.setItem('parent_unlocked_date', StudyDataStorage.getLocalDateStr());
          setShowForcedRest(false);
        }} />
      )}
    </>
  );
}

export default function App() {
  const Router = isHarmonyOS() ? HashRouter : BrowserRouter;
  
  return (
    <PrivacyProvider>
      <Router>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Router>
    </PrivacyProvider>
  );
}
