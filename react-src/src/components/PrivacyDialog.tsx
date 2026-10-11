import React, { useState } from 'react';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { X } from 'lucide-react';

interface PolicyPageProps {
  type: 'privacy' | 'children-privacy' | 'agreement';
  onClose: () => void;
}

const PolicyPage: React.FC<PolicyPageProps & { onClose: () => void }> = ({ type, onClose }) => {
  const title = type === 'privacy' ? '隐私政策' : type === 'children-privacy' ? '儿童隐私政策' : '用户协议';
  
  return (
    <div className="fixed inset-0 z-[60] bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={onClose}
          className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center pop-shadow-sm pop-shadow-sm-active transition-all text-[#4B454E]"
          aria-label="返回"
        >
          <span className="text-xl leading-none">←</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">{title}</h1>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="h-full overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto p-6">
          {type === 'privacy' ? (
            <PrivacyPolicyContent />
          ) : type === 'children-privacy' ? (
            <div className="prose prose-sm max-w-none text-gray-700">
              <h2 className="text-xl font-bold text-gray-800 mb-4">儿童隐私政策</h2>
              <p>为了更好地保护儿童隐私，我们专门制定了儿童隐私政策。我们承诺严格按照《儿童个人信息网络保护规定》等相关法律法规保护儿童隐私。</p>
              <p>核心原则：</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>不强制收集个人信息，所有功能无需注册即可使用</li>
                <li>本地计算优先，不在云端保留语音数据</li>
                <li>不将儿童学习数据、语音内容、真实身份信息用于广告定向画像或向第三方出售</li>
                <li>Android 版本的穿山甲插屏广告仅在监护人同意隐私政策后初始化，并限制非必要信息采集</li>
              </ul>
            </div>
          ) : (
            <UserAgreementContent />
          )}
        </div>
      </div>
    </div>
  );
};

const PrivacyPolicyContent: React.FC = () => (
  <div className="prose prose-sm max-w-none text-gray-700">
    <h2 className="text-xl font-bold text-gray-800 mb-4">隐私政策</h2>
    
    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">1. 引言</h3>
      <p className="mb-3">
        欢迎使用语音计算器应用。我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
      </p>
      <p>
        本隐私政策适用于您使用语音计算器应用及相关服务时，我们收集、使用、存储、共享和保护您的个人信息的行为。
      </p>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">2. 我们收集的信息</h3>
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">2.1 您主动提供的信息</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>语音数据：当您使用语音计算功能时收集的语音内容，仅用于本地语音识别</li>
          <li>学习数据：学习进度、答题记录等教育相关数据，存储在本地设备</li>
          <li>使用偏好：应用设置和个性化配置信息</li>
        </ul>

        <h4 className="font-medium text-gray-800">2.2 自动收集的信息</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>设备信息：设备型号、操作系统版本等基本技术信息</li>
          <li>应用使用情况：功能使用频率、错误日志等，用于改进产品</li>
        </ul>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">3. 信息使用方式</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>提供核心功能：语音计算、数学练习、学习进度跟踪</li>
        <li>改进用户体验：优化应用性能和稳定性</li>
        <li>技术支持：诊断和解决技术问题</li>
        <li>数据分析：了解产品使用情况，改进教学内容</li>
      </ul>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">4. 信息存储</h3>
      <p className="mb-3">
        <strong>本地存储优先：</strong>我们优先将数据存储在您的设备本地，包括学习进度、设置偏好等个人数据。
      </p>
      <p className="mb-3">
        <strong>数据安全：</strong>采用加密技术保护存储的数据安全，防止未经授权的访问。
      </p>
      <p>
        <strong>数据保留：</strong>数据保留期限符合法律法规要求，不会超出提供服务的必要期限。
      </p>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">5. 权限说明</h3>
      <div className="bg-blue-50 p-4 rounded-lg">
        <ul className="space-y-2">
          <li><strong>麦克风权限：</strong>用于语音计算功能，语音数据仅在本地处理，不会上传</li>
          <li><strong>存储权限：</strong>用于保存学习进度和设置，数据存储在本地设备</li>
        </ul>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">6. 第三方SDK说明</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Android 版本接入穿山甲广告SDK，用于插屏广告投放、广告统计和反作弊。应用ID：5746047；广告位ID：972630238。</li>
        <li>穿山甲广告SDK仅在您或监护人同意隐私政策后初始化，可能使用设备型号、系统版本、网络状态、Android ID/OAID、广告曝光/点击/关闭等必要信息。</li>
        <li>我们通过SDK隐私控制关闭定位、电话状态、外部存储写入、麦克风等非必要采集能力，不向广告SDK提供儿童学习数据、语音内容或真实身份信息。</li>
        <li>应用接入友盟统计SDK，用于匿名化、聚合化的启动、活跃、版本、渠道和崩溃统计。</li>
      </ul>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">7. 儿童隐私保护</h3>
      <p className="mb-3">
        我们特别重视儿童用户的隐私保护：
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>不收集13岁以下儿童的个人身份信息</li>
        <li>不要求儿童注册账户即可使用核心功能</li>
        <li>不向第三方分享儿童用户数据</li>
        <li>提供家长管理和控制选项</li>
      </ul>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">8. 联系我们</h3>
      <p>
        如您对本隐私政策有任何疑问、意见或建议，请通过以下方式联系我们：<br/>
        邮箱：novcat@colletools.com<br/>
        我们将在收到您的反馈后及时回复并处理。
      </p>
    </section>
  </div>
);

const UserAgreementContent: React.FC = () => (
  <div className="prose prose-sm max-w-none text-gray-700">
    <h2 className="text-xl font-bold text-gray-800 mb-4">用户协议</h2>
    
    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">1. 协议接受</h3>
      <p>
        欢迎使用语音计算器！本协议是您与我们之间关于您使用本应用的法律协议。使用本应用即表示您同意遵守本协议的所有条款。
      </p>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">2. 服务描述</h3>
      <p className="mb-3">
        语音计算器是一款专为3-12岁儿童设计的数学学习应用，提供：
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>语音识别计算功能</li>
        <li>互动数学练习</li>
        <li>游戏化学习体验</li>
        <li>个性化学习进度跟踪</li>
      </ul>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">3. 使用规则</h3>
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">您同意：</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>仅将本应用用于学习和教育目的</li>
          <li>不尝试破解、逆向工程或损害应用</li>
          <li>不上传违法、有害或不当内容</li>
          <li>尊重知识产权和版权</li>
        </ul>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">4. 家长责任</h3>
      <p className="mb-3">
        对于13岁以下的儿童用户：
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>家长或监护人应监督儿童使用本应用</li>
        <li>家长有权管理和删除儿童的使用数据</li>
        <li>家长应确保儿童安全合理使用电子设备</li>
      </ul>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">5. 免责声明</h3>
      <p className="mb-3">
        本应用按"现状"提供服务。我们不保证：
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>服务不会中断或完全无错误</li>
        <li>应用能满足所有用户的特定需求</li>
        <li>第三方服务的可用性和准确性</li>
      </ul>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">6. 知识产权</h3>
      <p>
        本应用的所有内容，包括但不限于文字、图片、音频、视频、软件代码等，均受知识产权法保护。未经授权不得复制、分发或商业使用。
      </p>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">7. 协议变更</h3>
      <p>
        我们可能会不定期更新本协议。重大变更会通过应用内通知或其他适当方式告知用户。继续使用应用即表示接受更新后的协议。
      </p>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">8. 联系方式</h3>
      <p>
        如有疑问或建议，请联系我们：<br/>
        邮箱：support@chmath.com<br/>
        我们将及时回复并处理您的问题。
      </p>
    </section>
  </div>
);

import { AdControl } from '@/native/adControl';
import { Capacitor } from '@capacitor/core';

type LegacyAdControlPlugin = {
  setConsent?: (options: { consent: boolean }) => Promise<unknown> | unknown;
};

type CapacitorWithLegacyPlugins = typeof Capacitor & {
  Plugins?: {
    AdControl?: LegacyAdControlPlugin;
  };
};

const PrivacyDialog: React.FC = () => {
  const { showPrivacyDialog, acceptPrivacy, rejectPrivacy } = usePrivacy();
  const [showPolicyPage, setShowPolicyPage] = useState<'privacy' | 'children-privacy' | 'agreement' | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  if (!showPrivacyDialog) {
    return null;
  }

  const handleAccept = async () => {
    try {
      // 1) 前端状态与权限管理器
      await acceptPrivacy();
      // 2) 可靠地同步到原生（双通道：registerPlugin 与 Capacitor.Plugins 兜底）
      try {
        await AdControl.setConsent({ consent: true });
      } catch {
        // 忽略，走兜底
      }
      try {
        const legacy = (Capacitor as CapacitorWithLegacyPlugins)?.Plugins?.AdControl;
        if (legacy && typeof legacy.setConsent === 'function') {
          await legacy.setConsent({ consent: true });
        }
      } catch {
        // ignore
      }
    } catch (error) {
      console.error('处理隐私同意时发生错误:', error);
    }
  };

  const handleReject = () => {
    setShowRejectConfirm(true);
  };

  // 如果正在显示政策页面，渲染政策页面
  if (showPolicyPage) {
    return (
      <PolicyPage 
        type={showPolicyPage} 
        onClose={() => setShowPolicyPage(null)} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm mx-4 flex flex-col max-h-[85vh] w-full overflow-hidden">
        {/* 固定头部 */}
        <div className="text-center p-6 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">温馨提示</h2>
        </div>

        {/* 可滚动内容 */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-600 leading-6 space-y-4">
          <p className="font-medium text-gray-800">
            欢迎使用语音计算器APP！
          </p>
          
          <p>
            我们非常重视您的个人信息和隐私保护，我们将通过《隐私权保护政策》帮助您了解我们收集、使用、存储、共享和保护个人信息的情况，以及您所享有的相关权利。
          </p>
          
          <p>
            1、为了更好的您提供注册认证、发布信息、交流互动、搜索查询、结合交易等其他服务功能，我们会收集、使用必要的信息；
          </p>
          
          <p>
            2、基于您的授权我们可能会获取您的位置等信息，您有权拒绝或取消授权；
          </p>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-700 font-medium text-sm mb-2">本应用特点：</p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>• 无需注册即可使用所有功能</p>
              <p>• 仅在必要时申请设备权限</p>
              <p>• 本地存储学习数据，保护隐私</p>
            </div>
          </div>

          {/* 协议链接 */}
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2 text-xs pt-2">
            <button 
              onClick={() => setShowPolicyPage('privacy')}
              className="text-blue-500 underline hover:text-blue-600 font-semibold whitespace-nowrap"
            >
              《隐私政策》
            </button>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <button 
              onClick={() => setShowPolicyPage('children-privacy')}
              className="text-blue-500 underline hover:text-blue-600 font-semibold whitespace-nowrap"
            >
              《儿童隐私政策》
            </button>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <button 
              onClick={() => setShowPolicyPage('agreement')}
              className="text-blue-500 underline hover:text-blue-600 font-semibold whitespace-nowrap"
            >
              《用户协议》
            </button>
          </div>
        </div>

        {/* 固定底部按钮 */}
        <div className="p-6 pt-3 border-t border-gray-100 bg-gray-50/50 space-y-3 rounded-b-2xl">
          <button
            onClick={handleAccept}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full transition-all active:scale-95 shadow-md shadow-blue-500/20"
          >
            同意并进入
          </button>
          
          <button
            onClick={handleReject}
            className="w-full bg-transparent text-gray-500 hover:text-gray-700 font-semibold py-2 transition-colors text-center text-sm"
          >
            退出
          </button>
        </div>
      </div>

      {showRejectConfirm && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/45">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm mx-4 p-6">
            <h3 className="text-lg font-black text-[#4B454E] mb-2">确认退出</h3>
            <p className="text-sm text-gray-500 font-semibold mb-5">
              拒绝隐私协议后将无法继续使用应用，确定退出吗？
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowRejectConfirm(false)}
                className="h-11 rounded-xl bg-white text-[#4B454E] border border-gray-200 font-black hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={rejectPrivacy}
                className="h-11 rounded-xl bg-[#FF8585] text-white font-black hover:bg-[#ef7676] transition-colors"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyDialog;
