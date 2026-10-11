// 路由配置
export enum TabIndex {
  HOME = 0,
  SAVINGS = 1,
  LEARN = 2,
  MY = 3
}

export class RouterManager {
  static currentTab: TabIndex = TabIndex.HOME;
  
  static setTab(index: TabIndex): void {
    this.currentTab = index;
  }
  
  static getTab(): TabIndex {
    return this.currentTab;
  }
}
