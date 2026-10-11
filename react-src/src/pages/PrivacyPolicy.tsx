import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] p-5 text-[#4B454E]">
      <AppPageHeader title="隐私政策" onBack={() => navigate(-1)} className="mb-4" />

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] pop-shadow p-8">
        <div className="prose prose-lg max-w-none">
          <div className="space-y-6 text-[#5B5560]">
            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">1. 引言</h3>
              <p className="mb-3">
                欢迎使用我们的语音计算器应用。安徽通拓电子商务有限公司（以下简称"我们"）专注于儿童教育科技产品的开发与运营，致力于为3-12岁儿童提供安全、有趣、有效的数学学习工具。我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
              </p>
              <p className="mb-3">
                本隐私政策适用于您使用我们的语音计算器应用及相关服务时，我们收集、使用、存储、共享和保护您的个人信息的行为。我们的应用主要面向学龄前儿童和小学生，通过语音交互和游戏化学习方式，帮助儿童建立数学基础，培养计算能力和逻辑思维。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">2. 我们收集的信息</h3>
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-[#4B454E]">2.1 您主动提供的信息</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>账户信息：当您注册账户时，我们可能收集您的用户名、邮箱地址等信息</li>
                  <li>语音数据：当您使用语音录制功能时，我们会收集您录制的语音内容</li>
                  <li>学习数据：我们会收集您的学习进度、答题记录等教育相关数据</li>
                  <li>反馈信息：当您向我们提供反馈或联系客服时，我们会收集相关信息</li>
                </ul>

                <h4 className="text-lg font-bold text-[#4B454E]">2.2 自动收集的信息</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>设备信息：设备型号、操作系统版本、设备标识符等</li>
                  <li>使用数据：应用使用频率、功能使用情况、错误日志等</li>
                  <li>网络信息：IP地址、网络类型、网络状态等</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">3. 信息使用目的</h3>
              <p className="mb-3">我们收集和使用您的个人信息主要用于以下目的：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>提供、维护和改进我们的服务</li>
                <li>分析使用情况以优化产品功能</li>
                <li>提供客户支持和响应您的请求</li>
                <li>发送服务通知和更新信息</li>
                <li>确保服务安全和防止欺诈行为</li>
                <li>遵守法律法规要求</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">4. 信息共享</h3>
              <p className="mb-3">我们不会向第三方出售、交易或转让您的个人信息，除非：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>获得您的明确同意</li>
                <li>为提供服务需要与授权合作伙伴共享必要信息</li>
                <li>法律法规要求或政府机关依法提出要求</li>
                <li>保护我们或用户的合法权益</li>
                <li>在紧急情况下保护用户或公众安全</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">5. 第三方SDK说明</h3>
              <div className="space-y-3">
                <p>Android 版本接入以下第三方SDK。相关SDK仅在您或监护人同意隐私政策后初始化，未同意前不会进行广告SDK初始化。</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>穿山甲广告SDK：</strong>用于插屏广告投放、广告统计分析和广告反作弊。应用ID：5746047；广告位ID：972630238（新插屏广告）。可能使用设备型号、系统版本、网络状态、Android ID/OAID、广告曝光/点击/关闭等必要信息。</li>
                  <li><strong>隐私控制：</strong>我们已通过SDK隐私控制关闭定位、电话状态、外部存储写入、麦克风等非必要采集能力，不向广告SDK提供儿童学习数据、语音内容或真实身份信息。</li>
                  <li><strong>友盟统计SDK：</strong>用于匿名化、聚合化的启动、活跃、版本、渠道和崩溃统计。</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">6. 信息存储与安全</h3>
              <div className="space-y-3">
                <p>我们采用行业标准的安全措施保护您的个人信息：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>数据加密传输和存储</li>
                  <li>访问控制和身份验证</li>
                  <li>定期安全评估和更新</li>
                  <li>员工保密培训</li>
                </ul>
                <p>我们会在实现服务目的所必需的期限内保留您的个人信息，除非法律要求或您同意延长保留期。</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">7. 您的权利</h3>
              <p className="mb-3">根据相关法律法规，您享有以下权利：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>访问、更正您的个人信息</li>
                <li>删除您的个人信息</li>
                <li>撤回您的同意</li>
                <li>投诉举报</li>
                <li>要求我们解释个人信息处理规则</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">8. 未成年人保护</h3>
              <p className="mb-3">
                我们高度重视对未成年人个人信息的保护。我们不会故意收集14岁以下儿童的个人信息。如果您是14岁以下的儿童，请在监护人的指导下使用我们的服务。
              </p>
              <p>
                如果我们发现自己在未事先获得可证实的父母同意的情况下收集了儿童的个人信息，则会设法尽快删除相关数据。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">9. 隐私政策的更新</h3>
              <p className="mb-3">
                我们可能会不时更新本隐私政策。当我们对本隐私政策进行重大变更时，我们会通过应用内通知、邮件或其他方式通知您。
              </p>
              <p>
                建议您定期查看本隐私政策，以了解我们如何保护您的信息。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">10. 联系我们</h3>
              <p className="mb-3">如果您对本隐私政策有任何疑问、意见或建议，请通过以下方式联系我们：</p>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#EEF2F7]">
                <p><strong>公司名称：</strong>安徽通拓电子商务有限公司</p>
                <p><strong>联系邮箱：</strong>970951698@qq.com</p>
                <p><strong>生效日期：</strong>2024年1月1日</p>
                <p><strong>最后更新：</strong>2026年7月5日</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
