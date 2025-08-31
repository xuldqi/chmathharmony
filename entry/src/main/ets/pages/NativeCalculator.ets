// import textToSpeech from '@ohos.textToSpeech' // HarmonyOS环境使用
// Web环境使用Web Speech API

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
    // 播放数字音频
    this.playNumberAudio(num)
  }

  // 播放数字音频
  playNumberAudio(num: string) {
    try {
      let audioText = num === '.' ? '点' : num
      // 使用Web Speech API
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(audioText)
        utterance.lang = 'zh-CN'
        utterance.rate = 1.0
        utterance.pitch = 1.0
        window.speechSynthesis.speak(utterance)
      } else {
        console.log('播放数字音频:', audioText)
      }
    } catch (error) {
      console.error('数字音频播放错误:', error)
    }
  }

  // 输入运算符
  inputOperator(op: string) {
    if (this.expression.length > 0) {
      this.expression += ` ${op} `
      this.display = '0'
      // 播放运算符音频
      this.playOperatorAudio(op)
    }
  }

  // 播放运算符音频
  playOperatorAudio(op: string) {
    try {
      // 根据运算符播放对应音频
      let audioText = ''
      switch (op) {
        case '+':
          audioText = '加'
          break
        case '-':
          audioText = '减'
          break
        case '×':
          audioText = '乘'
          break
        case '÷':
          audioText = '除'
          console.log('除法符号调试: 输入符号=', op, '音频文本=', audioText)
          break
        default:
          audioText = op
      }
      
      console.log('运算符音频播放调试: 符号=', op, '音频文本=', audioText)
      
      // 使用Web Speech API
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        console.log('Web Speech API 可用，开始播放:', audioText)
        const utterance = new SpeechSynthesisUtterance(audioText)
        utterance.lang = 'zh-CN'
        utterance.rate = 1.0
        utterance.pitch = 1.0
        
        // 添加事件监听器进行调试
        utterance.onstart = () => console.log('语音开始播放:', audioText)
        utterance.onend = () => console.log('语音播放结束:', audioText)
        utterance.onerror = (event) => console.error('语音播放错误:', event)
        
        window.speechSynthesis.speak(utterance)
      } else {
        console.log('Web Speech API 不可用，播放运算符音频:', audioText)
      }
    } catch (error) {
      console.error('音频播放错误:', error)
    }
  }

   // 播放结果音频
   playResultAudio(result: string) {
     try {
       // 如果结果包含约等于符号，只播报数字部分
       let resultText = result
       if (result.startsWith('≈')) {
         resultText = result.substring(1) // 去掉≈符号
       }
       
       // 限制语音播报的小数位数为2位
       const num = parseFloat(resultText)
       if (!isNaN(num) && resultText.includes('.')) {
         const parts = resultText.split('.')
         if (parts[1] && parts[1].length > 2) {
           resultText = num.toFixed(2)
         }
       }
       
       let audioText = '等于' + resultText
       // 使用Web Speech API
       if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
         const utterance = new SpeechSynthesisUtterance(audioText)
         utterance.lang = 'zh-CN'
         utterance.rate = 1.0
         utterance.pitch = 1.0
         window.speechSynthesis.speak(utterance)
       } else {
         console.log('播放结果音频:', audioText)
       }
     } catch (error) {
       console.error('结果音频播放错误:', error)
     }
   }

  // 计算结果
  calculate() {
    try {
      let expr = this.expression.replace(/×/g, '*').replace(/÷/g, '/')
      
      // 检查除数为0的情况
      if (expr.includes('/')) {
        const parts = expr.split('/')
        if (parts.length === 2 && parseFloat(parts[1].trim()) === 0) {
          this.display = '不能除以零'
          return
        }
      }
      
      let result = eval(expr)
      
      // 检查结果是否为有效数字
      if (!isFinite(result)) {
        this.display = '错误'
        return
      }
      
      // 限制小数点后最多2位
      let resultStr = result.toString()
      let isApproximate = false
      
      if (resultStr.includes('.')) {
        const parts = resultStr.split('.')
        const integerPart = parts[0]
        const decimalPart = parts[1]
        
        if (decimalPart.length > 2) {
          // 小数位数超过2位，保留2位小数
          resultStr = parseFloat(resultStr).toFixed(2)
          isApproximate = true
        }
      }
      
      // 如果结果被截断或使用科学计数法，添加约等于符号
      if (isApproximate) {
        resultStr = '≈' + resultStr
      }
      
      this.lastResult = this.expression + ' = ' + resultStr
      this.display = resultStr
      this.expression = resultStr
      // 播放结果音频
      this.playResultAudio(resultStr)
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