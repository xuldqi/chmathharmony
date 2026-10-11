import { abilityAccessCtrl, common, Permissions, bundleManager } from '@kit.AbilityKit';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
}

@Entry
@Component
struct CalculatorPage {
  @State state: CalculatorState = {
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  };

  @State isListening: boolean = false;
  @State isAudioUnlocked: boolean = false;
  @State historyText: string = '';
  @State voiceResult: string = '';

  private audioContext: common.UIAbilityContext | null = null;
  private calculationRef = {
    firstNumber: null as number | null,
    operator: null as string | null,
    secondNumber: null as number | null,
    startTime: null as Date | null
  };

  // 颜色（与 React 完全一致）
  private readonly COLORS = {
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

  aboutToAppear(): void {
    try {
      this.audioContext = getContext(this) as common.UIAbilityContext;
    } catch (e) {
      console.error('获取上下文失败');
    }
  }

  // 音频播放
  async playAudio(type: string, value?: string): Promise<void> {
    console.log(`[音频] ${type}: ${value || ''}`);
  }

  async unlockAudio(): Promise<void> {
    if (!this.isAudioUnlocked) {
      this.isAudioUnlocked = true;
    }
  }

  formatDisplayValue(value: number): string {
    if (!Number.isFinite(value)) {
      return '错误';
    }
    return Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
  }

  calculate(firstValue: number, secondValue: number, operation: string): number {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return firstValue / secondValue;
      default: return secondValue;
    }
  }

  handleMathError(message: string): void {
    this.state = {
      display: '错误',
      previousValue: null,
      operation: null,
      waitingForOperand: true,
    };
    this.historyText = '';
    this.voiceResult = message;
    setTimeout(() => {
      this.voiceResult = '';
    }, 2500);
  }

  async handleNumber(num: string): Promise<void> {
    await this.unlockAudio();
    await this.playAudio('number', num);

    if (this.state.waitingForOperand) {
      this.state = {
        ...this.state,
        display: num,
        waitingForOperand: false,
      };
      return;
    }

    this.state = {
      ...this.state,
      display: this.state.display === '0' || this.state.display === '错误'
        ? num
        : this.state.display + num,
    };
  }

  async handleOperator(nextOperation: string): Promise<void> {
    await this.unlockAudio();

    const inputValue = parseFloat(this.state.display);
    if (Number.isNaN(inputValue)) {
      return;
    }

    const opAudioMap: Record<string, string> = {
      '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide'
    };
    await this.playAudio('operator', opAudioMap[nextOperation]);

    if (this.state.previousValue === null) {
      this.calculationRef = {
        firstNumber: inputValue,
        operator: nextOperation,
        secondNumber: null,
        startTime: new Date(),
      };

      this.state = {
        ...this.state,
        previousValue: inputValue,
        operation: nextOperation,
        waitingForOperand: true,
      };
      return;
    }

    if (this.state.waitingForOperand) {
      this.calculationRef.operator = nextOperation;
      this.state = {
        ...this.state,
        operation: nextOperation,
      };
      return;
    }

    if (this.state.operation) {
      const newValue = this.calculate(this.state.previousValue, inputValue, this.state.operation);
      if (!Number.isFinite(newValue)) {
        this.handleMathError('不能除以0');
        return;
      }

      const formattedResult = this.formatDisplayValue(newValue);

      this.state = {
        ...this.state,
        display: formattedResult,
        previousValue: newValue,
        operation: nextOperation,
        waitingForOperand: true,
      };
    }
  }

  async handleEquals(): Promise<void> {
    const inputValue = parseFloat(this.state.display);
    if (Number.isNaN(inputValue)) {
      return;
    }

    if (this.state.previousValue !== null && this.state.operation) {
      const newValue = this.calculate(this.state.previousValue, inputValue, this.state.operation);
      if (!Number.isFinite(newValue)) {
        this.handleMathError('不能除以0');
        return;
      }

      const formattedResult = this.formatDisplayValue(newValue);
      const expression = `${this.state.previousValue} ${this.state.operation} ${inputValue} =`;

      this.state = {
        display: formattedResult,
        previousValue: null,
        operation: null,
        waitingForOperand: true,
      };
      this.historyText = expression;

      await this.playAudio('result', formattedResult);
    }
  }

  async handleClear(): Promise<void> {
    await this.playAudio('clear');
    this.calculationRef = {
      firstNumber: null,
      operator: null,
      secondNumber: null,
      startTime: null,
    };

    this.state = {
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
    };
    this.historyText = '';
  }

  async handleDelete(): Promise<void> {
    await this.playAudio('delete');

    this.state = {
      ...this.state,
      display: this.state.display === '错误'
        ? '0'
        : (this.state.display.length > 1 ? this.state.display.slice(0, -1) : '0'),
    };
  }

  async handleDecimal(): Promise<void> {
    await this.playAudio('operator', 'point');

    if (this.state.waitingForOperand) {
      this.state = {
        ...this.state,
        display: '0.',
        waitingForOperand: false,
      };
      return;
    }

    if (this.state.display.includes('.')) {
      return;
    }

    this.state = {
      ...this.state,
      display: this.state.display === '错误' ? '0.' : `${this.state.display}.`,
    };
  }

  // 语音识别相关
  evaluateExpression(expr: string): number | null {
    try {
      let e = expr.replace(/×/g, '*').replace(/÷/g, '/');
      const result = new Function('return ' + e)();
      return typeof result === 'number' ? result : null;
    } catch {
      return null;
    }
  }

  clearVoicePressTimer(): void {
    if (this.voicePressTimer !== null) {
      // setTimeout 无法在 ArkTS 中取消，这里仅作状态重置
      this.voicePressTimer = null;
    }
  }

  clearVoiceAutoStopTimer(): void {
    if (this.voiceAutoStopTimer !== null) {
      this.voiceAutoStopTimer = null;
    }
  }

  async startVoiceInput(): Promise<void> {
    this.voiceResult = '正在听取...';
    console.info('开始语音识别');
  }

  async stopVoiceInput(): Promise<void> {
    this.clearVoiceAutoStopTimer();
    this.voiceLongPressTriggered = false;
    console.info('停止语音识别');

    // 模拟识别结果
    const expressions = ['2+3', '5×4', '10-6', '8÷2'];
    const random = expressions[Math.floor(Math.random() * expressions.length)];

    const result = this.evaluateExpression(random);
    if (result !== null) {
      this.state = {
        ...this.state,
        display: this.formatDisplayValue(result),
        previousValue: null,
        operation: null,
        waitingForOperand: true,
      };
      this.historyText = `${random} =`;
      this.voiceResult = `识别: ${random}`;
      await this.playAudio('result', this.formatDisplayValue(result));
    } else {
      this.voiceResult = '没听清算式，请再说一次';
    }

    setTimeout(() => {
      this.voiceResult = '';
    }, 3000);
  }

  handleEqualsPressStart(): void {
    if (this.isListening) {
      this.voiceLongPressTriggered = false;
      this.clearVoicePressTimer();
      this.clearVoiceAutoStopTimer();
      this.stopVoiceInput();
      return;
    }

    this.voiceLongPressTriggered = false;
    this.clearVoicePressTimer();
    this.clearVoiceAutoStopTimer();

    // 400ms 长按触发语音
    this.voicePressTimer = setTimeout(() => {
      this.isListening = true;
      this.voiceLongPressTriggered = true;
      this.startVoiceInput();

      // 5秒自动停止
      this.voiceAutoStopTimer = setTimeout(() => {
        this.isListening = false;
        this.stopVoiceInput();
      }, 5000);
    }, 400) as unknown as number;
  }

  handleEqualsPressEnd(): void {
    this.clearVoicePressTimer();

    // 长按后松手，延迟停止
    if (this.voiceLongPressTriggered) {
      this.voiceLongPressTriggered = false;
      this.isListening = false;
      this.clearVoiceAutoStopTimer();

      this.voiceAutoStopTimer = setTimeout(() => {
        this.stopVoiceInput();
      }, 1300);
      return;
    }

    if (this.isListening) {
      return;
    }

    // 短按 = 计算
    this.handleEquals();
  }

  handleEqualsPressCancel(): void {
    this.clearVoicePressTimer();
    if (this.voiceLongPressTriggered) {
      this.voiceLongPressTriggered = false;
      this.isListening = false;
      this.clearVoiceAutoStopTimer();

      this.voiceAutoStopTimer = setTimeout(() => {
        this.stopVoiceInput();
      }, 1300);
    }
  }

  build() {
    Column() {
      // app-container
      Column() {
        // display-area
        Column() {
          // calc-screen
          Column() {
            // calc-label
            Text('语音计算器')
              .fontSize(12)
              .fontWeight(800)
              .fontColor(this.COLORS.textWhite)
              .backgroundColor(this.COLORS.accentMint)
              .padding({ top: 6, bottom: 6, left: 16, right: 16 })
              .borderRadius(999)
              .position({ left: 20, top: 12 })

            // history-text
            Text(this.historyText)
              .fontSize(18)
              .fontWeight(700)
              .fontColor(this.COLORS.purpleText)
              .width('100%')
              .textAlign(TextAlign.End)
              .margin({ bottom: 4 })

            // current-text
            Text(this.state.display)
              .fontSize(44)
              .fontWeight(900)
              .fontColor(this.COLORS.textInk)
              .width('100%')
              .textAlign(TextAlign.End)
              .lineHeight(44)

            // voice-tip
            Text('长按 = 说出算式')
              .fontSize(11)
              .fontWeight(700)
              .fontColor(this.COLORS.purpleText)
              .opacity(0.85)
              .position({ right: 18, bottom: 14 })
          }
          .width('100%')
          .height(236)
          .padding({ left: 22, right: 22, top: 46, bottom: 32 })
          .backgroundColor(this.COLORS.uiCloud)
          .borderRadius(32)
          .alignItems(HorizontalAlign.End)
          .shadow({
            radius: 15,
            color: '#E3CFEA',
            offsetY: 10
          })

          // voice-result-banner
          if (this.voiceResult !== '') {
            Text(this.voiceResult)
              .fontSize(11)
              .fontWeight(700)
              .fontColor('#1b5f48')
              .backgroundColor('rgba(102, 221, 179, 0.18)')
              .padding({ top: 6, bottom: 6, left: 10, right: 10 })
              .borderRadius(999)
              .width('100%')
              .textAlign(TextAlign.Center)
              .margin({ top: 8 })
          }
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 14, bottom: 18 })
        .alignItems(HorizontalAlign.Center)

        // keypad-area - Grid布局匹配React版本
        Column() {
          Grid() {
            // 第1行(行0): C ÷ × ⌫
            GridItem() { this.KeyButton('C', this.COLORS.stickerPink, this.COLORS.stickerPinkDark, this.COLORS.textWhite, () => this.handleClear()) }
            GridItem() { this.KeyButton('÷', this.COLORS.stickerYellow, this.COLORS.stickerYellowDark, this.COLORS.accentMintDark, () => this.handleOperator('÷')) }
            GridItem() { this.KeyButton('×', this.COLORS.stickerYellow, this.COLORS.stickerYellowDark, this.COLORS.accentMintDark, () => this.handleOperator('×')) }
            GridItem() { this.KeyButton('⌫', this.COLORS.stickerYellow, this.COLORS.stickerYellowDark, this.COLORS.textInk, () => this.handleDelete()) }
            // 第2行(行1): 7 8 9 -
            GridItem() { this.KeyButton('7', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('7')) }
            GridItem() { this.KeyButton('8', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('8')) }
            GridItem() { this.KeyButton('9', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('9')) }
            GridItem() { this.KeyButton('-', this.COLORS.stickerYellow, this.COLORS.stickerYellowDark, this.COLORS.accentMintDark, () => this.handleOperator('-')) }
            // 第3行(行2): 4 5 6 +
            GridItem() { this.KeyButton('4', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('4')) }
            GridItem() { this.KeyButton('5', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('5')) }
            GridItem() { this.KeyButton('6', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('6')) }
            GridItem() { this.KeyButton('+', this.COLORS.stickerYellow, this.COLORS.stickerYellowDark, this.COLORS.accentMintDark, () => this.handleOperator('+')) }
            // 第4行(行3): 1 2 3 =(跨行3-4)
            GridItem() { this.KeyButton('1', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('1')) }
            GridItem() { this.KeyButton('2', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('2')) }
            GridItem() { this.KeyButton('3', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('3')) }
            // 第5行(行4): 0(跨列0-1) .
            GridItem() { this.KeyButton('0', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleNumber('0')) }.columnStart(0).columnEnd(1)
            GridItem() { this.KeyButton('.', this.COLORS.uiCloud, this.COLORS.uiCloudShadow, this.COLORS.textInk, () => this.handleDecimal()) }
            // 语音按钮放在最后，手动定位
            GridItem() { this.VoiceButton() }.rowStart(3).rowEnd(4).columnStart(3).columnEnd(3)
          }
          .columnsTemplate('1fr 1fr 1fr 1fr')
          .rowsTemplate('1fr 1fr 1fr 1fr 1fr')
          .columnsGap(10)
          .rowsGap(10)
          .width('100%')
        }
        .width('100%')
        .layoutWeight(1)
        .padding(20)
        .backgroundColor('rgba(255, 255, 255, 0.5)')
        .borderRadius({ topLeft: 40, topRight: 40 })
      }
      .width('100%')
      .height('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor(this.COLORS.bgWall)
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

  // 语音按钮（跨两行）- 匹配React版本
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
    .height('100%')
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
