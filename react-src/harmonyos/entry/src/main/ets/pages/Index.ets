import { router } from '@kit.ArkUI';

@Entry
@Component
struct Index {
  @State isAudioEnabled: boolean = true

  build() {
    Column() {
      // 标题
      Text('欢迎来到数字乐园')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor('#374151')
        .margin({ top: 40, bottom: 20 })
        
      // 声音控制按钮
      Button() {
        Text(this.isAudioEnabled ? '🔊' : '🔇')
          .fontSize(24)
      }
      .type(ButtonType.Circle)
      .width(60)
      .height(60)
      .backgroundColor(this.isAudioEnabled ? '#22c55e' : '#6b7280')
      .onClick(() => {
        this.isAudioEnabled = !this.isAudioEnabled
      })
      .margin({ bottom: 30 })

      // 功能按钮网格
      Grid() {
        GridItem() {
          this.SimpleButton('小鹿口算计算器', '🧮', '#fb923c', 
            () => { router.pushUrl({ url: 'pages/Calculator' }) })
        }
        GridItem() {
          this.SimpleButton('数学练习', '📚', '#10b981', 
            () => { router.pushUrl({ url: 'pages/Practice' }) })
        }
        GridItem() {
          this.SimpleButton('数学大冒险', '🎮', '#8b5cf6', 
            () => { router.pushUrl({ url: 'pages/Game' }) })
        }
        GridItem() {
          this.SimpleButton('学数学', '🐱', '#f43f5e', 
            () => { router.pushUrl({ url: 'pages/VisualMath' }) })
        }
        GridItem() {
          this.SimpleButton('学习报告', '📊', '#06b6d4', 
            () => { router.pushUrl({ url: 'pages/Report' }) })
        }
        GridItem() {
          this.SimpleButton('语音选择', '🎤', '#ec4899', 
            () => { router.pushUrl({ url: 'pages/VoiceSelect' }) })
        }
        GridItem() {
          this.SimpleButton('设置', '⚙️', '#64748b', 
            () => { router.pushUrl({ url: 'pages/Settings' }) })
        }
      }
      .columnsTemplate('1fr 1fr')
      .rowsTemplate('1fr 1fr 1fr 1fr')
      .columnsGap(16)
      .rowsGap(16)
      .width('100%')
      .height(400)
      .padding({ left: 24, right: 24 })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f0f9ff')
  }

  @Builder
  SimpleButton(title: string, emoji: string, color: string, onTap: () => void) {
    Button() {
      Column() {
        Text(emoji)
          .fontSize(32)
          .margin({ bottom: 8 })
        Text(title)
          .fontSize(14)
          .fontColor(Color.White)
          .textAlign(TextAlign.Center)
      }
    }
    .width('100%')
    .height(120)
    .backgroundColor(color)
    .borderRadius(12)
    .onClick(onTap)
  }
}