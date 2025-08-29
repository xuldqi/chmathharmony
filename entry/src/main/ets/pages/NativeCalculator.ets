@Entry
@Component
struct NativeCalculator {
  @State display: string = '0'
  @State expression: string = ''
  @State isVoiceActive: boolean = false
  @State lastResult: string = ''

  build() {
    Column() {
      // 顶部标题
      Text('🧮 语音计算器')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor('#2196F3')
        .textAlign(TextAlign.Center)
        .margin({ top: 20, bottom: 10 })
      
      Text('HarmonyOS 原生版本')
        .fontSize(14)
        .fontColor('#666')
        .textAlign(TextAlign.Center)
        .margin({ bottom: 30 })

      // 显示屏
      Column() {
        Text(this.expression || '0')
          .fontSize(16)
          .fontColor('#999')
          .textAlign(TextAlign.End)
          .width('100%')
          .margin({ bottom: 10 })
          
        Text(this.display)
          .fontSize(32)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333')
          .textAlign(TextAlign.End)
          .width('100%')
      }
      .width('90%')
      .padding(20)
      .backgroundColor('#f8f8f8')
      .borderRadius(15)
      .margin({ bottom: 30 })
      
      // 语音按钮
      Button() {
        Row() {
          Text(this.isVoiceActive ? '🔴' : '🎤')
            .fontSize(20)
            .margin({ right: 8 })
          Text(this.isVoiceActive ? '语音识别中...' : '语音输入')
            .fontSize(16)
            .fontColor(Color.White)
        }
      }
      .width('90%')
      .height(50)
      .backgroundColor(this.isVoiceActive ? '#f44336' : '#9c27b0')
      .borderRadius(25)
      .margin({ bottom: 20 })
      .onClick(() => {
        this.toggleVoice()
      })

      // 按键网格
      Grid() {
        // 第一行
        GridItem() { this.CalculatorButton('C', '#ff9800', () => this.clear()) }
        GridItem() { this.CalculatorButton('⌫', '#ff9800', () => this.backspace()) }
        GridItem() { this.CalculatorButton('÷', '#ff9800', () => this.inputOperator('÷')) }
        GridItem() { this.CalculatorButton('×', '#ff9800', () => this.inputOperator('×')) }
        
        // 第二行
        GridItem() { this.CalculatorButton('7', '#2196F3', () => this.inputNumber('7')) }
        GridItem() { this.CalculatorButton('8', '#2196F3', () => this.inputNumber('8')) }
        GridItem() { this.CalculatorButton('9', '#2196F3', () => this.inputNumber('9')) }
        GridItem() { this.CalculatorButton('-', '#ff9800', () => this.inputOperator('-')) }
        
        // 第三行
        GridItem() { this.CalculatorButton('4', '#2196F3', () => this.inputNumber('4')) }
        GridItem() { this.CalculatorButton('5', '#2196F3', () => this.inputNumber('5')) }
        GridItem() { this.CalculatorButton('6', '#2196F3', () => this.inputNumber('6')) }
        GridItem() { this.CalculatorButton('+', '#ff9800', () => this.inputOperator('+')) }
        
        // 第四行
        GridItem() { this.CalculatorButton('1', '#2196F3', () => this.inputNumber('1')) }
        GridItem() { this.CalculatorButton('2', '#2196F3', () => this.inputNumber('2')) }
        GridItem() { this.CalculatorButton('3', '#2196F3', () => this.inputNumber('3')) }
        GridItem() { this.CalculatorButton('=', '#4caf50', () => this.calculate()) }
        
        // 第五行
        GridItem() { this.CalculatorButton('0', '#2196F3', () => this.inputNumber('0')) }
        GridItem() { this.CalculatorButton('.', '#2196F3', () => this.inputNumber('.')) }
        GridItem() { this.CalculatorButton('语音', '#9c27b0', () => this.simulateVoiceInput()) }
        GridItem() { this.CalculatorButton('📊', '#607d8b', () => this.showHistory()) }
      }
      .columnsTemplate('1fr 1fr 1fr 1fr')
      .rowsTemplate('1fr 1fr 1fr 1fr 1fr')
      .width('90%')
      .height(400)
      .columnsGap(8)
      .rowsGap(8)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#ffffff')
    .padding(20)
  }

  @Builder
  CalculatorButton(text: string, color: string, onClick: () => void) {
    Button(text)
      .fontSize(18)
      .fontColor(Color.White)
      .backgroundColor(color)
      .borderRadius(8)
      .width('100%')
      .height('100%')
      .onClick(onClick)
  }

  // 输入数字
  inputNumber(num: string) {
    if (this.display === '0' && num !== '.') {
      this.display = num
    } else {
      this.display += num
    }
    this.expression += num
  }

  // 输入运算符
  inputOperator(op: string) {
    if (this.expression.length > 0) {
      this.expression += ` ${op} `
      this.display = '0'
    }
  }

  // 计算结果
  calculate() {
    try {
      let expr = this.expression.replace(/×/g, '*').replace(/÷/g, '/')
      let result = eval(expr)
      this.lastResult = this.expression + ' = ' + result.toString()
      this.display = result.toString()
      this.expression = result.toString()
    } catch (error) {
      this.display = '错误'
    }
  }

  // 清除
  clear() {
    this.display = '0'
    this.expression = ''
  }

  // 退格
  backspace() {
    if (this.display.length > 1) {
      this.display = this.display.slice(0, -1)
    } else {
      this.display = '0'
    }
    if (this.expression.length > 0) {
      this.expression = this.expression.slice(0, -1)
    }
  }

  // 切换语音状态
  toggleVoice() {
    this.isVoiceActive = !this.isVoiceActive
    if (this.isVoiceActive) {
      // 模拟语音识别
      setTimeout(() => {
        this.isVoiceActive = false
        this.simulateVoiceInput()
      }, 2000)
    }
  }

  // 模拟语音输入
  simulateVoiceInput() {
    const voiceCommands = [
      { text: '二加三', expression: '2 + 3' },
      { text: '五乘四', expression: '5 × 4' },
      { text: '十减六', expression: '10 - 6' },
      { text: '八除二', expression: '8 ÷ 2' }
    ]
    
    const random = voiceCommands[Math.floor(Math.random() * voiceCommands.length)]
    
    AlertDialog.show({
      title: '语音识别',
      message: `识别到: "${random.text}"\n将输入: ${random.expression}`,
      confirm: {
        value: '确认',
        action: () => {
          this.expression = random.expression
          this.calculate()
        }
      },
      cancel: {
        value: '取消',
        action: () => {}
      }
    })
  }

  // 显示历史
  showHistory() {
    AlertDialog.show({
      title: '计算历史',
      message: this.lastResult || '暂无计算历史',
      confirm: {
        value: '确定',
        action: () => {}
      }
    })
  }
}