import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

interface WrongQuestion {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division';
  date: string;
}

interface MistakeReviewProps {
  wrongQuestions: WrongQuestion[];
}

const MistakeReview: React.FC<MistakeReviewProps> = ({ wrongQuestions }) => {
  const { playNumber } = useAudio();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 题目类型映射
  const typeMap = {
    addition: { name: '加法', emoji: '➕', color: 'from-green-400 to-green-600' },
    subtraction: { name: '减法', emoji: '➖', color: 'from-blue-400 to-blue-600' },
    multiplication: { name: '乘法', emoji: '✖️', color: 'from-purple-400 to-purple-600' },
    division: { name: '除法', emoji: '➗', color: 'from-orange-400 to-orange-600' }
  };

  // 过滤错题
  const filteredQuestions = selectedType === 'all' 
    ? wrongQuestions 
    : wrongQuestions.filter(q => q.type === selectedType);

  // 按类型统计错题
  const mistakeStats = Object.keys(typeMap).map(type => {
    const count = wrongQuestions.filter(q => q.type === type).length;
    return {
      type,
      count,
      ...typeMap[type as keyof typeof typeMap]
    };
  });

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    playNumber(Math.floor(Math.random() * 10));
  };

  const startPractice = () => {
    if (filteredQuestions.length === 0) return;
    setPracticeMode(true);
    setCurrentQuestionIndex(0);
    setUserInput('');
    setShowResult(false);
  };

  const submitAnswer = () => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const correct = userInput === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    playNumber(correct ? 2 : 3);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserInput('');
      setShowResult(false);
    } else {
      setPracticeMode(false);
      setCurrentQuestionIndex(0);
      setUserInput('');
      setShowResult(false);
    }
  };

  const exitPractice = () => {
    setPracticeMode(false);
    setCurrentQuestionIndex(0);
    setUserInput('');
    setShowResult(false);
  };

  if (practiceMode) {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* 练习模式头部 */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={exitPractice}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <XCircle className="w-4 h-4" />
            <span>退出练习</span>
          </motion.button>
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800">错题重练</h3>
            <p className="text-sm text-gray-600">
              第 {currentQuestionIndex + 1} 题 / 共 {filteredQuestions.length} 题
            </p>
          </div>
          
          <div className="w-20"></div>
        </div>

        {/* 练习题目 */}
        <motion.div 
          className="bg-white rounded-3xl p-8 shadow-xl text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </div>
          
          <div className="text-4xl mb-6">=</div>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="text-4xl font-bold text-center border-2 border-gray-300 rounded-2xl px-4 py-2 w-32 focus:border-purple-500 focus:outline-none"
              placeholder="?"
              disabled={showResult}
            />
          </div>
          
          {!showResult ? (
            <motion.button
              onClick={submitAnswer}
              disabled={!userInput}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              提交答案
            </motion.button>
          ) : (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`text-2xl font-bold ${
                isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {isCorrect ? '🎉 答对了！' : '❌ 答错了'}
              </div>
              
              {!isCorrect && (
                <div className="text-lg text-gray-600">
                  正确答案是: <span className="font-bold text-green-600">{currentQuestion.correctAnswer}</span>
                </div>
              )}
              
              <motion.button
                onClick={nextQuestion}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-bold text-lg hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentQuestionIndex < filteredQuestions.length - 1 ? '下一题' : '完成练习'}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-2">
          📝 错题回顾
        </h2>
        <p className="text-gray-600">
          重新练习错题，加深理解！
        </p>
      </motion.div>

      {/* 错题统计 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mistakeStats.map((stat, index) => (
          <motion.div
            key={stat.type}
            className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => handleTypeFilter(stat.type)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">{stat.emoji}</div>
              <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${stat.color} text-white text-sm font-bold`}>
                {stat.count}
              </div>
            </div>
            <div className="text-lg font-bold text-gray-800">{stat.name}</div>
            <div className="text-sm text-gray-600">{stat.count} 道错题</div>
          </motion.div>
        ))}
      </div>

      {/* 筛选器 */}
      <motion.div 
        className="flex flex-wrap gap-2 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.button
          onClick={() => handleTypeFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
            selectedType === 'all'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Filter className="w-4 h-4" />
          <span>全部</span>
        </motion.button>
        
        {Object.entries(typeMap).map(([type, info]) => (
          <motion.button
            key={type}
            onClick={() => handleTypeFilter(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedType === type
                ? `bg-gradient-to-r ${info.color} text-white shadow-lg`
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{info.emoji}</span>
            <span>{info.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* 错题列表 */}
      {filteredQuestions.length > 0 ? (
        <>
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-bold text-gray-800">
              {selectedType === 'all' ? '所有错题' : `${typeMap[selectedType as keyof typeof typeMap]?.name}错题`}
              <span className="text-sm text-gray-500 ml-2">({filteredQuestions.length} 道)</span>
            </h3>
            
            <motion.button
              onClick={startPractice}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>开始重练</span>
            </motion.button>
          </motion.div>
          
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredQuestions.map((question, index) => {
                const typeInfo = typeMap[question.type];
                return (
                  <motion.div
                    key={question.id}
                    className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    layout
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${typeInfo.color} text-white text-sm font-medium`}>
                        <span>{typeInfo.emoji}</span>
                        <span>{typeInfo.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(question.date).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-800">
                          {question.question}
                        </div>
                        <div className="text-xl text-gray-600">=</div>
                        <div className="flex items-center gap-2">
                          <div className="bg-red-100 text-red-600 px-3 py-1 rounded-lg font-medium">
                            {question.userAnswer}
                          </div>
                          <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-600">正确答案:</div>
                        <div className="bg-green-100 text-green-600 px-3 py-1 rounded-lg font-bold">
                          {question.correctAnswer}
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">
            {selectedType === 'all' ? '太棒了！没有错题记录' : `${typeMap[selectedType as keyof typeof typeMap]?.name}没有错题`}
          </h3>
          <p className="text-gray-500">
            继续保持，你做得很好！
          </p>
        </motion.div>
      )}


    </div>
  );
};

export default MistakeReview;
