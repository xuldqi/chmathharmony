/**
 * 亲戚关系计算器 (Kinship Calculator)
 * 核心逻辑参考 mumuy/relationship.js
 */

export interface RelationshipOptions {
    text?: string;                // 输入的文本
    target?: string;              // 目标对象
    sex?: 0 | 1;                  // 自己的性别：0-女, 1-男
    type?: 'default' | 'chain';   // 模式：default-关系找称呼, chain-称呼找关系
    reverse?: boolean;            // 是否反向
}

// 这里我们将使用关系路径字符串，例如 'f' 代表父亲(father), 'm' 代表母亲(mother)
// 这是 mumuy/relationship 的核心思路

export const RELATIONSHIP_DATA: Record<string, string[]> = {
    'f': ['爸爸', '父亲', '老爸', '爹'],
    'm': ['妈妈', '母亲', '老妈', '娘'],
    'h': ['老公', '丈夫', '先生', '官人'],
    'w': ['老婆', '妻子', '太太', '内人'],
    's': ['儿子', '犬子'],
    'd': ['女儿', '千金'],
    'ob': ['哥哥', '大哥', '兄'],
    'lb': ['弟弟', '下属', '弟'],
    'os': ['姐姐', '姐姐', '姐'],
    'ls': ['妹妹', '小妹', '妹'],
};

/**
 * 简化版亲戚计算逻辑 (集成 mumuy/relationship.js 的核心思想)
 * 实际项目中建议直接使用 npm install relationship-ts
 */
export class KinshipCalculator {
    public static calculate(options: RelationshipOptions): string[] {
        void options;
        // 由于直接引入整套算法比较复杂，这里实现一个轻量适配器
        // 在正式集成中，我们会使用打包好的关系库
        return ["暂不支持复杂计算，请安装扩展库"];
    }
}
