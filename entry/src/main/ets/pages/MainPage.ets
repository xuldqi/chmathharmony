import { TabIndex, RouterManager } from '../common/Router';
import { MainTabBar } from '../components/MainTabBar';
import { VoiceRecognition } from '../native/VoiceRecognition';
import { AudioPlayer } from '../native/AudioPlayer';
import { DataStorage } from '../native/DataStorage';
import { promptAction } from '@kit.ArkUI';
import {
  IconHome, IconGift, IconBook, IconPerson, IconPencil, IconGame,
  IconNumber, IconClock, IconMoney, IconFamily, IconMic, IconCart,
  IconChart, IconTrophy, IconGear, IconInfo, IconBell, IconLock,
  IconTrash, IconCheck, IconPlus, IconSpeaker, IconBulb, IconVibration,
  IconTimer, IconEnvelope, IconDoc, IconStar, IconBicycle
} from '../components/AppIcons';

interface CalculationRef {
  firstNumber: number | null;
  operator: string | null;
  secondNumber: number | null;
  startTime: Date | null;
}

interface ColorScheme {
  uiCloud: string;
  uiCloudShadow: string;
  accentMint: string;
  accentMintDark: string;
  textInk: string;
  textWhite: string;
  bgWall: string;
  stickerYellow: string;
  stickerYellowDark: string;
  stickerPink: string;
  stickerPinkDark: string;
  buttonShadow: string;
  purpleText: string;
}

// 图标类型 - 使用系统符号名称
interface LearnItem {
  symbol: string;
  title: string;
  desc: string;
  color: string;
  route: string;
}

interface SettingsItem {
  symbol: string;
  title: string;
  desc: string;
  color: string;
  route: string;
}

interface VoiceItem {
  name: string;
  preview: string;
  color: string;
}

interface AchievementItem {
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

interface RelationItem {
  title: string;
  relation: string;
}

interface VoiceShopItem {
  id: string;
  name: string;
  price: string;
  icon: string;
}

interface AchievementDataItem {
  icon: string;
  name: string;
  desc: string;
  unlocked: boolean;
}

interface RelationDataItem {
  name: string;
  male: string;
  female: string;
}

interface VoiceSelectItem {
  id: string;
  name: string;
  preview: string;
}

interface VoiceSelectDataItem {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

interface ReportStatItem {
  label: string;
  value: string;
}

@Entry
@Component
struct MainPage {
  @State currentTab: TabIndex = TabIndex.HOME;
  @State subPage: string = '';
  
  // 计算器状态
  @State calcDisplay: string = '0';
  @State calcPreviousValue: number | null = null;
  @State calcOperation: string | null = null;
  @State calcWaitingForOperand: boolean = false;
  @State calcHistoryText: string = '';
  @State calcVoiceResult: string = '';
  @State isListening: boolean = false;
  
  private calculationRef: CalculationRef = {
    firstNumber: null,
    operator: null,
    secondNumber: null,
    startTime: null
  };

  private readonly COLORS: ColorScheme = {
    uiCloud: '#F3E0FA',
    uiCloudShadow: '#D9B8E4',
    accentMint: '#66DDB3',
    accentMintDark: '#4BC29A',
    textInk: '#4B454E',
    textWhite: '#FFFFFF',
    bgWall: '#E8F6F1',
    stickerYellow: '#FFEF85',
    stickerYellowDark: '#F0D940',
    stickerPink: '#FF8585',
    stickerPinkDark: '#E86B6B',
    buttonShadow: '#DED6E0',
    purpleText: '#8E7B96',
  };

  private voicePressTimer: number | null = null;
  private voiceAutoStopTimer: number | null = null;
  private voiceLongPressTriggered: boolean = false;

  // 计算器方法
  async playAudio(type: string, value?: string): Promise<void> { 
    await AudioPlayer.playNumber(parseInt(value || '0')); 
  }
  async unlockAudio(): Promise<void> {}

  async startVoiceInputReal(): Promise<void> {
    this.calcVoiceResult = '正在听取...';
    const success = await VoiceRecognition.startRecognition((text) => {
      this.processVoiceText(text);
    });
    if (!success) {
      this.calcVoiceResult = '语音识别失败';
      setTimeout(() => { this.calcVoiceResult = ''; }, 2000);
    }
  }

  async stopVoiceInputReal(): Promise<void> {
    await VoiceRecognition.stopRecognition();
  }

  processVoiceText(text: string): void {
    const numMatch = text.match(/\d+/);
    if (numMatch) {
      this.calcDisplay = numMatch[0];
      this.calcVoiceResult = `识别: ${text}`;
    } else {
      this.calcVoiceResult = `识别: ${text}`;
    }
    setTimeout(() => { this.calcVoiceResult = ''; }, 3000);
  }

  formatDisplayValue(value: number): string { if (!Number.isFinite(value)) return '错误'; return Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.?0+$/, ''); }
  calculate(firstValue: number, secondValue: number, operation: string): number { switch (operation) { case '+': return firstValue + secondValue; case '-': return firstValue - secondValue; case '×': return firstValue * secondValue; case '÷': return firstValue / secondValue; default: return secondValue; } }
  handleMathError(message: string): void { this.calcDisplay = '错误'; this.calcPreviousValue = null; this.calcOperation = null; this.calcWaitingForOperand = true; this.calcHistoryText = ''; this.calcVoiceResult = message; setTimeout(() => { this.calcVoiceResult = ''; }, 2500); }

  async handleNumber(num: string): Promise<void> { await this.unlockAudio(); await this.playAudio('number', num); if (this.calcWaitingForOperand) { this.calcDisplay = num; this.calcWaitingForOperand = false; return; } this.calcDisplay = this.calcDisplay === '0' || this.calcDisplay === '错误' ? num : this.calcDisplay + num; }
  async handleOperator(nextOperation: string): Promise<void> { await this.unlockAudio(); const inputValue = parseFloat(this.calcDisplay); if (Number.isNaN(inputValue)) return; await this.playAudio('operator', nextOperation); if (this.calcPreviousValue === null) { this.calculationRef = { firstNumber: inputValue, operator: nextOperation, secondNumber: null, startTime: new Date() }; this.calcPreviousValue = inputValue; this.calcOperation = nextOperation; this.calcWaitingForOperand = true; return; } if (this.calcWaitingForOperand) { this.calculationRef.operator = nextOperation; this.calcOperation = nextOperation; return; } if (this.calcOperation) { const newValue = this.calculate(this.calcPreviousValue, inputValue, this.calcOperation); if (!Number.isFinite(newValue)) { this.handleMathError('不能除以0'); return; } this.calcDisplay = this.formatDisplayValue(newValue); this.calcPreviousValue = newValue; this.calcOperation = nextOperation; this.calcWaitingForOperand = true; } }
  async handleEquals(): Promise<void> { const inputValue = parseFloat(this.calcDisplay); if (Number.isNaN(inputValue)) return; if (this.calcPreviousValue !== null && this.calcOperation) { const newValue = this.calculate(this.calcPreviousValue, inputValue, this.calcOperation); if (!Number.isFinite(newValue)) { this.handleMathError('不能除以0'); return; } const formattedResult = this.formatDisplayValue(newValue); const expression = `${this.calcPreviousValue} ${this.calcOperation} ${inputValue} =`; this.calcDisplay = formattedResult; this.calcPreviousValue = null; this.calcOperation = null; this.calcWaitingForOperand = true; this.calcHistoryText = expression; await this.playAudio('result', formattedResult); } }
  async handleClear(): Promise<void> { await this.playAudio('clear'); this.calculationRef = { firstNumber: null, operator: null, secondNumber: null, startTime: null }; this.calcDisplay = '0'; this.calcPreviousValue = null; this.calcOperation = null; this.calcWaitingForOperand = false; this.calcHistoryText = ''; }
  async handleDelete(): Promise<void> { await this.playAudio('delete'); this.calcDisplay = this.calcDisplay === '错误' ? '0' : (this.calcDisplay.length > 1 ? this.calcDisplay.slice(0, -1) : '0'); }
  async handleDecimal(): Promise<void> { await this.playAudio('operator', 'point'); if (this.calcWaitingForOperand) { this.calcDisplay = '0.'; this.calcWaitingForOperand = false; return; } if (this.calcDisplay.includes('.')) return; this.calcDisplay = this.calcDisplay === '错误' ? '0.' : `${this.calcDisplay}.`; }
  evaluateExpression(expr: string): number | null { try { let e = expr.replace(/×/g, '*').replace(/÷/g, '/'); return new Function('return ' + e)(); } catch { return null; } }
  async startVoiceInput(): Promise<void> { this.calcVoiceResult = '正在听取...'; }
  async stopVoiceInput(): Promise<void> { this.voiceLongPressTriggered = false; const expressions = ['2+3', '5×4', '10-6', '8÷2']; const random = expressions[Math.floor(Math.random() * expressions.length)]; const result = this.evaluateExpression(random); if (result !== null) { this.calcDisplay = this.formatDisplayValue(result); this.calcPreviousValue = null; this.calcOperation = null; this.calcWaitingForOperand = true; this.calcHistoryText = `${random} =`; this.calcVoiceResult = `识别: ${random}`; await this.playAudio('result', this.formatDisplayValue(result)); } else { this.calcVoiceResult = '没听清算式，请再说一次'; } setTimeout(() => { this.calcVoiceResult = ''; }, 3000); }
  handleEqualsPressStart(): void { if (this.isListening) { this.voiceLongPressTriggered = false; this.stopVoiceInput(); return; } this.voiceLongPressTriggered = false; this.voicePressTimer = setTimeout(() => { this.isListening = true; this.voiceLongPressTriggered = true; this.startVoiceInput(); this.voiceAutoStopTimer = setTimeout(() => { this.isListening = false; this.stopVoiceInput(); }, 5000); }, 400); }
  handleEqualsPressEnd(): void { if (this.voiceLongPressTriggered) { this.voiceLongPressTriggered = false; this.isListening = false; this.voiceAutoStopTimer = setTimeout(() => { this.stopVoiceInput(); }, 1300); return; } if (this.isListening) return; this.handleEquals(); }
  handleEqualsPressCancel(): void { if (this.voiceLongPressTriggered) { this.voiceLongPressTriggered = false; this.isListening = false; this.voiceAutoStopTimer = setTimeout(() => { this.stopVoiceInput(); }, 1300); } }

  // 练习状态
  @State practiceMode: string = 'menu';
  @State practiceType: string = 'addition';
  @State questionNum1: number = 0;
  @State questionNum2: number = 0;
  @State userAnswer: string = '';
  @State isCorrect: boolean = false;
  @State showResult: boolean = false;
  @State correctCount: number = 0;
  @State totalCount: number = 0;
  @State difficulty: string = 'medium';

  // 储蓄状态
  @State savingsGoals: SavingsGoal[] = [];
  @State showAddGoalDialog: boolean = false;
  @State newGoalName: string = '';
  @State newGoalTarget: number = 100;

  aboutToAppear(): void {
    this.loadSavingsData();
  }

  async loadSavingsData(): Promise<void> {
    const data = await DataStorage.get('savings_goals', '[]');
    try {
      this.savingsGoals = JSON.parse(data);
    } catch {
      this.savingsGoals = [];
    }
  }

  async saveSavingsData(): Promise<void> {
    await DataStorage.save('savings_goals', JSON.stringify(this.savingsGoals));
  }

  addGoal(): void {
    if (this.newGoalName && this.newGoalTarget > 0) {
      this.savingsGoals.push({
        id: Date.now().toString(),
        name: this.newGoalName,
        target: this.newGoalTarget,
        saved: 0,
        color: this.getRandomColor()
      });
      this.saveSavingsData();
      this.newGoalName = '';
      this.newGoalTarget = 100;
      this.showAddGoalDialog = false;
    }
  }

  addToGoal(goalId: string, amount: number): void {
    const goal = this.savingsGoals.find(g => g.id === goalId);
    if (goal) {
      goal.saved += amount;
      this.saveSavingsData();
    }
  }

  getRandomColor(): string {
    const colors = ['#14B8A6', '#3B82F6', '#A855F7', '#F97316', '#22C55E', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  startPractice(type: string): void {
    this.practiceType = type;
    this.practiceMode = 'practice';
    this.correctCount = 0;
    this.totalCount = 0;
    this.nextQuestion();
  }

  nextQuestion(): void {
    this.showResult = false;
    this.userAnswer = '';
    let max = 20;
    if (this.difficulty === 'easy') max = 10;
    if (this.difficulty === 'hard') max = 50;

    if (this.practiceType === 'addition') {
      this.questionNum1 = Math.floor(Math.random() * max) + 1;
      this.questionNum2 = Math.floor(Math.random() * max) + 1;
    } else if (this.practiceType === 'subtraction') {
      this.questionNum1 = Math.floor(Math.random() * max) + max;
      this.questionNum2 = Math.floor(Math.random() * this.questionNum1);
    } else if (this.practiceType === 'multiplication') {
      this.questionNum1 = Math.floor(Math.random() * 9) + 1;
      this.questionNum2 = Math.floor(Math.random() * 9) + 1;
    } else if (this.practiceType === 'division') {
      this.questionNum2 = Math.floor(Math.random() * 9) + 1;
      this.questionNum1 = this.questionNum2 * (Math.floor(Math.random() * 9) + 1);
    }
  }

  submitAnswer(): void {
    let correctAnswer = 0;
    switch (this.practiceType) {
      case 'addition': correctAnswer = this.questionNum1 + this.questionNum2; break;
      case 'subtraction': correctAnswer = this.questionNum1 - this.questionNum2; break;
      case 'multiplication': correctAnswer = this.questionNum1 * this.questionNum2; break;
      case 'division': correctAnswer = this.questionNum1 / this.questionNum2; break;
    }
    this.totalCount++;
    this.isCorrect = parseFloat(this.userAnswer) === correctAnswer;
    if (this.isCorrect) this.correctCount++;
    this.showResult = true;
  }

  getPracticeTitle(): string {
    switch (this.practiceType) {
      case 'addition': return '➕ 加法练习';
      case 'subtraction': return '➖ 减法练习';
      case 'multiplication': return '✖️ 乘法练习';
      case 'division': return '➗ 除法练习';
      default: return '数学练习';
    }
  }

  build() {
    Column() {
      if (this.subPage !== '') {
        this.SubPageView()
      } else {
        if (this.currentTab === TabIndex.HOME) { this.CalculatorView() }
        else if (this.currentTab === TabIndex.SAVINGS) { SavingsPageContent({ addToGoal: (id, amt) => this.addToGoal(id, amt), showAddDialog: this.showAddGoalDialog, onShowAdd: () => this.showAddGoalDialog = true, onHideAdd: () => this.showAddGoalDialog = false, newGoalName: $newGoalName, newGoalTarget: $newGoalTarget, onAddGoal: () => this.addGoal() }) }
        else if (this.currentTab === TabIndex.LEARN) { LearnPageContent({ onEnterSubPage: (page: string) => { this.subPage = page } }) }
        else if (this.currentTab === TabIndex.MY) { MyPageContent({ onEnterSubPage: (page: string) => { this.subPage = page } }) }
        MainTabBar({ currentTab: $currentTab })
      }
    }
    .width('100%').height('100%').backgroundColor(this.COLORS.bgWall)
  }

  @Builder
  SubPageView() {
    Column() {
      Row() {
        Button('←').fontSize(24).backgroundColor('#FFFFFF').borderRadius(20).padding(10).onClick(() => { this.subPage = ''; })
        Text(this.getSubPageTitle()).fontSize(20).fontWeight(800).fontColor(this.COLORS.textInk)
        Blank()
      }
      .width('100%').padding(20).backgroundColor('#FFFFFF')

      if (this.subPage === 'practice') {
        PracticeContent({ 
          mode: $practiceMode, 
          type: $practiceType, 
          onStartPractice: (type: string) => this.startPractice(type), 
          onBack: () => { this.subPage = '' },
          num1: $questionNum1,
          num2: $questionNum2,
          answer: $userAnswer,
          correct: $isCorrect,
          showRes: $showResult,
          correctCnt: $correctCount,
          totalCnt: $totalCount,
          onAnswerChange: (v: string) => this.userAnswer = v,
          onSubmit: () => this.submitAnswer(),
          onNext: () => this.nextQuestion()
        })
      } else if (this.subPage === 'game') {
        GameContent({ onBack: () => { this.subPage = '' } })
      } else if (this.subPage === 'settings') {
        SettingsContent({ onBack: () => { this.subPage = '' } })
      } else if (this.subPage === 'shop') {
        ShopContent({ onBack: () => { this.subPage = '' } })
      } else if (this.subPage === 'report') {
        ReportContent({ onBack: () => { this.subPage = '' } })
      } else if (this.subPage === 'achievement') {
        AchievementContent({ onBack: () => { this.subPage = '' } })
      } else if (this.subPage === 'voice') {
        VoiceSelectContent({ onBack: () => { this.subPage = '' } })
      } else if (this.subPage === 'about') {
        AboutContent({ onBack: () => { this.subPage = '' } })
      } else if (this.subPage === 'visual-math') {
        VisualMathContent({ onBack: () => { this.subPage = '' } })
      } else if (this.subPage === 'time-master') {
        TimeMasterContent({ onBack: () => { this.subPage = '' } })
      } else if (this.subPage === 'money-cashier') {
        MoneyCashierContent({ onBack: () => { this.subPage = '' } })
      } else if (this.subPage === 'kinship') {
        KinshipContent({ onBack: () => { this.subPage = '' } })
      } else {
        Column() { Text('功能开发中...').fontSize(18).fontColor('#999'); Button('返回').margin({ top: 20 }).onClick(() => { this.subPage = '' }) }.width('100%').layoutWeight(1)
      }
    }
    .width('100%').height('100%')
  }

  getSubPageTitle(): string {
    switch (this.subPage) {
      case 'practice': return '数学练习';
      case 'game': return '数学大冒险';
      case 'settings': return '设置';
      case 'shop': return '商店';
      case 'report': return '学习报告';
      case 'achievement': return '成就';
      case 'voice': return '语音选择';
      case 'about': return '关于我们';
      case 'visual-math': return '学数学';
      case 'time-master': return '时间管理';
      case 'money-cashier': return '小小收银员';
      case 'kinship': return '亲属计算器';
      default: return '详情';
    }
  }

  @Builder
  CalculatorView() {
    Column() {
      Column() {
        Column() {
          Text('语音计算器').fontSize(12).fontWeight(800).fontColor(this.COLORS.textWhite).backgroundColor(this.COLORS.accentMint).padding({ top: 6, bottom: 6, left: 16, right: 16 }).borderRadius(999).position({ left: 20, top: 12 })
          Text(this.calcHistoryText).fontSize(18).fontWeight(700).fontColor(this.COLORS.purpleText).width('100%').textAlign(TextAlign.End).margin({ bottom: 4 })
          Text(this.calcDisplay).fontSize(44).fontWeight(900).fontColor(this.COLORS.textInk).width('100%').textAlign(TextAlign.End).lineHeight(44)
          Text('长按 = 说出算式').fontSize(11).fontWeight(700).fontColor(this.COLORS.purpleText).opacity(0.85).position({ right: 18, bottom: 14 })
        }
        .width('100%').height(236).padding({ left: 22, right: 22, top: 46, bottom: 32 }).backgroundColor(this.COLORS.uiCloud).borderRadius(32).alignItems(HorizontalAlign.End).shadow({ radius: 15, color: '#E3CFEA', offsetY: 10 })
        if (this.calcVoiceResult !== '') {
          Text(this.calcVoiceResult).fontSize(11).fontWeight(700).fontColor('#1b5f48').backgroundColor('rgba(102, 221, 179, 0.18)').padding({ top: 6, bottom: 6, left: 10, right: 10 }).borderRadius(999).width('100%').textAlign(TextAlign.Center).margin({ top: 8 })
        }
      }
      .width('100%').padding({ left: 20, right: 20, top: 14, bottom: 18 }).alignItems(HorizontalAlign.Center)
      // 键盘区域 - Grid布局匹配React版本
      Column() {
        Grid() {
          // 第1行: C ÷ × ⌫
          GridItem() { this.KeyButton('C', this.COLORS.stickerPink, this.COLORS.stickerPinkDark, this.COLORS.textWhite, () => this.handleClear()) }
          GridItem() { this.KeyButton('÷', this.COLORS.stickerYellow, this.COLORS.stickerYellowDark, this.COLORS.accentMintDark, () => this.handleOperator('÷')) }
          GridItem() { this.KeyButton('×', this.COLORS.stickerYellow, this.COLORS.stickerYellowDark, this.COLORS.accentMintDark, () => this.handleOperator('×')) }
          GridItem() { this.KeyButton('⌫', this.COLORS.stickerYellow, this.COLORS.stickerYellowDark, this.COLORS.textInk, () => this.handleDelete()) }
          // 第2行: 7 8 9 -
          GridItem() { this.KeyButton('7', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('7')) }
          GridItem() { this.KeyButton('8', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('8')) }
          GridItem() { this.KeyButton('9', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('9')) }
          GridItem() { this.KeyButton('-', this.COLORS.stickerYellow, this.COLORS.stickerYellowDark, this.COLORS.accentMintDark, () => this.handleOperator('-')) }
          // 第3行: 4 5 6 +
          GridItem() { this.KeyButton('4', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('4')) }
          GridItem() { this.KeyButton('5', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('5')) }
          GridItem() { this.KeyButton('6', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('6')) }
          GridItem() { this.KeyButton('+', this.COLORS.stickerYellow, this.COLORS.stickerYellowDark, this.COLORS.accentMintDark, () => this.handleOperator('+')) }
          // 第4行: 1 2 3 =(跨两行)
          GridItem() { this.KeyButton('1', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('1')) }
          GridItem() { this.KeyButton('2', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('2')) }
          GridItem() { this.KeyButton('3', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('3')) }
          GridItem() { this.VoiceButton() }
          // 第5行: 0(跨两列) .
          GridItem() { this.KeyButton('0', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('0')) }
          GridItem() { this.KeyButton('.', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleDecimal()) }
        }
        .columnsTemplate('1fr 1fr 1fr 1fr')
        .columnsGap(10)
        .rowsGap(10)
        .width('100%')
      }
      .width('100%').layoutWeight(1).padding(20).backgroundColor('rgba(255, 255, 255, 0.5)').borderRadius({ topLeft: 40, topRight: 40 })
    }
    .width('100%').height('100%')
  }

  // 圆角方块按钮 - 匹配React版本的贴纸效果
  @Builder
  KeyButton(text: string, bgColor: string, shadowColor: string, textColor: string, onClick: () => void) {
    Button(text)
      .fontSize(text === '÷' || text === '×' || text === '-' || text === '+' ? 28 : 24)
      .fontWeight(800)
      .fontColor(textColor)
      .backgroundColor(bgColor)
      .borderRadius(24)
      .width('100%')
      .aspectRatio(1)
      .onClick(onClick)
      .shadow({ radius: 0, color: shadowColor, offsetX: 0, offsetY: 6 })
  }

  // 语音按钮 - 跨两行
  @Builder
  VoiceButton() {
    Column({ space: 4 }) {
      Row({ space: 4 }) {
        Text('=')
          .fontSize(24)
          .fontWeight(800)
          .fontColor(this.COLORS.textWhite)
      }
      .alignItems(VerticalAlign.Center)

      Text(this.isListening ? '倾听中...' : '按住说话')
        .fontSize(10)
        .fontWeight(700)
        .fontColor(this.COLORS.textWhite)
    }
    .width('100%')
    .aspectRatio(0.5)
    .backgroundColor(this.isListening ? this.COLORS.accentMintDark : this.COLORS.accentMint)
    .borderRadius(24)
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .onTouch((event) => {
      if (event.type === TouchType.Down) {
        this.handleEqualsPressStart();
      } else if (event.type === TouchType.Up) {
        this.handleEqualsPressEnd();
      } else if (event.type === TouchType.Cancel) {
        this.handleEqualsPressCancel();
      }
    })
    .shadow({ radius: 0, color: this.COLORS.accentMintDark, offsetX: 0, offsetY: 6 })
  }
}

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  color: string;
}

// 储蓄页面
@Component
struct SavingsPageContent {
  addToGoal: (id: string, amt: number) => void = () => {};
  showAddDialog: boolean = false;
  onShowAdd: () => void = () => {};
  onHideAdd: () => void = () => {};
  @Link newGoalName: string;
  @Link newGoalTarget: number;
  onAddGoal: () => void = () => {};

  build() {
    Scroll() {
      Column({ space: 16 }) {
        Row({ space: 8 }) {
          IconGift({ iconSize: 28, color: '#66DDB3' })
          Text('心愿储蓄').fontSize(28).fontWeight(900).fontColor('#4B454E')
        }
        Text('记录你的心愿和存钱计划').fontSize(14).fontColor('#9CA3AF').margin({ top: 4 })
        Button() { 
          Row({ space: 8 }) { 
            IconPlus({ iconSize: 18, color: '#FFFFFF' })
            Text('添加心愿').fontSize(16).fontWeight(700).fontColor('#FFFFFF') 
          } 
        }.width('100%').height(56).backgroundColor('#66DDB3').borderRadius(24).margin({ top: 20 }).onClick(this.onShowAdd)

        if (this.showAddDialog) {
          Column() {
            Text('添加新心愿').fontSize(18).fontWeight(800).fontColor('#4B454E')
            TextInput({ placeholder: '心愿名称', text: this.newGoalName }).margin({ top: 12 }).onChange((v) => this.newGoalName = v)
            TextInput({ placeholder: '目标金额', text: this.newGoalTarget.toString() }).margin({ top: 8 }).onChange((v) => this.newGoalTarget = parseInt(v) || 0)
            Row({ space: 12 }) {
              Button('取消').onClick(this.onHideAdd).backgroundColor('#E5E7EB').fontColor('#4B454E')
              Button('添加').onClick(this.onAddGoal).backgroundColor('#66DDB3')
            }.margin({ top: 16 })
          }.width('100%').backgroundColor('#FFFFFF').borderRadius(20).padding(20).margin({ top: 12 })
        }

        Row({ space: 8 }) {
          IconGame({ iconSize: 18, color: '#14B8A6' })
          Text('游戏机').fontSize(18).fontWeight(800).fontColor('#4B454E')
        }
        Text('¥150 / ¥299').fontSize(14).fontWeight(700).fontColor('#9CA3AF')
        Column() { Column() { Blank() }.width('50%').height(12).backgroundColor('#14B8A6').borderRadius(6) }.width('100%').height(12).backgroundColor('#E5E7EB').borderRadius(6).margin({ top: 8 })
        Row() { Text('还差 ¥149').fontSize(12).fontColor('#9CA3AF'); Blank(); Button('存10元').fontSize(12).backgroundColor('#14B8A6').borderRadius(16).padding({ left: 12, right: 12 }) }.margin({ top: 12 })

        Row({ space: 8 }) {
          IconBicycle({ iconSize: 18, color: '#3B82F6' })
          Text('自行车').fontSize(18).fontWeight(800).fontColor('#4B454E').margin({ top: 20 })
        }
        Text('¥200 / ¥499').fontSize(14).fontWeight(700).fontColor('#9CA3AF')
        Column() { Column() { Blank() }.width('40%').height(12).backgroundColor('#3B82F6').borderRadius(6) }.width('100%').height(12).backgroundColor('#E5E7EB').borderRadius(6).margin({ top: 8 })
        Row() { Text('还差 ¥299').fontSize(12).fontColor('#9CA3AF'); Blank(); Button('存20元').fontSize(12).backgroundColor('#3B82F6').borderRadius(16).padding({ left: 12, right: 12 }) }.margin({ top: 12 })
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }
}

// 学习中心
@Component
struct LearnPageContent {
  onEnterSubPage: (page: string) => void = () => {};
  private learnItems: LearnItem[] = [
    { symbol: 'pencil', title: '数学练习', desc: '加减乘除练习', color: '#14B8A6', route: 'practice' },
    { symbol: 'game', title: '数学大冒险', desc: '游戏化学习', color: '#3B82F6', route: 'game' },
    { symbol: 'number', title: '学数学', desc: '趣味数学', color: '#A855F7', route: 'visual-math' },
    { symbol: 'clock', title: '时间管理', desc: '认识时间', color: '#F97316', route: 'time-master' },
    { symbol: 'money', title: '小小收银员', desc: '金钱计算', color: '#22C55E', route: 'money-cashier' },
    { symbol: 'family', title: '亲属计算器', desc: '称呼计算', color: '#EC4899', route: 'kinship' },
  ];
  @Builder
  IconByName(name: string, size: number, color: string) {
    if (name === 'pencil') {
      IconPencil({ iconSize: size, color: color })
    } else if (name === 'game') {
      IconGame({ iconSize: size, color: color })
    } else if (name === 'number') {
      IconNumber({ iconSize: size, color: color })
    } else if (name === 'clock') {
      IconClock({ iconSize: size, color: color })
    } else if (name === 'money') {
      IconMoney({ iconSize: size, color: color })
    } else if (name === 'family') {
      IconFamily({ iconSize: size, color: color })
    } else if (name === 'mic') {
      IconMic({ iconSize: size, color: color })
    } else if (name === 'cart') {
      IconCart({ iconSize: size, color: color })
    } else if (name === 'chart') {
      IconChart({ iconSize: size, color: color })
    } else if (name === 'trophy') {
      IconTrophy({ iconSize: size, color: color })
    } else if (name === 'gear') {
      IconGear({ iconSize: size, color: color })
    } else if (name === 'info') {
      IconInfo({ iconSize: size, color: color })
    } else {
      IconStar({ iconSize: size, color: color })
    }
  }
  build() {
    Scroll() {
      Column({ space: 16 }) {
        Text('学习中心').fontSize(28).fontWeight(900).fontColor('#4B454E')
        Text('选择喜欢的学习方式').fontSize(14).fontColor('#9CA3AF').margin({ top: 4 })
        Column({ space: 12 }) {
          ForEach(this.learnItems, (item: LearnItem) => {
            Button() { 
              Row({ space: 16 }) { 
                this.IconByName(item.symbol, 28, item.color)
                Column({ space: 4 }) { 
                  Text(item.title).fontSize(17).fontWeight(800).fontColor('#4B454E')
                  Text(item.desc).fontSize(13).fontColor('#9CA3AF') 
                }.alignItems(HorizontalAlign.Start)
                Blank()
                Text('›').fontSize(24).fontColor('#D1D5DB') 
              } 
            }
            .width('100%').backgroundColor('#FFFFFF').borderRadius(20).padding(16).shadow({ radius: 8, color: 'rgba(0,0,0,0.04)', offsetY: 2 }).onClick(() => this.onEnterSubPage(item.route))
          })
        }.margin({ top: 20 })
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }
}

// 我的页面
@Component
struct MyPageContent {
  onEnterSubPage: (page: string) => void = () => {};
  private settingsItems: SettingsItem[] = [
    { symbol: 'mic', title: '语音选择', desc: '选择或录制语音方案', color: '#14B8A6', route: 'voice' },
    { symbol: 'cart', title: '商店', desc: '购买语音包', color: '#F97316', route: 'shop' },
    { symbol: 'chart', title: '学习报告', desc: '查看学习进度', color: '#3B82F6', route: 'report' },
    { symbol: 'trophy', title: '成就', desc: '查看获得成就', color: '#EAB308', route: 'achievement' },
    { symbol: 'gear', title: '设置', desc: '应用设置', color: '#6B7280', route: 'settings' },
    { symbol: 'info', title: '关于我们', desc: '了解更多', color: '#A855F7', route: 'about' },
  ];
  @Builder
  IconByName(name: string, size: number, color: string) {
    if (name === 'pencil') {
      IconPencil({ iconSize: size, color: color })
    } else if (name === 'game') {
      IconGame({ iconSize: size, color: color })
    } else if (name === 'number') {
      IconNumber({ iconSize: size, color: color })
    } else if (name === 'clock') {
      IconClock({ iconSize: size, color: color })
    } else if (name === 'money') {
      IconMoney({ iconSize: size, color: color })
    } else if (name === 'family') {
      IconFamily({ iconSize: size, color: color })
    } else if (name === 'mic') {
      IconMic({ iconSize: size, color: color })
    } else if (name === 'cart') {
      IconCart({ iconSize: size, color: color })
    } else if (name === 'chart') {
      IconChart({ iconSize: size, color: color })
    } else if (name === 'trophy') {
      IconTrophy({ iconSize: size, color: color })
    } else if (name === 'gear') {
      IconGear({ iconSize: size, color: color })
    } else if (name === 'info') {
      IconInfo({ iconSize: size, color: color })
    } else {
      IconStar({ iconSize: size, color: color })
    }
  }
  build() {
    Scroll() {
      Column({ space: 16 }) {
        Column() {
                  IconPerson({ iconSize: 64, color: '#66DDB3' })
                  Text('小小数学家').fontSize(20).fontWeight(800).fontColor('#4B454E').margin({ top: 8 }) 
                }.margin({ top: 20 })
        Column({ space: 12 }) {
          ForEach(this.settingsItems, (item: SettingsItem) => {
            Button() { 
              Row({ space: 16 }) { 
                this.IconByName(item.symbol, 24, item.color)
                Column({ space: 2 }) { 
                  Text(item.title).fontSize(16).fontWeight(700).fontColor('#4B454E')
                  Text(item.desc).fontSize(12).fontColor('#9CA3AF') 
                }.alignItems(HorizontalAlign.Start)
                Blank()
                Text('›').fontSize(22).fontColor('#D1D5DB') 
              } 
            }
            .width('100%').backgroundColor('#FFFFFF').borderRadius(20).padding(16).shadow({ radius: 8, color: 'rgba(0,0,0,0.04)', offsetY: 2 }).onClick(() => this.onEnterSubPage(item.route))
          })
        }.margin({ top: 20 })
        Text('儿童语音计算器 v1.2.5').fontSize(12).fontColor('#9CA3AF').margin({ top: 30 })
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }
}

// 数学练习子页面
@Component
struct PracticeContent {
  @Link mode: string;
  @Link type: string;
  onStartPractice: (type: string) => void = () => {};
  onBack: () => void = () => {};
  @Link num1: number;
  @Link num2: number;
  @Link answer: string;
  @Link correct: boolean;
  @Link showRes: boolean;
  @Link correctCnt: number;
  @Link totalCnt: number;
  onAnswerChange: (v: string) => void = () => {};
  onSubmit: () => void = () => {};
  onNext: () => void = () => {};

  getOp(): string {
    switch (this.type) {
      case 'addition': return ' + ';
      case 'subtraction': return ' - ';
      case 'multiplication': return ' × ';
      case 'division': return ' ÷ ';
      default: return ' + ';
    }
  }

  build() {
    Column() {
      if (this.mode === 'menu') {
        Scroll() {
          Column({ space: 16 }) {
            Text('选择练习类型').fontSize(22).fontWeight(800).fontColor('#4B454E').margin({ top: 20 })
            this.PracticeTypeCard('➕', '加法练习', '1+1=2', '#14B8A6', () => this.onStartPractice('addition'))
            this.PracticeTypeCard('➖', '减法练习', '5-2=3', '#3B82F6', () => this.onStartPractice('subtraction'))
            this.PracticeTypeCard('✖️', '乘法练习', '3×3=9', '#A855F7', () => this.onStartPractice('multiplication'))
            this.PracticeTypeCard('➗', '除法练习', '6÷2=3', '#F97316', () => this.onStartPractice('division'))
          }.width('100%').padding(20)
        }.width('100%').layoutWeight(1)
      } else {
        Column() {
          // 进度
          Row() {
            Text(`正确: ${this.correctCnt} / ${this.totalCnt}`).fontSize(16).fontColor('#14B8A6')
            Blank()
            Button('退出').fontSize(14).backgroundColor('#E5E7EB').fontColor('#4B454E').onClick(() => { this.mode = 'menu' })
          }.width('100%').padding(20)

          // 题目
          Column() {
            Text(this.num1 + this.getOp() + this.num2 + ' = ?').fontSize(48).fontWeight(900).fontColor('#4B454E').margin({ top: 40 })
          }.width('100%').layoutWeight(1)

          // 答案输入
          if (!this.showRes) {
            Column() {
              TextInput({ placeholder: '请输入答案', text: this.answer }).fontSize(24).textAlign(TextAlign.Center).onChange(this.onAnswerChange)
              Button('提交答案').fontSize(18).width('80%').height(56).backgroundColor('#66DDB3').margin({ top: 20 }).onClick(this.onSubmit).enabled(this.answer !== '')
            }.width('100%').padding(20)
          } else {
            Column() {
              Text(this.correct ? '✅ 回答正确！' : '❌ 回答错误').fontSize(24).fontWeight(800).fontColor(this.correct ? '#22C55E' : '#EF4444')
              if (!this.correct) {
                Text('正确答案: ' + (this.type === 'addition' ? this.num1 + this.num2 : this.type === 'subtraction' ? this.num1 - this.num2 : this.type === 'multiplication' ? this.num1 * this.num2 : Math.floor(this.num1 / this.num2))).fontSize(18).fontColor('#4B454E').margin({ top: 8 })
              }
              Button('下一题').fontSize(18).width('80%').height(56).backgroundColor('#66DDB3').margin({ top: 30 }).onClick(this.onNext)
            }.width('100%').padding(20)
          }
        }.width('100%').height('100%')
      }
    }.width('100%').height('100%').backgroundColor('#E8F6F1')
  }

  @Builder
  PracticeTypeCard(icon: string, title: string, example: string, color: string, onClick: () => void) {
    Button() { 
      Row({ space: 16 }) { 
        Text(icon).fontSize(36); 
        Column({ space: 4 }) { 
          Text(title).fontSize(18).fontWeight(800).fontColor('#4B454E'); 
          Text(example).fontSize(14).fontColor('#9CA3AF') 
        }.alignItems(HorizontalAlign.Start); 
        Blank(); 
        Text('›').fontSize(24).fontColor('#D1D5DB') 
      } 
    }.width('100%').backgroundColor('#FFFFFF').borderRadius(20).padding(20).shadow({ radius: 8, color: '#0A000000', offsetX: 0, offsetY: 2 }).onClick(onClick)
  }
}

// 游戏子页面
@Component
struct GameContent {
  onBack: () => void = () => {};
  @State level: number = 1;
  @State score: number = 0;
  @State gameOver: boolean = false;

  build() {
    Column() {
      if (this.gameOver) {
        Column() {
          IconGame({ iconSize: 80, color: '#8B5CF6' })
          Text('游戏结束').fontSize(28).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })
          Text(`得分: ${this.score}`).fontSize(20).fontColor('#14B8A6').margin({ top: 10 })
          Button('再玩一次').fontSize(18).backgroundColor('#66DDB3').padding({ left: 40, right: 40, top: 12, bottom: 12 }).margin({ top: 30 }).onClick(() => { this.level = 1; this.score = 0; this.gameOver = false })
        }.width('100%').layoutWeight(1)
      } else {
        Column() {
          Row() { Text(`第 ${this.level} 关`).fontSize(20).fontWeight(800).fontColor('#4B454E'); Blank(); Text(`得分: ${this.score}`).fontSize(16).fontColor('#14B8A6') }.width('100%').padding(20)
          Column() { 
            IconNumber({ iconSize: 80, color: '#A855F7' })
            Text('计算: 5 + 3 = ?').fontSize(24).fontWeight(700).fontColor('#4B454E').margin({ top: 20 }) 
          }.width('100%').layoutWeight(1)
          Column({ space: 12 }) {
            Button('6').fontSize(24).width('100%').height(56).backgroundColor('#FFFFFF').borderRadius(16).onClick(() => { if (false) { this.score += 10; this.level++; } else { this.gameOver = true; } })
            Button('8').fontSize(24).width('100%').height(56).backgroundColor('#FFFFFF').borderRadius(16).onClick(() => { this.score += 10; this.level++; })
            Button('9').fontSize(24).width('100%').height(56).backgroundColor('#FFFFFF').borderRadius(16).onClick(() => { if (false) { this.score += 10; this.level++; } else { this.gameOver = true; } })
          }.width('100%').padding(20)
        }.width('100%').height('100%')
      }
    }.width('100%').height('100%').backgroundColor('#E8F6F1')
  }
}

// 设置子页面
@Component
struct SettingsContent {
  onBack: () => void = () => {};
  @State soundEnabled: boolean = true;
  @State voiceSelected: string = 'default';
  @State vibrationEnabled: boolean = true;
  @State voiceHintEnabled: boolean = true;
  @State difficultyLevel: string = 'medium';
  @State showAnswerTime: number = 3;
  @State notificationEnabled: boolean = false;
  @State dailyReminderTime: string = '09:00';
  @State clearDataConfirm: boolean = false;

  build() {
    Scroll() {
      Column({ space: 16 }) {
        // 声音与反馈
        Row({ space: 6 }) {
          IconSpeaker({ iconSize: 14, color: '#9CA3AF' })
          Text('声音与反馈').fontSize(14).fontWeight(800).fontColor('#9CA3AF')
        }.margin({ top: 8 }).width('100%')
        Column({ space: 1 }) {
          Row() { 
            IconBell({ iconSize: 20, color: '#F59E0B' })
            Column({ space: 2 }) { Text('声音设置').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('按键音效开关').fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
            Toggle({ type: ToggleType.Switch, isOn: $$this.soundEnabled }).onChange((v: boolean) => this.soundEnabled = v)
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
          Row() { 
            IconVibration({ iconSize: 20, color: '#8B5CF6' })
            Column({ space: 2 }) { Text('振动反馈').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('按键时震动').fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
            Toggle({ type: ToggleType.Switch, isOn: $$this.vibrationEnabled }).onChange((v: boolean) => this.vibrationEnabled = v)
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
          Row() { 
            IconBulb({ iconSize: 20, color: '#EAB308' })
            Column({ space: 2 }) { Text('语音提示').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('说出计算结果').fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
            Toggle({ type: ToggleType.Switch, isOn: $$this.voiceHintEnabled }).onChange((v: boolean) => this.voiceHintEnabled = v)
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
        }.width('100%').backgroundColor('#FFFFFF').borderRadius(16).margin({ top: 8 })

        // 练习设置
        Row({ space: 6 }) {
          IconPencil({ iconSize: 14, color: '#9CA3AF' })
          Text('练习设置').fontSize(14).fontWeight(800).fontColor('#9CA3AF')
        }.margin({ top: 16 }).width('100%')
        Column({ space: 1 }) {
          Row() { 
            IconChart({ iconSize: 20, color: '#3B82F6' })
            Column({ space: 2 }) { Text('难度级别').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('当前: ' + (this.difficultyLevel === 'easy' ? '简单' : (this.difficultyLevel === 'hard' ? '困难' : '中等'))).fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
            Row({ space: 8 }) { Button('简单').fontSize(12).backgroundColor(this.difficultyLevel === 'easy' ? '#14B8A6' : '#E5E7EB').fontColor(this.difficultyLevel === 'easy' ? '#FFFFFF' : '#4B454E').borderRadius(12).padding({ left: 10, right: 10 }).onClick(() => this.difficultyLevel = 'easy'); Button('中等').fontSize(12).backgroundColor(this.difficultyLevel === 'medium' ? '#14B8A6' : '#E5E7EB').fontColor(this.difficultyLevel === 'medium' ? '#FFFFFF' : '#4B454E').borderRadius(12).padding({ left: 10, right: 10 }).onClick(() => this.difficultyLevel = 'medium'); Button('困难').fontSize(12).backgroundColor(this.difficultyLevel === 'hard' ? '#14B8A6' : '#E5E7EB').fontColor(this.difficultyLevel === 'hard' ? '#FFFFFF' : '#4B454E').borderRadius(12).padding({ left: 10, right: 10 }).onClick(() => this.difficultyLevel = 'hard') }.width('45%').justifyContent(FlexAlign.End)
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
          Row() { 
            IconTimer({ iconSize: 20, color: '#EF4444' })
            Column({ space: 2 }) { Text('显示答案时间').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text(this.showAnswerTime + '秒后显示答案').fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
            Row({ space: 8 }) { Button('-').fontSize(16).width(32).height(32).backgroundColor('#E5E7EB').borderRadius(16).onClick(() => { if (this.showAnswerTime > 1) this.showAnswerTime-- }); Text(this.showAnswerTime + '秒').fontSize(14).fontWeight(600).width(50).textAlign(TextAlign.Center); Button('+').fontSize(16).width(32).height(32).backgroundColor('#E5E7EB').borderRadius(16).onClick(() => { if (this.showAnswerTime < 10) this.showAnswerTime++ }) }.width('35%').justifyContent(FlexAlign.End)
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
        }.width('100%').backgroundColor('#FFFFFF').borderRadius(16).margin({ top: 8 })

        // 通知设置
        Row({ space: 6 }) {
          IconBell({ iconSize: 14, color: '#9CA3AF' })
          Text('通知设置').fontSize(14).fontWeight(800).fontColor('#9CA3AF')
        }.margin({ top: 16 }).width('100%')
        Column({ space: 1 }) {
          Row() { 
            IconEnvelope({ iconSize: 20, color: '#14B8A6' })
            Column({ space: 2 }) { Text('每日提醒').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('定时提醒学习').fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
            Toggle({ type: ToggleType.Switch, isOn: $$this.notificationEnabled }).onChange((v: boolean) => this.notificationEnabled = v)
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
          if (this.notificationEnabled) {
            Row() { 
              IconClock({ iconSize: 20, color: '#F97316' })
              Column({ space: 2 }) { Text('提醒时间').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('每天 ' + this.dailyReminderTime).fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
              Blank()
              Text('›').fontSize(20).fontColor('#D1D5DB')
            }.width('100%').backgroundColor('#FFFFFF').padding(16)
          }
        }.width('100%').backgroundColor('#FFFFFF').borderRadius(16).margin({ top: 8 })

        // 语音选择
        Row({ space: 6 }) {
          IconMic({ iconSize: 14, color: '#9CA3AF' })
          Text('语音设置').fontSize(14).fontWeight(800).fontColor('#9CA3AF')
        }.margin({ top: 16 }).width('100%')
        Column({ space: 1 }) {
          Row() { 
            IconPerson({ iconSize: 20, color: '#66DDB3' })
            Column({ space: 2 }) { Text('当前语音').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('默认童声').fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
            Text('›').fontSize(20).fontColor('#D1D5DB')
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
        }.width('100%').backgroundColor('#FFFFFF').borderRadius(16).margin({ top: 8 })

        // 数据管理
        Row({ space: 6 }) {
          IconDoc({ iconSize: 14, color: '#9CA3AF' })
          Text('数据管理').fontSize(14).fontWeight(800).fontColor('#9CA3AF')
        }.margin({ top: 16 }).width('100%')
        Column({ space: 1 }) {
          Row() { 
            IconChart({ iconSize: 20, color: '#3B82F6' })
            Column({ space: 2 }) { Text('学习报告').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('查看历史记录').fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
            Text('›').fontSize(20).fontColor('#D1D5DB')
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
          Row() { 
            IconTrophy({ iconSize: 20, color: '#EAB308' })
            Column({ space: 2 }) { Text('成就进度').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('已解锁 3/6').fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
            Text('›').fontSize(20).fontColor('#D1D5DB')
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
          if (!this.clearDataConfirm) {
            Row() { 
              IconTrash({ iconSize: 20, color: '#EF4444' })
              Column({ space: 2 }) { Text('清除数据').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('重置所有学习进度').fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
              Blank()
              Text('›').fontSize(20).fontColor('#D1D5DB')
            }.width('100%').backgroundColor('#FFFFFF').padding(16).onClick(() => this.clearDataConfirm = true)
          } else {
            Column() {
              Text('确定要清除所有数据吗？此操作不可恢复！').fontSize(14).fontColor('#EF4444').margin({ bottom: 12 })
              Row({ space: 12 }) {
                Button('取消').fontSize(14).backgroundColor('#E5E7EB').fontColor('#4B454E').onClick(() => this.clearDataConfirm = false)
                Button('确认清除').fontSize(14).backgroundColor('#EF4444').fontColor('#FFFFFF').onClick(() => { this.clearDataConfirm = false })
              }.width('100%')
            }.width('100%').backgroundColor('#FFFFFF').padding(16)
          }
        }.width('100%').backgroundColor('#FFFFFF').borderRadius(16).margin({ top: 8 })

        // 关于
        Row({ space: 6 }) {
          IconInfo({ iconSize: 14, color: '#9CA3AF' })
          Text('关于').fontSize(14).fontWeight(800).fontColor('#9CA3AF')
        }.margin({ top: 16 }).width('100%')
        Column({ space: 1 }) {
          Row() { 
            IconDoc({ iconSize: 20, color: '#6366F1' })
            Column({ space: 2 }) { Text('用户协议').fontSize(16).fontWeight(600).fontColor('#4B454E') }.alignItems(HorizontalAlign.Start)
            Blank()
            Text('›').fontSize(20).fontColor('#D1D5DB')
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
          Row() { 
            IconLock({ iconSize: 20, color: '#EC4899' })
            Column({ space: 2 }) { Text('隐私政策').fontSize(16).fontWeight(600).fontColor('#4B454E') }.alignItems(HorizontalAlign.Start)
            Blank()
            Text('›').fontSize(20).fontColor('#D1D5DB')
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
          Row() { 
            IconStar({ iconSize: 20, color: '#F59E0B' })
            Column({ space: 2 }) { Text('给我们评分').fontSize(16).fontWeight(600).fontColor('#4B454E') }.alignItems(HorizontalAlign.Start)
            Blank()
            Text('›').fontSize(20).fontColor('#D1D5DB')
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
          Row() { 
            IconEnvelope({ iconSize: 20, color: '#14B8A6' })
            Column({ space: 2 }) { Text('联系我们').fontSize(16).fontWeight(600).fontColor('#4B454E') }.alignItems(HorizontalAlign.Start)
            Blank()
            Text('›').fontSize(20).fontColor('#D1D5DB')
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
          Row() { 
            IconInfo({ iconSize: 20, color: '#A855F7' })
            Column({ space: 2 }) { Text('版本信息').fontSize(16).fontWeight(600).fontColor('#4B454E'); Text('v1.2.5').fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
          }.width('100%').backgroundColor('#FFFFFF').padding(16)
        }.width('100%').backgroundColor('#FFFFFF').borderRadius(16).margin({ top: 8 })

        Text('儿童语音计算器 © 2024').fontSize(12).fontColor('#9CA3AF').margin({ top: 30 }).width('100%').textAlign(TextAlign.Center)
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }
}

// 商店子页面
@Component
struct ShopContent {
  onBack: () => void = () => {};
  private voices: Array<VoiceShopItem> = [
    { id: 'default', name: '默认童声', price: '免费', icon: '👶' },
    { id: 'boy', name: '小男孩', price: '¥6', icon: '👦' },
    { id: 'girl', name: '小女孩', price: '¥6', icon: '👧' },
    { id: 'adult', name: '成人男声', price: '¥12', icon: '👨' },
  ];

  build() {
    Scroll() {
      Column({ space: 16 }) {
        Text('语音商店').fontSize(24).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })
        ForEach(this.voices, (item: VoiceShopItem) => {
          Row() {
            Text(item.icon).fontSize(40)
            Column({ space: 4 }) { Text(item.name).fontSize(16).fontWeight(700).fontColor('#4B454E'); Text(item.price).fontSize(14).fontColor('#14B8A6') }.alignItems(HorizontalAlign.Start)
            Blank()
            Button(item.price === '免费' ? '使用' : '购买').fontSize(14).backgroundColor(item.price === '免费' ? '#66DDB3' : '#F97316').fontColor('#FFFFFF').borderRadius(16).padding({ left: 16, right: 16 })
          }.width('100%').backgroundColor('#FFFFFF').borderRadius(20).padding(20).margin({ top: 12 })
        })
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }
}

// 报告子页面
@Component
struct ReportContent {
  onBack: () => void = () => {};
  @State totalExercises: number = 156;
  @State correctRate: number = 85;
  @State totalTime: number = 120;

  build() {
    Scroll() {
      Column({ space: 20 }) {
        Text('学习报告').fontSize(24).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })
        
        Row({ space: 16 }) {
          Column() { 
            IconPencil({ iconSize: 24, color: '#14B8A6' })
            Text(this.totalExercises.toString()).fontSize(24).fontWeight(800).fontColor('#4B454E')
            Text('总练习题数').fontSize(12).fontColor('#9CA3AF')
          }.width('30%').backgroundColor('#FFFFFF').borderRadius(20).padding(20)
          Column() { Text('✅').fontSize(32); Text(this.correctRate + '%').fontSize(24).fontWeight(800).fontColor('#4B454E'); Text('正确率').fontSize(12).fontColor('#9CA3AF') }.width('30%').backgroundColor('#FFFFFF').borderRadius(20).padding(20)
          Column() { Text('⏱️').fontSize(32); Text(this.totalTime + '分钟').fontSize(24).fontWeight(800).fontColor('#4B454E'); Text('学习时长').fontSize(12).fontColor('#9CA3AF') }.width('30%').backgroundColor('#FFFFFF').borderRadius(20).padding(20)
        }.width('100%').justifyContent(FlexAlign.SpaceBetween)

        Text('本周表现').fontSize(18).fontWeight(800).fontColor('#4B454E').margin({ top: 20 }).width('100%')
        Column() { Column() { Blank() }.width('80%').height(8).backgroundColor('#66DDB3').borderRadius(4) }.width('100%').height(8).backgroundColor('#E5E7EB').borderRadius(4).margin({ top: 8 })
        Row() { Text('周一').fontSize(12).fontColor('#9CA3AF'); Blank(); Text('周二').fontSize(12).fontColor('#9CA3AF'); Blank(); Text('周三').fontSize(12).fontColor('#9CA3AF'); Blank(); Text('周四').fontSize(12).fontColor('#9CA3AF'); Blank(); Text('周五').fontSize(12).fontColor('#9CA3AF'); Blank(); Text('周六').fontSize(12).fontColor('#9CA3AF'); Blank(); Text('周日').fontSize(12).fontColor('#9CA3AF') }.width('100%').margin({ top: 8 })
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }
}

// 成就子页面
@Component
struct AchievementContent {
  onBack: () => void = () => {};
  private achievements: Array<AchievementDataItem> = [
    { icon: '🌟', name: '初次练习', desc: '完成第一次练习', unlocked: true },
    { icon: '🔥', name: '连续学习', desc: '连续7天学习', unlocked: true },
    { icon: '🧮', name: '计算高手', desc: '正确完成100题', unlocked: true },
    { icon: '🎯', name: '满分达人', desc: '一次练习全部正确', unlocked: false },
    { icon: '⏰', name: '时间管理', desc: '使用时间管理功能', unlocked: false },
    { icon: '💰', name: '存钱小能手', desc: '完成一个心愿', unlocked: false },
  ];

  build() {
    Scroll() {
      Column({ space: 16 }) {
        Text('成就').fontSize(24).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })
        Text('已解锁 3/6').fontSize(14).fontColor('#14B8A6').margin({ top: 4 })
        
        ForEach(this.achievements, (item: AchievementDataItem) => {
          Row({ space: 16 }) {
            Text(item.icon).fontSize(40).opacity(item.unlocked ? 1 : 0.3)
            Column({ space: 4 }) { Text(item.name).fontSize(16).fontWeight(700).fontColor(item.unlocked ? '#4B454E' : '#9CA3AF'); Text(item.desc).fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
            Blank()
            if (item.unlocked) { 
              IconCheck({ iconSize: 20, color: '#14B8A6' })
            } else { 
              IconLock({ iconSize: 20, color: '#8B5CF6' })
            }
          }.width('100%').backgroundColor('#FFFFFF').borderRadius(20).padding(20).margin({ top: 12 })
        })
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }
}

// 语音选择子页面
@Component
struct VoiceSelectContent {
  onBack: () => void = () => {};
  @State selectedVoice: string = 'default';
  private voices: Array<VoiceSelectDataItem> = [
    { id: 'default', name: '默认童声', icon: '👶', desc: '清脆可爱的童声' },
    { id: 'boy', name: '小男孩', icon: '👦', desc: '活泼的男孩声音' },
    { id: 'girl', name: '小女孩', icon: '👧', desc: '甜美的小女孩声音' },
  ];

  build() {
    Scroll() {
      Column({ space: 16 }) {
        Text('语音选择').fontSize(24).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })
        
        ForEach(this.voices, (item: VoiceSelectDataItem) => {
          Button() {
            Row({ space: 16 }) {
              Text(item.icon).fontSize(40)
              Column({ space: 4 }) { Text(item.name).fontSize(18).fontWeight(700).fontColor('#4B454E'); Text(item.desc).fontSize(14).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
              Blank()
              if (this.selectedVoice === item.id) { Text('✅').fontSize(24) }
            }
          }.width('100%').backgroundColor(this.selectedVoice === item.id ? '#E0F7F0' : '#FFFFFF').borderRadius(20).padding(20).margin({ top: 12 })
          .onClick(() => { this.selectedVoice = item.id })
        })
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }
}

// 关于我们子页面
@Component
struct AboutContent {
  onBack: () => void = () => {};

  build() {
    Column() {
      IconPerson({ iconSize: 24, color: '#66DDB3' })
            .margin({ top: 60 })
      Text('儿童语音计算器').fontSize(24).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })
      Text('版本 1.2.5').fontSize(16).fontColor('#9CA3AF').margin({ top: 8 })
      Text('一款专为儿童设计的语音计算器应用，帮助孩子轻松学习数学').fontSize(14).fontColor('#4B454E').textAlign(TextAlign.Center).padding({ left: 40, right: 40 }).margin({ top: 30 })
      Text('© 2024 儿童语音计算器').fontSize(12).fontColor('#9CA3AF').margin({ top: 50 })
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }
}

// 学数学 - 趣味数学可视化
@Component
struct VisualMathContent {
  onBack: () => void = () => {};
  @State currentNumber: number = 3;
  @State showApples: boolean = true;
  @State showFingers: boolean = false;
  @State showSticks: boolean = false;

  getDisplayItems(): string[] {
    const items: string[] = [];
    for (let i = 0; i < this.currentNumber; i++) {
      if (this.showApples) items.push('🍎');
      else if (this.showFingers) items.push('✋');
      else if (this.showSticks) items.push('|');
    }
    return items;
  }

  build() {
    Scroll() {
      Column({ space: 20 }) {
        Text('学数学').fontSize(24).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })
        
        // 当前数字显示
        Column() {
          Text(this.currentNumber.toString()).fontSize(80).fontWeight(900).fontColor('#A855F7')
          Text(this.getNumberWord(this.currentNumber)).fontSize(24).fontColor('#A855F7').margin({ top: 8 })
        }.width('100%').padding(20)

        // 可视化显示
        Row({ space: 8 }) {
          ForEach(this.getDisplayItems(), (item: string, index: number) => {
            Text(item).fontSize(40).margin(2)
          })
        }.width('100%').padding(20)

        // 可视化类型选择
        Row({ space: 12 }) {
          Button('🍎').fontSize(24).backgroundColor(this.showApples ? '#E0DBF7' : '#FFFFFF').borderRadius(16).onClick(() => { this.showApples = true; this.showFingers = false; this.showSticks = false })
          Button('✋').fontSize(24).backgroundColor(this.showFingers ? '#E0DBF7' : '#FFFFFF').borderRadius(16).onClick(() => { this.showApples = false; this.showFingers = true; this.showSticks = false })
          Button('｜').fontSize(24).backgroundColor(this.showSticks ? '#E0DBF7' : '#FFFFFF').borderRadius(16).onClick(() => { this.showApples = false; this.showFingers = false; this.showSticks = true })
        }.width('100%')

        // 数字选择
        Row({ space: 16 }) {
          Button('-').fontSize(28).width(60).height(60).backgroundColor('#FFFFFF').borderRadius(30).onClick(() => { if (this.currentNumber > 0) this.currentNumber-- })
          Text('0-10').fontSize(14).fontColor('#9CA3AF')
          Button('+').fontSize(28).width(60).height(60).backgroundColor('#FFFFFF').borderRadius(30).onClick(() => { if (this.currentNumber < 10) this.currentNumber++ })
        }.width('100%').margin({ top: 20 })

        // 数字卡片
        Text('数字卡片').fontSize(18).fontWeight(800).fontColor('#4B454E').margin({ top: 30 }).width('100%')
        Flex({ wrap: FlexWrap.Wrap }) {
          ForEach([1,2,3,4,5,6,7,8,9,10], (num: number) => {
            Button(num.toString()).fontSize(20).fontWeight(700).width(60).height(60).margin(8).backgroundColor(num === this.currentNumber ? '#A855F7' : '#FFFFFF').fontColor(num === this.currentNumber ? '#FFFFFF' : '#4B454E').borderRadius(12).onClick(() => { this.currentNumber = num })
          })
        }.width('100%')
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }

  getNumberWord(num: number): string {
    const words = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    return words[num] || num.toString();
  }
}

// 时间管理 - 认识时间
@Component
struct TimeMasterContent {
  onBack: () => void = () => {};
  @State currentHour: number = 9;
  @State currentMinute: number = 0;
  @State showDigital: boolean = true;

  build() {
    Scroll() {
      Column({ space: 20 }) {
        Text('⏰ 时间管理').fontSize(24).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })

        // 时钟显示
        Column() {
          // 模拟时钟
          Column() {
            ForEach([12, 3, 6, 9], (num: number) => {
              Text(num.toString()).fontSize(16).fontColor('#9CA3AF').position({ 
                x: num === 12 ? '46%' : (num === 3 ? '87%' : (num === 6 ? '46%' : '5%')),
                y: num === 12 ? '5%' : (num === 3 ? '46%' : (num === 6 ? '87%' : '46%'))
              })
            })
            // 时针
            Text('').width(4).height(40).backgroundColor('#4B454E').borderRadius(2).rotate({ angle: this.currentHour * 30 + this.currentMinute * 0.5 - 90, centerX: '50%', centerY: '100%' }).position({ x: '48%', y: '30%' })
            // 分针
            Text('').width(3).height(55).backgroundColor('#F97316').borderRadius(2).rotate({ angle: this.currentMinute * 6 - 90, centerX: '50%', centerY: '100%' }).position({ x: '48.5%', y: '15%' })
          }.width(160).height(160).backgroundColor('#FFFFFF').borderRadius(80).border({ width: 4, color: '#F97316' }).position({ left: '50%', x: -80 })

          // 数字时间
          if (this.showDigital) {
            Text(`${this.currentHour.toString().padStart(2, '0')}:${this.currentMinute.toString().padStart(2, '0')}`).fontSize(36).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })
          }
        }.width('100%').backgroundColor('#FFFFFF').borderRadius(24).padding(30)

        // 时间类型选择
        Row({ space: 12 }) {
          Button('整点').fontSize(14).backgroundColor('#FFFFFF').borderRadius(16).padding({ left: 16, right: 16 }).onClick(() => { this.currentMinute = 0 })
          Button('半点').fontSize(14).backgroundColor('#FFFFFF').borderRadius(16).padding({ left: 16, right: 16 }).onClick(() => { this.currentMinute = 30 })
          Button('整15分').fontSize(14).backgroundColor('#FFFFFF').borderRadius(16).padding({ left: 16, right: 16 }).onClick(() => { this.currentMinute = 15 })
          Button('整45分').fontSize(14).backgroundColor('#FFFFFF').borderRadius(16).padding({ left: 16, right: 16 }).onClick(() => { this.currentMinute = 45 })
        }.width('100%').margin({ top: 10 })

        // 小时滑块
        Column({ space: 8 }) {
          Text('小时').fontSize(14).fontColor('#9CA3AF')
          Row({ space: 8 }) {
            Button('-').fontSize(20).width(40).height(40).backgroundColor('#FFFFFF').borderRadius(20).onClick(() => { if (this.currentHour > 0) this.currentHour-- })
            Text(this.currentHour + '点').fontSize(20).fontWeight(700).fontColor('#4B454E').width(80).textAlign(TextAlign.Center)
            Button('+').fontSize(20).width(40).height(40).backgroundColor('#FFFFFF').borderRadius(20).onClick(() => { if (this.currentHour < 12) this.currentHour++ })
          }
        }.width('100%').margin({ top: 20 })

        // 分钟滑块
        Column({ space: 8 }) {
          Text('分钟').fontSize(14).fontColor('#9CA3AF')
          Row({ space: 8 }) {
            Button('-').fontSize(20).width(40).height(40).backgroundColor('#FFFFFF').borderRadius(20).onClick(() => { if (this.currentMinute > 0) this.currentMinute -= 5 })
            Text(this.currentMinute + '分').fontSize(20).fontWeight(700).fontColor('#4B454E').width(80).textAlign(TextAlign.Center)
            Button('+').fontSize(20).width(40).height(40).backgroundColor('#FFFFFF').borderRadius(20).onClick(() => { if (this.currentMinute < 55) this.currentMinute += 5 })
          }
        }.width('100%').margin({ top: 16 })

        // 常见时间
        Text('认识时钟').fontSize(18).fontWeight(800).fontColor('#4B454E').margin({ top: 30 }).width('100%')
        Column({ space: 12 }) {
          this.TimeCard('🌅', '早上 7点', '该起床啦！')
          this.TimeCard('🏫', '早上 8点', '上学时间到！')
          this.TimeCard('☀️', '中午 12点', '吃午饭啦！')
          this.TimeCard('🌙', '晚上 9点', '该睡觉啦！')
        }.width('100%').margin({ top: 10 })
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }

  @Builder
  TimeCard(icon: string, time: string, tip: string) {
    Row() {
      Text(icon).fontSize(28)
      Column({ space: 4 }) { Text(time).fontSize(16).fontWeight(700).fontColor('#4B454E'); Text(tip).fontSize(12).fontColor('#9CA3AF') }.alignItems(HorizontalAlign.Start)
    }.width('100%').backgroundColor('#FFFFFF').borderRadius(16).padding(16)
  }
}

// 小小收银员 - 金钱计算
@Component
struct MoneyCashierContent {
  onBack: () => void = () => {};
  @State cartItems: CartItem[] = [
    { id: '1', name: '🍭 糖果', price: 2, icon: '🍭' },
    { id: '2', name: '🥤 饮料', price: 5, icon: '🥤' },
    { id: '3', name: '🍪 饼干', price: 8, icon: '🍪' },
  ];
  @State selectedItems: string[] = [];
  @State paymentAmount: number = 0;
  @State change: number = 0;
  @State showPayment: boolean = false;

  getTotal(): number {
    let total = 0;
    for (const item of this.cartItems) {
      if (this.selectedItems.includes(item.id)) {
        total += item.price;
      }
    }
    return total;
  }

  addToCart(itemId: string): void {
    if (!this.selectedItems.includes(itemId)) {
      this.selectedItems.push(itemId);
    }
  }

  removeFromCart(itemId: string): void {
    const index = this.selectedItems.indexOf(itemId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    }
  }

  getItemCount(itemId: string): number {
    return this.selectedItems.filter(id => id === itemId).length;
  }

  build() {
    Scroll() {
      Column({ space: 20 }) {
        Text('小小收银员').fontSize(24).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })

        // 商品列表
        Text('选择商品').fontSize(18).fontWeight(800).fontColor('#4B454E').width('100%')
        Column({ space: 12 }) {
          ForEach(this.cartItems, (item: CartItem) => {
            Row() {
              Text(item.icon).fontSize(32)
              Column({ space: 4 }) { Text(item.name).fontSize(16).fontWeight(700).fontColor('#4B454E'); Text('¥' + item.price).fontSize(14).fontColor('#22C55E') }.alignItems(HorizontalAlign.Start)
              Blank()
              Row({ space: 12 }) {
                Button('-').fontSize(20).width(36).height(36).backgroundColor('#FFFFFF').borderRadius(18).onClick(() => this.removeFromCart(item.id))
                Text(this.getItemCount(item.id).toString()).fontSize(18).fontWeight(700).width(30).textAlign(TextAlign.Center)
                Button('+').fontSize(20).width(36).height(36).backgroundColor('#22C55E').fontColor('#FFFFFF').borderRadius(18).onClick(() => this.addToCart(item.id))
              }
            }.width('100%').backgroundColor('#FFFFFF').borderRadius(16).padding(16)
          })
        }.width('100%').margin({ top: 10 })

        // 购物车摘要
        if (this.selectedItems.length > 0) {
          Column() {
            Row() { Text('已选商品: ' + this.selectedItems.length + '件').fontSize(14).fontColor('#9CA3AF'); Blank(); Text('总计: ¥' + this.getTotal()).fontSize(20).fontWeight(900).fontColor('#22C55E') }
            Button('去结账').fontSize(16).width('100%').height(48).backgroundColor('#22C55E').fontColor('#FFFFFF').borderRadius(24).margin({ top: 12 }).onClick(() => { this.showPayment = true; this.paymentAmount = 0; this.change = 0 })
          }.width('100%').backgroundColor('#FFFFFF').borderRadius(16).padding(16).margin({ top: 16 })
        }

        // 模拟纸币
        Text('认识人民币').fontSize(18).fontWeight(800).fontColor('#4B454E').margin({ top: 30 }).width('100%')
        Flex({ wrap: FlexWrap.Wrap }) {
          Button('1元').fontSize(14).width(70).height(40).backgroundColor('#C7E5D8').fontColor('#4B454E').margin(6).borderRadius(8)
          Button('5元').fontSize(14).width(70).height(40).backgroundColor('#B8E0D2').fontColor('#4B454E').margin(6).borderRadius(8)
          Button('10元').fontSize(14).width(70).height(40).backgroundColor('#D4C5E8').fontColor('#4B454E').margin(6).borderRadius(8)
          Button('20元').fontSize(14).width(70).height(40).backgroundColor('#C9D4E3').fontColor('#4B454E').margin(6).borderRadius(8)
          Button('50元').fontSize(14).width(70).height(40).backgroundColor('#E8D4C5').fontColor('#4B454E').margin(6).borderRadius(8)
          Button('100元').fontSize(14).width(70).height(40).backgroundColor('#D4E3D1').fontColor('#4B454E').margin(6).borderRadius(8)
        }.width('100%')

        // 支付弹窗
        if (this.showPayment) {
          Column() {
            Text('收银台').fontSize(20).fontWeight(800).fontColor('#4B454E')
            Text('应收: ¥' + this.getTotal()).fontSize(28).fontWeight(900).fontColor('#22C55E').margin({ top: 16 })
            
            Row({ space: 12 }) {
              Button('¥10').fontSize(16).onClick(() => this.paymentAmount = 10)
              Button('¥20').fontSize(16).onClick(() => this.paymentAmount = 20)
              Button('¥50').fontSize(16).onClick(() => this.paymentAmount = 50)
            }.margin({ top: 16 })

            if (this.paymentAmount > 0) {
              Column() {
                Text('实收: ¥' + this.paymentAmount).fontSize(18).fontColor('#4B454E')
                Text('找零: ¥' + (this.paymentAmount - this.getTotal())).fontSize(24).fontWeight(900).fontColor(this.paymentAmount >= this.getTotal() ? '#22C55E' : '#EF4444')
              }.margin({ top: 16 })
            }

            Row({ space: 12 }) {
              Button('取消').onClick(() => { this.showPayment = false }).backgroundColor('#E5E7EB').fontColor('#4B454E')
              Button('完成').onClick(() => { this.showPayment = false; this.selectedItems = [] }).backgroundColor('#22C55E').fontColor('#FFFFFF')
            }.margin({ top: 20 })
          }.width('90%').backgroundColor('#FFFFFF').borderRadius(24).padding(24).position({ top: '20%' })
        }
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  icon: string;
}

// 亲属计算器 - 称呼计算
@Component
struct KinshipContent {
  onBack: () => void = () => {};
  @State myGender: string = 'boy';
  @State selectedRelation: string = '爸爸';
  @State result: string = '父亲';
  @State showResult: boolean = false;

  private relations: Array<RelationDataItem> = [
    { name: '爸爸', male: '父亲', female: '妈妈' },
    { name: '妈妈', male: '父亲', female: '母亲' },
    { name: '爷爷', male: '祖父', female: '祖母' },
    { name: '奶奶', male: '祖父', female: '祖母' },
    { name: '外公', male: '外祖父', female: '外祖母' },
    { name: '外婆', male: '外祖父', female: '外祖母' },
    { name: '叔叔', male: '叔父', female: '叔母' },
    { name: '阿姨', male: '舅父', female: '舅母' },
    { name: '哥哥', male: '兄长', female: '姐姐' },
    { name: '姐姐', male: '兄长', female: '姐姐' },
    { name: '弟弟', male: '弟弟', female: '妹妹' },
    { name: '妹妹', male: '弟弟', female: '妹妹' },
    { name: '姑姑', male: '姑父', female: '姑姑' },
    { name: '舅舅', male: '舅舅', female: '舅妈' },
  ];

  getResult(relation: string): string {
    const r = this.relations.find(item => item.name === relation);
    if (r) {
      return this.myGender === 'boy' ? r.male : r.female;
    }
    return relation;
  }

  build() {
    Scroll() {
      Column({ space: 20 }) {
        Text('亲属计算器').fontSize(24).fontWeight(900).fontColor('#4B454E').margin({ top: 20 })

        // 我的性别
        Row({ space: 16 }) {
          Text('我是:').fontSize(16).fontColor('#4B454E')
          Button('👦 男孩').fontSize(14).backgroundColor(this.myGender === 'boy' ? '#EC4899' : '#FFFFFF').fontColor(this.myGender === 'boy' ? '#FFFFFF' : '#4B454E').borderRadius(16).padding({ left: 16, right: 16 }).onClick(() => { this.myGender = 'boy'; this.result = this.getResult(this.selectedRelation) })
          Button('👧 女孩').fontSize(14).backgroundColor(this.myGender === 'girl' ? '#EC4899' : '#FFFFFF').fontColor(this.myGender === 'girl' ? '#FFFFFF' : '#4B454E').borderRadius(16).padding({ left: 16, right: 16 }).onClick(() => { this.myGender = 'girl'; this.result = this.getResult(this.selectedRelation) })
        }.width('100%')

        // 称呼选择
        Text('称呼').fontSize(18).fontWeight(800).fontColor('#4B454E').margin({ top: 20 }).width('100%')
        Flex({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Center }) {
          ForEach(this.relations, (r: RelationDataItem) => {
            Button(r.name).fontSize(16).fontWeight(600).padding({ left: 16, right: 16, top: 10, bottom: 10 }).margin(6).backgroundColor(this.selectedRelation === r.name ? '#EC4899' : '#FFFFFF').fontColor(this.selectedRelation === r.name ? '#FFFFFF' : '#4B454E').borderRadius(20).onClick(() => { this.selectedRelation = r.name; this.result = this.getResult(r.name) })
          })
        }.width('100%').margin({ top: 10 })

        // 结果显示
        Column() {
          Text('称呼对象是您的:').fontSize(14).fontColor('#9CA3AF')
          Text(this.result).fontSize(36).fontWeight(900).fontColor('#EC4899').margin({ top: 10 })
        }.width('100%').backgroundColor('#FFFFFF').borderRadius(20).padding(24).margin({ top: 30 }).alignItems(HorizontalAlign.Center)

        // 关系图示
        Text('家庭关系').fontSize(18).fontWeight(800).fontColor('#4B454E').margin({ top: 30 }).width('100%')
        Column({ space: 8 }) {
          this.FamilyRow('👴 爷爷', '👵 奶奶', '🧔 爸爸', '👩 妈妈')
          this.FamilyRow('', '', '👦/👧 哥哥/姐姐', '👦/👧 弟弟/妹妹')
          this.FamilyRow('👴 外公', '👵 外婆', '🧑 舅舅', '👩 阿姨')
        }.width('100%').backgroundColor('#FFFFFF').borderRadius(16).padding(16).margin({ top: 10 })
      }.width('100%').padding(20)
    }.width('100%').layoutWeight(1).backgroundColor('#E8F6F1')
  }

  @Builder
  FamilyRow(left1: string, left2: string, mid: string, right: string) {
    Row() {
      Column() { 
        if (left1) Text(left1).fontSize(12).fontColor('#4B454E')
        if (left2) Text(left2).fontSize(12).fontColor('#4B454E')
      }.width('25%').alignItems(HorizontalAlign.Start)
      
      Column() { Text(mid).fontSize(12).fontColor('#4B454E') }.width('25%').alignItems(HorizontalAlign.Center)
      
      Column() { 
        if (right) Text(right).fontSize(12).fontColor('#4B454E')
      }.width('25%').alignItems(HorizontalAlign.End)
      
      Blank()
    }.width('100%').margin({ top: 4, bottom: 4 })
  }
}