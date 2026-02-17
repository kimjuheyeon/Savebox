'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, RotateCcw } from 'lucide-react';
import { ICON_BUTTON_BASE_CLASS, ICON_BUTTON_ICON_SIZE, ICON_BUTTON_SIZE_CLASS } from '@/lib/iconUI';
import ActionSnackbar from '@/components/ActionSnackbar';

const SHARED_CONTENT = {
  title: '비트코인 소름 돋는 예언 하나 할게',
  thumbnail: '/thumbnail/dd1994d5301ea079533443fdf481775d.jpg',
  source: 'Threads',
};

const INITIAL_COLLECTIONS = [
  { id: 'c1', name: 'UI 레퍼런스', thumbnail: '/thumbnail/2aca272e2362eaf5a34383381000c9a7.jpg' },
  { id: 'c2', name: '개발 아티클', thumbnail: '/thumbnail/6912ebf347095999d3b8597ec1c0c887.jpg' },
  { id: 'c3', name: '맛집 리스트', thumbnail: '/thumbnail/b1d0c3bfdcd04d80dd8fde350cdf2946.jpg' },
  { id: 'c4', name: '나중에 볼 영상', thumbnail: '/thumbnail/d7316f9967030db54150c3bf12937544.jpg' },
];

export default function ShareExtension() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('list');
  const [collections, setCollections] = useState(INITIAL_COLLECTIONS);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [savedCollection, setSavedCollection] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step === 'create' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    let interval;
    if (step === 'success') {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= 2000) {
          handleClose();
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep('list');
      setSavedCollection(null);
    }, 500);
  };

  const handleSaveToCollection = (collection) => {
    setSavedCollection(collection);
    setIsOpen(false);
    setStep('success');
  };

  const handleCreateAndSave = () => {
    if (!newCollectionName.trim()) return;
    const newCollection = {
      id: `c-${Date.now()}`,
      name: newCollectionName,
      color: 'bg-gray-100 text-gray-800',
    };
    setCollections([newCollection, ...collections]);
    setSavedCollection(newCollection);
    setNewCollectionName('');
    setIsOpen(false);
    setStep('success');
  };

  const handleReset = () => {
    setIsOpen(false);
    setStep('list');
    setCollections(INITIAL_COLLECTIONS);
    setNewCollectionName('');
    setSavedCollection(null);
    setTimeout(() => setIsOpen(true), 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreateAndSave();
  };

  return (
    <div className="relative w-full h-[100dvh] bg-neutral-900 font-sans text-slate-900 overflow-hidden">
      {/* Background: Threads Screenshot */}
      <img
        src="/Image/default-screen.png"
        alt="threads background"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* Black Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen || step === 'success' ? 'opacity-50' : 'opacity-0'
        }`}
      />

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="absolute top-[max(2rem,env(safe-area-inset-top,2rem))] right-4 z-[60] flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-white/15 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/25 transition-colors min-h-[44px]"
      >
        <RotateCcw size={14} />
        리셋
      </button>

      {/* Share Extension Sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div
          className="bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] w-full overflow-hidden"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Header Indicator */}
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="px-5 pt-2 pb-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} -ml-1.5 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px]`}
                >
                  <X size={ICON_BUTTON_ICON_SIZE} />
                </button>
                <h2 className="text-lg font-bold text-gray-900">컬렉션에 저장</h2>
              </div>
              <button
                onClick={() => setStep('create')}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors min-h-[44px] flex items-center px-2"
              >
                새 컬렉션
              </button>
            </div>
          </div>

          {/* S1-02: Content Preview Card */}
          <div className="px-5 py-3">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ backgroundColor: '#F8F8F8' }}>
              {SHARED_CONTENT.thumbnail ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <img src={SHARED_CONTENT.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl shrink-0 bg-white flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700">
                    {SHARED_CONTENT.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{SHARED_CONTENT.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{SHARED_CONTENT.source}에서 공유됨</p>
              </div>
            </div>
          </div>

          {/* Main Body Area */}
          <div className="px-5 py-4" style={{ minHeight: 'min(280px, 40dvh)' }}>
            {/* S1-03 Collection List */}
            {step === 'list' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="space-y-1">
                  <div className="overflow-y-auto pr-1 custom-scrollbar" style={{ maxHeight: 'min(280px, 35dvh)' }}>
                    {collections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => handleSaveToCollection(col)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left min-h-[56px]"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                          {col.thumbnail ? (
                            <img src={col.thumbnail} alt={col.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                              {col.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{col.name}</p>
                          <p className="text-xs text-gray-500">12개 항목</p>
                        </div>
                        <div
                          className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-xl text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors min-w-[44px] min-h-[44px]`}
                        >
                          <Plus size={ICON_BUTTON_ICON_SIZE} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* S1-04 New Collection Input */}
            {step === 'create' && (
              <div className="animate-in fade-in slide-in-from-right-8">
                <div className="mb-4">
                  <button
                    onClick={() => setStep('list')}
                    className="text-xs text-gray-500 flex items-center gap-1 mb-4 hover:text-gray-800 min-h-[44px]"
                  >
                    ← 뒤로가기
                  </button>
                  <label className="text-sm font-semibold text-gray-800 block mb-2">
                    새 컬렉션 이름
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="예: 인테리어 아이디어"
                    className="w-full p-4 text-base border-b-2 border-indigo-500 focus:outline-none bg-transparent placeholder:text-gray-300"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button
                  onClick={handleCreateAndSave}
                  disabled={!newCollectionName.trim()}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all transform active:scale-95 min-h-[48px] ${
                    newCollectionName.trim()
                      ? 'bg-indigo-600 shadow-lg shadow-indigo-200'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  완료 및 저장
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ActionSnackbar
        open={step === 'success'}
        message={`"${savedCollection?.name}"에 저장됨`}
        actionHref="/content"
        actionLabel="앱 열기"
        className="fixed inset-x-0 z-[70] px-4"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      />
    </div>
  );
}
