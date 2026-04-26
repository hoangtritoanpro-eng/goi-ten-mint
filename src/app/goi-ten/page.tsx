"use client";
import React, { useState, useRef, useEffect } from "react";

const Confetti = ({ onComplete }: any) => {
  useEffect(() => { const t = setTimeout(onComplete, 3000); return () => clearTimeout(t); }, [onComplete]);
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} className={`absolute top-[-10%] w-3 h-3 ${['bg-emerald-500', 'bg-blue-500', 'bg-amber-400', 'bg-rose-500'][i % 4]} rounded-full animate-confetti-fall`}
          style={{ left: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 2 + 2}s`, animationDelay: `${Math.random()}s` }}
        />
      ))}
    </div>
  );
};

export default function RandomCaller() {
  const [rawText, setRawText] = useState("Lưu Đức Bảo An\nĐào Nhật Anh\nNguyễn Văn Tuấn Anh\nTrần Hải Bình\nNguyễn Thành Công\nVũ Mạnh Cường\nTạ Quang Hiếu\nHà Trọng Dũng");
  const [students, setStudents] = useState<any[]>(["Lưu Đức Bảo An", "Đào Nhật Anh", "Nguyễn Văn Tuấn Anh", "Trần Hải Bình", "Nguyễn Thành Công", "Vũ Mạnh Cường", "Tạ Quang Hiếu", "Hà Trọng Dũng"]);
  const [history, setHistory] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [game, setGame] = useState<any>({ id: "", name: "", icon: "" });
  const [winner, setWinner] = useState("");
  const [status, setStatus] = useState<any>("idle");
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [theme, setTheme] = useState("emerald");

  const aMusic = useRef<any>(null); const aWin = useRef<any>(null); const aSpin = useRef<any>(null);
  const aDice = useRef<any>(null); const aSlot = useRef<any>(null); const aBomb = useRef<any>(null); 
  const aDuck = useRef<any>(null); const aClap = useRef<any>(null);

  const unlock = () => { 
    setAudioUnlocked(true); 
    [aMusic, aSpin, aDice, aSlot, aBomb, aDuck, aWin, aClap].forEach((ref: any) => {
      if (ref.current) { ref.current.volume = 0; const p = ref.current.play(); if (p) p.catch(()=>{}); }
    });
    setTimeout(() => { if (aMusic.current) aMusic.current.volume = 0.25; }, 100);
  };

  const playSfx = (ref: any) => {
      [aSpin, aDice, aSlot, aBomb, aDuck, aWin, aClap].forEach((r: any) => { if (r.current) { r.current.pause(); r.current.currentTime = 0; } });
      if (ref.current) ref.current.play().catch(() => {});
  };

  const play = (g: any) => {
    if(students.length === 0) return alert("Nhập danh sách lớp!");
    setGame(g); setStatus("playing"); setIsModalOpen(true);
    
    // Phát âm thanh tùy game
    if(g.id===1 || g.id===7 || g.id===9) playSfx(aSpin);
    else if(g.id===2) playSfx(aDuck);
    else if(g.id===3 || g.id===10) playSfx(aBomb);
    else if(g.id===4 || g.id===11) playSfx(aSlot);
    else playSfx(aDice);

    const sel = students[Math.floor(Math.random() * students.length)];
    setTimeout(() => {
      setWinner(sel); setStatus("finished"); setShowConfetti(true);
      playSfx(aWin);
      setTimeout(() => { if(aClap.current) aClap.current.play().catch(()=>{}); }, 1500);
      setHistory((prev: any) => [{ time: new Date().toLocaleTimeString(), name: sel }, ...prev]);
    }, 4000);
  };

  return (
    <div className={`min-h-screen ${theme === 'emerald' ? 'bg-slate-50' : 'bg-slate-900'} p-6 font-sans`}>
      {!audioUnlocked && (
        <div className="fixed inset-0 bg-slate-900 z-[99] flex flex-col items-center justify-center">
          <button onClick={unlock} className="bg-emerald-500 text-white p-6 rounded-full text-2xl font-bold">BẤM VÀO ĐÂY ĐỂ BẮT ĐẦU</button>
        </div>
      )}
      
      <audio ref={aMusic} loop src="/music/nhac-nen.mp3" /> <audio ref={aSpin} loop src="/music/vong-quay.mp3" />
      <audio ref={aDice} src="/music/xuc-xac.mp3" /> <audio ref={aSlot} loop src="/music/may-xeng.mp3" />
      <audio ref={aBomb} loop src="/music/bom-no.mp3" /> <audio ref={aDuck} loop src="/music/vit-keu.mp3" />
      <audio ref={aWin} src="/music/chien-thang.mp3" /> <audio ref={aClap} src="/music/vo-tay.mp3" />
      
      <header className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm mb-6">
        <h1 className="font-black text-emerald-600 text-xl">HỆ THỐNG GỌI TÊN MINT</h1>
        <div className="flex gap-4">
            <div className="text-center"><p className="text-[10px] font-bold">SỈ SỐ</p><p className="text-xl font-black text-emerald-600">{students.length}</p></div>
            <button onClick={() => { if(aMusic.current?.paused) aMusic.current.play(); else aMusic.current?.pause(); }} className="p-2 border rounded-lg text-xl">🎵</button>
            <button onClick={() => setTheme(theme === 'emerald' ? 'dark' : 'emerald')} className="p-2 border rounded-lg text-xl">🌓</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 bg-white p-5 rounded-xl shadow-sm">
          <h2 className="font-bold text-xs mb-4">📄 DANH SÁCH LỚP</h2>
          <textarea className="w-full h-40 border p-2 text-sm mb-4 rounded-lg" value={rawText} onChange={(e)=>setRawText(e.target.value)} />
          <button onClick={()=>setStudents(rawText.split('\n').filter(s=>s.trim()))} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-black mb-4">CẬP NHẬT LỚP</button>
          <div className="h-64 overflow-y-auto">
             {students.map((s, i) => <div key={i} className="p-2 border-b text-sm font-bold">{i+1}. {s}</div>)}
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[ 
            {id:1, name:"VÒNG QUAY", icon:"🎡"}, {id:2, name:"ĐUA VỊT", icon:"🦆"}, {id:3, name:"BOM NỔ", icon:"💣"}, 
            {id:4, name:"MÁY XÈNG", icon:"🎰"}, {id:5, name:"XÚC XẮC", icon:"🎲"}, {id:6, name:"PLINKO", icon:"⚪"},
            {id:7, name:"PHI TIÊU", icon:"🎯"}, {id:8, name:"BÓNG BAY", icon:"🎈"}, {id:9, name:"RÚT BÀI", icon:"🃏"},
            {id:10, name:"MƯA TÊN", icon:"🌧️"}, {id:11, name:"GẮP THÚ", icon:"🪝"}, {id:12, name:"THƯ BÍ ẨN", icon:"💌"}
          ].map(g => (
            <button key={g.id} onClick={()=>play(g)} className="bg-white p-6 rounded-2xl shadow-sm hover:scale-105 transition-transform flex flex-col items-center justify-center h-32 border border-slate-100">
              <span className="text-5xl mb-2">{g.icon}</span>
              <span className="font-black text-[10px] uppercase">{g.name}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-white p-5 rounded-xl shadow-sm overflow-y-auto h-[500px]">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-bold text-xs">🕒 LỊCH SỬ GỌI</h2>
             <button onClick={()=>setHistory([])} className="text-rose-500 font-bold text-xs">XÓA</button>
          </div>
          {history.map((h, i) => <div key={i} className="border-l-4 border-emerald-500 pl-3 mb-4"><p className="text-[10px] text-slate-400">{h.time}</p><p className={`font-black ${i===0?'text-emerald-600':''}`}>{h.name}</p></div>)}
        </div>
      </div>

      <div className="mt-8 bg-slate-800 p-8 rounded-[2rem] text-center text-white border-4 border-slate-700 shadow-xl">
          <h3 className="text-xl font-black mb-2 uppercase tracking-widest">HỆ THỐNG GỌI TÊN THÔNG MINH — ĐỘC QUYỀN</h3>
          <p className="text-emerald-400 mb-6 text-sm">12 chế độ tương tác + âm thanh sống động</p>
          <p className="text-slate-400 text-sm">Phát triển bởi <span className="text-white font-bold">THẦY TOÀN A.I</span> — Sky-Line Education</p>
          <p className="text-slate-500 text-[10px] mt-2">Bản quyền © 2026. Mọi thông tin được bảo mật.</p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-10">
          <button onClick={()=>{setIsModalOpen(false); playSfx({current:null});}} className="absolute top-10 right-10 w-12 h-12 bg-rose-500 text-white rounded-xl font-black">✕</button>
          {status === "playing" ? (
            <div className="text-center"><span className="text-9xl animate-spin inline-block">{game.icon}</span><p className="text-2xl font-black mt-8 tracking-widest">ĐANG CHỌN...</p></div>
          ) : (
            <div className="text-center animate-in zoom-in duration-300">
              <p className="text-emerald-600 font-black mb-4 tracking-[0.3em]">CHÚC MỪNG</p>
              <h2 className="text-7xl font-black mb-10 text-slate-900">{winner}</h2>
              <button onClick={()=>{setIsModalOpen(false); playSfx({current:null});}} className="bg-emerald-500 text-white px-12 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-lg border-2 border-white">SẴN SÀNG PHẢN HỒI</button>
            </div>
          )}
        </div>
      )}

      {showConfetti && <Confetti onComplete={()=>setShowConfetti(false)} />}
      <style>{`@keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } } .animate-confetti-fall { animation-name: confetti-fall; animation-timing-function: linear; animation-fill-mode: forwards; }`}</style>
    </div>
  );
}