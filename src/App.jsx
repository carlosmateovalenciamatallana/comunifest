import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Clock, Image as ImageIcon, Upload } from 'lucide-react';
import { db, storage } from './firebase';
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 1. Lógica de la Cuenta Regresiva (Fecha del flyer: 1 de Noviembre de 2026, 8:00 AM)
  useEffect(() => {
    const eventDate = new Date('2026-11-01T08:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
          horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutos: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          segundos: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Lógica para obtener fotos de Firebase en tiempo real
  useEffect(() => {
    const q = query(collection(db, 'galeria'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPhotos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(fetchedPhotos);
    });
    return () => unsubscribe();
  }, []);

  // 3. Lógica para subir fotos
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `fotos_evento/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error("Error subiendo imagen: ", error);
        setUploading(false);
        alert("Error al subir la imagen");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'galeria'), {
          url: downloadURL,
          timestamp: serverTimestamp()
        });
        setUploading(false);
      }
    );
  };

  // Cronograma de Datos
  const scheduleData = [
    { hora: "08:30 AM", actividad: "Salida Buses desde Manizales", tipo: "transporte" },
    { hora: "09:30 AM", actividad: "Registro e Ingreso en Finca", tipo: "registro" },
    { hora: "10:15 AM", actividad: "Warm-up / Bienvenida", tipo: "general" },
    { hora: "10:45 AM", actividad: "Tiempo de Alabanza", tipo: "espiritual" },
    { hora: "11:45 AM", actividad: "Prédica / Plenaria", tipo: "espiritual" },
    { hora: "01:00 PM", actividad: "Almuerzo y Networking", tipo: "comida" },
    { hora: "02:30 PM", actividad: "Actividades de la Tarde", tipo: "general" },
    { hora: "05:30 PM", actividad: "Retorno a Manizales (Salida)", tipo: "transporte" }
  ];

  return (
    <div className="min-h-screen bg-[#050510] text-white pb-20">
      {/* Header Estilo Flyer */}
      <header className="pt-10 pb-6 px-4 text-center bg-gradient-to-b from-[#1a0033] to-[#050510] border-b border-neonMagenta/30 shadow-[0_0_20px_rgba(255,0,234,0.2)]">
        <h1 className="text-5xl font-black italic tracking-tighter mb-2">
          <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">COMUNI</span>
          <span className="text-neonCyan neon-text-cyan ml-2">FEST</span>
        </h1>
        <p className="text-lg font-semibold mt-2">
          somos una <span className="text-neonCyan">familia</span>, un solo <span className="text-neonMagenta">corazón</span>
        </p>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-md mx-auto p-4 mt-4">
        
        {/* PESTAÑA INICIO - Cuenta Regresiva */}
        {activeTab === 'inicio' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gray-900/80 border border-neonCyan/50 rounded-2xl p-6 text-center backdrop-blur-sm shadow-[0_0_15px_rgba(0,243,255,0.15)]">
              <h2 className="text-neonCyan font-bold text-xl mb-4 flex justify-center items-center gap-2">
                <Clock className="w-6 h-6" /> FALTAN PARA EL EVENTO
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'DÍAS', value: timeLeft.dias },
                  { label: 'HRS', value: timeLeft.horas },
                  { label: 'MIN', value: timeLeft.minutos },
                  { label: 'SEG', value: timeLeft.segundos }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="bg-black border border-neonMagenta/50 w-full py-3 rounded-lg text-2xl font-bold text-white shadow-[inset_0_0_10px_rgba(255,0,234,0.2)]">
                      {item.value}
                    </div>
                    <span className="text-xs text-gray-400 mt-2 font-bold">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-black border border-gray-800 p-4 rounded-xl">
                <Calendar className="text-neonCyan w-8 h-8" />
                <div>
                  <p className="text-xs text-neonCyan font-bold">FECHA DEL EVENTO</p>
                  <p className="font-semibold">01 de noviembre de 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-black border border-gray-800 p-4 rounded-xl">
                <Clock className="text-neonMagenta w-8 h-8" />
                <div>
                  <p className="text-xs text-neonMagenta font-bold">HORARIO</p>
                  <p className="font-semibold">8:00 am - 6:00 pm</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA CRONOGRAMA */}
        {activeTab === 'cronograma' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center text-white flex justify-center items-center gap-2">
              <Calendar className="text-neonMagenta" /> Programación
            </h2>
            <div className="relative border-l-2 border-neonCyan/30 ml-4 space-y-8">
              {scheduleData.map((item, index) => (
                <div key={index} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-black border-2 border-neonCyan shadow-[0_0_8px_rgba(0,243,255,0.8)]"></div>
                  <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 backdrop-blur-md">
                    <span className="text-neonMagenta font-bold text-sm bg-black px-2 py-1 rounded-md border border-neonMagenta/30">{item.hora}</span>
                    <h3 className="text-white font-semibold mt-2 text-lg">{item.actividad}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA GALERÍA */}
        {activeTab === 'galeria' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ImageIcon className="text-neonCyan" /> Galería en Vivo
              </h2>
              
              {/* Botón de Subir Foto */}
              <label className="bg-neonMagenta hover:bg-fuchsia-600 text-white px-4 py-2 rounded-full font-bold cursor-pointer transition flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,234,0.4)]">
                {uploading ? 'Subiendo...' : <><Upload className="w-4 h-4" /> Subir</>}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {photos.length === 0 && !uploading && (
                <div className="col-span-2 text-center text-gray-500 py-10 bg-gray-900/50 rounded-xl border border-gray-800">
                  Aún no hay fotos. ¡Sé el primero en subir una!
                </div>
              )}
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
                  <img src={photo.url} alt="Comuni Fest" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Menú de Navegación Inferior (Mobile First) */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a1a]/90 backdrop-blur-md border-t border-neonCyan/30 px-6 py-3 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('inicio')}
          className={`flex flex-col items-center p-2 transition ${activeTab === 'inicio' ? 'text-neonCyan neon-text-cyan' : 'text-gray-500'}`}
        >
          <Clock className="w-6 h-6 mb-1" />
          <span className="text-xs font-bold">Inicio</span>
        </button>
        <button 
          onClick={() => setActiveTab('cronograma')}
          className={`flex flex-col items-center p-2 transition ${activeTab === 'cronograma' ? 'text-neonMagenta neon-text-magenta' : 'text-gray-500'}`}
        >
          <Calendar className="w-6 h-6 mb-1" />
          <span className="text-xs font-bold">Agenda</span>
        </button>
        <button 
          onClick={() => setActiveTab('galeria')}
          className={`flex flex-col items-center p-2 transition ${activeTab === 'galeria' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-gray-500'}`}
        >
          <Camera className="w-6 h-6 mb-1" />
          <span className="text-xs font-bold">Fotos</span>
        </button>
      </nav>
    </div>
  );
}