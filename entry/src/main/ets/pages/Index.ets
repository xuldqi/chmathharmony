import { router } from '@kit.ArkUI';
import { display } from '@kit.ArkUI';

// 按钮状态接口
interface ButtonState {
  isHovered: boolean;
  isPressed: boolean;
  scale: number;
  translateY: number;
  emojiRotate: number;
  emojiScale: number;
}

@Entry
@Component
struct Index {
  @State isAudioEnabled: boolean = true
  @State gridCols: number = 2
  @State screenWidth: number = 0
  @State screenHeight: number = 0
  
  // 按钮动画状态
  @State buttonStates: ButtonState[] = [
    { isHovered: false, isPressed: false, scale: 1.0, translateY: 0, emojiRotate: 0, emojiScale: 1.0 },
    { isHovered: false, isPressed: false, scale: 1.0, translateY: 0, emojiRotate: 0, emojiScale: 1.0 },
    { isHovered: false, isPressed: false, scale: 1.0, translateY: 0, emojiRotate: 0, emojiScale: 1.0 },
    { isHovered: false, isPressed: false, scale: 1.0, translateY: 0, emojiRotate: 0, emojiScale: 1.0 },
    { isHovered: false, isPressed: false, scale: 1.0, translateY: 0, emojiRotate: 0, emojiScale: 1.0 },
    { isHovered: false, isPressed: false, scale: 1.0, translateY: 0, emojiRotate: 0, emojiScale: 1.0 },
    { isHovered: false, isPressed: false, scale: 1.0, translateY: 0, emojiRotate: 0, emojiScale: 1.0 }
  ]

  aboutToAppear() {
    this.detectDevice()
  }

  // 检测设备类型和屏幕尺寸
  detectDevice() {
    const displayInfo = display.getDefaultDisplaySync()
    this.screenWidth = displayInfo.width
    this.screenHeight = displayInfo.height
    
    // 固定为2列布局，不管什么设备
    this.gridCols = 2
  }

  build() {
    Stack() {
      // 天空到紫色渐变背景
      Column()
        .width('100%')
        .height('100%')
        .linearGradient({
          direction: GradientDirection.Bottom,
          colors: [[0x87CEEB, 0.0], [0xE0E6FF, 0.5], [0xC8B2DB, 1.0]]
        })

      Column() {
        // 顶部控制区域
        Column() {
          Text('欢迎来到数字乐园')
            .fontSize(30)  // 对应React的text-3xl
            .fontWeight(FontWeight.Bold)
            .fontColor('#374151')
            .textAlign(TextAlign.Center)
            .margin({ bottom: 24 })
            
          // 声音控制大按钮
          Row() {
            this.SoundButton()
          }
          .justifyContent(FlexAlign.Center)
          .margin({ bottom: 16 })
            
          Text(this.isAudioEnabled ? '♪ 声音已开启' : '✕ 声音已关闭')
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor(this.isAudioEnabled ? '#16a34a' : '#6b7280')
            .textAlign(TextAlign.Center)
            .animation({ duration: 300 })
        }
        .width('100%')
        .alignItems(HorizontalAlign.Center)
        .margin({ top: 40, bottom: 48 })  // 对应React的mb-12

        // 功能按钮网格
        Column() {
          GridRow({ columns: 2, gutter: { x: 16, y: 16 } }) {  // 固定2列布局
            // 语音计算器
            GridCol() {
              this.CartoonButton(
                0,
                '语音计算器',
                '🧮',
                '#fb923c',
                () => {
                  router.pushUrl({ url: 'pages/NativeCalculator' })
                }
              )
            }
            
            // 数学练习
            GridCol() {
              this.CartoonButton(
                1,
                '练习模式',
                '📚',
                '#34d399',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/practice' } })
                }
              )
            }

            // 数学大冒险
            GridCol() {
              this.CartoonButton(
                2,
                '闯关练习',
                '🎮',
                '#a855f7',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/game' } })
                }
              )
            }

            // 学数学
            GridCol() {
              this.CartoonButton(
                3,
                '知识点学习',
                '🐱',
                '#f43f5e',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/visual-math' } })
                }
              )
            }

            // 认识时钟
            GridCol() {
              this.CartoonButton(
                4,
                '认识时钟',
                '⏰',
                '#3b82f6',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/time-master' } })
                }
              )
            }

            // 小小收银员
            GridCol() {
              this.CartoonButton(
                5,
                '小小收银员',
                '🏪',
                '#10b981',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/money-cashier' } })
                }
              )
            }

            // 心愿存钱罐
            GridCol() {
              this.CartoonButton(
                6,
                '心愿存钱罐',
                '🎯',
                '#6366f1',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/savings' } })
                }
              )
            }

            // 金币商城
            GridCol() {
              this.CartoonButton(
                7,
                '金币商城',
                '🛍️',
                '#f59e0b',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/shop' } })
                }
              )
            }

            // 学习报告
            GridCol() {
              this.CartoonButton(
                8,
                '学习报告',
                '📊',
                '#22d3ee',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/report' } })
                }
              )
            }

            // 我的
            GridCol() {
              this.CartoonButton(
                9,
                '我的',
                '👧',
                '#ec4899',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/my' } })
                }
              )
            }

            // 家长控制
            GridCol() {
              this.CartoonButton(
                10,
                '家长控制',
                '🛡️',
                '#475569',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/parent-dashboard' } })
                }
              )
            }

            // 设置
            GridCol() {
              this.CartoonButton(
                11,
                '设置',
                '⚙️',
                '#64748b',
                () => {
                  router.pushUrl({ url: 'pages/WebContainer', params: { url: '/settings' } })
                }
              )
            }
          }
          .width('100%')
          .constraintSize({ maxWidth: 600 })  // 限制最大宽度
          .alignSelf(ItemAlign.Center)  // 网格居中
        }
        .width('100%')
        .alignItems(HorizontalAlign.Center)  // 内容居中对齐
      }
      .width('100%')
      .height('100%')
      .padding({ left: 24, right: 24 })
      .alignItems(HorizontalAlign.Center)  // 整体内容居中
      
      // 浮动装饰元素
      this.FloatingDecorations()
    }
    .width('100%')
    .height('100%')
  }

  // 声音控制按钮
  @Builder
  SoundButton() {
    Button() {
      Text(this.isAudioEnabled ? '🔊' : '🔇')
        .fontSize(24)
        .animation({ duration: 200, curve: Curve.EaseInOut })
    }
    .type(ButtonType.Circle)
    .width(70)
    .height(70)
    .borderRadius(35)
    .linearGradient({
      direction: GradientDirection.Bottom,
      colors: this.isAudioEnabled ? 
        [['#10b981', 0.0], ['#059669', 1.0]] : 
        [['#9ca3af', 0.0], ['#6b7280', 1.0]]
    })
    .shadow({
      radius: 8,
      color: this.isAudioEnabled ? '#10b98140' : '#6b728040',
      offsetX: 0,
      offsetY: 2
    })
    .onClick(() => {
      this.isAudioEnabled = !this.isAudioEnabled
    })
  }

  // 简洁可爱按钮组件
  @Builder
  CartoonButton(index: number, title: string, emoji: string, color: string, onTap: () => void) {
    Button() {
      Column({ space: 12 }) {
        Text(emoji)
          .fontSize(48)
          .shadow({
            radius: 8,
            color: '#00000020',
            offsetX: 0,
            offsetY: 2
          })
          .animation({ duration: 300, curve: Curve.EaseOut })
          
        Text(title)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor(Color.White)
          .textAlign(TextAlign.Center)
          .maxLines(2)
          .shadow({
            radius: 4,
            color: '#00000030',
            offsetX: 0,
            offsetY: 1
          })
      }
      .justifyContent(FlexAlign.Center)
      .alignItems(HorizontalAlign.Center)
      .width('100%')
      .height('100%')
    }
    .type(ButtonType.Normal)
    .width(140)
    .height(140)
    .borderRadius(28)
    .linearGradient({
      direction: GradientDirection.Bottom,
      colors: [[color, 0.0], [color + 'dd', 1.0]]
    })
    .border({ width: 2, color: '#ffffff50', style: BorderStyle.Solid })
    .backgroundBlurStyle(BlurStyle.Thin)
    .shadow({
      radius: 12,
      color: color + '40',
      offsetX: 0,
      offsetY: 4
    })
    .scale({ 
      x: this.buttonStates[index].isPressed ? 0.95 : (this.buttonStates[index].isHovered ? 1.05 : 1.0), 
      y: this.buttonStates[index].isPressed ? 0.95 : (this.buttonStates[index].isHovered ? 1.05 : 1.0) 
    })
    .animation({ duration: 200, curve: Curve.EaseOut })
    .onClick(() => {
      onTap()
    })
    .onTouch((event: TouchEvent) => {
      if (event.type === TouchType.Down) {
        this.buttonStates[index].isPressed = true
      } else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
        this.buttonStates[index].isPressed = false
      }
    })
    .onHover((isHover: boolean) => {
      this.buttonStates[index].isHovered = isHover
    })
  }
  
  // 浮动装饰元素
  @Builder
  FloatingDecorations() {
    // 底部装饰
    Text('⭐')
      .fontSize(32)
      .position({ x: 16, y: this.screenHeight - 120 })
      .animation({ 
        duration: 2000, 
        curve: Curve.EaseInOut, 
        iterations: -1, 
        playMode: PlayMode.Alternate 
      })
      
    Text('🌟')
      .fontSize(32)
      .position({ x: this.screenWidth - 64, y: this.screenHeight - 120 })
      .animation({ 
        duration: 2000, 
        curve: Curve.EaseInOut, 
        iterations: -1, 
        playMode: PlayMode.Alternate,
        delay: 500
      })
      
    // 顶部装饰
    Text('🎈')
      .fontSize(24)
      .position({ x: 40, y: 80 })
      .animation({ 
        duration: 3000, 
        curve: Curve.EaseInOut, 
        iterations: -1, 
        playMode: PlayMode.Alternate 
      })
      
    Text('🎨')
      .fontSize(24)
      .position({ x: this.screenWidth - 90, y: 128 })
      .animation({ 
        duration: 3000, 
        curve: Curve.EaseInOut, 
        iterations: -1, 
        playMode: PlayMode.Alternate,
        delay: 1000
      })
      
    Text('🌈')
      .fontSize(20)
      .position({ x: 32, y: this.screenHeight * 0.5 })
      .animation({ 
        duration: 3000, 
        curve: Curve.EaseInOut, 
        iterations: -1, 
        playMode: PlayMode.Alternate,
        delay: 2000
      })
  }
}