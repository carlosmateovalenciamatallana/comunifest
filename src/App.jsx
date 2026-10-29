import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Camera, Image as ImageIcon, Upload, MapPin, Navigation } from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Animación inicial
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Lógica de Cuenta Regresiva (01 Nov 2026, 8:00 AM)
  useEffect(() => {
    const eventDate = new Date('2026-11-01T08:00:00').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
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

  // OBTENER FOTOS Y ACTIVAR TIEMPO REAL CON SUPABASE
  useEffect(() => {
    // Cargar las fotos que ya existen
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('galeria')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setPhotos(data);
    };
    fetchPhotos();

    // Suscribirse a cambios en tiempo real (El Live Feed)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'galeria' },
        (payload) => {
          // Apenas alguien sube una foto, se agrega al instante al inicio de la lista
          setPhotos((currentPhotos) => [payload.new, ...currentPhotos]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // SUBIR FOTO A SUPABASE STORAGE Y REGISTRAR EN LA BASE DE DATOS
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Subir la imagen física al Storage
      const { error: uploadError } = await supabase.storage
        .from('fotos_evento')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener la URL pública de la imagen que acabamos de subir
      const { data } = supabase.storage
        .from('fotos_evento')
        .getPublicUrl(fileName);

      // Guardar esa URL en la base de datos para que dispare el tiempo real
      const { error: dbError } = await supabase
        .from('galeria')
        .insert([{ url: data.publicUrl }]);

      if (dbError) throw dbError;

    } catch (error) {
      console.error("Error al subir foto:", error);
      alert("Hubo un error al compartir tu foto.");
    } finally {
      setUploading(false);
    }
  };

  const scheduleData = [
    { hora: "07:30 AM", actividad: "Salida Buses desde Manizales", detalle: "Punto de encuentro principal" },
    { hora: "09:00 AM", actividad: "Registro e Ingreso en Finca", detalle: "Entrega de manillas" },
    { hora: "09:30 AM", actividad: "Bienvenida", detalle: "Integración inicial" },
    { hora: "09:45 AM", actividad: "Entrega Refrigerio", detalle: "Saludos de bienvenida y convivencia Inicial" },
    { hora: "10:30 AM", actividad: "Tiempo de Alabanza", detalle: "Música en vivo" },
    { hora: "11:00 AM", actividad: "Enseñanza", detalle: "Tiempo de Palabra" },
    { hora: "12:00 PM", actividad: "Almuerzo", detalle: "Tiempo libre para almorzar y compartir" },
    { hora: "12:45 PM", actividad: "Tiempo Libre", detalle: "Tiempo para compartir en familia" },
    { hora: "01:30 PM", actividad: "Actividades de la Tarde", detalle: "Juegos y dinámicas" },
    { hora: "04:00 PM", actividad: "Tiempo Libre", detalle: "Tiempo para compartir en familia" },
    { hora: "05:00 PM", actividad: "Actividad de Cierre", detalle: "Oración y Cierre" },
    { hora: "05:30 PM", actividad: "Retorno a Manizales", detalle: "Abordaje puntual de buses" }
  ];

  return (
    <div className="min-h-screen bg-[#050510] text-white pb-24 font-sans selection:bg-neonMagenta selection:text-white">
      
      {/* Header Estilo Flyer */}
      <header className={`pt-12 pb-8 px-4 text-center bg-gradient-to-b from-[#1a0033] to-[#050510] border-b border-neonMagenta/20 shadow-[0_0_30px_rgba(255,0,234,0.15)] transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <h1 className="text-6xl font-black italic tracking-tighter mb-2">
          <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">COMUNI</span>
          <span className="text-neonCyan neon-text-cyan ml-1">FEST</span>
        </h1>
        <p className="text-lg font-medium mt-3 tracking-wide text-gray-300">
          somos una <span className="text-neonCyan font-bold drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">familia</span>, un solo <span className="text-neonMagenta font-bold drop-shadow-[0_0_8px_rgba(255,0,234,0.5)]">corazón</span>
        </p>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-md mx-auto p-5 mt-2">
        
        {/* PESTAÑA INICIO */}
        {activeTab === 'inicio' && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-gray-900/40 border border-neonCyan/30 rounded-3xl p-6 text-center backdrop-blur-md shadow-[0_0_20px_rgba(0,243,255,0.1)] transition-transform hover:scale-[1.02] duration-300">
              <h2 className="text-neonCyan font-bold text-sm tracking-widest mb-6 flex justify-center items-center gap-2 uppercase">
                <Clock className="w-5 h-5" /> Faltan para el evento
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'DÍAS', value: timeLeft.dias },
                  { label: 'HRS', value: timeLeft.horas },
                  { label: 'MIN', value: timeLeft.minutos },
                  { label: 'SEG', value: timeLeft.segundos }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="bg-black/60 border border-neonMagenta/40 w-full py-4 rounded-xl text-3xl font-black text-white shadow-[inset_0_0_15px_rgba(255,0,234,0.15)] flex items-center justify-center relative overflow-hidden">
                      <span className="relative z-10">{item.value.toString().padStart(2, '0')}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-3 font-bold tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tarjetas de Información */}
            <div className="space-y-4 pt-2">
              
              {/* 1. Tarjeta de Fecha */}
              <div className="group flex items-center gap-4 bg-gray-900/30 border border-gray-800/50 p-5 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-neonCyan/50 hover:bg-gray-900/50">
                <div className="bg-black p-3 rounded-full border border-neonCyan/30 group-hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all">
                  <Calendar className="text-neonCyan w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-neonCyan font-bold tracking-wider mb-1">FECHA DEL EVENTO</p>
                  <p className="font-semibold text-gray-200 text-lg">01 de noviembre de 2026</p>
                </div>
              </div>

              {/* 2. Tarjeta de Horario */}
              <div className="group flex items-center gap-4 bg-gray-900/30 border border-gray-800/50 p-5 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-neonMagenta/50 hover:bg-gray-900/50">
                <div className="bg-black p-3 rounded-full border border-neonMagenta/30 group-hover:shadow-[0_0_15px_rgba(255,0,234,0.3)] transition-all">
                  <Clock className="text-neonMagenta w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-neonMagenta font-bold tracking-wider mb-1">HORARIO</p>
                  <p className="font-semibold text-gray-200 text-lg">8:00 am - 6:00 pm</p>
                </div>
              </div>

             {/* 3. Tarjeta de Ubicación con MAPA INTERACTIVO */}
              <div className="group bg-gray-900/30 border border-gray-800/50 p-5 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-gray-900/50 overflow-hidden">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-black p-3 rounded-full border border-gray-600 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">
                    <MapPin className="text-white w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold tracking-wider mb-1">PUNTO DE ENCUENTRO</p>
                    <p className="font-semibold text-gray-200 text-lg leading-tight mb-1">Sede Comunidad Cristiana de Fé</p>
                    <p className="text-sm text-gray-500">Manizales, Caldas</p>
                  </div>
                </div>

                {/* Contenedor del Mapa Incrustado */}
                <div className="w-full rounded-xl overflow-hidden border border-gray-700 mb-4 bg-gray-800">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d295.3855670496733!2d-75.5184498572379!3d5.068280550912243!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e476f9fc9a7e9c5%3A0xa94da6953aab8cc6!2sComunidad%20Cristiana%20de%20Fe!5e0!3m2!1ses-419!2sco!4v1791516057204!5m2!1ses-419!2sco" 
                    width="100%" 
                    height="220" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="strict-origin-when-cross-origin"
                  ></iframe>
                </div>
                
                <a 
                  href="https://maps.app.goo.gl/7HF98yB1bQdnrebt9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full justify-center active:scale-95"
                >
                  <Navigation className="w-4 h-4" /> Abrir en App de GPS
                </a>
              </div>

            </div>
          </div>
        )}

        {/* PESTAÑA CRONOGRAMA */}
        {activeTab === 'cronograma' && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center justify-center gap-3 mb-10">
              <Calendar className="text-neonMagenta w-7 h-7" />
              <h2 className="text-3xl font-black text-white tracking-tight">Programación</h2>
            </div>
            
            <div className="relative border-l-2 border-neonCyan/20 ml-5 space-y-8 pb-4">
              {scheduleData.map((item, index) => (
                <div key={index} className="relative pl-8 group cursor-default">
                  <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-black border-2 border-neonCyan shadow-[0_0_10px_rgba(0,243,255,0.5)] group-hover:scale-125 group-hover:bg-neonCyan transition-all duration-300"></div>
                  
                  <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 group-hover:border-neonMagenta/40 group-hover:transform group-hover:translate-x-1 group-hover:bg-gray-900/60">
                    <span className="inline-block text-neonMagenta font-bold text-xs tracking-wider bg-black/80 px-3 py-1.5 rounded-lg border border-neonMagenta/20 mb-3">
                      {item.hora}
                    </span>
                    <h3 className="text-white font-bold text-lg mb-1">{item.actividad}</h3>
                    <p className="text-gray-400 text-sm">{item.detalle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA GALERÍA */}
        {activeTab === 'galeria' && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">
                <ImageIcon className="text-neonCyan w-7 h-7" /> Galería
              </h2>
              
              <label className="bg-neonMagenta hover:bg-fuchsia-600 text-white px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,234,0.3)] hover:scale-105 hover:shadow-[0_0_25px_rgba(255,0,234,0.5)]">
                {uploading ? 'Subiendo...' : <><Upload className="w-5 h-5" /> Subir Foto</>}
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

            <div className="grid grid-cols-2 gap-4">
              {photos.length === 0 && !uploading && (
                <div className="col-span-2 text-center text-gray-400 py-12 bg-gray-900/30 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-50 text-neonCyan" />
                  <p className="text-sm font-medium">Aún no hay fotos.</p>
                  <p className="text-xs mt-1">¡Sé el primero en capturar un momento!</p>
                </div>
              )}
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800/50 shadow-lg hover:border-neonCyan/40 transition-all duration-300 group cursor-pointer relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                  <img src={photo.url} alt="Momento Comuni Fest" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Menú de Navegación Inferior Flotante */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#0a0a1a]/80 backdrop-blur-xl border border-gray-800 rounded-full px-2 py-2 flex justify-around items-center z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <button 
          onClick={() => setActiveTab('inicio')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all duration-300 ${activeTab === 'inicio' ? 'bg-neonCyan/10 text-neonCyan' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Clock className={`w-5 h-5 ${activeTab === 'inicio' ? 'drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]' : ''}`} />
          <span className={`text-sm font-bold ${activeTab === 'inicio' ? 'block' : 'hidden'}`}>Inicio</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('cronograma')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all duration-300 ${activeTab === 'cronograma' ? 'bg-neonMagenta/10 text-neonMagenta' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'cronograma' ? 'drop-shadow-[0_0_8px_rgba(255,0,234,0.8)]' : ''}`} />
          <span className={`text-sm font-bold ${activeTab === 'cronograma' ? 'block' : 'hidden'}`}>Agenda</span>
        </button>

        <button 
          onClick={() => setActiveTab('galeria')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all duration-300 ${activeTab === 'galeria' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Camera className={`w-5 h-5 ${activeTab === 'galeria' ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`} />
          <span className={`text-sm font-bold ${activeTab === 'galeria' ? 'block' : 'hidden'}`}>Fotos</span>
        </button>
      </nav>
      
    </div>
  );
}