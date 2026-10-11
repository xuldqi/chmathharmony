import { router } from '@kit.ArkUI';
import { speechRecognizer } from '@kit.CoreSpeechKit';
import { media } from '@kit.MediaKit';
import { hilog } from '@kit.PerformanceAnalysisKit';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
}

@Entry
@Component
struct Calculator {
  @State state: CalculatorState = {
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false
  };
  
  @State voiceResult: string = '';
  @State isListening: boolean = false;
  @State speechRecognizerEngine: speechRecognizer.SpeechRecognitionEngine | null = null;

  aboutToAppear() {
    this.initSpeechRecognition();
  }

  // 初始化语音识别
  private async initSpeechRecognition() {
    try {
      // 创建语音识别引擎
      let extraParam: Record<string, Object> = {
        "locate": "CN",
        "recognizerMode": "short"
      };
      
      this.speechRecognizerEngine = await speechRecognizer.createEngine(extraParam);
      
      // 设置回调
      this.speechRecognizerEngine.setListener({
        onStart: () => {
          hilog.info(0x0000, 'Calculator', '语音识别开始');
          this.isListening = true;
          this.voiceResult = '正在听取...';
        },
        onEvent: (event: number, eventMessage: string) => {
          hilog.info(0x0000, 'Calculator', `语音识别事件: ${event}, ${eventMessage}`);
        },
        onResult: (result: speechRecognizer.SpeechRecognitionResult) => {
          hilog.info(0x0000, 'Calculator', '语音识别结果: ' + result.result);
          this.voiceResult = `识别结果: ${result.result}`;
          this.processVoiceInput(result.result);
          this.isListening = false;
          
          // 3秒后清除结果显示
          setTimeout(() => {
            this.voiceResult = '';
          }, 3000);
        },
        onError: (errorCode: number, errorMessage: string) => {
          hilog.error(0x0000, 'Calculator', `语音识别错误: ${errorCode}, ${errorMessage}`);
          this.voiceResult = '识别失败';
          this.isListening = false;
          
          setTimeout(() => {
            this.voiceResult = '';
          }, 3000);
        }
      });
    } catch (error) {
      hilog.error(0x0000, 'Calculator', '初始化语音识别失败: ' + error);
    }
  }

  // 处理数字输入
  private handleNumber(num: string) {
    if (this.state.waitingForOperand) {
      this.state = {
        ...this.state,
        display: num,
        waitingForOperand: false,
      };
    } else {
      this.state = {
        ...this.state,
        display: this.state.display === '0' ? num : this.state.display + num,
      };
    }
  }

  // 处理运算符输入
  private handleOperator(nextOperation: string) {
    const inputValue = parseFloat(this.state.display);

    if (this.state.previousValue === null) {
      this.state = {
        ...this.state,
        previousValue: inputValue,
        operation: nextOperation,
        waitingForOperand: true,
      };
    } else if (this.state.operation) {
      const currentValue = this.state.previousValue || 0;
      const newValue = this.calculate(currentValue, inputValue, this.state.operation);

      const formattedResult = Number.isInteger(newValue) 
        ? newValue.toString() 
        : newValue.toFixed(2).replace(/\.?0+$/, '');

      this.state = {
        display: formattedResult,
        previousValue: newValue,
        operation: nextOperation,
        waitingForOperand: true,
      };
    }
  }

  // 计算
  private calculate(firstValue: number, secondValue: number, operation: string): number {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  }

  // 处理等号
  private handleEquals() {
    const inputValue = parseFloat(this.state.display);
    
    if (this.state.previousValue !== null && this.state.operation) {
      const newValue = this.calculate(this.state.previousValue, inputValue, this.state.operation);
      
      const formattedResult = Number.isInteger(newValue) 
        ? newValue.toString() 
        : newValue.toFixed(2).replace(/\.?0+$/, '');
      
      this.state = {
        display: formattedResult,
        previousValue: null,
        operation: null,
        waitingForOperand: true,
      };
    }
  }

  // 清空
  private handleClear() {
    this.state = {
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
    };
  }

  // 删除
  private handleDelete() {
    this.state = {
      ...this.state,
      display: this.state.display.length > 1 ? this.state.display.slice(0, -1) : '0',
    };
  }

  // 开始语音识别
  private async startVoiceInput() {
    if (this.speechRecognizerEngine && !this.isListening) {
      try {
        await this.speechRecognizerEngine.startListening();
      } catch (error) {
        hilog.error(0x0000, 'Calculator', '启动语音识别失败: ' + error);
        this.voiceResult = '启动识别失败';
        setTimeout(() => {
          this.voiceResult = '';
        }, 3000);
      }
    }
  }

  // 停止语音识别
  private async stopVoiceInput() {
    if (this.speechRecognizerEngine && this.isListening) {
      try {
        await this.speechRecognizerEngine.stopListening();
      } catch (error) {
        hilog.error(0x0000, 'Calculator', '停止语音识别失败: ' + error);
        this.isListening = false;
      }
    }
  }

  // 处理语音输入
  private processVoiceInput(transcript: string) {
    hilog.info(0x0000, 'Calculator', '语音输入处理: ' + transcript);
    
    const numberMap: Record<string, string> = {
      '零': '0', '一': '1', '二': '2', '三': '3', '四': '4',
      '五': '5', '六': '6', '七': '7', '八': '8', '九': '9',
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
      '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
    };
    
    const operatorMap: Record<string, string> = {
      '加': '+', '减': '-', '乘': '×', '除': '÷',
      '等于': '=', '清除': 'clear', '删除': 'delete'
    };
    
    // 处理数字
    for (const [key, value] of Object.entries(numberMap)) {
      if (transcript.includes(key)) {
        this.handleNumber(value);
        return;
      }
    }
    
    // 处理操作符
    for (const [key, value] of Object.entries(operatorMap)) {
      if (transcript.includes(key)) {
        if (value === '=') {
          this.handleEquals();
        } else if (value === 'clear') {
          this.handleClear();
        } else if (value === 'delete') {
          this.handleDelete();
        } else {
          this.handleOperator(value);
        }
        return;
      }
    }
  }

  build() {
    Column() {
      // 顶部导航栏
      Row() {
        Button() {
          Row() {
            Text('← 返回')
              .fontSize(16)
              .fontColor($r('app.color.primary_color'))
          }
        }
        .backgroundColor(Color.White)
        .borderRadius(20)
        .onClick(() => {
          router.back();
        })

        Blank()

        Text('小鹿口算计算器')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))

        Blank()
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 10, bottom: 10 })

      // 显示屏
      Column() {
        Column() {
          Text(this.state.display)
            .fontSize(36)
            .fontWeight(FontWeight.Bold)
            .fontColor($r('app.color.text_primary'))
            .textAlign(TextAlign.End)
            .width('100%')
            .height(60)
        }
        .backgroundColor('#F5F5F5')
        .borderRadius(16)
        .padding(20)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.End)
      }
      .backgroundColor(Color.White)
      .borderRadius(24)
      .padding(24)
      .margin({ left: 20, right: 20, top: 20, bottom: 20 })

      // 按键区域
      Column() {
        // 功能按钮行
        Row() {
          Button('清空')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .backgroundColor('#FF6B6B')
            .fontColor(Color.White)
            .borderRadius(16)
            .width('48%')
            .height(50)
            .onClick(() => this.handleClear())

          Button('删除')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .backgroundColor('#FFA726')
            .fontColor(Color.White)
            .borderRadius(16)
            .width('48%')
            .height(50)
            .onClick(() => this.handleDelete())
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ bottom: 16 })

        // 数字和运算符按钮
        Grid() {
          // 第一行
          ForEach(['7', '8', '9', '÷'], (btn: string) => {
            GridItem() {
              this.CalculatorButton(btn, ['÷', '×', '-', '+'].includes(btn))
            }
          })

          // 第二行
          ForEach(['4', '5', '6', '×'], (btn: string) => {
            GridItem() {
              this.CalculatorButton(btn, ['÷', '×', '-', '+'].includes(btn))
            }
          })

          // 第三行
          ForEach(['1', '2', '3', '-'], (btn: string) => {
            GridItem() {
              this.CalculatorButton(btn, ['÷', '×', '-', '+'].includes(btn))
            }
          })

          // 第四行
          GridItem() {
            Button('0')
              .fontSize(24)
              .fontWeight(FontWeight.Bold)
              .backgroundColor('#F5F5F5')
              .fontColor($r('app.color.text_primary'))
              .borderRadius(16)
              .width('100%')
              .height(60)
              .onClick(() => this.handleNumber('0'))
          }.columnStart(0).columnEnd(1)

          GridItem() {
            this.CalculatorButton('+', true)
          }

          GridItem() {
            Button('=')
              .fontSize(24)
              .fontWeight(FontWeight.Bold)
              .backgroundColor('#4CAF50')
              .fontColor(Color.White)
              .borderRadius(16)
              .width('100%')
              .height(60)
              .onClick(() => this.handleEquals())
          }
        }
        .columnsTemplate('1fr 1fr 1fr 1fr')
        .rowsTemplate('1fr 1fr 1fr 1fr')
        .columnsGap(12)
        .rowsGap(12)
        .width('100%')
        .height(280)
      }
      .backgroundColor(Color.White)
      .borderRadius(24)
      .padding(24)
      .margin({ left: 20, right: 20 })

      // 语音输入按钮
      Column() {
        Button() {
          Row() {
            Text('🎤')
              .fontSize(20)
            Text(this.isListening ? '按住说话中...' : '按住说话')
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .margin({ left: 8 })
          }
        }
        .backgroundColor(this.isListening ? '#FF5722' : $r('app.color.primary_color'))
        .fontColor(Color.White)
        .borderRadius(24)
        .padding({ left: 24, right: 24, top: 12, bottom: 12 })
        .onTouch((event) => {
          if (event.type === TouchType.Down) {
            this.startVoiceInput();
          } else if (event.type === TouchType.Up) {
            this.stopVoiceInput();
          }
        })

        // 语音识别结果显示
        if (this.voiceResult) {
          Text(this.voiceResult)
            .fontSize(14)
            .fontColor('#4CAF50')
            .backgroundColor('#E8F5E8')
            .padding(12)
            .borderRadius(8)
            .margin({ top: 16 })
        }

        // 使用提示
        Column() {
          Text('🎤 按住按钮说话，松开结束')
            .fontSize(14)
            .fontColor($r('app.color.primary_color'))
            .fontWeight(FontWeight.Medium)
            .margin({ bottom: 4 })

          Text('试试说："三乘三等于几" 或 "五加二等于多少"')
            .fontSize(12)
            .fontColor($r('app.color.text_secondary'))
        }
        .margin({ top: 8 })
      }
      .margin({ top: 24, bottom: 24 })
      .alignItems(HorizontalAlign.Center)

    }
    .height('100%')
    .width('100%')
    .backgroundColor($r('app.color.background_color'))
  }

  @Builder
  CalculatorButton(text: string, isOperator: boolean) {
    Button(text)
      .fontSize(24)
      .fontWeight(FontWeight.Bold)
      .backgroundColor(isOperator ? $r('app.color.primary_color') : '#F5F5F5')
      .fontColor(isOperator ? Color.White : $r('app.color.text_primary'))
      .borderRadius(16)
      .width('100%')
      .height(60)
      .onClick(() => {
        if (['÷', '×', '-', '+'].includes(text)) {
          this.handleOperator(text);
        } else {
          this.handleNumber(text);
        }
      })
  }
}