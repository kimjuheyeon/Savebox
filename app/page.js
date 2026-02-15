'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Check, Hash, RotateCcw } from 'lucide-react';

const INITIAL_COLLECTIONS = [
  { id: 'c1', name: 'UI 레퍼런스', color: 'bg-blue-100 text-blue-600' },
  { id: 'c2', name: '개발 아티클', color: 'bg-green-100 text-green-600' },
  { id: 'c3', name: '맛집 리스트', color: 'bg-orange-100 text-orange-600' },
  { id: 'c4', name: '나중에 볼 영상', color: 'bg-purple-100 text-purple-600' },
];

export default function App() {
  // --- States ---
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('list');
  const [collections, setCollections] = useState(INITIAL_COLLECTIONS);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [savedCollection, setSavedCollection] = useState(null);
  const [timeLeft, setTimeLeft] = useState(2000);

  const inputRef = useRef(null);

  // --- Effects ---

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
        const remaining = Math.max(0, 2000 - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          handleClose();
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [step]);

  // --- Handlers ---

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep('list');
      setSavedCollection(null);
      setTimeLeft(2000);
    }, 500);
  };

  const handleSaveToCollection = (collection) => {
    setSavedCollection(collection);
    setStep('success');
  };

  const handleCreateAndSave = () => {
    if (!newCollectionName.trim()) return;

    const newCollection = {
      id: `c-${Date.now()}`,
      name: newCollectionName,
      color: 'bg-gray-100 text-gray-800'
    };

    setCollections([newCollection, ...collections]);
    setSavedCollection(newCollection);
    setNewCollectionName('');
    setStep('success');
  };

  const handleReset = () => {
    setIsOpen(false);
    setStep('list');
    setCollections(INITIAL_COLLECTIONS);
    setNewCollectionName('');
    setSavedCollection(null);
    setTimeLeft(2000);
    setTimeout(() => setIsOpen(true), 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreateAndSave();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans text-slate-900">

      {/* Background: SNS App Context */}
      <div
        className={`w-full h-full bg-cover bg-center transition-transform duration-500 ${isOpen ? 'scale-95 opacity-80 brightness-75' : 'scale-100'}`}
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000&auto=format&fit=crop")',
          filter: isOpen ? 'blur(2px) brightness(0.7)' : 'none'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="absolute top-4 right-4 z-[60] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/25 transition-colors"
      >
        <RotateCcw size={14} />
        리셋
      </button>

      {/* Share Extension Sheet (SaveBox) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] w-full max-w-md mx-auto overflow-hidden pb-8">

          {/* Header Indicator */}
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="px-5 pt-2 pb-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button onClick={handleClose} className="p-1.5 -ml-1.5 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
                <h2 className="text-lg font-bold text-gray-900">컬렉션에 저장</h2>
              </div>
              <button
                onClick={() => setStep('create')}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                새 컬렉션
              </button>
            </div>
          </div>

          {/* Main Body Area */}
          <div className="px-5 py-4 min-h-[280px]">

            {/* VIEW STATE: S1-03 Collection List */}
            {step === 'list' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="space-y-1">
                  <div className="max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                    {collections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => handleSaveToCollection(col)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${col.color}`}>
                          <Hash size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{col.name}</p>
                          <p className="text-xs text-gray-500">12개 항목</p>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
                          <Plus size={18} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW STATE: S1-04 New Collection Input */}
            {step === 'create' && (
              <div className="animate-in fade-in slide-in-from-right-8">
                <div className="mb-4">
                  <button
                    onClick={() => setStep('list')}
                    className="text-xs text-gray-500 flex items-center gap-1 mb-4 hover:text-gray-800"
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
                    className="w-full p-4 text-lg border-b-2 border-indigo-500 focus:outline-none bg-transparent placeholder:text-gray-300"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <button
                  onClick={handleCreateAndSave}
                  disabled={!newCollectionName.trim()}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
                    newCollectionName.trim()
                      ? 'bg-indigo-600 shadow-lg shadow-indigo-200'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  완료 및 저장
                </button>
              </div>
            )}

            {/* VIEW STATE: S1-05 Success & Auto Return */}
            {step === 'success' && (
              <div className="h-full flex flex-col items-center justify-center py-6 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <Check size={32} strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">저장됨!</h3>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  <span className="font-semibold text-indigo-600">{savedCollection?.name}</span>에<br/>
                  성공적으로 저장되었습니다.
                </p>

                {/* Actions */}
                <div className="flex gap-3 w-full mb-6">
                  <button
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    onClick={handleClose}
                  >
                    닫기
                  </button>
                  <button className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-md transition-colors">
                    상세 보기
                  </button>
                </div>

                {/* Auto Return Indicator */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-400 rounded-full transition-all ease-linear"
                    style={{ width: `${(timeLeft / 2000) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {Math.ceil(timeLeft / 1000)}초 후 자동 복귀
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
