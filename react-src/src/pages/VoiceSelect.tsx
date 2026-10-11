import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Play, RotateCcw, Save, ChevronRight, Star, Plus, X } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import AppPageHeader from '@/components/AppPageHeader';
import { audioPlayer } from '@/lib/audioPlayer';

interface AudioItem {
  id: string;
  label: string;
  key: string;
  audioDataUrl?: string;
  isRecorded?: boolean;
}

interface VoiceScheme {
  id: string;
  name: string;
  isDefault: boolean;
  audioItems: AudioItem[];
  description?: string;
  color?: string;
}

type ToastType = 'success' | 'error' | 'info';

const STORAGE_KEYS = {
  recordings: 'voiceRecordings',
  defaultScheme: 'defaultVoiceScheme',
  customSchemes: 'customVoiceSchemes',
} as const;

const AUDIO_ITEMS: AudioItem[] = [
  { id: '0', label: '数字 0', key: '0' },
  { id: '1', label: '数字 1', key: '1' },
  { id: '2', label: '数字 2', key: '2' },
  { id: '3', label: '数字 3', key: '3' },
  { id: '4', label: '数字 4', key: '4' },
  { id: '5', label: '数字 5', key: '5' },
  { id: '6', label: '数字 6', key: '6' },
  { id: '7', label: '数字 7', key: '7' },
  { id: '8', label: '数字 8', key: '8' },
  { id: '9', label: '数字 9', key: '9' },
  { id: 'plus', label: '加号 +', key: '+' },
  { id: 'minus', label: '减号 -', key: '-' },
  { id: 'multiply', label: '乘号 ×', key: '×' },
  { id: 'divide', label: '除号 ÷', key: '÷' },
  { id: 'equals', label: '等号 =', key: '=' },
  { id: 'decimal', label: '小数点 .', key: '.' },
  { id: 'ge', label: '个', key: '个' },
  { id: 'shi', label: '十', key: '十' },
  { id: 'bai', label: '百', key: '百' },
  { id: 'qian', label: '千', key: '千' },
  { id: 'wan', label: '万', key: '万' },
  { id: 'clear', label: '清空', key: 'clear' },
  { id: 'delete', label: '删除', key: 'delete' },
];

const ITEM_TO_AUDIO_NAME_MAP: Record<string, string> = {
  '0': 'num0',
  '1': 'num1',
  '2': 'num2',
  '3': 'num3',
  '4': 'num4',
  '5': 'num5',
  '6': 'num6',
  '7': 'num7',
  '8': 'num8',
  '9': 'num9',
  plus: 'jia',
  minus: 'jian',
  multiply: 'chengyi',
  divide: 'chuyi',
  equals: 'dengyu',
  decimal: 'dian',
  ge: 'ge',
  shi: 'shi',
  bai: 'bai',
  qian: 'qian',
  wan: 'wan',
  clear: 'clear',
  delete: 'del',
};

const toAudioName = (itemId: string): string | null => ITEM_TO_AUDIO_NAME_MAP[itemId] ?? null;

const VoiceSelect: React.FC = () => {
  const navigate = useNavigate();
  const { playNumber, playDelete, playAudio, refreshVoiceProfiles } = useAudio();
  const [currentView, setCurrentView] = useState<'list' | 'recording'>('list');
  const [selectedScheme, setSelectedScheme] = useState<VoiceScheme | null>(null);
  const [defaultSchemeId, setDefaultSchemeId] = useState<string>('system');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingItem, setRecordingItem] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [recordedAudios, setRecordedAudios] = useState<Record<string, string>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [customSchemes, setCustomSchemes] = useState<VoiceScheme[]>([]);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [pendingDeleteSchemeId, setPendingDeleteSchemeId] = useState<string | null>(null);
  const [pendingSwitchSchemeId, setPendingSwitchSchemeId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordedAudiosRef = useRef<Record<string, string>>({});
  const customSchemesRef = useRef<VoiceScheme[]>([]);
  const recordStartAtRef = useRef<number>(0);
  const storageWarningShownRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const RECORD_WARMUP_MS = 180;
  const RECORD_TRIM_HEAD_MS = 220;
  const RECORD_TIMESLICE_MS = 120;
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ type, message });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2200);
  }, []);

  const notifyStorageIssueOnce = useCallback((context: string) => {
    if (!storageWarningShownRef.current) {
      storageWarningShownRef.current = true;
      showToast('录音保存空间不足，建议删除部分录音或语音方案后再试。', 'error');
    }
    console.error(`[VoiceSelect] 本地存储失败(${context})`);
  }, [showToast]);

  const safeGetStorage = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`[VoiceSelect] 读取存储失败: ${key}`, error);
      return null;
    }
  };

  const safeSetStorage = useCallback((key: string, value: string, context: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`[VoiceSelect] 写入存储失败: ${key}`, error);
      notifyStorageIssueOnce(context);
      return false;
    }
  }, [notifyStorageIssueOnce]);

  const getPreferredRecorderMimeType = (): string | undefined => {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
      return undefined;
    }
    const candidates = [
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type));
  };

  useEffect(() => {
    recordedAudiosRef.current = recordedAudios;
  }, [recordedAudios]);

  useEffect(() => {
    customSchemesRef.current = customSchemes;
  }, [customSchemes]);

  // 计算录音完成度
  const getRecordingProgress = (schemeId: string) => {
    if (schemeId === 'system') return { completed: AUDIO_ITEMS.length, total: AUDIO_ITEMS.length }; // 系统默认已完成

    const prefix = `${schemeId}_`;
    const completed = Object.keys(recordedAudios).filter(key => key.startsWith(prefix)).length;
    return { completed, total: AUDIO_ITEMS.length };
  };

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });

  const syncVoiceProfiles = useCallback((
    nextRecordedAudios: Record<string, string>,
    nextCustomSchemes: VoiceScheme[],
    preferredSchemeId?: string,
  ) => {
    const profiles: Array<{ id: string; name: string; type: 'default' | 'custom'; recordings?: Record<string, string> }> = [
      { id: 'default', name: '系统默认', type: 'default' },
    ];

    const nonSystemSchemes: Array<{ id: string; name: string }> = [
      { id: 'dad', name: '爸爸的声音' },
      { id: 'mom', name: '妈妈的声音' },
      ...nextCustomSchemes.map((scheme) => ({ id: scheme.id, name: scheme.name })),
    ];

    nonSystemSchemes.forEach((scheme) => {
      const recordings: Record<string, string> = {};
      AUDIO_ITEMS.forEach((item) => {
        const audioName = toAudioName(item.id);
        if (!audioName) return;
        const key = `${scheme.id}_${item.id}`;
        const dataUrl = nextRecordedAudios[key];
        if (dataUrl) recordings[audioName] = dataUrl;
      });

      profiles.push({
        id: scheme.id,
        name: scheme.name,
        type: 'custom',
        recordings,
      });
    });

    audioPlayer.setVoiceProfiles(profiles);

    const appliedSchemeId = preferredSchemeId ?? safeGetStorage(STORAGE_KEYS.defaultScheme) ?? 'system';
    const profileId = appliedSchemeId === 'system' ? 'default' : appliedSchemeId;
    audioPlayer.setCurrentVoiceProfile(profileId);
    refreshVoiceProfiles();
  }, [refreshVoiceProfiles]);

  // 创建新方案
  const createNewScheme = () => {
    if (!newSchemeName.trim()) {
      showToast('请输入方案名称', 'info');
      return;
    }
    
    // 检查名称是否重复
    const allSchemes = [...presetSchemes, ...customSchemes];
    if (allSchemes.some(scheme => scheme.name === newSchemeName.trim())) {
      showToast('方案名称已存在，请使用其他名称', 'error');
      return;
    }
    
    const newSchemeId = `custom_${Date.now()}`;
    const newScheme: VoiceScheme = {
      id: newSchemeId,
      name: newSchemeName.trim(),
      description: '自定义录制的语音方案',
      color: 'bg-indigo-500',
      isDefault: false,
      audioItems: AUDIO_ITEMS.map(item => ({
        ...item,
        isRecorded: false
      }))
    };
    
    setCustomSchemes(prev => [...prev, newScheme]);
    setShowCreateDialog(false);
    setNewSchemeName('');
    
    // 自动进入录音界面
    enterRecordingView(newScheme);
  };

  // 预设语音方案列表（只保留系统默认、爸爸、妈妈的声音）
  const presetSchemes: VoiceScheme[] = [
    {
      id: 'system',
      name: '系统默认',
      description: '标准普通话发音，适合大多数儿童',
      color: 'bg-blue-500',
      isDefault: defaultSchemeId === 'system',
      audioItems: AUDIO_ITEMS
    },
    {
      id: 'dad',
      name: '爸爸的声音',
      description: '让爸爸为你录制专属声音',
      color: 'bg-green-500',
      isDefault: defaultSchemeId === 'dad',
      audioItems: AUDIO_ITEMS.map(item => ({
        ...item,
        audioDataUrl: recordedAudios[`dad_${item.id}`],
        isRecorded: !!recordedAudios[`dad_${item.id}`]
      }))
    },
    {
      id: 'mom',
      name: '妈妈的声音',
      description: '让妈妈为你录制温柔声音',
      color: 'bg-pink-500',
      isDefault: defaultSchemeId === 'mom',
      audioItems: AUDIO_ITEMS.map(item => ({
        ...item,
        audioDataUrl: recordedAudios[`mom_${item.id}`],
        isRecorded: !!recordedAudios[`mom_${item.id}`]
      }))
    }
  ];

  // 删除自定义方案
  const deleteCustomScheme = useCallback((schemeId: string) => {
    const updatedCustomSchemes = customSchemes.filter(scheme => scheme.id !== schemeId);
    setCustomSchemes(updatedCustomSchemes);

    const updatedRecordings = { ...recordedAudios };
    Object.keys(updatedRecordings).forEach((key) => {
      if (key.startsWith(`${schemeId}_`)) {
        delete updatedRecordings[key];
      }
    });
    setRecordedAudios(updatedRecordings);
    safeSetStorage(
      STORAGE_KEYS.recordings,
      JSON.stringify(updatedRecordings),
      '删除方案后更新录音',
    );

    const nextDefaultSchemeId = defaultSchemeId === schemeId ? 'system' : defaultSchemeId;
    if (nextDefaultSchemeId !== defaultSchemeId) {
      setDefaultSchemeId('system');
      safeSetStorage(STORAGE_KEYS.defaultScheme, 'system', '删除方案后重置默认方案');
    }

    syncVoiceProfiles(updatedRecordings, updatedCustomSchemes, nextDefaultSchemeId);
    showToast('语音方案已删除', 'success');
  }, [customSchemes, recordedAudios, defaultSchemeId, safeSetStorage, syncVoiceProfiles, showToast]);

  // 合并所有语音方案
  const voiceSchemes = [...presetSchemes, ...customSchemes];

  // 开始录音
  const startRecording = async (itemId: string, schemeId?: string) => {
    const audioKey = schemeId ? `${schemeId}_${itemId}` : itemId;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        }
      });
      let mediaRecorder: MediaRecorder;
      const preferredMimeType = getPreferredRecorderMimeType();
      try {
        mediaRecorder = preferredMimeType
          ? new MediaRecorder(stream, { mimeType: preferredMimeType })
          : new MediaRecorder(stream);
      } catch (error) {
        console.warn('[VoiceSelect] 指定 mimeType 初始化录音失败，回退默认格式', error);
        mediaRecorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordStartAtRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const elapsed = recordStartAtRef.current ? (Date.now() - recordStartAtRef.current) : 0;
          // 裁掉起录阶段的“噗”声/底噪突变，提升试听与使用体验
          if (elapsed >= RECORD_TRIM_HEAD_MS) {
            audioChunksRef.current.push(event.data);
          }
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const firstValidChunk = audioChunksRef.current.find((chunk) => chunk.size > 0);
          const mimeType = mediaRecorder.mimeType || firstValidChunk?.type || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          if (audioBlob.size <= 0) {
            throw new Error('录音内容为空');
          }
          const audioDataUrl = await blobToDataUrl(audioBlob);
          const updatedRecordings = { ...recordedAudios, [audioKey]: audioDataUrl };
          setRecordedAudios(updatedRecordings);
          safeSetStorage(
            STORAGE_KEYS.recordings,
            JSON.stringify(updatedRecordings),
            '录音完成后保存',
          );

          let updatedCustomSchemes = customSchemes;
          if (schemeId && schemeId.startsWith('custom_')) {
            updatedCustomSchemes = customSchemes.map(scheme => {
              if (scheme.id === schemeId) {
                return {
                  ...scheme,
                  audioItems: scheme.audioItems.map(item =>
                    item.id === itemId ? { ...item, isRecorded: true, audioDataUrl } : item
                  )
                };
              }
              return scheme;
            });
            setCustomSchemes(updatedCustomSchemes);

            setSelectedScheme(prev => {
              if (!prev || prev.id !== schemeId) return prev;
              return {
                ...prev,
                audioItems: prev.audioItems.map(item =>
                  item.id === itemId ? { ...item, isRecorded: true, audioDataUrl } : item
                )
              };
            });
          }

          syncVoiceProfiles(updatedRecordings, updatedCustomSchemes);
        } catch (error) {
          console.error('保存录音失败:', error);
          showToast('录音保存失败，请重试', 'error');
        } finally {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      setIsRecording(true);
      setRecordingItem(itemId);
      setCountdown(3);
      // 先给麦克风一个极短预热窗口，避免按键瞬间噪声被录入
      await new Promise((resolve) => setTimeout(resolve, RECORD_WARMUP_MS));
      recordStartAtRef.current = Date.now();
      mediaRecorder.start(RECORD_TIMESLICE_MS);

      // 开始倒计时
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 3秒后自动停止
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 3000);
    } catch (error) {
      console.error('录音失败:', error);
      showToast('无法访问麦克风，请检查权限设置', 'error');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsRecording(false);
    setRecordingItem(null);
    setCountdown(0);
  };

  // 播放录音或系统默认音频（系统默认使用应用内置音频，不使用系统TTS）
  const playRecording = (itemId: string, schemeId?: string) => {
    if (schemeId === 'system') {
      if (/^\d$/.test(itemId)) {
        playNumber(parseInt(itemId, 10));
        return;
      }
      switch (itemId) {
        case 'clear':
          playAudio('clear');
          return;
        case 'delete':
          playDelete();
          return;
        default:
          break;
      }

      const audioName = toAudioName(itemId);
      if (audioName) {
        playAudio(audioName);
      }
      return;
    }

    const audioKey = schemeId ? `${schemeId}_${itemId}` : itemId;
    const audioDataUrl = recordedAudios[audioKey];
    if (audioDataUrl) {
      const audio = new Audio(audioDataUrl);
      audio.preload = 'auto';
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        void playPromise.catch((error) => {
          console.error('[VoiceSelect] 录音播放失败:', error);
          showToast('录音播放失败，请重录后再试', 'error');
        });
      }
    }
  };

  // 设置默认方案
  const setAsDefault = (schemeId: string) => {
    if (schemeId !== 'system') {
      const schemePrefix = `${schemeId}_`;
      const schemeRecordings = Object.keys(recordedAudios).filter(key => key.startsWith(schemePrefix));
      
      if (schemeRecordings.length < AUDIO_ITEMS.length) {
        setPendingSwitchSchemeId(schemeId);
        return;
      }
    }
    confirmSetAsDefault(schemeId);
  };

  const confirmSetAsDefault = (schemeId: string) => {
    setDefaultSchemeId(schemeId);
    safeSetStorage(STORAGE_KEYS.defaultScheme, schemeId, '设置默认方案');
    const profileId = schemeId === 'system' ? 'default' : schemeId;
    audioPlayer.setCurrentVoiceProfile(profileId);
    refreshVoiceProfiles();
    setPendingSwitchSchemeId(null);
  };

  // 进入录音界面
  const enterRecordingView = (scheme: VoiceScheme) => {
    setSelectedScheme(scheme);
    setCurrentView('recording');
  };

  // 返回方案列表
  const backToList = () => {
    setCurrentView('list');
    setSelectedScheme(null);
  };

  // 处理安卓物理返回键：录制页优先返回语音方案列表，而不是离开当前页面
  useEffect(() => {
    const handleVoiceSelectBack = (event: Event) => {
      if (currentView === 'recording') {
        const customEvent = event as CustomEvent<{ handled?: boolean }>;
        if (customEvent.detail) customEvent.detail.handled = true;
        backToList();
      }
    };
    window.addEventListener('chmath:voice-select-back', handleVoiceSelectBack as EventListener);
    return () => {
      window.removeEventListener('chmath:voice-select-back', handleVoiceSelectBack as EventListener);
    };
  }, [currentView]);

  // 保存自定义语音方案
  // 直接保存当前方案
  const saveCurrentScheme = () => {
    if (!selectedScheme || selectedScheme.id === 'system') {
      showToast('系统默认方案无需保存', 'info');
      return;
    }
    
    // 检查是否有录音内容
    const schemePrefix = `${selectedScheme.id}_`;
    const schemeRecordings = Object.keys(recordedAudios).filter(key => key.startsWith(schemePrefix));
    
    if (schemeRecordings.length === 0) {
      showToast('请先录制一些音频内容', 'info');
      return;
    }
    
    // 这里可以保存到本地存储或发送到服务器
    const customScheme = {
      id: selectedScheme.id,
      name: selectedScheme.name, // 直接使用方案名称，不再需要用户输入
      isDefault: false,
      audioItems: AUDIO_ITEMS.map(item => {
        const audioKey = `${selectedScheme.id}_${item.id}`;
        return {
          ...item,
          audioDataUrl: recordedAudios[audioKey],
          isRecorded: !!recordedAudios[audioKey]
        };
      }),
      description: '自定义语音方案',
      color: 'bg-gradient-to-br from-purple-400 to-pink-400'
    };
    
    // 更新本地方案列表
    const existingIndex = customSchemes.findIndex(scheme => scheme.id === selectedScheme.id);
    let updatedSchemes;
    if (existingIndex >= 0) {
      updatedSchemes = [...customSchemes];
      updatedSchemes[existingIndex] = customScheme;
    } else {
      updatedSchemes = [...customSchemes, customScheme];
    }
    
    setCustomSchemes(updatedSchemes);
    safeSetStorage(
      STORAGE_KEYS.customSchemes,
      JSON.stringify(updatedSchemes),
      '保存当前方案',
    );
    syncVoiceProfiles(recordedAudios, updatedSchemes);
    
    showToast('语音方案保存成功！', 'success');
  };

  // 清理资源
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // 从本地存储加载默认方案和自定义方案
  useEffect(() => {
    const savedDefault = safeGetStorage(STORAGE_KEYS.defaultScheme);
    const defaultId = savedDefault || 'system';
    setDefaultSchemeId(defaultId);

    const savedCustomSchemes = safeGetStorage(STORAGE_KEYS.customSchemes);
    let parsedSchemes: VoiceScheme[] = [];
    if (savedCustomSchemes) {
      try {
        parsedSchemes = JSON.parse(savedCustomSchemes);
        setCustomSchemes(parsedSchemes);
      } catch (error) {
        console.error('加载自定义方案失败:', error);
      }
    }

    const savedRecordings = safeGetStorage(STORAGE_KEYS.recordings);
    let parsedRecordings: Record<string, string> = {};
    if (savedRecordings) {
      try {
        parsedRecordings = JSON.parse(savedRecordings);
        setRecordedAudios(parsedRecordings);
      } catch (error) {
        console.error('加载录音数据失败:', error);
      }
    }

    syncVoiceProfiles(parsedRecordings, parsedSchemes, defaultId);
  }, [syncVoiceProfiles]);
  
  // 保存自定义方案到本地存储
  useEffect(() => {
    safeSetStorage(
      STORAGE_KEYS.customSchemes,
      JSON.stringify(customSchemes),
      '自定义方案自动保存',
    );
  }, [customSchemes, safeSetStorage]);

  // 保存录音到本地存储
  useEffect(() => {
    safeSetStorage(
      STORAGE_KEYS.recordings,
      JSON.stringify(recordedAudios),
      '录音自动保存',
    );
  }, [recordedAudios, safeSetStorage]);

  // 方案列表视图
  const renderSchemeList = () => (
    <div className="space-y-5 pb-4">
      <h2 className="text-2xl font-black text-[#4B454E] mb-1">录制语音方案</h2>
      {voiceSchemes.map(scheme => {
        const progress = getRecordingProgress(scheme.id);
        const isSystemDefault = scheme.id === 'system';
        const isComplete = progress.completed === progress.total;
        const isDefault = scheme.id === defaultSchemeId;
        
        return (
          <div key={scheme.id} className={`relative bg-white rounded-[28px] pop-shadow p-6 ${
            !isSystemDefault && !isComplete ? 'border-2 border-dashed border-gray-300' : ''
          }`}>
            {/* 设为默认：右上角 */}
            <button
              type="button"
              onClick={() => setAsDefault(scheme.id)}
              className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-black transition-colors whitespace-nowrap ${
                isDefault 
                  ? 'bg-[#FFF3C4] text-amber-700'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#FFF3C4] hover:text-amber-700'
              }`}
              title={isDefault ? '当前默认' : '设为默认'}
            >
              {isDefault ? '当前默认' : '设为默认'}
            </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 去掉左侧头像图标，仅展示文字信息 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#4B454E]">{scheme.name}</h3>
                    {isSystemDefault && (
                      <span className="px-2 py-1 bg-[#EBFBF7] text-[#0F766E] text-xs rounded-full font-black">可试听</span>
                    )}
                  </div>
                  <p className="text-sm text-[#8A8490] font-bold">{scheme.description}</p>
                  
                  {/* 录音完成度显示 */}
                  {!isSystemDefault && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-[#E5E7EB] rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isComplete ? 'bg-[#34D399]' : 'bg-[#C9B8FA]'
                          }`}
                          style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-black ${
                        isComplete ? 'text-[#059669]' : 'text-[#7C3AED]'
                      }`}>
                        {progress.completed}/{progress.total} 已录制
                      </span>
                    </div>
                  )}
                  
                  {isDefault && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-xs text-yellow-600 font-black">默认方案</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* 系统默认的试听按钮已隐藏 */}
                
                {/* 删除按钮（仅自定义方案） */}
                {scheme.id.startsWith('custom_') && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteSchemeId(scheme.id);
                    }}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="删除方案"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                
                {/* 进入录制 */}
                <button
                  type="button"
                  onClick={() => enterRecordingView(scheme)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors bg-[#66DDB3] text-white font-black pop-shadow-sm pop-shadow-sm-active"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* 创建新方案按钮 */}
      <div className="bg-white rounded-[28px] pop-shadow p-6 border-2 border-dashed border-gray-300 hover:border-[#66DDB3] transition-colors">
        <button
          type="button"
          onClick={() => setShowCreateDialog(true)}
          className="w-full flex items-center justify-center gap-3 py-4 text-[#6B7280] hover:text-[#4B454E] transition-colors"
        >
          <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center hover:bg-[#EBFBF7] transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-black">创建新方案</h3>
            <p className="text-sm text-[#8A8490] font-bold">录制属于你的专属语音</p>
          </div>
        </button>
      </div>
    </div>
  );

  const pendingDeleteScheme = pendingDeleteSchemeId
    ? voiceSchemes.find((scheme) => scheme.id === pendingDeleteSchemeId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] p-5 text-[#4B454E]">
      <AppPageHeader
        title={currentView === 'list' ? '语音方案' : `录制-${selectedScheme?.name ?? ''}`}
        onBack={currentView === 'list' ? () => navigate(-1) : backToList}
        className="mb-6"
      />

      {/* 主要内容区域 */}
      {currentView === 'list' ? renderSchemeList() : null}

      {/* 条状录音界面 */}
      {currentView === 'recording' && selectedScheme && (
        <div className="bg-white rounded-[32px] pop-shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-[#4B454E]">
              录制语音方案
            </h2>
            {selectedScheme.id !== 'system' && (
              <button
                type="button"
                onClick={saveCurrentScheme}
                className="px-4 py-2 bg-[#66DDB3] text-white rounded-full pop-shadow-sm pop-shadow-sm-active transition-all flex items-center gap-2 font-black"
              >
                <Save className="w-4 h-4" />
                保存方案
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {AUDIO_ITEMS.map(item => (
              <div key={item.id} className="bg-[#F8FAFC] rounded-[20px] p-4 border border-[#EEF2F7]">
                <div className="flex items-center justify-between">
                  {/* 左侧：标签信息 */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#C9B8FA] rounded-full flex items-center justify-center text-white text-xl font-black">
                      {item.key}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#4B454E]">{item.label}</h3>
                      <p className="text-sm text-[#8A8490] font-bold">按键: {item.key}</p>
                    </div>
                  </div>
                  
                  {/* 右侧：录音控制 */}
                  <div className="flex items-center gap-3">
                    {/* 录音状态显示 */}
                    {isRecording && recordingItem === item.id ? (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <button
                            type="button"
                            className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"
                            disabled
                          >
                            <Mic className="w-6 h-6" />
                          </button>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-2xl font-bold text-red-500 w-8 text-center">{countdown}</div>
                        <span className="text-sm text-[#8A8490] font-bold">录音中...</span>
                      </div>
                    ) : (() => {
                      let hasRecording = false;
                      
                      if (selectedScheme?.id === 'system') {
                        hasRecording = true; // 系统默认总是有录音
                      } else {
                        const audioKey = `${selectedScheme?.id}_${item.id}`;
                        hasRecording = !!recordedAudios[audioKey];
                      }
                      
                      return hasRecording ? (
                        // 已录制状态或系统默认
                        <div className="flex items-center gap-2">
                          {selectedScheme?.id !== 'system' && (
                            <span className="text-sm font-black text-[#059669]">
                              ✓ 已录制
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => playRecording(item.id, selectedScheme?.id)}
                            className="w-10 h-10 bg-[#C9B8FA] rounded-full flex items-center justify-center text-white hover:bg-[#B79CF7] transition-colors"
                            title={selectedScheme?.id === 'system' ? '试听' : '播放'}
                          >
                            <Play className="w-5 h-5" />
                          </button>
                          {selectedScheme?.id !== 'system' && (
                            <>
                              <button
                                type="button"
                                onClick={() => startRecording(item.id, selectedScheme?.id)}
                                className="w-10 h-10 bg-[#FFBE5C] rounded-full flex items-center justify-center text-white hover:bg-[#F8B33F] transition-colors"
                                title="重录"
                              >
                                <RotateCcw className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        // 未录制状态
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-[#8A8490] font-bold">未录制</span>
                          <button
                            type="button"
                            onClick={() => startRecording(item.id, selectedScheme?.id)}
                            disabled={isRecording}
                            className="w-12 h-12 bg-[#66DDB3] rounded-full flex items-center justify-center text-white hover:bg-[#4BC29A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="开始录音"
                          >
                            <Mic className="w-6 h-6" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 创建新方案对话框 */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
          <div className="bg-white rounded-[28px] p-6 w-96 max-w-[90vw] pop-shadow">
            <h3 className="text-lg font-black text-[#4B454E] mb-4">创建新语音方案</h3>
            <p className="text-sm text-[#8A8490] font-bold mb-4">为你的专属语音方案起个名字吧！</p>
            <input
              type="text"
              value={newSchemeName}
              onChange={(e) => setNewSchemeName(e.target.value)}
              placeholder="例如：小明的声音"
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#66DDB3]/40 focus:border-transparent mb-4 outline-none font-bold text-[#4B454E]"
              onKeyDown={(e) => e.key === 'Enter' && createNewScheme()}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewSchemeName('');
                }}
                className="flex-1 px-4 py-2 border border-[#E5E7EB] rounded-2xl hover:bg-gray-50 transition-colors font-black text-[#6B7280]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={createNewScheme}
                className="flex-1 px-4 py-2 bg-[#66DDB3] text-white rounded-2xl hover:bg-[#4BC29A] transition-colors font-black"
              >
                创建并录制
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {pendingDeleteScheme && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
          <div className="bg-white rounded-[28px] p-6 w-96 max-w-[90vw] pop-shadow">
            <h3 className="text-lg font-black text-[#4B454E] mb-3">删除语音方案</h3>
            <p className="text-sm text-[#8A8490] font-bold mb-5">
              确定删除“{pendingDeleteScheme.name}”吗？删除后无法恢复。
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteSchemeId(null)}
                className="flex-1 px-4 py-2 border border-[#E5E7EB] rounded-2xl hover:bg-gray-50 transition-colors font-black text-[#6B7280]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomScheme(pendingDeleteScheme.id);
                  setPendingDeleteSchemeId(null);
                }}
                className="flex-1 px-4 py-2 bg-[#FF8585] text-white rounded-2xl hover:bg-[#ef7676] transition-colors font-black"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 切换不完整语音警告对话框 */}
      {pendingSwitchSchemeId && (() => {
        const schemeObj = presetSchemes.find(s => s.id === pendingSwitchSchemeId) || 
                          customSchemes.find(s => s.id === pendingSwitchSchemeId);
        const schemeName = schemeObj?.name || '该方案';
        const schemePrefix = `${pendingSwitchSchemeId}_`;
        const count = Object.keys(recordedAudios).filter(key => key.startsWith(schemePrefix)).length;
        
        if (count === 0) {
          return (
            <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
              <div className="bg-white rounded-[28px] p-6 w-96 max-w-[90vw] pop-shadow">
                <h3 className="text-lg font-black text-[#4B454E] mb-3">语音未录制</h3>
                <p className="text-sm text-[#8A8490] font-bold mb-5">
                  【{schemeName}】目前没有任何录音，无法发声。请先去录制声音，或者选择切换其他已录制的语音方案。
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (schemeObj) enterRecordingView(schemeObj);
                      setPendingSwitchSchemeId(null);
                    }}
                    className="flex-1 px-4 py-2 bg-[#66DDB3] text-white rounded-2xl hover:bg-[#4BC29A] transition-colors font-black"
                  >
                    去录制声音
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingSwitchSchemeId(null)}
                    className="flex-1 px-4 py-2 border border-[#E5E7EB] rounded-2xl hover:bg-gray-50 transition-colors font-black text-[#6B7280]"
                  >
                    选择其他语音
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
            <div className="bg-white rounded-[28px] p-6 w-96 max-w-[90vw] pop-shadow">
              <h3 className="text-lg font-black text-[#4B454E] mb-3">语音录制不全</h3>
              <p className="text-sm text-[#8A8490] font-bold mb-2">
                【{schemeName}】还有未录完的声音（已录制 {count} / {AUDIO_ITEMS.length}）。
              </p>
              <p className="text-sm text-[#FF8585] font-bold mb-5">
                游戏中未录制的部分将无法发声，建议您去录全声音，或者切换其他已录全的语音，或者强行切换。
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (schemeObj) enterRecordingView(schemeObj);
                    setPendingSwitchSchemeId(null);
                  }}
                  className="w-full px-4 py-2 bg-[#66DDB3] text-white rounded-2xl hover:bg-[#4BC29A] transition-colors font-black"
                >
                  去录全声音
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPendingSwitchSchemeId(null)}
                    className="flex-1 px-4 py-2 border border-[#E5E7EB] rounded-2xl hover:bg-gray-50 transition-colors font-black text-[#6B7280]"
                  >
                    切换其他语音
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmSetAsDefault(pendingSwitchSchemeId)}
                    className="flex-1 px-4 py-2 border border-[#FF8585] text-[#FF8585] rounded-2xl hover:bg-[#FFF5F5] transition-colors font-black"
                  >
                    强行切换
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 轻量提示 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
          <div className={`px-4 py-2 rounded-full text-sm font-black shadow-lg ${
            toast.type === 'success'
              ? 'bg-[#4BC29A] text-white'
              : toast.type === 'error'
                ? 'bg-[#FF8585] text-white'
                : 'bg-[#4B454E] text-white'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSelect;
