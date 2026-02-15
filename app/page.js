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
    setIsOpen(false); // close the sheet
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
    setIsOpen(false); // close the sheet
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
    <div className="flex items-center justify-center w-full h-screen bg-neutral-900 font-sans text-slate-900">

      {/* Mobile Frame */}
      <div className="relative w-[390px] h-[844px] overflow-hidden rounded-[40px] border-[6px] border-neutral-700 shadow-2xl">

        {/* Background: Threads Screenshot */}
        <img
          src="/Image/default-screen.png"
          alt="threads background"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />

        {/* Black Overlay - opacity 0.5 */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${isOpen || step === 'success' ? 'opacity-50' : 'opacity-0'}`}
        />

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="absolute top-8 right-6 z-[60] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/25 transition-colors"
        >
          <RotateCcw size={14} />
          리셋
        </button>

        {/* Share Extension Sheet (SaveBox) */}
        <div
          className={`absolute inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] w-full overflow-hidden pb-8">

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


          </div>
        </div>
      </div>

        {/* S1-05: Snackbar Toast */}
        <div
          className={`absolute inset-x-0 bottom-10 z-[70] px-4 transition-all duration-300 ease-out ${
            step === 'success'
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          <div
            className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} className="text-white" />
              </div>
              <span className="text-sm font-medium text-white">
                &ldquo;{savedCollection?.name}&rdquo;에 저장됨
              </span>
            </div>
            <button className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 shrink-0 ml-3">
              앱 열기
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
