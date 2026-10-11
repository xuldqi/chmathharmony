import { router } from '@kit.ArkUI';

@Entry
@Component
struct Settings {
  @State audioEnabled: boolean = true
  @State voiceSpeed: number = 1
  @State difficultyLevel: string = 'medium'
  @State darkMode: boolean = false

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

        Text('设置')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))

        Blank()
      }
      .width('100%')
      .padding(20)

      ScrollableArena() {
        Column({ space: 20 }) {
          // 音频设置
          this.SettingSection('音频设置', [
            {
              type: 'switch',
              title: '启用语音',
              subtitle: '开启数字和运算符语音播放',
              value: this.audioEnabled,
              onChange: (value: boolean) => { this.audioEnabled = value }
            },
            {
              type: 'slider',
              title: '语音速度',
              subtitle: '调整语音播放速度',
              value: this.voiceSpeed,
              min: 0.5,
              max: 2.0,
              step: 0.1,
              onChange: (value: number) => { this.voiceSpeed = value }
            }
          ])

          // 学习设置
          this.SettingSection('学习设置', [
            {
              type: 'select',
              title: '难度等级',
              subtitle: '选择练习题目的难度',
              value: this.difficultyLevel,
              options: [
                { label: '简单', value: 'easy' },
                { label: '中等', value: 'medium' },
                { label: '困难', value: 'hard' }
              ],
              onChange: (value: string) => { this.difficultyLevel = value }
            }
          ])

          // 界面设置
          this.SettingSection('界面设置', [
            {
              type: 'switch',
              title: '深色模式',
              subtitle: '使用深色主题界面',
              value: this.darkMode,
              onChange: (value: boolean) => { this.darkMode = value }
            }
          ])

          // 数据管理
          this.SettingSection('数据管理', [
            {
              type: 'button',
              title: '清除学习数据',
              subtitle: '删除所有学习记录和统计',
              action: () => {
                AlertDialog.show({
                  title: '确认清除',
                  message: '确定要清除所有学习数据吗？此操作不可恢复。',
                  primaryButton: {
                    value: '确认',
                    action: () => {
                      // TODO: 实现清除数据功能
                    }
                  },
                  secondaryButton: {
                    value: '取消',
                    action: () => {}
                  }
                })
              }
            }
          ])

          // 关于应用
          this.SettingSection('关于', [
            {
              type: 'info',
              title: '应用版本',
              subtitle: 'v1.0.0'
            },
            {
              type: 'info',
              title: '开发者',
              subtitle: '记账日记开发团队'
            }
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
  SettingSection(title: string, items: Array<any>) {
    Column() {
      Text(title)
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.text_primary'))
        .margin({ bottom: 16 })
        .alignSelf(ItemAlign.Start)

      Column({ space: 12 }) {
        ForEach(items, (item: any) => {
          Column() {
            Row() {
              Column() {
                Text(item.title)
                  .fontSize(16)
                  .fontColor($r('app.color.text_primary'))
                  .alignSelf(ItemAlign.Start)

                if (item.subtitle) {
                  Text(item.subtitle)
                    .fontSize(14)
                    .fontColor($r('app.color.text_secondary'))
                    .margin({ top: 4 })
                    .alignSelf(ItemAlign.Start)
                }
              }
              .layoutWeight(1)
              .alignItems(HorizontalAlign.Start)

              // 根据类型显示不同的控件
              if (item.type === 'switch') {
                Toggle({ type: ToggleType.Switch, isOn: item.value })
                  .onChange((isOn: boolean) => {
                    if (item.onChange) {
                      item.onChange(isOn)
                    }
                  })
              } else if (item.type === 'select') {
                Text(item.options?.find((opt: any) => opt.value === item.value)?.label || item.value)
                  .fontSize(16)
                  .fontColor($r('app.color.primary_color'))
                  .onClick(() => {
                    // TODO: 实现选择器弹窗
                  })
              } else if (item.type === 'button') {
                Button('操作')
                  .fontSize(14)
                  .backgroundColor($r('app.color.primary_color'))
                  .borderRadius(8)
                  .onClick(() => {
                    if (item.action) {
                      item.action()
                    }
                  })
              } else if (item.type === 'info') {
                Text(item.subtitle || '')
                  .fontSize(16)
                  .fontColor($r('app.color.text_secondary'))
              }
            }
            .width('100%')
            .padding({ top: 12, bottom: 12 })

            // 滑块控件单独处理
            if (item.type === 'slider') {
              Slider({
                value: item.value,
                min: item.min || 0,
                max: item.max || 100,
                step: item.step || 1
              })
                .width('100%')
                .margin({ top: 8 })
                .onChange((value: number) => {
                  if (item.onChange) {
                    item.onChange(value)
                  }
                })

              Text(`当前值: ${item.value.toFixed(1)}`)
                .fontSize(12)
                .fontColor($r('app.color.text_secondary'))
                .margin({ top: 4 })
                .alignSelf(ItemAlign.Start)
            }
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