import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

const UserAgreement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12 text-[#4B454E]">
      <AppPageHeader title="用户协议" onBack={() => navigate(-1)} className="mb-4" />

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] pop-shadow p-8">
        <div className="prose prose-lg max-w-none">
          <div className="space-y-6 text-[#5B5560]">
            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">1. 协议概述</h3>
              <p className="mb-3">
                欢迎使用语音计算器应用！本用户协议（以下简称"本协议"）是您与安徽通拓电子商务有限公司（以下简称"我们"或"公司"）之间就您使用我们的语音计算器应用及相关服务所订立的协议。我们是一家专注于儿童教育科技产品开发的公司，致力于为3-12岁儿童提供安全、有趣、有效的数学学习工具。
              </p>
              <p>
                请您仔细阅读本协议的全部内容。如果您对本协议的任何条款表示异议，您可以选择不使用我们的服务。您使用我们的服务即表示您已充分阅读、理解并接受本协议的全部条款。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">2. 服务内容</h3>
              <div className="space-y-3">
                <p>我们的服务包括但不限于：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>语音计算器功能：通过语音输入进行数学计算</li>
                  <li>数学练习功能：提供各种数学题目的练习</li>
                  <li>数学大冒险游戏：寓教于乐的数学游戏</li>
                  <li>语音录制功能：支持自定义语音方案</li>
                  <li>学习进度跟踪：记录和分析学习数据</li>
                  <li>个性化设置：根据用户偏好调整应用功能</li>
                </ul>
                <p>
                  我们保留随时修改、中断或终止服务的权利，且无需事先通知您。我们不对服务的修改、中断或终止承担任何责任。
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">3. 用户注册与账户</h3>
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-[#4B454E]">3.1 注册要求</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>您必须是具有完全民事行为能力的自然人</li>
                  <li>如果您是未成年人，请在监护人的指导下使用我们的服务</li>
                  <li>您需要提供真实、准确、完整的注册信息</li>
                  <li>您有义务及时更新注册信息，确保信息的真实性和准确性</li>
                </ul>

                <h4 className="text-lg font-bold text-[#4B454E]">3.2 账户安全</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>您有责任妥善保管您的账户信息</li>
                  <li>您不得将账户转让、出借或授权他人使用</li>
                  <li>如发现账户被盗用或存在安全风险，请立即通知我们</li>
                  <li>因您保管不善造成的损失由您自行承担</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">4. 用户行为规范</h3>
              <div className="space-y-3">
                <p>在使用我们的服务时，您承诺：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>遵守中华人民共和国相关法律法规</li>
                  <li>不得利用我们的服务从事违法违规活动</li>
                  <li>不得发布、传播违法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽或其他令人反感的信息</li>
                  <li>不得侵犯他人的知识产权、隐私权等合法权益</li>
                  <li>不得干扰、破坏或限制我们的服务正常运行</li>
                  <li>不得从事任何可能损害我们或其他用户利益的行为</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">5. 知识产权</h3>
              <div className="space-y-3">
                <p>我们的服务及其内容（包括但不限于文字、图片、音频、视频、软件、程序、版面设计等）均受知识产权法律法规保护。</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>我们拥有服务及其内容的完整知识产权</li>
                  <li>未经我们书面许可，您不得复制、传播、展示、镜像、上载、下载、修改、出租、出借、出售、散布、传输、编译、汇编、出版、商业利用或创建相关衍生作品</li>
                  <li>您在使用服务过程中产生的学习数据等，我们有权在保护您隐私的前提下用于服务改进</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">6. 隐私保护</h3>
              <p className="mb-3">
                我们重视您的隐私保护，具体隐私保护政策请参见《隐私政策》。我们承诺按照隐私政策收集、使用、存储和保护您的个人信息。
              </p>
              <p>
                您同意我们按照隐私政策收集和使用您的个人信息，用于提供和改进我们的服务。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">7. 免责声明</h3>
              <div className="space-y-3">
                <p>在法律允许的范围内，我们不对以下情况承担责任：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>因不可抗力、网络故障、系统维护等原因导致的服务中断或数据丢失</li>
                  <li>因您自身原因导致的账户损失或服务无法正常使用</li>
                  <li>第三方提供的服务或内容造成的任何损失</li>
                  <li>您使用我们的服务进行学习的效果，我们不保证特定的学习成果</li>
                  <li>因法律法规变化或政府要求导致的服务调整</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">8. 服务变更与终止</h3>
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-[#4B454E]">8.1 服务变更</h4>
                <p>我们保留随时修改、暂停或终止服务的权利，且无需事先通知您。</p>

                <h4 className="text-lg font-bold text-[#4B454E]">8.2 协议终止</h4>
                <p>在以下情况下，本协议将终止：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>您主动注销账户</li>
                  <li>您违反本协议规定，我们终止为您提供服务</li>
                  <li>我们停止提供相关服务</li>
                  <li>法律法规要求终止</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">9. 争议解决</h3>
              <p className="mb-3">
                本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。如双方就本协议内容或其执行发生任何争议，双方应尽量友好协商解决。
              </p>
              <p>
                协商不成时，任何一方均可向安徽通拓电子商务有限公司所在地的人民法院提起诉讼。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">10. 协议修改</h3>
              <p className="mb-3">
                我们有权随时修改本协议的任何条款。一旦本协议的内容发生变动，我们将会在应用内显著位置提示修改内容。
              </p>
              <p>
                如果您不同意修改后的条款，您有权停止使用我们的服务。继续使用服务即表示您接受修改后的条款。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">11. 联系我们</h3>
              <p className="mb-3">如果您对本协议有任何疑问、意见或建议，请通过以下方式联系我们：</p>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#EEF2F7]">
                <p><strong>公司名称：</strong>安徽通拓电子商务有限公司</p>
                <p><strong>联系邮箱：</strong>970951698@qq.com</p>
                <p><strong>生效日期：</strong>2024年1月1日</p>
                <p><strong>最后更新：</strong>2024年1月1日</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-[#4B454E] mb-3">12. 其他条款</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>本协议中的标题仅为方便阅读而设，不影响条款的解释</li>
                <li>本协议的任何条款无论因何种原因完全或部分无效或不具有执行力，本协议的其余条款仍应有效并且有约束力</li>
                <li>本协议构成您与我们之间关于使用我们服务的完整协议，取代您与我们之间先前就相同事项达成的任何口头或书面协议</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAgreement;
