import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, BookOpen } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';

const ChildrenPrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] text-[#4B454E]">
      <div className="max-w-4xl mx-auto px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
        <AppPageHeader title="儿童隐私政策" onBack={() => navigate(-1)} className="mb-4" />

        {/* 标题区域 */}
        <div className="text-center mb-6 p-6 bg-white rounded-[32px] pop-shadow">
          
          <h2 className="text-xl font-extrabold text-[#4B454E] mb-2">儿童隐私政策</h2>
          <p className="text-[#6B7280] font-bold">专门为14周岁以下儿童用户制定的隐私保护政策</p>
          <p className="text-sm text-[#9CA3AF] font-bold mt-2">最后更新：2026年7月5日</p>
        </div>

        {/* 政策内容 */}
        <div className="bg-white rounded-[32px] pop-shadow p-8 mb-8">
          <div className="space-y-8">
            {/* 特别说明 */}
            <section>
              <h2 className="text-2xl font-black text-[#4B454E] mb-4 border-b-2 border-[#66DDB3] pb-2">
                特别说明
              </h2>
              <div className="bg-[#EBFBF7] p-4 rounded-2xl">
                <p className="text-[#5B5560] leading-relaxed font-medium">
                  我们非常重视儿童的隐私保护。本政策专门针对14周岁以下的儿童用户制定，
                  详细说明我们如何收集、使用、存储和保护儿童的个人信息。
                </p>
              </div>
            </section>

            {/* 信息收集 */}
            <section>
              <h2 className="text-2xl font-black text-[#4B454E] mb-4 border-b-2 border-[#66DDB3] pb-2">
                信息收集
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#ECFDF5] p-4 rounded-2xl border border-emerald-100">
                  <h3 className="text-lg font-black text-emerald-700 mb-3">我们收集的信息：</h3>
                  <ul className="space-y-2 text-[#5B5560]">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>学习进度数据（仅用于个性化学习）</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>设备信息（确保应用正常运行）</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>使用统计（改善产品体验）</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#FEF2F2] p-4 rounded-2xl border border-rose-100">
                  <h3 className="text-lg font-black text-rose-700 mb-3">我们不会收集：</h3>
                  <ul className="space-y-2 text-[#5B5560]">
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>儿童的真实姓名</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>联系方式</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>地理位置信息</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>照片或视频</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 使用目的 */}
            <section>
              <h2 className="text-2xl font-black text-[#4B454E] mb-4 border-b-2 border-[#C9B8FA] pb-2">
                信息使用目的
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#F5F3FF] p-4 rounded-2xl border border-purple-100">
                  <div className="flex items-center mb-2">
                    <BookOpen className="text-purple-500 mr-2" size={20} />
                    <span className="font-black">个性化学习</span>
                  </div>
                  <p className="text-[#5B5560] text-sm">根据学习进度提供适合的数学题目</p>
                </div>
                <div className="bg-[#F5F3FF] p-4 rounded-2xl border border-purple-100">
                  <div className="flex items-center mb-2">
                    <Shield className="text-purple-500 mr-2" size={20} />
                    <span className="font-black">应用安全</span>
                  </div>
                  <p className="text-[#5B5560] text-sm">确保应用安全稳定运行</p>
                </div>
              </div>
            </section>

            {/* 保护措施 */}
            <section>
              <h2 className="text-2xl font-black text-[#4B454E] mb-4 border-b-2 border-[#FFEF85] pb-2">
                信息保护措施
              </h2>
              <div className="bg-[#FFFBEB] p-4 rounded-2xl border border-amber-100">
                <ul className="space-y-3 text-[#5B5560]">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>所有数据采用加密存储</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>严格限制员工访问权限</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>定期进行安全审计</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="font-semibold">数据仅在本地设备存储，不上传到服务器</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 家长权利 */}
            <section>
              <h2 className="text-2xl font-black text-[#4B454E] mb-4 border-b-2 border-[#F9A8D4] pb-2">
                家长权利
              </h2>
              <div className="bg-[#FDF2F8] p-4 rounded-2xl border border-pink-100">
                <p className="text-[#5B5560] mb-4">家长或监护人享有以下权利：</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-pink-400 shrink-0 inline-block" />
                      <span className="text-[#5B5560]">查看儿童的个人信息</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-pink-400 shrink-0 inline-block" />
                      <span className="text-[#5B5560]">要求更正或删除信息</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-pink-400 shrink-0 inline-block" />
                      <span className="text-[#5B5560]">拒绝进一步收集信息</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-pink-400 shrink-0 inline-block" />
                      <span className="text-[#5B5560]">随时撤销同意</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#4B454E] mb-4 border-b-2 border-[#66DDB3] pb-2">
                第三方SDK与广告说明
              </h2>
              <div className="bg-[#EBFBF7] p-4 rounded-2xl border border-emerald-100">
                <p className="text-[#5B5560] mb-3">
                  Android 版本接入穿山甲广告SDK用于插屏广告投放、广告统计和反作弊。应用ID为5746047，广告位ID为972630238。该SDK仅在家长或监护人同意隐私政策后初始化。
                </p>
                <ul className="list-disc pl-6 space-y-2 text-[#5B5560]">
                  <li>可能使用设备型号、系统版本、网络状态、Android ID/OAID、广告曝光/点击/关闭等投放必要信息。</li>
                  <li>我们已通过SDK隐私控制关闭定位、电话状态、外部存储写入、麦克风等非必要采集能力。</li>
                  <li>我们不会向广告SDK提供儿童学习数据、语音内容、真实姓名或联系方式。</li>
                  <li>友盟统计SDK仅用于匿名化、聚合化的启动、活跃、版本、渠道和崩溃统计。</li>
                </ul>
              </div>
            </section>

            {/* 联系我们 */}
            <section>
              <h2 className="text-2xl font-black text-[#4B454E] mb-4 border-b-2 border-[#66DDB3] pb-2">
                联系我们
              </h2>
              <div className="bg-[#EBFBF7] p-4 rounded-2xl border border-emerald-100">
                <p className="text-[#5B5560] mb-4">
                  如果您对本儿童隐私政策有任何疑问或需要行使相关权利，请通过以下方式联系我们：
                </p>
                <div className="flex items-center space-x-2 text-blue-600">
                  <Mail size={20} />
                  <a href="mailto:970951698@qq.com" className="hover:underline">
                    970951698@qq.com
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-[#66DDB3] text-white rounded-full pop-shadow-btn-primary active-press transition-all font-black"
          >
            我已阅读并同意
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildrenPrivacyPolicy;
