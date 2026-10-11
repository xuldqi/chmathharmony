import { router } from '@kit.ArkUI';

@Entry
@Component
struct Practice {
  @State currentType: string = 'addition'
  @State difficulty: string = 'easy'
  @State question: string = ''
  @State answer: string = ''
  @State userAnswer: string = ''
  @State score: number = 0
  @State questionsAnswered: number = 0

  aboutToAppear() {
    this.generateQuestion()
  }

  // 生成练习题
  private generateQuestion() {
    let num1: number
    let num2: number
    let operator: string
    let result: number

    // 根据难度设置数字范围
    const maxNum = this.difficulty === 'easy' ? 10 : this.difficulty === 'medium' ? 50 : 100

    switch (this.currentType) {
      case 'addition':
        num1 = Math.floor(Math.random() * maxNum) + 1
        num2 = Math.floor(Math.random() * maxNum) + 1
        operator = '+'
        result = num1 + num2
        break
      case 'subtraction':
        num1 = Math.floor(Math.random() * maxNum) + 1
        num2 = Math.floor(Math.random() * num1) + 1 // 确保结果为正数
        operator = '-'
        result = num1 - num2
        break
      case 'multiplication':
        num1 = Math.floor(Math.random() * (maxNum / 2)) + 1
        num2 = Math.floor(Math.random() * (maxNum / 2)) + 1
        operator = '×'
        result = num1 * num2
        break
      case 'division':
        result = Math.floor(Math.random() * maxNum) + 1
        num2 = Math.floor(Math.random() * 9) + 1
        num1 = result * num2 // 确保整除
        operator = '÷'
        break
      default:
        num1 = 1
        num2 = 1
        operator = '+'
        result = 2
    }

    this.question = `${num1} ${operator} ${num2} = ?`
    this.answer = result.toString()
    this.userAnswer = ''
  }

  // 检查答案
  private checkAnswer() {
    if (this.userAnswer === this.answer) {
      this.score++
      // 显示正确提示
      AlertDialog.show({
        title: '正确！',
        message: `答案是 ${this.answer}`,
        primaryButton: {
          value: '下一题',
          action: () => {
            this.nextQuestion()
          }
        }
      })
    } else {
      // 显示错误提示
      AlertDialog.show({
        title: '答错了',
        message: `正确答案是 ${this.answer}`,
        primaryButton: {
          value: '下一题',
          action: () => {
            this.nextQuestion()
          }
        }
      })
    }
  }

  // 下一题
  private nextQuestion() {
    this.questionsAnswered++
    this.generateQuestion()
  }

  // 输入数字
  private inputNumber(num: string) {
    if (this.userAnswer === '0') {
      this.userAnswer = num
    } else {
      this.userAnswer += num
    }
  }

  // 删除数字
  private deleteNumber() {
    if (this.userAnswer.length > 1) {
      this.userAnswer = this.userAnswer.slice(0, -1)
    } else {
      this.userAnswer = '0'
    }
  }

  // 清空输入
  private clearInput() {
    this.userAnswer = '0'
  }

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

        Text('数学练习')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))

        Blank()
      }
      .width('100%')
      .padding(20)

      // 得分显示
      Row() {
        Text(`得分: ${this.score}/${this.questionsAnswered}`)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.primary_color'))
      }
      .width('100%')
      .justifyContent(FlexAlign.Center)
      .margin({ bottom: 20 })

      // 练习类型选择
      Row() {
        Button('加法')
          .backgroundColor(this.currentType === 'addition' ? $r('app.color.primary_color') : '#F5F5F5')
          .fontColor(this.currentType === 'addition' ? Color.White : $r('app.color.text_primary'))
          .borderRadius(12)
          .onClick(() => {
            this.currentType = 'addition'
            this.generateQuestion()
          })

        Button('减法')
          .backgroundColor(this.currentType === 'subtraction' ? $r('app.color.primary_color') : '#F5F5F5')
          .fontColor(this.currentType === 'subtraction' ? Color.White : $r('app.color.text_primary'))
          .borderRadius(12)
          .onClick(() => {
            this.currentType = 'subtraction'
            this.generateQuestion()
          })

        Button('乘法')
          .backgroundColor(this.currentType === 'multiplication' ? $r('app.color.primary_color') : '#F5F5F5')
          .fontColor(this.currentType === 'multiplication' ? Color.White : $r('app.color.text_primary'))
          .borderRadius(12)
          .onClick(() => {
            this.currentType = 'multiplication'
            this.generateQuestion()
          })

        Button('除法')
          .backgroundColor(this.currentType === 'division' ? $r('app.color.primary_color') : '#F5F5F5')
          .fontColor(this.currentType === 'division' ? Color.White : $r('app.color.text_primary'))
          .borderRadius(12)
          .onClick(() => {
            this.currentType = 'division'
            this.generateQuestion()
          })
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceEvenly)
      .margin({ bottom: 20 })

      // 题目显示
      Column() {
        Text(this.question)
          .fontSize(32)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))
          .textAlign(TextAlign.Center)
          .margin({ bottom: 20 })

        Text(`您的答案: ${this.userAnswer || '0'}`)
          .fontSize(24)
          .fontColor($r('app.color.secondary_color'))
          .textAlign(TextAlign.Center)
      }
      .backgroundColor(Color.White)
      .borderRadius(24)
      .padding(32)
      .margin({ left: 20, right: 20, bottom: 20 })

      // 数字键盘
      Column() {
        Grid() {
          ForEach(['1', '2', '3'], (num: string) => {
            GridItem() {
              Button(num)
                .fontSize(24)
                .fontWeight(FontWeight.Bold)
                .backgroundColor('#F5F5F5')
                .fontColor($r('app.color.text_primary'))
                .borderRadius(16)
                .width('100%')
                .height(60)
                .onClick(() => this.inputNumber(num))
            }
          })

          ForEach(['4', '5', '6'], (num: string) => {
            GridItem() {
              Button(num)
                .fontSize(24)
                .fontWeight(FontWeight.Bold)
                .backgroundColor('#F5F5F5')
                .fontColor($r('app.color.text_primary'))
                .borderRadius(16)
                .width('100%')
                .height(60)
                .onClick(() => this.inputNumber(num))
            }
          })

          ForEach(['7', '8', '9'], (num: string) => {
            GridItem() {
              Button(num)
                .fontSize(24)
                .fontWeight(FontWeight.Bold)
                .backgroundColor('#F5F5F5')
                .fontColor($r('app.color.text_primary'))
                .borderRadius(16)
                .width('100%')
                .height(60)
                .onClick(() => this.inputNumber(num))
            }
          })

          GridItem() {
            Button('清空')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .backgroundColor('#FF6B6B')
              .fontColor(Color.White)
              .borderRadius(16)
              .width('100%')
              .height(60)
              .onClick(() => this.clearInput())
          }

          GridItem() {
            Button('0')
              .fontSize(24)
              .fontWeight(FontWeight.Bold)
              .backgroundColor('#F5F5F5')
              .fontColor($r('app.color.text_primary'))
              .borderRadius(16)
              .width('100%')
              .height(60)
              .onClick(() => this.inputNumber('0'))
          }

          GridItem() {
            Button('删除')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .backgroundColor('#FFA726')
              .fontColor(Color.White)
              .borderRadius(16)
              .width('100%')
              .height(60)
              .onClick(() => this.deleteNumber())
          }
        }
        .columnsTemplate('1fr 1fr 1fr')
        .rowsTemplate('1fr 1fr 1fr 1fr')
        .columnsGap(12)
        .rowsGap(12)
        .width('100%')
        .height(280)

        // 提交答案按钮
        Button('提交答案')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .backgroundColor($r('app.color.secondary_color'))
          .fontColor(Color.White)
          .borderRadius(16)
          .width('100%')
          .height(50)
          .margin({ top: 20 })
          .onClick(() => this.checkAnswer())
      }
      .backgroundColor(Color.White)
      .borderRadius(24)
      .padding(24)
      .margin({ left: 20, right: 20 })

    }
    .height('100%')
    .width('100%')
    .backgroundColor($r('app.color.background_color'))
  }
}