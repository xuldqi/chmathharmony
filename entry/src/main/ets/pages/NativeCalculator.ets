@Entry
@Component
struct NativeCalculator {
  @State display: string = '0'
  @State expression: string = ''
  @State lastResult: string = ''

  build() {
    Column() {
      Text('🧮 语音计算器')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 40, bottom: 20 })

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

      Grid() {
        GridItem() { this.CalcButton('C', '#ff9800', (): void => { this.clear() }) }
        GridItem() { this.CalcButton('⌫', '#ff9800', (): void => { this.backspace() }) }
        GridItem() { this.CalcButton('÷', '#ff9800', (): void => { this.inputOperator('÷') }) }
        GridItem() { this.CalcButton('×', '#ff9800', (): void => { this.inputOperator('×') }) }
        
        GridItem() { this.CalcButton('7', '#2196F3', (): void => { this.inputNumber('7') }) }
        GridItem() { this.CalcButton('8', '#2196F3', (): void => { this.inputNumber('8') }) }
        GridItem() { this.CalcButton('9', '#2196F3', (): void => { this.inputNumber('9') }) }
        GridItem() { this.CalcButton('-', '#ff9800', (): void => { this.inputOperator('-') }) }
        
        GridItem() { this.CalcButton('4', '#2196F3', (): void => { this.inputNumber('4') }) }
        GridItem() { this.CalcButton('5', '#2196F3', (): void => { this.inputNumber('5') }) }
        GridItem() { this.CalcButton('6', '#2196F3', (): void => { this.inputNumber('6') }) }
        GridItem() { this.CalcButton('+', '#ff9800', (): void => { this.inputOperator('+') }) }
        
        GridItem() { this.CalcButton('1', '#2196F3', (): void => { this.inputNumber('1') }) }
        GridItem() { this.CalcButton('2', '#2196F3', (): void => { this.inputNumber('2') }) }
        GridItem() { this.CalcButton('3', '#2196F3', (): void => { this.inputNumber('3') }) }
        GridItem() { this.CalcButton('=', '#4caf50', (): void => { this.calculate() }) }
        
        GridItem() { this.CalcButton('0', '#2196F3', (): void => { this.inputNumber('0') }) }
        GridItem() { this.CalcButton('.', '#2196F3', (): void => { this.inputNumber('.') }) }
        GridItem() { this.CalcButton('历史', '#607d8b', (): void => { this.showHistory() }) }
        GridItem() { this.CalcButton('测试', '#9c27b0', (): void => { this.simulateVoiceInput() }) }
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
  CalcButton(text: string, color: string, onClick: () => void) {
    Button(text)
      .fontSize(18)
      .fontColor(Color.White)
      .backgroundColor(color)
      .borderRadius(8)
      .width('100%')
      .height('100%')
      .onClick(onClick)
  }

  clear(): void {
    this.display = '0'
    this.expression = ''
  }

  backspace(): void {
    if (this.display.length > 1) {
      this.display = this.display.slice(0, -1)
    } else {
      this.display = '0'
    }
    if (this.expression.length > 0) {
      this.expression = this.expression.slice(0, -1)
    }
  }

  inputNumber(num: string): void {
    if (this.display === '0' && num !== '.') {
      this.display = num
    } else {
      this.display += num
    }
    this.expression += num
  }

  inputOperator(op: string): void {
    if (this.expression.length > 0) {
      this.expression += ` ${op} `
      this.display = '0'
    }
  }

  calculate(): void {
    try {
      let expr = this.expression.replace(/×/g, '*').replace(/÷/g, '/')
      
      if (expr.includes('/')) {
        const parts = expr.split('/')
        if (parts.length === 2 && parseFloat(parts[1].trim()) === 0) {
          this.display = '不能除以零'
          return
        }
      }
      
      let result = this.evaluate(expr)
      
      if (!Number.isFinite(result)) {
        this.display = '错误'
        return
      }
      
      let resultStr = result.toString()
      let isApproximate = false
      
      if (resultStr.includes('.')) {
        const parts = resultStr.split('.')
        const decimalPart = parts[1]
        
        if (decimalPart.length > 2) {
          resultStr = Number(resultStr).toFixed(2)
          isApproximate = true
        }
      }
      
      if (isApproximate) {
        resultStr = '≈' + resultStr
      }
      
      this.lastResult = this.expression + ' = ' + resultStr
      this.display = resultStr
      this.expression = resultStr
    } catch (e) {
      this.display = '错误'
    }
  }

  private evaluate(expr: string): number {
    expr = expr.replace(/\s+/g, '');
    const nums: number[] = [];
    const ops: string[] = [];
    let currentNum = '';
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      
      if (char >= '0' && char <= '9' || char === '.') {
        currentNum += char;
      } else if (char === '(') {
        ops.push(char);
      } else if (char === ')') {
        if (currentNum !== '') {
          nums.push(parseFloat(currentNum));
          currentNum = '';
        }
        while (ops.length > 0 && ops[ops.length - 1] !== '(') {
          this.applyOp(nums, ops.pop());
        }
        ops.pop();
      } else if (['+', '-', '*', '/'].includes(char)) {
        if (currentNum !== '') {
          nums.push(parseFloat(currentNum));
          currentNum = '';
        }
        while (ops.length > 0 && this.precedence(ops[ops.length - 1]) >= this.precedence(char)) {
          this.applyOp(nums, ops.pop());
        }
        ops.push(char);
      }
    }
    
    if (currentNum !== '') {
      nums.push(parseFloat(currentNum));
    }
    
    while (ops.length > 0) {
      this.applyOp(nums, ops.pop());
    }
    
    return nums.length > 0 ? nums[0] : 0;
  }

  private precedence(op: string): number {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
  }

  private applyOp(nums: number[], op: string | undefined): void {
    if (op === undefined || nums.length < 2) return;
    const b = nums.pop();
    const a = nums.pop();
    if (a === undefined || b === undefined) return;
    
    switch (op) {
      case '+': nums.push(a + b); break;
      case '-': nums.push(a - b); break;
      case '*': nums.push(a * b); break;
      case '/': nums.push(a / b); break;
    }
  }

  simulateVoiceInput(): void {
    interface VoiceCmd {
      text: string;
      expression: string;
    }
    const cmd1: VoiceCmd = { text: '二加三', expression: '2 + 3' };
    const cmd2: VoiceCmd = { text: '五乘四', expression: '5 × 4' };
    const cmd3: VoiceCmd = { text: '十减六', expression: '10 - 6' };
    const cmd4: VoiceCmd = { text: '八除二', expression: '8 ÷ 2' };
    const voiceCommands: VoiceCmd[] = [cmd1, cmd2, cmd3, cmd4];
    
    const random = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
    this.expression = random.expression;
    this.calculate();
  }

  showHistory(): void {
    AlertDialog.show({
      title: '计算历史',
      message: this.lastResult || '暂无计算历史'
    });
  }
}
