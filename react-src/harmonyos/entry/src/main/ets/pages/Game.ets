import { router } from '@kit.ArkUI';
import { hilog } from '@kit.PerformanceAnalysisKit';

@Entry
@Component
struct Game {
  @State selectedGame: string = '';

  build() {
    Column() {
      // 顶部导航栏
      Row() {
        Button() {
          Text('← 返回')
            .fontSize(16)
            .fontColor($r('app.color.primary_color'))
        }
        .backgroundColor(Color.White)
        .borderRadius(20)
        .padding({ left: 16, right: 16, top: 8, bottom: 8 })
        .onClick(() => {
          router.back()
        })

        Blank()

        Text('数学游戏')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))

        Blank()
      }
      .width('100%')
      .padding(20)

      // 游戏内容区域
      if (this.selectedGame === '') {
        this.GameSelection()
      } else {
        this.GameContent()
      }
    }
    .height('100%')
    .width('100%')
    .backgroundColor($r('app.color.background_color'))
  }

  @Builder
  GameSelection() {
    Column() {
      Text('选择游戏')
        .fontSize(28)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.primary_color'))
        .margin({ top: 20, bottom: 40 })

      // 游戏选择网格
      Grid() {
        GridItem() {
          this.GameCard('数字大比拼', '比较数字大小', '🔢', Color.Orange, 'number_compare')
        }

        GridItem() {
          this.GameCard('速算挑战', '限时计算题目', '⏰', Color.Red, 'speed_calculate')
        }

        GridItem() {
          this.GameCard('数字拼图', '拖拽数字排序', '🧩', Color.Green, 'number_puzzle')
        }

        GridItem() {
          this.GameCard('数学记忆', '记住计算结果', '🧠', Color.Blue, 'math_memory')
        }
      }
      .columnsTemplate('1fr 1fr')
      .rowsTemplate('1fr 1fr')
      .columnsGap(16)
      .rowsGap(16)
      .width('90%')
      .height(400)
    }
    .width('100%')
    .padding(24)
  }

  @Builder
  GameCard(title: string, description: string, emoji: string, color: Color, gameId: string) {
    Column() {
      Text(emoji)
        .fontSize(40)
        .margin({ bottom: 12 })

      Text(title)
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor(color)
        .margin({ bottom: 8 })

      Text(description)
        .fontSize(14)
        .fontColor($r('app.color.text_secondary'))
        .textAlign(TextAlign.Center)
        .maxLines(2)
    }
    .width('100%')
    .height('100%')
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(16)
    .justifyContent(FlexAlign.Center)
    .shadow({
      radius: 4,
      color: Color.Black,
      offsetX: 0,
      offsetY: 2
    })
    .onClick(() => {
      this.selectedGame = gameId;
    })
  }

  @Builder
  GameContent() {
    if (this.selectedGame === 'number_compare') {
      NumberCompareGame({ 
        onBack: () => { this.selectedGame = ''; } 
      })
    } else if (this.selectedGame === 'speed_calculate') {
      SpeedCalculateGame({ 
        onBack: () => { this.selectedGame = ''; } 
      })
    } else if (this.selectedGame === 'number_puzzle') {
      NumberPuzzleGame({ 
        onBack: () => { this.selectedGame = ''; } 
      })
    } else if (this.selectedGame === 'math_memory') {
      MathMemoryGame({ 
        onBack: () => { this.selectedGame = ''; } 
      })
    }
  }
}

// 数字大比拼游戏组件
@Component
struct NumberCompareGame {
  @State num1: number = 0;
  @State num2: number = 0;
  @State score: number = 0;
  @State result: string = '';
  @State showResult: boolean = false;
  onBack: () => void = () => {};

  aboutToAppear() {
    this.generateNumbers();
  }

  build() {
    Column() {
      // 游戏头部
      Row() {
        Button('← 返回')
          .backgroundColor(Color.White)
          .borderRadius(20)
          .onClick(() => {
            this.onBack();
          })

        Blank()

        Text('数字大比拼')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))

        Text(`分数: ${this.score}`)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.primary_color'))
      }
      .width('100%')
      .padding(20)

      Column() {
        Text('哪个数字更大？')
          .fontSize(20)
          .fontColor($r('app.color.text_primary'))
          .margin({ top: 40, bottom: 40 })

        // 数字比较区域
        Row() {
          Column() {
            Text(this.num1.toString())
              .fontSize(48)
              .fontWeight(FontWeight.Bold)
              .fontColor(Color.Orange)
          }
          .width(120)
          .height(120)
          .backgroundColor(Color.Orange.withOpacity(0.2))
          .borderRadius(16)
          .border({ width: 2, color: Color.Orange })
          .justifyContent(FlexAlign.Center)
          .onClick(() => {
            this.selectNumber(this.num1);
          })

          Text('VS')
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .margin({ left: 20, right: 20 })

          Column() {
            Text(this.num2.toString())
              .fontSize(48)
              .fontWeight(FontWeight.Bold)
              .fontColor(Color.Blue)
          }
          .width(120)
          .height(120)
          .backgroundColor(Color.Blue.withOpacity(0.2))
          .borderRadius(16)
          .border({ width: 2, color: Color.Blue })
          .justifyContent(FlexAlign.Center)
          .onClick(() => {
            this.selectNumber(this.num2);
          })
        }
        .width('100%')
        .justifyContent(FlexAlign.Center)

        // 结果显示
        if (this.showResult) {
          Text(this.result)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(this.result === '正确!' ? Color.Green : Color.Red)
            .backgroundColor(this.result === '正确!' ? Color.Green.withOpacity(0.2) : Color.Red.withOpacity(0.2))
            .padding(16)
            .borderRadius(12)
            .margin({ top: 40 })
        }
      }
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
  }

  private generateNumbers(): void {
    this.num1 = Math.floor(Math.random() * 99) + 1;
    this.num2 = Math.floor(Math.random() * 99) + 1;
    
    // 确保两个数字不相等
    while (this.num1 === this.num2) {
      this.num2 = Math.floor(Math.random() * 99) + 1;
    }
    
    this.result = '';
    this.showResult = false;
  }

  private selectNumber(selected: number): void {
    const correct = selected === Math.max(this.num1, this.num2);
    
    this.result = correct ? '正确!' : '错误!';
    this.showResult = true;
    if (correct) {
      this.score++;
    }
    
    // 1秒后生成新题目
    setTimeout(() => {
      this.generateNumbers();
    }, 1000);
  }
}

// 速算挑战游戏组件
@Component
struct SpeedCalculateGame {
  @State timeLeft: number = 60;
  @State score: number = 0;
  @State gameStarted: boolean = false;
  @State gameEnded: boolean = false;
  @State num1: number = 0;
  @State num2: number = 0;
  @State operator: string = '+';
  @State correctAnswer: number = 0;
  @State userAnswer: string = '';
  @State showGameEndDialog: boolean = false;
  onBack: () => void = () => {};
  private timerId: number = -1;

  aboutToAppear() {
    this.generateQuestion();
  }

  aboutToDisappear() {
    if (this.timerId !== -1) {
      clearInterval(this.timerId);
    }
  }

  build() {
    Column() {
      // 游戏头部
      Row() {
        Button('← 返回')
          .backgroundColor(Color.White)
          .borderRadius(20)
          .onClick(() => {
            this.onBack();
          })

        Blank()

        Text('速算挑战')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))

        Blank()
      }
      .width('100%')
      .padding(20)

      // 游戏状态显示
      Row() {
        Column() {
          Text(this.timeLeft.toString())
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.Red)
          Text('秒')
            .fontSize(16)
        }

        Blank()

        Column() {
          Text(this.score.toString())
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.Green)
          Text('分数')
            .fontSize(16)
        }
      }
      .width('100%')
      .padding({ left: 40, right: 40, top: 20, bottom: 20 })

      Column() {
        if (!this.gameStarted) {
          Button('开始游戏')
            .fontSize(20)
            .backgroundColor(Color.Green)
            .fontColor(Color.White)
            .borderRadius(12)
            .padding({ left: 32, right: 32, top: 16, bottom: 16 })
            .onClick(() => {
              this.startGame();
            })
        } else {
          Text(`${this.num1} ${this.operator} ${this.num2} = ?`)
            .fontSize(32)
            .fontWeight(FontWeight.Bold)
            .fontColor($r('app.color.text_primary'))
            .margin({ bottom: 30 })

          TextInput({ placeholder: '答案' })
            .width(200)
            .fontSize(24)
            .textAlign(TextAlign.Center)
            .borderRadius(12)
            .onChange((value: string) => {
              this.userAnswer = value;
            })
            .onSubmit(() => {
              this.checkAnswer();
            })

          Button('确认')
            .fontSize(18)
            .backgroundColor($r('app.color.primary_color'))
            .fontColor(Color.White)
            .borderRadius(8)
            .margin({ top: 20 })
            .enabled(this.userAnswer.length > 0)
            .onClick(() => {
              this.checkAnswer();
            })
        }
      }
      .layoutWeight(1)
      .justifyContent(FlexAlign.Center)
    }
    .width('100%')
    .height('100%')
    .bindContentCover(this.showGameEndDialog, this.GameEndDialog(), ModalTransition.NONE)
  }

  @Builder
  GameEndDialog() {
    Column() {
      Text('游戏结束')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 20 })

      Text(`你的得分: ${this.score}`)
        .fontSize(18)
        .margin({ bottom: 30 })

      Button('再来一次')
        .fontSize(16)
        .backgroundColor($r('app.color.primary_color'))
        .fontColor(Color.White)
        .onClick(() => {
          this.showGameEndDialog = false;
          this.gameStarted = false;
          this.gameEnded = false;
          this.score = 0;
          this.timeLeft = 60;
        })
    }
    .width(300)
    .padding(30)
    .backgroundColor(Color.White)
    .borderRadius(16)
    .shadow({ radius: 10, color: Color.Black, offsetX: 0, offsetY: 4 })
  }

  private startGame(): void {
    this.gameStarted = true;
    this.timeLeft = 60;
    this.score = 0;
    
    this.timerId = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  private generateQuestion(): void {
    this.num1 = Math.floor(Math.random() * 20) + 1;
    this.num2 = Math.floor(Math.random() * 20) + 1;
    
    const operators = ['+', '-', '×'];
    this.operator = operators[Math.floor(Math.random() * operators.length)];
    
    if (this.operator === '-' && this.num2 > this.num1) {
      const temp = this.num1;
      this.num1 = this.num2;
      this.num2 = temp;
    }
    
    switch (this.operator) {
      case '+':
        this.correctAnswer = this.num1 + this.num2;
        break;
      case '-':
        this.correctAnswer = this.num1 - this.num2;
        break;
      case '×':
        this.correctAnswer = this.num1 * this.num2;
        break;
    }
    
    this.userAnswer = '';
  }

  private checkAnswer(): void {
    if (this.userAnswer === '') return;
    
    try {
      const userAnswerInt = parseInt(this.userAnswer);
      if (userAnswerInt === this.correctAnswer) {
        this.score++;
      }
      
      this.generateQuestion();
    } catch (error) {
      hilog.error(0x0000, 'Game', '输入无效: ' + error);
    }
  }

  private endGame(): void {
    if (this.timerId !== -1) {
      clearInterval(this.timerId);
    }
    this.gameStarted = false;
    this.gameEnded = true;
    this.showGameEndDialog = true;
  }
}

// 数字拼图游戏组件
@Component
struct NumberPuzzleGame {
  @State numbers: number[] = [];
  @State targetOrder: number[] = [];
  @State level: number = 1;
  @State showSuccessDialog: boolean = false;
  onBack: () => void = () => {};

  aboutToAppear() {
    this.generatePuzzle();
  }

  build() {
    Column() {
      // 游戏头部
      Row() {
        Button('← 返回')
          .backgroundColor(Color.White)
          .borderRadius(20)
          .onClick(() => {
            this.onBack();
          })

        Blank()

        Text(`数字拼图 - 第${this.level}关`)
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))

        Blank()
      }
      .width('100%')
      .padding(20)

      Text('拖拽数字，按从小到大排序')
        .fontSize(18)
        .fontColor($r('app.color.text_secondary'))
        .margin({ top: 40, bottom: 40 })

      // 数字列表
      List() {
        ForEach(this.numbers, (number: number, index: number) => {
          ListItem() {
            Row() {
              Text('≡')
                .fontSize(24)
                .fontColor($r('app.color.text_secondary'))
                .margin({ right: 16 })

              Text(number.toString())
                .fontSize(24)
                .fontWeight(FontWeight.Bold)
                .fontColor($r('app.color.text_primary'))
            }
            .width('100%')
            .padding(16)
            .backgroundColor(Color.Purple.withOpacity(0.2))
            .borderRadius(12)
            .border({ width: 1, color: Color.Purple })
            .margin({ bottom: 8 })
          }
        })
      }
      .width('90%')
      .layoutWeight(1)

      Button('检查顺序')
        .fontSize(18)
        .backgroundColor($r('app.color.primary_color'))
        .fontColor(Color.White)
        .borderRadius(12)
        .margin({ top: 20, bottom: 20 })
        .onClick(() => {
          this.checkOrder();
        })
    }
    .width('100%')
    .height('100%')
    .bindContentCover(this.showSuccessDialog, this.SuccessDialog(), ModalTransition.NONE)
  }

  @Builder
  SuccessDialog() {
    Column() {
      Text('恭喜！')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 20 })

      Text(`第${this.level}关完成！`)
        .fontSize(18)
        .margin({ bottom: 30 })

      Button('下一关')
        .fontSize(16)
        .backgroundColor($r('app.color.primary_color'))
        .fontColor(Color.White)
        .onClick(() => {
          this.showSuccessDialog = false;
          this.level++;
          this.generatePuzzle();
        })
    }
    .width(300)
    .padding(30)
    .backgroundColor(Color.White)
    .borderRadius(16)
    .shadow({ radius: 10, color: Color.Black, offsetX: 0, offsetY: 4 })
  }

  private generatePuzzle(): void {
    this.targetOrder = [];
    for (let i = 1; i <= this.level + 3; i++) {
      this.targetOrder.push(i);
    }
    
    this.numbers = [...this.targetOrder];
    // 简单的洗牌算法
    for (let i = this.numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.numbers[i], this.numbers[j]] = [this.numbers[j], this.numbers[i]];
    }
  }

  private checkOrder(): void {
    let isCorrect = true;
    for (let i = 0; i < this.numbers.length; i++) {
      if (this.numbers[i] !== this.targetOrder[i]) {
        isCorrect = false;
        break;
      }
    }
    
    if (isCorrect) {
      this.showSuccessDialog = true;
    }
  }
}

// 数学记忆游戏组件
@Component
struct MathMemoryGame {
  @State expressions: string[] = [];
  @State revealed: boolean[] = [];
  @State selectedIndex: number = -1;
  @State score: number = 0;
  @State attempts: number = 0;
  onBack: () => void = () => {};

  aboutToAppear() {
    this.generateCards();
  }

  build() {
    Column() {
      // 游戏头部
      Row() {
        Button('← 返回')
          .backgroundColor(Color.White)
          .borderRadius(20)
          .onClick(() => {
            this.onBack();
          })

        Blank()

        Text('数学记忆')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))

        Text(`${this.score}/${this.attempts}`)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.primary_color'))
      }
      .width('100%')
      .padding(20)

      Text('找到相等的表达式')
        .fontSize(18)
        .fontColor($r('app.color.text_secondary'))
        .margin({ top: 20, bottom: 40 })

      // 卡片网格
      Grid() {
        ForEach(this.expressions, (expression: string, index: number) => {
          GridItem() {
            Text(this.revealed[index] ? expression : '?')
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .fontColor($r('app.color.text_primary'))
              .textAlign(TextAlign.Center)
              .width('100%')
              .height('100%')
              .backgroundColor(this.revealed[index] ? Color.Blue.withOpacity(0.2) : Color.Grey.withOpacity(0.3))
              .borderRadius(12)
              .border({
                width: 2,
                color: this.selectedIndex === index ? Color.Blue : Color.Grey
              })
              .onClick(() => {
                this.selectCard(index);
              })
          }
          .padding(4)
        })
      }
      .columnsTemplate('1fr 1fr 1fr')
      .rowsTemplate('1fr 1fr 1fr 1fr')
      .columnsGap(8)
      .rowsGap(8)
      .width('90%')
      .height(400)
    }
    .width('100%')
    .height('100%')
  }

  private generateCards(): void {
    const expressions = [
      '2+3', '5', '1+4', '3×2', '6', '4+2',
      '8-3', '10-5', '7-2', '3×3', '9', '18÷2'
    ];
    
    this.expressions = [...expressions];
    // 洗牌
    for (let i = this.expressions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.expressions[i], this.expressions[j]] = [this.expressions[j], this.expressions[i]];
    }
    
    this.revealed = new Array(this.expressions.length).fill(false);
  }

  private selectCard(index: number): void {
    if (this.revealed[index]) return;
    
    this.revealed[index] = true;
    
    if (this.selectedIndex === -1) {
      this.selectedIndex = index;
    } else {
      this.attempts++;
      // 检查是否匹配
      if (this.evaluateExpression(this.expressions[this.selectedIndex]) === 
          this.evaluateExpression(this.expressions[index])) {
        this.score++;
      } else {
        // 延迟隐藏
        setTimeout(() => {
          this.revealed[this.selectedIndex] = false;
          this.revealed[index] = false;
        }, 1000);
      }
      this.selectedIndex = -1;
    }
  }

  private evaluateExpression(expression: string): number {
    // 简单的表达式计算
    if (expression.includes('+')) {
      const parts = expression.split('+');
      return parseInt(parts[0]) + parseInt(parts[1]);
    } else if (expression.includes('-')) {
      const parts = expression.split('-');
      return parseInt(parts[0]) - parseInt(parts[1]);
    } else if (expression.includes('×')) {
      const parts = expression.split('×');
      return parseInt(parts[0]) * parseInt(parts[1]);
    } else if (expression.includes('÷')) {
      const parts = expression.split('÷');
      return parseInt(parts[0]) / parseInt(parts[1]);
    } else {
      return parseInt(expression);
    }
  }
}