import { router } from '@kit.ArkUI';

@Entry
@Component
struct Report {
  @State totalQuestions: number = 150
  @State correctAnswers: number = 128
  @State studyTime: string = '25分钟'
  @State currentStreak: number = 7

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

        Text('学习报告')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))

        Blank()
      }
      .width('100%')
      .padding(20)

      ScrollableArena() {
        Column({ space: 20 }) {
          // 总体统计
          this.StatCard('学习统计', [
            { label: '总题数', value: this.totalQuestions.toString() },
            { label: '正确数', value: this.correctAnswers.toString() },
            { label: '正确率', value: `${Math.round(this.correctAnswers / this.totalQuestions * 100)}%` },
            { label: '学习时间', value: this.studyTime },
            { label: '连续答对', value: `${this.currentStreak}题` }
          ])

          // 分类统计
          this.StatCard('分类统计', [
            { label: '加法练习', value: '38题 (95%正确)' },
            { label: '减法练习', value: '32题 (89%正确)' },
            { label: '乘法练习', value: '25题 (92%正确)' },
            { label: '除法练习', value: '18题 (85%正确)' }
          ])

          // 最近进步
          this.StatCard('最近进步', [
            { label: '昨天', value: '完成28题，正确率93%' },
            { label: '前天', value: '完成25题，正确率87%' },
            { label: '3天前', value: '完成22题，正确率90%' },
            { label: '本周平均', value: '每天25题，正确率90%' }
          ])

          // 成就展示
          this.StatCard('获得成就', [
            { label: '🏆 速算达人', value: '连续答对10题' },
            { label: '📚 勤奋学习', value: '连续学习7天' },
            { label: '🎯 精准射手', value: '正确率超过90%' },
            { label: '⚡ 闪电计算', value: '10秒内完成题目' }
          ])
        }
        .padding({ left: 20, right: 20, bottom: 20 })
      }
      .layoutWeight(1)

    }
    .height('100%')
    .width('100%')
    .backgroundColor($r('app.color.background_color'))
  }

  @Builder
  StatCard(title: string, items: Array<{ label: string, value: string }>) {
    Column() {
      Text(title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.text_primary'))
        .margin({ bottom: 16 })
        .alignSelf(ItemAlign.Start)

      Column({ space: 12 }) {
        ForEach(items, (item: { label: string, value: string }) => {
          Row() {
            Text(item.label)
              .fontSize(16)
              .fontColor($r('app.color.text_secondary'))

            Blank()

            Text(item.value)
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
              .fontColor($r('app.color.text_primary'))
          }
          .width('100%')
        })
      }
    }
    .width('100%')
    .backgroundColor(Color.White)
    .borderRadius(16)
    .padding(20)
  }
}