import { TabIndex, RouterManager } from '../common/Router';

interface TabBarColors {
  textInk: string;
  bgWhite: string;
  inactive: string;
  accentMint: string;
}

@Component
export struct MainTabBar {
  @Link currentTab: TabIndex;
  
  private readonly COLORS: TabBarColors = {
    textInk: '#4B454E',
    bgWhite: '#FFFFFF',
    inactive: '#999999',
    accentMint: '#66DDB3'
  };

  @Builder
  HomeIcon(color: string) {
    // 首页图标 - 房子
    Shape() {
      Path()
        .width(24)
        .height(24)
        .commands('M12 3L2 12h3v8h5v-6h4v6h5v-8h3L12 3z')
        .fillOpacity(1)
    }
    .width(24)
    .height(24)
    .viewPort({ x: 0, y: 0, width: 24, height: 24 })
    .fill(color)
  }

  @Builder
  GiftIcon(color: string) {
    // 心愿图标 - 礼物盒
    Shape() {
      Path()
        .width(24)
        .height(24)
        .commands('M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z')
        .fillOpacity(1)
    }
    .width(24)
    .height(24)
    .viewPort({ x: 0, y: 0, width: 24, height: 24 })
    .fill(color)
  }

  @Builder
  BookIcon(color: string) {
    // 学习中心图标 - 书本
    Shape() {
      Path()
        .width(24)
        .height(24)
        .commands('M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z')
        .fillOpacity(1)
    }
    .width(24)
    .height(24)
    .viewPort({ x: 0, y: 0, width: 24, height: 24 })
    .fill(color)
  }

  @Builder
  PersonIcon(color: string) {
    // 我的图标 - 人物
    Shape() {
      Path()
        .width(24)
        .height(24)
        .commands('M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z')
        .fillOpacity(1)
    }
    .width(24)
    .height(24)
    .viewPort({ x: 0, y: 0, width: 24, height: 24 })
    .fill(color)
  }

  build() {
    Row() {
      // 首页
      Column({ space: 4 }) {
        this.HomeIcon(this.currentTab === TabIndex.HOME ? this.COLORS.textInk : this.COLORS.inactive)
        Text('首页')
          .fontSize(11)
          .fontWeight(800)
          .fontColor(this.currentTab === TabIndex.HOME ? this.COLORS.textInk : this.COLORS.inactive)
      }
      .width(60)
      .onClick(() => { this.currentTab = TabIndex.HOME; })

      // 心愿
      Column({ space: 4 }) {
        this.GiftIcon(this.currentTab === TabIndex.SAVINGS ? this.COLORS.textInk : this.COLORS.inactive)
        Text('心愿')
          .fontSize(11)
          .fontWeight(800)
          .fontColor(this.currentTab === TabIndex.SAVINGS ? this.COLORS.textInk : this.COLORS.inactive)
      }
      .width(60)
      .onClick(() => { this.currentTab = TabIndex.SAVINGS; })

      // 学习中心
      Column({ space: 4 }) {
        this.BookIcon(this.currentTab === TabIndex.LEARN ? this.COLORS.textInk : this.COLORS.inactive)
        Text('学习中心')
          .fontSize(11)
          .fontWeight(800)
          .fontColor(this.currentTab === TabIndex.LEARN ? this.COLORS.textInk : this.COLORS.inactive)
      }
      .width(60)
      .onClick(() => { this.currentTab = TabIndex.LEARN; })

      // 我的
      Column({ space: 4 }) {
        this.PersonIcon(this.currentTab === TabIndex.MY ? this.COLORS.textInk : this.COLORS.inactive)
        Text('我的')
          .fontSize(11)
          .fontWeight(800)
          .fontColor(this.currentTab === TabIndex.MY ? this.COLORS.textInk : this.COLORS.inactive)
      }
      .width(60)
      .onClick(() => { this.currentTab = TabIndex.MY; })
    }
    .width('100%')
    .justifyContent(FlexAlign.SpaceEvenly)
    .backgroundColor(this.COLORS.bgWhite)
    .padding({ top: 12, bottom: 12 })
    .shadow({
      radius: 20,
      color: 'rgba(0, 0, 0, 0.03)',
      offsetY: -4
    })
  }
}