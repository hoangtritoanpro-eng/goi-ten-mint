"use client";
import { useState, useRef, useEffect } from "react";

// === COMPONENT PHÁO HOA ĂN MỪNG (ĐÃ FIX LỖI HYDRATION) ===
const Confetti = ({ onComplete }: { onComplete: () => void }) => {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    // Chỉ tạo pháo hoa sau khi web đã tải xong để tránh lỗi Hydration của Vercel
    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-400', 'bg-rose-500', 'bg-purple-500'];
    const newPieces = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      animationDelay: `${Math.random() * 2}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm'
    }));
    setPieces(newPieces);

    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className={`absolute top-[-10%] w-3 h-3 ${p.color} ${p.shape} animate-confetti-fall`}
          style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay }}
        />
      ))}
    </div>
  );
};

export default function RandomCaller() {
  // === KHIÊN CHỐNG LỖI HYDRATION VÀ GOOGLE DỊCH ===
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // === STATES DỮ LIỆU ===
  const [rawText, setRawText] = useState("Lưu Đức Bảo An\nĐào Nhật Anh\nNguyễn Văn Tuấn Anh\nTrần Hải Bình\nNguyễn Thành Công\nVũ Mạnh Cường\nTạ Quang Hiếu\nHà Trọng Dũng");
  const [students, setStudents] = useState<string[]>(["Lưu Đức Bảo An", "Đào Nhật Anh", "Nguyễn Văn Tuấn Anh", "Trần Hải Bình", "Nguyễn Thành Công", "Vũ Mạnh Cường", "Tạ Quang Hiếu", "Hà Trọng Dũng"]);
  const [history, setHistory] = useState<{time: string, name: string}[]>([]);

  // === STATES MODAL & GAME ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [game, setGame] = useState({ id: "", name: "", icon: "" });
  const [winner, setWinner] = useState("");
  const [status, setStatus] = useState<"idle" | "playing" | "finished">("idle");
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false); 

  // States chi tiết cho từng Mini Game
  const [slots, setSlots] = useState(["?", "?", "?"]);
  const [bomb, setBomb] = useState(5);
  const [dice, setDice] = useState([1, 1]);
  const [card, setCard] = useState<number | null>(null);
  const [drops, setDrops] = useState<any[]>([]);
  const [pop, setPop] = useState<number | null>(null);
  const [env, setEnv] = useState<number | null>(null);
  const [wheelRot, setWheelRot] = useState(0);
  const [racers, setRacers] = useState<any[]>([]);
  const [dartRot, setDartRot] = useState(0);
  const [plinkoBall, setPlinkoBall] = useState({ active: false, left: '50%', top: '5%', dur: '0s', ease: 'linear' });
  const [claw, setClaw] = useState({ active: false, x: 50, y: 10, grabbed: -1, dur: '1s' });

  // === STATES THEME & AUDIO ===
  const [theme, setTheme] = useState<"emerald" | "dark" | "light">("emerald");
  const [musicOn, setMusicOn] = useState(false);
  const [sfxOn, setSfxOn] = useState(true);

  // === ĐÃ SỬA LỖI TYPESCRIPT (THÊM | null) ===
  const aMusic = useRef<HTMLAudioElement | null>(null);
  const aSpin = useRef<HTMLAudioElement | null>(null);
  const aDice = useRef<HTMLAudioElement | null>(null);
  const aSlot = useRef<HTMLAudioElement | null>(null);
  const aBomb = useRef<HTMLAudioElement | null>(null);
  const aDuck = useRef<HTMLAudioElement | null>(null);
  const aWin = useRef<HTMLAudioElement | null>(null);
  const aClap = useRef<HTMLAudioElement | null>(null);

  // === HÀM MỞ KHÓA ÂM THANH ===
  const unlockAudio = () => {
    const audios = [aMusic, aSpin, aDice, aSlot, aBomb, aDuck, aWin, aClap];
    audios.forEach(ref => {
      if (ref.current) {
        ref.current.volume = 0; 
        const playPromise = ref.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            if (ref.current) {
              ref.current.pause();
              ref.current.currentTime = 0;
            }
          }).catch(error => console.log("Lỗi load âm thanh: ", error));
        }
      }
    });

    setTimeout(() => {
      if (aMusic.current) aMusic.current.volume = 0.25;
      if (aWin.current) aWin.current.volume = 0.8;
      if (aClap.current) aClap.current.volume = 0.8;
      [aSpin, aDice, aSlot, aBomb, aDuck].forEach(r => { if (r.current) r.current.volume = 1; });
    }, 100);
    
    setAudioUnlocked(true);
  };

  // === XỬ LÝ GIAO DIỆN ===
  const getThemeStyles = () => {
    if (theme === "emerald") return {
      bg: "bg-[#F8FAFC]", card: "bg-white", border: "border-slate-200", line: "bg-slate-200",
      text: "text-slate-900", mut: "text-slate-700", acc: "text-emerald-700", accBg: "bg-emerald-50", accBorder: "border-emerald-300",
      modalBg: "bg-[#F8FAFC]/95", btnTxt: "text-white" 
    };
    if (theme === "light") return {
      bg: "bg-[#F4F7F9]", card: "bg-white", border: "border-slate-200", line: "bg-slate-200",
      text: "text-slate-900", mut: "text-slate-700", acc: "text-blue-700", accBg: "bg-blue-50", accBorder: "border-blue-300",
      modalBg: "bg-white/95", btnTxt: "text-slate-900" 
    };
    return {
      bg: "bg-[#090E17]", card: "bg-[#121A2F]", border: "border-[#1E293B]", line: "bg-slate-700",
      text: "text-white", mut: "text-slate-400", acc: "text-[#00E5FF]", accBg: "bg-[#00E5FF]/10", accBorder: "border-[#00E5FF]/30",
      modalBg: "bg-[#090E17]/95", btnTxt: "text-slate-900" 
    };
  };
  const t = getThemeStyles();

  // === AUDIO CONTROLLERS ĐÃ CHUẨN XÁC VỚI TYPESCRIPT ===
  const stopAllSfx = () => {
    [aSpin, aDice, aSlot, aBomb, aDuck, aWin, aClap].forEach(r => {
      if (r.current) { r.current.pause(); r.current.currentTime = 0; }
    });
  };

  // Khai báo | null ở tham số để Vercel không báo lỗi nữa
  const playSfx = (ref: React.RefObject<HTMLAudioElement | null>) => {
    if (sfxOn && ref.current) {
      stopAllSfx();
      ref.current.play().catch(e => console.warn("Lỗi phát âm thanh: ", e));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    stopAllSfx();
  };

  // === LOGIC HỆ THỐNG ===
  const openGame = (id: string, name: string, icon: string) => {
    if (students.length === 0) return alert("⚠️ Vui lòng nhập danh sách lớp!");
    setGame({ id, name, icon });
    setStatus("idle");
    setShowConfetti(false);
    setCard(null); setPop(null); setEnv(null); setDrops([]); setWheelRot(0); setDartRot(0);
    setPlinkoBall({ active: false, left: '50%', top: '5%', dur: '0s', ease: 'linear' });
    setClaw({ active: false, x: 50, y: 10, grabbed: -1, dur: '0s' });
    setIsModalOpen(true);
  };

  const finishGame = (sel: string) => {
    stopAllSfx();
    if (sfxOn) {
      aWin.current?.play().catch(()=>{});
      aClap.current?.play().catch(()=>{}); 
    }
    setWinner(sel);
    setStatus("finished");
    setShowConfetti(true);
    const timeString = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    setHistory(prev => [{ time: timeString, name: sel }, ...prev]);
  };

  const getRandomStudent = () => students[Math.floor(Math.random() * students.length)];

  // === THUẬT TOÁN 12 MINI GAMES ===
  const playJackpot = () => {
    setStatus("playing"); playSfx(aSlot); 
    const sel = getRandomStudent();
    let ticks = 0;
    const interval = setInterval(() => {
      setSlots([getRandomStudent(), getRandomStudent(), getRandomStudent()]);
      if (++ticks >= 20) { clearInterval(interval); setSlots([sel, sel, sel]); finishGame(sel); }
    }, 100);
  };

  const playBombG = () => {
    setStatus("playing"); playSfx(aBomb); 
    const sel = getRandomStudent();
    let c = 4; setBomb(c);
    const interval = setInterval(() => {
      setBomb(--c);
      if (c <= 0) { clearInterval(interval); finishGame(sel); }
    }, 1000);
  };

  const playDiceG = () => {
    setStatus("playing"); playSfx(aDice); 
    const sel = getRandomStudent();
    let ticks = 0;
    const interval = setInterval(() => {
      setDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      if (++ticks >= 20) { clearInterval(interval); finishGame(sel); }
    }, 80);
  };

  const playTarot = (idx: number) => {
    if (status !== "idle") return;
    setStatus("playing"); playSfx(aSpin); 
    setCard(idx);
    setTimeout(() => finishGame(getRandomStudent()), 1000);
  };

  const playRain = () => {
    setStatus("playing"); playSfx(aSpin);
    setDrops(Array.from({ length: 30 }).map((_, id) => ({
      id, name: getRandomStudent(), left: `${Math.random() * 90}%`, delay: `${Math.random() * 1.5}s`
    })));
    setTimeout(() => finishGame(getRandomStudent()), 3500);
  };

  const playBalloon = (idx: number, clickedName: string) => {
    if (status !== "idle") return;
    setStatus("playing"); playSfx(aBomb);
    setPop(idx);
    let sel = getRandomStudent();
    while(sel === clickedName && students.length > 1) { sel = getRandomStudent(); }
    setTimeout(() => finishGame(sel), 600);
  };

  const playLetter = (idx: number) => {
    if (status !== "idle") return;
    setStatus("playing"); playSfx(aSpin);
    setEnv(idx);
    setTimeout(() => finishGame(getRandomStudent()), 800);
  };

  const playWheel = () => {
    setStatus("playing"); playSfx(aSpin); 
    const winIdx = Math.floor(Math.random() * students.length);
    const sel = students[winIdx];
    const sliceAngle = 360 / students.length;
    const targetAngle = 360 - (winIdx * sliceAngle + sliceAngle / 2);
    const newRotation = wheelRot + 1800 + targetAngle - (wheelRot % 360);
    setWheelRot(newRotation);
    setTimeout(() => finishGame(sel), 5000);
  };

  const playDart = () => {
    setStatus("playing"); playSfx(aSpin);
    const winIdx = Math.floor(Math.random() * students.length);
    const sel = students[winIdx];
    const sliceAngle = 360 / students.length;
    const targetAngle = winIdx * sliceAngle; 
    const newRotation = dartRot + 1440 + targetAngle - (dartRot % 360);
    setDartRot(newRotation);
    setTimeout(() => finishGame(sel), 3500);
  };

  const playPlinko = () => {
    setStatus("playing"); playSfx(aDice); 
    const winIdx = Math.floor(Math.random() * students.length);
    const sel = students[winIdx];
    const displayCount = Math.min(students.length, 10);
    const effectiveWinIdx = winIdx % displayCount;
    const bucketWidth = 100 / displayCount;
    const targetLeft = (effectiveWinIdx * bucketWidth) + (bucketWidth / 2);
    
    const totalSteps = 6;
    let currentLeft = 50;
    let path: any[] = [];
    
    for (let i = 1; i <= totalSteps; i++) {
       const remaining = totalSteps - i + 1;
       const idealShift = (targetLeft - currentLeft) / remaining;
       let zigZag = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 6);
       if (i === totalSteps) { currentLeft = targetLeft; } 
       else { currentLeft += idealShift + zigZag; }
       
       path.push({ left: `${currentLeft}%`, top: `${10 + i * 12}%`, dur: '0.35s', ease: 'cubic-bezier(0.4, 0, 1, 1)' });
       if (i !== totalSteps) {
         path.push({ left: `${currentLeft + (Math.random() > 0.5 ? 2 : -2)}%`, top: `${9 + i * 12}%`, dur: '0.15s', ease: 'ease-out' });
       }
    }
    path.push({ left: `${targetLeft}%`, top: '88%', dur: '0.4s', ease: 'ease-in' });

    setPlinkoBall({ active: true, left: '50%', top: '5%', dur: '0s', ease: 'linear' });
    
    let step = 0;
    const runPath = () => {
       if (step < path.length) {
          const p = path[step];
          setPlinkoBall({ active: true, left: p.left, top: p.top, dur: p.dur, ease: p.ease });
          const delay = parseFloat(p.dur) * 1000;
          step++;
          setTimeout(runPath, delay + 20); 
       } else {
          setTimeout(() => finishGame(sel), 300);
       }
    };
    setTimeout(runPath, 100);
  };

  const playClaw = () => {
    setStatus("playing"); playSfx(aSlot); 
    const displayCount = Math.min(students.length, 8);
    const winIdx = Math.floor(Math.random() * displayCount);
    const sel = students[winIdx];
    const targetX = (winIdx / displayCount) * 100 + (100 / displayCount) / 2;
    
    setClaw({ active: true, x: 50, y: 10, grabbed: -1, dur: '0.3s' });
    setTimeout(() => setClaw(p => ({...p, x: 85, dur: '0.5s'})), 100); 
    setTimeout(() => setClaw(p => ({...p, x: 15, dur: '0.6s'})), 700);     
    setTimeout(() => setClaw(p => ({...p, x: 90, dur: '0.7s'})), 1400); 
    setTimeout(() => setClaw(p => ({...p, x: targetX, dur: '0.8s'})), 2200); 
    setTimeout(() => setClaw(p => ({...p, y: 68, dur: '1.2s'})), 3100);     
    setTimeout(() => setClaw(p => ({...p, y: 10, grabbed: winIdx, dur: '1.5s'})), 4400); 
    setTimeout(() => finishGame(sel), 6000);
  };

  const playDuck = () => {
    setStatus("playing"); playSfx(aDuck); 
    const sel = getRandomStudent();
    const arr = [...students];
    const winIdx = arr.indexOf(sel);
    const icons = ["🦆", "🐣", "🐥", "🐔", "🐧", "🦢", "🐢", "🐸"];
    
    setRacers(arr.map((name, i) => ({ name, icon: icons[i % icons.length], progress: 0 })));
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setRacers(prev => prev.map((r, x) => ({
        ...r, progress: Math.min(x === winIdx ? 100 : 85, r.progress + (x === winIdx ? 2 : Math.random() * 3))
      })));
      if (ticks >= 50) { clearInterval(interval); finishGame(sel); }
    }, 100);
  };

  const getWheelGradient = () => {
    const wheelColors = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#14B8A6", "#F43F5E", "#06B6D4", "#F97316"]; 
    const angle = 360 / students.length;
    let gradient = [];
    for (let i = 0; i < students.length; i++) {
      gradient.push(`${wheelColors[i % wheelColors.length]} ${i * angle}deg ${(i + 1) * angle}deg`);
    }
    return `conic-gradient(${gradient.join(", ")})`;
  };

  const handleUpdateList = () => setStudents(rawText.split('\n').map(s => s.trim()).filter(s => s !== ""));
  const handleClearList = () => { if (confirm("Xóa toàn bộ danh sách?")) { setRawText(""); setStudents([]); } };
  const handleClearHistory = () => setHistory([]);
  const loadSample = () => {
    const smp = "Nguyễn Văn A\nTrần Thị B\nLê Văn C\nPhạm Thị D\nHoàng Văn E\nĐỗ Thị F\nĐặng Văn G\nPhùng Thị H";
    setRawText(smp); setStudents(smp.split('\n'));
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : theme === "light" ? "emerald" : "dark");
  const toggleMusic = () => { 
    if (musicOn) {
      aMusic.current?.pause();
    } else {
      aMusic.current?.play().catch(e => console.log("Lỗi bật nhạc tự động"));
    }
    setMusicOn(!musicOn); 
  };
  const toggleSfx = () => { setSfxOn(!sfxOn); };

  const gamesList = [
    { id: "WHEEL", name: "VÒNG QUAY MAY MẮN", icon: "🎡" }, { id: "DUCK", name: "ĐUA VỊT", icon: "🦆" },
    { id: "SLOT", name: "MÁY JACKPOT", icon: "🎰" }, { id: "BOMB", name: "BOM NỔ CHẬM", icon: "💣" },
    { id: "DICE", name: "XÚC XẮC MAY RỦI", icon: "🎲" }, { id: "DART", name: "PHÓNG PHI TIÊU", icon: "🎯" },
    { id: "CARDS", name: "RÚT BÀI TAROT", icon: "🃏" }, { id: "PLINKO", name: "PLINKO RƠI BÓNG", icon: "⚪" },
    { id: "RAIN", name: "MƯA TÊN", icon: "🌧️" }, { id: "BALLOON", name: "BẮN BONG BÓNG", icon: "🎈" },
    { id: "CLAW", name: "MÁY GẮP THÚ", icon: "🪝" }, { id: "LETTER", name: "THƯ BÍ ẨN", icon: "💌" }
  ];

  // Nếu trình duyệt chưa tải xong thì không hiện gì cả để chống rác lỗi Vercel
  if (!isMounted) return null;

  return (
    <div className={`min-h-screen overflow-y-auto ${t.bg} font-sans p-6 flex flex-col transition-colors duration-500 custom-scrollbar`}>
      
      {/* MÀN HÌNH UNLOCK ÂM THANH */}
      {!audioUnlocked && (
        <div className="fixed inset-0 bg-slate-900/95 z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="text-7xl mb-6 drop-shadow-lg">🎓</div>
            <h1 className="text-white text-4xl sm:text-5xl font-black mb-8 tracking-widest text-center px-4">HỆ THỐNG GỌI TÊN MINT</h1>
            <button onClick={unlockAudio} className="bg-emerald-500 text-white font-black py-4 px-12 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.5)] hover:scale-105 transition-transform text-xl sm:text-2xl uppercase border-2 border-white">
                Bấm Vào Đây Để Bắt Đầu
            </button>
            <p className="text-slate-400 mt-6 font-bold text-center max-w-md px-4 text-sm">Thao tác này giúp hệ thống vượt qua tường lửa bảo mật của trình duyệt để phát Nhạc Nền và Hiệu Ứng Game.</p>
        </div>
      )}

      {/* === KHO ÂM THANH NỘI BỘ === */}
      <audio ref={aMusic} loop preload="auto" src="/music/nhac-nen.mp3" />
      <audio ref={aSpin} loop preload="auto" src="/music/vong-quay.mp3" />
      <audio ref={aDice} preload="auto" src="/music/xuc-xac.mp3" />
      <audio ref={aSlot} loop preload="auto" src="/music/may-xeng.mp3" />
      <audio ref={aBomb} loop preload="auto" src="/music/bom-no.mp3" />
      <audio ref={aDuck} loop preload="auto" src="/music/vit-keu.mp3" />
      <audio ref={aWin} preload="auto" src="/music/chien-thang.mp3" />
      <audio ref={aClap} preload="auto" src="/music/vo-tay.mp3" />

      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}

      {/* === SÂN KHẤU GAME (MODAL) === */}
      {isModalOpen && (
        <div className={`fixed inset-0 ${t.modalBg} backdrop-blur-md z-50 flex flex-col p-6 animate-in fade-in duration-200`}>
          <div className={`flex justify-between items-center mb-8 border-b ${t.border} pb-4`}>
            <div className="flex items-center gap-4">
              <span className={`text-4xl ${t.card} p-3 rounded-2xl border ${t.border} shadow-sm`}>{game.icon}</span>
              <h2 className={`text-slate-900 font-black tracking-widest text-2xl drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] uppercase`}>{game.name}</h2>
            </div>
            <div className="flex items-center gap-6">
              <span className={`text-sm font-black ${t.mut}`}>TRẠNG THÁI: <span className={`${theme === 'emerald' ? 'text-emerald-600' : 'text-orange-500'} uppercase`}>{status}</span></span>
              <button onClick={closeModal} className={`w-12 h-12 rounded-xl ${theme === 'emerald' ? 'bg-emerald-100 border-emerald-500 text-emerald-700 hover:bg-emerald-500' : 'bg-rose-500/10 border-rose-500 text-rose-500 hover:bg-rose-500'} hover:text-white flex items-center justify-center transition-all border-2 text-xl font-black shadow-sm`}>✕</button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-6xl mx-auto">
            {game.id === "SLOT" && (
              <div className="flex flex-col items-center w-full max-w-lg">
                <div className={`bg-gradient-to-b ${theme === 'emerald' ? 'from-emerald-400 via-teal-500 to-emerald-600' : 'from-orange-400 via-rose-500 to-orange-600'} p-3 rounded-[2rem] mb-10 w-full shadow-lg`}>
                  <div className="bg-slate-900 p-8 rounded-[1.5rem] flex gap-5 justify-center shadow-inner">
                    <div className="bg-white text-slate-900 text-4xl font-black w-36 h-36 flex items-center justify-center rounded-2xl truncate border-4 border-slate-300">{slots[0]}</div>
                    <div className="bg-white text-slate-900 text-4xl font-black w-36 h-36 flex items-center justify-center rounded-2xl truncate border-4 border-slate-300">{slots[1]}</div>
                    <div className="bg-white text-slate-900 text-4xl font-black w-36 h-36 flex items-center justify-center rounded-2xl truncate border-4 border-slate-300">{slots[2]}</div>
                  </div>
                </div>
                {status === "idle" && <button onClick={playJackpot} className={`bg-gradient-to-b from-[#FDE047] to-[#F59E0B] text-slate-900 font-black py-4 px-16 rounded-full shadow-lg hover:scale-110 transition-transform text-2xl tracking-widest uppercase border-2 border-white`}>🎰 KÉO CẦN</button>}
              </div>
            )}
            {game.id === "BOMB" && (
              <div className="flex flex-col items-center">
                <div className={`text-[10rem] mb-4 transition-transform ${status === "playing" ? 'animate-bounce' : ''}`}>{status === "finished" ? "💥" : "💣"}</div>
                {status !== "finished" && <div className={`text-9xl font-black ${theme === 'emerald' ? 'text-emerald-600' : 'text-orange-500'} mb-10 font-mono drop-shadow-md`}>{bomb}</div>}
                {status === "idle" && <button onClick={playBombG} className={`bg-gradient-to-b from-rose-400 to-rose-600 text-slate-900 font-black py-4 px-16 rounded-full shadow-lg hover:scale-110 transition-transform text-2xl tracking-widest uppercase border-2 border-white`}>🔥 ĐỐT NGÒI</button>}
              </div>
            )}
            {game.id === "DICE" && (
              <div className="flex flex-col items-center">
                <div className="flex gap-8 mb-10">
                  <div className={`bg-white text-slate-900 text-8xl font-black w-48 h-48 flex items-center justify-center rounded-[2.5rem] shadow-xl border-b-[12px] border-slate-300 ${status === 'playing' ? 'animate-spin' : ''}`}>{dice[0]}</div>
                  <div className={`bg-white text-slate-900 text-8xl font-black w-48 h-48 flex items-center justify-center rounded-[2.5rem] shadow-xl border-b-[12px] border-slate-300 ${status === 'playing' ? 'animate-spin' : ''}`}>{dice[1]}</div>
                </div>
                {status !== "idle" && <p className={`text-3xl text-slate-900 font-black mb-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]`}>Tổng điểm: <span className={`${theme === 'emerald' ? 'text-emerald-600' : 'text-orange-500'} text-6xl ml-2`}>{dice[0] + dice[1]}</span></p>}
                {status === "idle" && <button onClick={playDiceG} className={`bg-gradient-to-b from-[#34D399] to-[#059669] text-slate-900 font-black py-4 px-12 rounded-full shadow-lg hover:scale-110 transition-transform text-2xl tracking-widest uppercase border-2 border-white`}>🎲 GIEO XÚC XẮC</button>}
              </div>
            )}
            {game.id === "CARDS" && (
              <div className="flex flex-col items-center w-full">
                {status === "idle" && <p className={`text-slate-900 mb-10 text-2xl font-black tracking-widest uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]`}>🔮 Hãy chọn lá bài định mệnh</p>}
                <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
                  {students.slice(0, 10).map((s, idx) => (
                    <div key={idx} className="perspective-1000 w-32 h-48 cursor-pointer" onClick={() => playTarot(idx)}>
                      <div className={`relative w-full h-full transition-transform duration-[800ms] transform-style-3d ${card === idx ? 'rotate-y-180 scale-125 z-10' : (card !== null ? 'opacity-30 scale-90' : 'hover:-translate-y-4 hover:scale-105')}`}>
                        <div className={`absolute inset-0 backface-hidden ${theme === 'emerald' ? 'bg-emerald-100 border-emerald-400' : 'bg-indigo-100 border-indigo-400'} border-4 rounded-2xl flex items-center justify-center shadow-lg`}><span className="text-6xl text-slate-900 font-black opacity-60">?</span></div>
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-b from-amber-200 to-amber-400 border-4 border-white rounded-2xl flex items-center justify-center p-2 shadow-xl"><span className="text-xl font-black text-slate-900 text-center break-words leading-tight">{status === "finished" && card === idx ? winner : ""}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {game.id === "DART" && (
              <div className="flex flex-col items-center w-full">
                <div className="relative w-[26rem] h-[26rem] sm:w-[30rem] sm:h-[30rem] mb-12 rounded-full bg-[#1E293B] border-[12px] border-[#1E293B] flex items-center justify-center shadow-2xl">
                  <div className="absolute inset-0 rounded-full bg-[#E14D3D] flex items-center justify-center shadow-inner">
                    <div className="absolute inset-10 sm:inset-12 rounded-full bg-white flex items-center justify-center shadow-md">
                      <div className="absolute inset-10 sm:inset-12 rounded-full bg-[#E14D3D] flex items-center justify-center shadow-inner">
                        <div className="absolute inset-8 sm:inset-10 rounded-full bg-white shadow-md"></div>
                      </div>
                    </div>
                  </div>
                  {students.map((s, i) => {
                    const angle = (i * 360) / students.length - 90;
                    return (
                      <div key={i} className="absolute left-1/2 top-1/2 w-0 h-0 z-10" style={{ transform: `rotate(${angle}deg)` }}>
                        <div className="absolute w-[65px] sm:w-[85px] -left-[32.5px] sm:-left-[42.5px] -top-[12rem] sm:-top-[13.8rem] bg-slate-900 text-white rounded-full text-[10px] sm:text-[11px] font-black shadow-lg px-2 py-1.5 border border-slate-600 truncate text-center" style={{ transform: `rotate(-${angle}deg)` }}>{s}</div>
                      </div>
                    )
                  })}
                  <div className="absolute z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[70px] border-b-slate-900 origin-bottom drop-shadow-xl" style={{ top: 'calc(50% - 70px)', transform: `rotate(${dartRot}deg)`, transition: status === 'playing' ? 'transform 3.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none' }}></div>
                </div>
                {status === "idle" && <button onClick={playDart} className={`bg-gradient-to-b from-[#A78BFA] to-[#7C3AED] text-slate-900 font-black py-4 px-16 rounded-full shadow-lg hover:scale-110 transition-transform text-2xl tracking-widest uppercase border-2 border-white`}>🎯 PHÓNG PHI TIÊU</button>}
              </div>
            )}
            {game.id === "PLINKO" && (
              <div className="flex flex-col items-center w-full max-w-4xl">
                <div className="w-full h-[450px] bg-[#131521] rounded-[2rem] relative overflow-hidden border-4 border-[#1E293B] shadow-2xl mb-8">
                  <div className="absolute inset-0 flex flex-col justify-evenly py-8 opacity-90 pointer-events-none">
                    {[5,6,7,8,9,10].map((row, i) => (
                      <div key={i} className="flex justify-center gap-12 sm:gap-16">
                        {Array.from({length: row}).map((_, j) => <div key={j} className="w-3.5 h-3.5 rounded-full bg-yellow-300 shadow-[0_0_15px_#FDE047]"></div>)}
                      </div>
                    ))}
                  </div>
                  {plinkoBall.active && (
                    <div className="absolute w-7 h-7 bg-pink-200 rounded-full shadow-[0_0_20px_#F9A8D4] z-20" style={{ left: plinkoBall.left, top: plinkoBall.top, transitionProperty: 'left, top', transitionDuration: plinkoBall.dur, transitionTimingFunction: plinkoBall.ease, transform: 'translate(-50%, -50%)' }}></div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-16 flex">
                    {students.slice(0, Math.min(students.length, 10)).map((s, i) => (
                      <div key={i} className={`flex-1 border-r border-slate-900/50 flex items-center justify-center text-xs font-black text-white px-2 text-center break-words leading-tight ${i%2===0 ? 'bg-[#254A52]' : 'bg-[#4B2F38]'}`}>
                        <span className="truncate w-full">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {status === "idle" && <button onClick={playPlinko} className={`bg-gradient-to-b from-[#93C5FD] to-[#3B82F6] text-slate-900 font-black py-4 px-16 rounded-full shadow-lg hover:scale-110 transition-transform text-2xl tracking-widest uppercase border-2 border-white`}>⚪ THẢ BÓNG</button>}
              </div>
            )}
            {game.id === "RAIN" && (
              <div className="flex flex-col items-center w-full max-w-4xl h-[500px]">
                <div className={`w-full h-full bg-blue-50 rounded-[2rem] border-4 border-blue-300 relative overflow-hidden shadow-inner mb-8`}>
                  {drops.map(d => (
                    <div key={d.id} className="absolute text-slate-900 font-black text-2xl opacity-90 animate-raindrop" style={{ left: d.left, animationDelay: d.delay }}>{d.name}</div>
                  ))}
                </div>
                {status === "idle" && <button onClick={playRain} className={`bg-gradient-to-b from-[#60A5FA] to-[#2563EB] text-slate-900 font-black py-4 px-16 rounded-full shadow-lg hover:scale-110 transition-transform text-2xl tracking-widest uppercase border-2 border-white`}>🌧️ BẮT ĐẦU MƯA</button>}
              </div>
            )}
            {game.id === "BALLOON" && (
              <div className="flex flex-col items-center w-full max-w-4xl h-[500px]">
                {status === "idle" && <p className={`text-slate-900 mb-8 text-2xl font-black tracking-widest uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]`}>🎈 Bấm vào quả bóng bạn muốn!</p>}
                <div className="w-full h-full bg-gradient-to-b from-[#93C5FD] to-[#3B82F6] rounded-[2rem] relative overflow-hidden shadow-inner border-4 border-white/50 p-10 flex flex-wrap justify-center items-center gap-8">
                  {students.slice(0, 10).map((s, idx) => (
                    <div key={idx} onClick={() => playBalloon(idx, s)} className={`relative flex flex-col items-center cursor-pointer transition-all duration-500 ${status === "idle" ? "hover:-translate-y-4 animate-float" : ""} ${pop === idx ? "scale-[2] opacity-0" : (pop !== null ? "opacity-20 translate-y-[-100px]" : "")}`} style={{ animationDelay: `${(idx*0.2)%2}s` }}>
                      <div className="text-7xl drop-shadow-xl relative">🎈</div>
                      <div className="absolute -bottom-6 bg-white px-3 py-1 rounded-full text-slate-900 text-[10px] font-black shadow-md border border-slate-200 z-10 min-w-[60px] text-center truncate max-w-[100px]">{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {game.id === "LETTER" && (
              <div className="flex flex-col items-center w-full max-w-4xl">
                {status === "idle" && <p className={`text-slate-900 mb-10 text-2xl font-black tracking-widest uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]`}>💌 Chọn một phong bì định mệnh</p>}
                <div className={`${theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-100/80'} border-2 ${t.border} p-10 rounded-[2rem] w-full flex flex-wrap justify-center gap-8 shadow-inner`}>
                  {["bg-[#FF6B6B]", "bg-[#FF9F43]", "bg-[#10B981]", "bg-[#3B82F6]", "bg-[#8B5CF6]"].map((cClass, idx) => (
                    <div key={idx} onClick={() => playLetter(idx)} className={`relative w-48 h-32 rounded-2xl cursor-pointer transition-all duration-500 flex items-center justify-center shadow-md border-2 border-white/50 ${env === idx ? "bg-white scale-125 z-10 shadow-2xl" : (env !== null ? "opacity-30 scale-90" : `${cClass} hover:-translate-y-4 hover:scale-105`)}`}>
                      {env === idx ? <span className="text-4xl animate-bounce text-slate-900 font-black">Mở...</span> : <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center border-2 border-white/60"><span className="text-white text-2xl drop-shadow-sm">💌</span></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {game.id === "WHEEL" && (
              <div className="flex flex-col items-center w-full">
                <div className="relative w-[28rem] h-[28rem] sm:w-[32rem] sm:h-[32rem] mb-12">
                  <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[35px] ${theme === 'emerald' ? 'border-t-emerald-600' : 'border-t-rose-600'} z-20 drop-shadow-md`}></div>
                  <div className="w-full h-full rounded-full border-8 border-white shadow-xl overflow-hidden relative" style={{ background: getWheelGradient(), transform: `rotate(${wheelRot}deg)`, transition: status === "playing" ? 'transform 5s cubic-bezier(0.15, 0.9, 0.15, 1)' : 'none' }}>
                    {students.map((s, i) => {
                      const angle = 360 / students.length; 
                      const rotate = i * angle + angle / 2 - 90;
                      return (
                        <div key={i} className="absolute top-1/2 left-1/2 origin-left flex items-center justify-end pr-10 sm:pr-14" style={{ width: '50%', transform: `translateY(-50%) rotate(${rotate}deg)` }}>
                          <span className="font-black text-slate-900 text-xs sm:text-sm break-words whitespace-normal text-right leading-tight" style={{ maxWidth: '85%' }}>{s}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {status === "idle" && <button onClick={playWheel} className={`bg-gradient-to-b from-[#FDE047] to-[#F59E0B] text-slate-900 font-black py-4 px-20 rounded-full shadow-lg hover:scale-110 transition-transform text-3xl tracking-widest border-4 border-white uppercase`}>🎡 QUAY NGAY</button>}
              </div>
            )}
            {game.id === "DUCK" && (
              <div className="flex flex-col items-center w-full max-w-5xl">
                {status === "idle" && <button onClick={playDuck} className={`bg-gradient-to-b from-[#34D399] to-[#059669] text-slate-900 font-black py-4 px-16 rounded-full shadow-lg hover:scale-110 transition-transform text-2xl tracking-widest border-2 border-white uppercase mb-8 z-10`}>🏁 XUẤT PHÁT!</button>}
                <div className="w-full bg-[#38BDF8] p-5 rounded-[2rem] border-8 border-white/50 shadow-inner relative overflow-y-auto custom-scrollbar max-h-[65vh]">
                  <div className="absolute right-12 sm:right-16 top-0 min-h-full h-full w-3 bg-[repeating-linear-gradient(0deg,transparent,transparent_15px,#0F172A_15px,#0F172A_30px)] opacity-40 z-0"></div>
                  <div className="absolute right-[3.5rem] sm:right-[4.5rem] top-0 min-h-full h-full w-3 bg-[repeating-linear-gradient(0deg,#0F172A,#0F172A_15px,transparent_15px,transparent_30px)] opacity-40 z-0"></div>
                  {racers.map((r, index) => (
                    <div key={index} className="relative min-h-[5rem] sm:min-h-[6rem] border-b-2 border-white/40 flex items-center py-2 mb-2 last:mb-0 z-10 shrink-0">
                      <div className="absolute left-2 bg-white text-slate-900 px-3 py-2 rounded-xl text-[10px] sm:text-xs font-black w-24 sm:w-36 break-words border-2 border-slate-300 shadow-md tracking-wide leading-tight text-center z-20">{r.name}</div>
                      <div className="absolute text-5xl sm:text-6xl transition-all ease-linear z-10" style={{ left: `calc(7.5rem + ${r.progress}% * 0.65)`, transitionDuration: status === 'playing' ? '100ms' : '0s' }}>
                        <span className={status === 'playing' ? 'animate-bounce block drop-shadow-md' : 'drop-shadow-md'}>{r.icon}</span>
                      </div>
                    </div>
                  ))}
                  {racers.length === 0 && <div className="h-64 flex items-center justify-center text-slate-800/50 font-black text-2xl tracking-widest">SẴN SÀNG ĐƯỜNG ĐUA!</div>}
                </div>
              </div>
            )}
            {game.id === "CLAW" && (
              <div className="flex flex-col items-center w-full max-w-4xl">
                {status === "idle" && <p className="text-slate-900 mb-6 text-2xl font-black tracking-widest uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">🪝 Cần cẩu sẽ gắp ngẫu nhiên một bạn!</p>}
                <div className="w-full h-[400px] bg-gradient-to-b from-purple-100 to-pink-100 rounded-[2rem] border-[12px] border-amber-500 shadow-2xl relative overflow-hidden mb-8">
                  <div className="absolute top-0 w-full h-4 bg-slate-800 shadow-md z-30"></div>
                  <div className="absolute top-0 w-1.5 bg-slate-800 z-20" style={{ left: `${claw.x}%`, height: `${claw.y}%`, transitionDuration: claw.dur, transitionTimingFunction: 'ease-in-out' }}>
                    <div className="absolute bottom-[-30px] left-[-20px] w-10 h-8 border-t-[6px] border-l-[6px] border-r-[6px] border-amber-400 rounded-t-xl drop-shadow-md bg-white/20"></div>
                    {claw.grabbed !== -1 && (
                      <div className="absolute bottom-[-90px] left-1/2 -translate-x-1/2 flex flex-col items-center z-10 w-24">
                        <span className="text-5xl drop-shadow-md">{['🐻','🐼','🐨','🦁','🐯','🐸','🐵','🐰'][claw.grabbed % 8]}</span>
                        <div className="bg-white text-slate-900 text-[10px] px-3 py-1 rounded-full mt-1 font-black shadow-sm truncate max-w-[80px] text-center border border-slate-200">{students[claw.grabbed]}</div>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-amber-500 to-amber-400 flex items-end justify-around pb-4 rounded-b-xl border-t-4 border-amber-600 z-10">
                    {students.slice(0, 8).map((s, i) => {
                      const isGrabbed = claw.grabbed === i;
                      return (
                        <div key={i} className={`flex flex-col items-center transition-opacity duration-300 w-20 ${isGrabbed ? 'opacity-0' : 'opacity-100'}`}>
                          <span className="text-5xl drop-shadow-md">{['🐻','🐼','🐨','🦁','🐯','🐸','🐵','🐰'][i % 8]}</span>
                          <div className="bg-white text-slate-900 text-[10px] px-3 py-1 rounded-full mt-2 font-black shadow-sm truncate max-w-[80px] text-center border border-slate-200">{s}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {status === "idle" && <button onClick={playClaw} className={`bg-gradient-to-b from-orange-400 to-orange-600 text-slate-900 font-black py-4 px-16 rounded-full shadow-lg hover:scale-110 transition-transform text-2xl tracking-widest uppercase border-2 border-white`}>🪝 NHẤN ĐỂ GẮP!</button>}
              </div>
            )}
            
            {/* BẢNG KẾT QUẢ ĐỒNG BỘ */}
            <div className={`mt-8 w-full max-w-2xl ${theme === 'emerald' ? 'bg-white' : 'bg-[#0F172A]'} border-2 ${t.border} rounded-3xl p-8 flex flex-col items-center shadow-2xl transition-all duration-700 z-10 ${status === "finished" ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-90 invisible absolute"}`}>
              <p className={`text-xs ${t.acc} tracking-[0.4em] font-black mb-4 uppercase drop-shadow-sm`}>Mục tiêu đã được chọn</p>
              <div className={`text-4xl sm:text-5xl font-black ${t.text} mb-10 min-h-[5rem] flex items-center justify-center text-center w-full break-words whitespace-normal px-4 leading-tight`}>{winner}</div>
              <button onClick={closeModal} className={`${theme === 'emerald' ? 'bg-emerald-100 text-emerald-800 border-emerald-400 hover:bg-emerald-600 hover:text-white' : 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-slate-900'} border-2 text-xs tracking-[0.2em] font-black py-4 px-12 rounded-full transition-all shadow-md uppercase`}>SẴN SÀNG PHẢN HỒI</button>
            </div>
          </div>
        </div>
      )}

      {/* === HEADER === */}
      <header className={`flex justify-between items-center mb-6 ${t.card} p-4 rounded-2xl border ${t.border} shadow-sm shrink-0`}>
        <div className="flex items-start gap-3">
          <div className={`w-3 h-3 ${theme === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full mt-1.5 shadow-sm`}></div>
          <div><h1 className={`text-sm font-bold ${t.mut} uppercase`}>Hệ Thống Gọi Tên</h1><h2 className={`text-[15px] font-black ${t.text} tracking-widest uppercase mt-1`}>🎯 12 CHẾ ĐỘ NGẪU NHIÊN</h2></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-center">
            <div className="w-12"><p className={`text-[10px] ${t.mut} font-bold`}>SỈ SỐ</p><p className={`text-xl font-black ${t.acc}`}>{students.length}</p></div>
            <div className="w-12"><p className={`text-[10px] ${t.mut} font-bold`}>ĐÃ GỌI</p><p className={`text-xl font-black ${theme === 'emerald' ? 'text-emerald-600' : 'text-orange-500'}`}>{history.length}</p></div>
          </div>
          <div className={`h-8 w-px ${t.line}`}></div>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className={`h-14 px-4 border ${t.border} rounded-2xl flex flex-col items-center justify-center transition hover:bg-slate-100 hover:shadow-sm`}><span className="text-lg">{theme==="dark"?"🌙":theme==="emerald"?"🌿":"☀️"}</span><span className={`text-[9px] font-bold ${t.mut} mt-1`}>{theme==="dark"?"TỐI":theme==="emerald"?"MINT":"SÁNG"}</span></button>
            <button onClick={toggleMusic} className={`h-14 w-16 border ${t.border} rounded-2xl flex flex-col items-center justify-center transition ${musicOn?t.accBg:'hover:bg-slate-100 hover:shadow-sm'}`}><span className={`text-lg ${musicOn?t.acc:t.mut}`}>🎵</span><span className={`text-[9px] font-bold ${musicOn?t.acc:t.mut} mt-1`}>NHẠC</span></button>
            <button onClick={toggleSfx} className={`h-14 w-16 border ${t.border} rounded-2xl flex flex-col items-center justify-center transition ${sfxOn?t.accBg:'hover:bg-slate-100 hover:shadow-sm'}`}><span className={`text-lg ${sfxOn?t.acc:t.mut}`}>🔊</span><span className={`text-[9px] font-bold ${sfxOn?t.acc:t.mut} mt-1`}>SFX</span></button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* CỘT TRÁI */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 min-h-0">
            <div className={`${t.card} border ${t.border} p-5 rounded-2xl shadow-sm flex flex-col flex-1 min-h-0`}>
              <div className="flex justify-between items-center mb-4"><h2 className={`font-bold text-xs ${t.mut} tracking-wider`}>📄 DANH SÁCH LỚP</h2></div>
              <div className="flex gap-2 mb-4">
                <button onClick={loadSample} className={`flex-1 border ${t.border} ${theme === 'emerald' ? 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300' : 'hover:bg-slate-100 hover:text-slate-800'} text-[10px] font-bold py-2.5 rounded-xl transition ${t.mut}`}>🔀 TẢI MẪU</button>
                <button onClick={handleClearList} className="flex-1 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-400 text-[10px] font-bold py-2.5 rounded-xl transition">🗑 XÓA HẾT</button>
              </div>
              <textarea className={`w-full h-36 bg-transparent border ${t.border} rounded-xl p-3 text-xs ${t.text} font-bold focus:outline-none focus:border-${theme === 'emerald' ? 'emerald-500' : 'orange-400'} mb-4 custom-scrollbar resize-none shrink-0`} placeholder="Nhập danh sách học sinh..." value={rawText} onChange={(e) => setRawText(e.target.value)}></textarea>
              
              <button onClick={handleUpdateList} className={`w-full ${theme === 'emerald' ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700' : `${t.accBg} border-2 ${t.accBorder} ${t.acc}`} font-black py-3 rounded-xl mb-4 hover:shadow-md active:scale-95 uppercase text-xs tracking-widest shrink-0 transition-colors`}>CẬP DANH SÁCH</button>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
                {students.map((s, idx) => (
                  <div key={idx} className={`bg-transparent border ${t.border} rounded-xl p-3 flex text-xs items-center shadow-sm`}><span className={`${t.mut} font-black w-6`}>{idx+1}.</span><span className={`${t.text} font-black truncate`}>{s}</span></div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT GIỮA */}
          <div className={`col-span-1 lg:col-span-6 ${t.card} border ${t.border} p-6 rounded-2xl shadow-sm flex flex-col min-h-0`}>
            <h2 className={`font-bold text-xs ${t.mut} tracking-wider mb-6`}>🎮 CHỌN GAME TƯƠNG TÁC (12)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {gamesList.map(g => (
                <button key={g.id} onClick={() => openGame(g.id, g.name, g.icon)} className={`bg-transparent border ${t.border} rounded-2xl p-4 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 hover:shadow-md hover:bg-slate-50/50 transition-all group aspect-square`}>
                  <span className="text-4xl group-hover:scale-110 transition-transform drop-shadow-sm">{g.icon}</span>
                  <span className={`text-[10px] font-black text-center ${t.text} group-hover:${t.acc} uppercase tracking-wider px-1`}>{g.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className={`col-span-1 lg:col-span-3 ${t.card} border ${t.border} p-5 rounded-2xl shadow-sm flex flex-col min-h-0`}>
            <div className="flex justify-between items-center mb-6"><h2 className={`font-bold text-xs ${t.mut} tracking-wider`}>🕒 LỊCH SỬ GỌI</h2><button onClick={handleClearHistory} className="text-[10px] text-rose-500 font-bold hover:underline">XÓA</button></div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 relative">
              {history.length > 0 && <div className={`absolute left-1 top-2 bottom-0 w-px ${t.line}`}></div>}
              {history.map((item, idx) => (
                <div key={idx} className="relative pl-5 group">
                  <span className={`absolute -left-[4px] top-1 font-black text-[10px] ${idx === 0 ? (theme === 'emerald' ? 'text-emerald-600 drop-shadow-md' : 'text-orange-500 drop-shadow-md') : 'text-slate-300'}`}>✓</span>
                  <p className={`text-[10px] ${t.mut} font-bold mb-1 ml-3`}>{item.time}</p>
                  <p className={`font-black text-sm truncate ml-3 ${idx === 0 ? (theme === 'emerald' ? 'text-emerald-600' : 'text-orange-600') : t.text}`}>{item.name}</p>
                </div>
              ))}
              {history.length === 0 && <p className={`text-xs ${t.mut} italic text-center mt-10 font-bold`}>Chưa có ai bị gọi...</p>}
            </div>
          </div>
        </div>

        {/* === MÔ TẢ & BẢN QUYỀN === */}
        <div className="mt-8 bg-[#0F172A] rounded-[2rem] p-8 flex flex-col items-center justify-center border-4 border-slate-800/50 shadow-2xl relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/10"></div>
            
            <div className="bg-slate-800/60 border border-slate-700/50 backdrop-blur-md rounded-2xl px-8 py-6 max-w-3xl w-full text-center z-10 mb-6 shadow-inner">
                <h3 className="text-white font-black text-xl sm:text-2xl tracking-[0.1em] mb-3 uppercase">HỆ THỐNG GỌI TÊN NGẪU NHIÊN — ĐỘC QUYỀN</h3>
                <p className="text-emerald-400 font-bold text-sm sm:text-base">12 chế độ tương tác + Hiệu ứng âm thanh sống động → Nâng tầm hứng thú học tập</p>
            </div>

            <div className="flex gap-4 justify-center z-10 mb-6">
                <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 12 Chế Độ</span>
                <span className="bg-orange-900/50 text-orange-400 border border-orange-800 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">🎲 Đa Dạng</span>
                <span className="bg-blue-900/50 text-blue-400 border border-blue-800 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">🔊 Âm Thanh</span>
            </div>

            <div className="text-center z-10 space-y-2 mt-2">
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Phát triển bởi <span className="text-white font-black">THẦY TOÀN A.I</span> — Ứng dụng công nghệ vào giáo dục Toán học</p>
                <p className="text-slate-500 text-[10px] sm:text-xs">Bản quyền © 2026 Hệ thống giáo dục Sky-Line. Mọi dữ liệu được lưu trữ an toàn.</p>
            </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        @keyframes raindrop { 0% { transform: translateY(-100px); opacity: 0; } 10% { opacity: 0.9; } 90% { opacity: 0.9; } 100% { transform: translateY(500px); opacity: 0; } } .animate-raindrop { animation: raindrop 2s linear infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } } .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } } .animate-confetti-fall { animation-name: confetti-fall; animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); animation-fill-mode: forwards; }
      `}} />
    </div>
  );
}