import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Upload, Info, Music, Headphones, Activity, Disc, Layers, Library, Server } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8080";

export default function App() {
  const [tab, setTab] = useState('main');
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [info, setInfo] = useState({});

  useEffect(() => {
    if (tab === 'listen') axios.get(`${API_BASE}/songs`).then(r => setSongs(r.data)).catch(e => console.error(e));
    if (tab === 'main') axios.get(`${API_BASE}/main`).then(r => setInfo(r.data)).catch(e => console.error(e));
  }, [tab]);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`${API_BASE}/upload`, formData);
      alert("Track uploaded successfully!");
      setTab('listen');
    } catch (e) { alert("Upload failed!"); }
  };

  const getImageUrl = (path) => {
    if (!path || path === "Unknown Image Path" || path === "") return null;
    if (path.startsWith('storage/')) return `${API_BASE}/${path}`;
    return `${API_BASE}/storage/covers/${path}`;
  };

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">
      <nav className="fixed left-0 top-0 h-full w-20 bg-black border-r border-zinc-900 flex flex-col justify-center items-center gap-8 pb-32 z-50">
        <NavIcon active={tab === 'main'} onClick={() => setTab('main')} icon={<Info />} label="ABOUT" />
        <NavIcon active={tab === 'listen'} onClick={() => setTab('listen')} icon={<Music />} label="TRACKS" />
        <NavIcon active={tab === 'upload'} onClick={() => setTab('upload')} icon={<Upload />} label="UPLOAD" />
      </nav>

      <main className="flex-1 ml-20 p-10 flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* TAB: MAIN (ABOUT) */}
          {tab === 'main' && (
            <motion.div key="main" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="max-w-5xl mx-auto w-full">
              <h1 className="text-7xl font-black tracking-tighter mb-8 italic">
                SOUND<span className="text-soundcloud">CP</span>
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="col-span-full bg-zinc-900/30 border border-zinc-800 p-8 rounded-[40px] shadow-2xl">
                   <h2 className="text-soundcloud font-black uppercase tracking-[0.4em] text-[9px] mb-4">Project Overview</h2>
                   <p className="text-3xl font-light leading-snug">
                     This streaming platform pet project was inspired by <span className="text-white font-bold">SoundCloud</span>. 
                     The backend architecture was engineered by <span className="text-white font-bold">vankos</span>, 
                     while the frontend interface was crafted by <span className="text-white font-bold">Gemini 3.0 PRO</span>.
                   </p>
                </div>

                <InfoCard icon={<Layers size={22} />} title="The Stack" value={info.stack?.replace(/\//g, ', ')} />
                <InfoCard icon={<Library size={22} />} title="Libraries" value={info.library} />
                <InfoCard icon={<Server size={22} />} title="Architecture" value={info.architecture} />
              </div>
            </motion.div>
          )}

          {tab === 'listen' && (
            <motion.div key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto pr-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start scrollbar-hide">
              {songs.length > 0 ? songs.map(song => (
                <SongCard key={song.id} song={song} imageUrl={getImageUrl(song.img_path)} onPlay={() => setCurrentSong(song)} />
              )) : (
                <div className="col-span-full h-full flex items-center justify-center">
                   <p className="text-zinc-800 font-black text-2xl uppercase tracking-[0.2em] italic">Songs not found</p>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center">
              <div className="w-full max-w-xl bg-zinc-900/20 border-2 border-dashed border-zinc-800 p-12 rounded-[50px] flex flex-col items-center hover:border-soundcloud transition-all group">
                <Upload size={48} className="text-soundcloud mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-8 tracking-tight">Push your audio</h3>
                <input type="file" id="fup" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
                <label htmlFor="fup" className="bg-soundcloud text-black font-black px-12 py-3 rounded-full cursor-pointer hover:bg-white transition-colors text-sm uppercase tracking-widest">Select MP3</label>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <AnimatePresence>
        {currentSong && (
          <motion.div initial={{ y: 120 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-xl border-t border-zinc-900 p-4 flex items-center justify-between z-[100] px-12">
            <div className="flex items-center gap-4 w-1/4">
              <div className="w-14 h-14 bg-soundcloud rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {getImageUrl(currentSong.img_path) ? (
                  <img src={getImageUrl(currentSong.img_path)} className="w-full h-full object-cover" />
                ) : (
                  <Disc size={28} color="black" className="animate-spin-slow" />
                )}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-lg font-black truncate leading-tight">{currentSong.title}</h4>
                <p className="text-soundcloud font-bold uppercase text-[9px] tracking-widest">{currentSong.artist}</p>
              </div>
            </div>

            <div className="flex-1 max-w-xl px-10">
              <audio controls autoPlay src={`${API_BASE}/stream/${currentSong.id}`} className="w-full h-8 filter invert brightness-110 contrast-125" />
            </div>

            <div className="w-1/4 flex justify-end">
               <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                  <Activity size={12} /> Playing Live
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavIcon({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`group relative p-4 rounded-2xl transition-all duration-300 ${active ? 'bg-soundcloud text-black shadow-lg scale-110' : 'text-zinc-700 hover:text-soundcloud hover:bg-zinc-900/50'}`}>
      {React.cloneElement(icon, { size: 28, strokeWidth: active ? 2.5 : 2 })}
      <span className="absolute left-24 bg-soundcloud text-black text-[9px] font-black px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

function InfoCard({ icon, title, value }) {
  return (
    <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-[35px] hover:border-soundcloud/30 transition-all group">
      <div className="flex items-center gap-3 mb-3 text-soundcloud">
        {icon}
        <span className="text-[9px] font-black tracking-[0.3em] uppercase opacity-50">{title}</span>
      </div>
      <div className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors truncate">{value || "..."}</div>
    </div>
  );
}

function SongCard({ song, imageUrl, onPlay }) {
  return (
    <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-[40px] hover:bg-zinc-900/30 transition-all group relative">
      <div className="aspect-square bg-zinc-800 rounded-[30px] mb-4 flex items-center justify-center overflow-hidden relative shadow-lg">
        {imageUrl ? (
          <img src={imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Music size={40} className="text-zinc-900 group-hover:text-soundcloud transition-colors" />
        )}
        <button onClick={onPlay} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <div className="bg-soundcloud p-4 rounded-full shadow-lg scale-75 group-hover:scale-100 transition-transform">
            <Play size={24} fill="black" color="black" />
          </div>
        </button>
      </div>
      <h4 className="text-md font-black truncate mb-1 px-1">{song.title}</h4>
      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider px-1">{song.artist}</p>
    </div>
  );
}