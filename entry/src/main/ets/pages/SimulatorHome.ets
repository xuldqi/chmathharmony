@Entry
@Component
struct SimulatorHome {
  @State message: string = '数字乐园 - 模拟器版本';
  @State result: string = '0';

  build() {
    Column() {
      Text(this.message)
        .fontSize(28)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.Blue)
        .textAlign(TextAlign.Center)
        .margin({ bottom: 30 })
        
      Text('🧮')
        .fontSize(60)
        .margin({ bottom: 20 })
        
      Text('WebView 功能需要在真机上测试')
        .fontSize(16)
        .fontColor(Color.Gray)
        .textAlign(TextAlign.Center)
        .margin({ bottom: 20 })
        
      Text('计算结果: ' + this.result)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 20 })
        
      Button('简单计算演示')
        .fontSize(16)
        .backgroundColor(Color.Green)
        .width(180)
        .height(45)
        .onClick(() => {
          this.result = '2 + 3 = 5'
        })
        
      Text('完整语音计算器功能请在真机测试')
        .fontSize(12)
        .fontColor(Color.Gray)
        .textAlign(TextAlign.Center)
        .margin({ top: 30 })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor(Color.White)
    .padding(20)
  }
}