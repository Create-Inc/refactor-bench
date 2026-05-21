"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

export default function HurodeRayaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Video overlay states
  const [videoOverlays, setVideoOverlays] = useState({
    production: true,
    lab: true,
    industrial1: true,
    industrial2: true,
    industrial3: true,
    industrial4: true,
  });

  // Audio player states
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const [waveformBars, setWaveformBars] = useState([]);
  const audioRef = useRef(null);

  const speeds = [1, 1.25, 1.5, 0.75];
  const [speedIndex, setSpeedIndex] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Gagal mengirim pesan");
      return response.json();
    },
    onSuccess: () => {
      toast.success(
        "Pesan berhasil dikirim! Kami akan segera menghubungi Anda.",
      );
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "Terjadi kesalahan, silakan coba lagi.");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate waveform bars
  useEffect(() => {
    const TOTAL_BARS =
      window.innerWidth <= 400 ? 35 : window.innerWidth <= 768 ? 45 : 60;
    const bars = [];
    for (let i = 0; i < TOTAL_BARS; i++) {
      const center = TOTAL_BARS / 2;
      const dist = Math.abs(i - center) / center;
      const base = (1 - dist * 0.5) * 28;
      const rand = (Math.sin(i * 0.7) * 0.3 + Math.random() * 0.5) * 12;
      const height = Math.max(4, base + rand);
      bars.push(height);
    }
    setWaveformBars(bars);
  }, []);

  // Audio player handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setAudioCurrentTime(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);
    const handlePlay = () => setIsAudioPlaying(true);
    const handlePause = () => setIsAudioPlaying(false);
    const handleEnded = () => setIsAudioPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    audio.volume = audioVolume;

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioVolume]);

  const toggleAudioPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isAudioPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const handleWaveformClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    audio.currentTime = ratio * audio.duration;
  };

  const handleSpeedChange = () => {
    const newIndex = (speedIndex + 1) % speeds.length;
    setSpeedIndex(newIndex);
    if (audioRef.current) {
      audioRef.current.playbackRate = speeds[newIndex];
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setAudioVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioVolume > 0) {
      setAudioVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
    } else {
      setAudioVolume(0.8);
      if (audioRef.current) audioRef.current.volume = 0.8;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const playedBars = audioDuration
    ? Math.floor((audioCurrentTime / audioDuration) * waveformBars.length)
    : 0;

  const handleVideoPlay = (videoId) => {
    setVideoOverlays((prev) => ({ ...prev, [videoId]: false }));
  };

  const whatsappLink = "https://wa.me/6285710503901";

  return (
    <div className="min-h-screen bg-white font-inter overflow-x-hidden">
      <Toaster position="top-right" />

      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/92 backdrop-blur-xl border-b border-[#2C3956]/5"
            : "bg-white/92 backdrop-blur-xl border-b border-[#2C3956]/5"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-[#2C3956] to-[#9CAF88] flex-shrink-0"></div>
            <span className="text-[0.72rem] md:text-[1.15rem] font-bold text-[#2C3956] font-montserrat whitespace-nowrap">
              BIO-TEXTURE-HURODE INDONESIA
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:block">
            <ul className="flex gap-8">
              <li>
                <a
                  href="#profile"
                  className="text-[0.9rem] font-medium text-[#2C3956] hover:text-[#D4AF37] transition-colors"
                >
                  Profile
                </a>
              </li>
              <li>
                <a
                  href="#capabilities"
                  className="text-[0.9rem] font-medium text-[#2C3956] hover:text-[#D4AF37] transition-colors"
                >
                  Production
                </a>
              </li>
              <li>
                <a
                  href="#certifications"
                  className="text-[0.9rem] font-medium text-[#2C3956] hover:text-[#D4AF37] transition-colors"
                >
                  BPOM & Halal
                </a>
              </li>
              <li>
                <a
                  href="#inventory"
                  className="text-[0.9rem] font-medium text-[#2C3956] hover:text-[#D4AF37] transition-colors"
                >
                  Inventory
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="text-[0.9rem] font-medium text-[#2C3956] hover:text-[#D4AF37] transition-colors"
                >
                  Testimoni
                </a>
              </li>
              <li>
                <a
                  href="#partners"
                  className="text-[0.9rem] font-medium text-[#2C3956] hover:text-[#D4AF37] transition-colors"
                >
                  Partners
                </a>
              </li>
            </ul>
          </nav>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2 z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span
              className={`w-6 h-[2.5px] bg-[#2C3956] rounded transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-[7.5px]" : ""}`}
            ></span>
            <span
              className={`w-6 h-[2.5px] bg-[#2C3956] rounded transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`w-6 h-[2.5px] bg-[#2C3956] rounded transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-[7.5px]" : ""}`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-lg">
            <nav className="px-8 py-4">
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href="#profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 text-base text-[#2C3956] hover:text-[#D4AF37]"
                  >
                    Profile
                  </a>
                </li>
                <li>
                  <a
                    href="#capabilities"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 text-base text-[#2C3956] hover:text-[#D4AF37]"
                  >
                    Production
                  </a>
                </li>
                <li>
                  <a
                    href="#certifications"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 text-base text-[#2C3956] hover:text-[#D4AF37]"
                  >
                    BPOM & Halal
                  </a>
                </li>
                <li>
                  <a
                    href="#inventory"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 text-base text-[#2C3956] hover:text-[#D4AF37]"
                  >
                    Inventory
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 text-base text-[#2C3956] hover:text-[#D4AF37]"
                  >
                    Testimoni
                  </a>
                </li>
                <li>
                  <a
                    href="#partners"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 text-base text-[#2C3956] hover:text-[#D4AF37]"
                  >
                    Partners
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* WhatsApp Float */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 bg-[#25D366] text-white px-4 md:px-6 py-3 md:py-4 rounded-full flex items-center gap-3 font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <i className="fab fa-whatsapp text-2xl md:text-3xl"></i>
        <span className="hidden md:inline">Hubungi Kami</span>
      </a>

      {/* Hero Section */}
      <section
        id="profile"
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#2C3956] z-0"></div>
        <div
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C3956]/98 to-[#2C3956]/85 z-0"></div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 py-20 md:py-0 w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          <div className="text-white w-full md:w-1/2 text-center md:text-left">
            <div className="inline-block bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-2 rounded text-xs md:text-[0.85rem] font-semibold mb-6 tracking-widest uppercase">
              Partner Usaha Anda
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-[3.2rem] font-bold leading-tight mb-6 font-montserrat">
              Penyedia bahan pengolahan makanan dan minuman.
            </h1>
            <p className="text-base md:text-[1.15rem] text-white/80 mb-8 md:mb-10 max-w-[500px] mx-auto md:mx-0">
              Menggunakan bahan organik dari dalam dan luar negeri melalui
              pengujian lab dan penerapan skala industri.
            </p>
            <a
              href="#capabilities"
              className="inline-block border-2 border-[#D4AF37] text-white px-8 md:px-10 py-3 md:py-4 font-montserrat font-semibold hover:bg-[#D4AF37] hover:text-[#2C3956] transition-all active:scale-95"
            >
              Eksplorasi Proses & Mutu
            </a>
          </div>

          <div className="w-full md:w-[45%] relative">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80"
              alt="CV. Hurode Raya Profile"
              className="w-full h-[280px] md:h-[450px] object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Capabilities / Production Section */}
      <section
        id="capabilities"
        className="bg-white py-16 md:py-24 px-4 md:px-8"
      >
        <div className="max-w-[1280px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#2C3956] mb-4 font-montserrat">
              Produk Unggulan Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
              Produsen bahan pengolahan makanan melalui bahan organik terpilih,
              aman dan halal, dapat meningkatkan omzet usaha anda.
            </p>
            <div className="w-[60px] h-1 bg-[#D4AF37] mx-auto mt-4 rounded"></div>
          </div>

          {/* Main Production Video */}
          <div className="text-center mb-12 md:mb-20 max-w-[350px] mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video
                className="w-full min-h-[350px] object-contain"
                controls
                onPlay={() => handleVideoPlay("production")}
                onPause={() =>
                  setVideoOverlays((prev) => ({ ...prev, production: true }))
                }
                onEnded={() =>
                  setVideoOverlays((prev) => ({ ...prev, production: true }))
                }
                poster="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80"
              >
                <source src="/produksi_bio_texture.mp4" type="video/mp4" />
                Browser Anda tidak mendukung video.
              </video>
              {videoOverlays.production && (
                <div
                  className="absolute inset-0 bg-[#2C3956]/50 flex items-center justify-center cursor-pointer hover:bg-[#2C3956]/30 transition-colors"
                  onClick={() => {
                    const video = document.querySelector("video");
                    if (video) video.play();
                  }}
                >
                  <i className="fas fa-play-circle text-[#D4AF37] text-7xl md:text-8xl drop-shadow-lg hover:scale-110 transition-transform"></i>
                </div>
              )}
            </div>
            <p className="mt-6 text-gray-600 italic text-sm md:text-base">
              Simak proses produksi kami dalam menghasilkan bahan pengolahan
              makanan dan minuman berkualitas.
            </p>
          </div>

          {/* Lab Research Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-12 md:mb-16">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl md:text-3xl font-semibold text-[#2C3956] mb-4 font-montserrat">
                Lab Penelitian & Pengembangan
              </h3>
              <p className="text-gray-600 mb-6 text-base md:text-lg">
                Produk melalui riset laboratorium sebelum percobaan skala
                industri.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-600">
                  <i className="fas fa-flask text-[#9CAF88] text-xl"></i>
                  <span>Melalui tahapan analisis bahan</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <i className="fas fa-microscope text-[#9CAF88] text-xl"></i>
                  <span>Menformulasikan racikan presisi</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <i className="fas fa-atom text-[#9CAF88] text-xl"></i>
                  <span>Melalui pengujian laboratorium dan skala industri</span>
                </li>
              </ul>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black order-1 md:order-2">
              <video
                className="w-full h-[220px] md:h-[250px] object-contain"
                controls
                onPlay={() => handleVideoPlay("lab")}
                onPause={() =>
                  setVideoOverlays((prev) => ({ ...prev, lab: true }))
                }
                onEnded={() =>
                  setVideoOverlays((prev) => ({ ...prev, lab: true }))
                }
                poster="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80"
              >
                <source src="/skalalab.mp4" type="video/mp4" />
                Browser Anda tidak mendukung video.
              </video>
              {videoOverlays.lab && (
                <div
                  className="absolute inset-0 bg-[#2C3956]/50 flex items-center justify-center cursor-pointer hover:bg-[#2C3956]/30 transition-colors"
                  onClick={() => {
                    const videos = document.querySelectorAll("video");
                    if (videos[1]) videos[1].play();
                  }}
                >
                  <i className="fas fa-play-circle text-[#D4AF37] text-6xl drop-shadow-lg hover:scale-110 transition-transform"></i>
                </div>
              )}
            </div>
          </div>

          {/* Industrial Scale Section */}
          <div className="text-center mt-16 mb-12">
            <h3 className="text-2xl md:text-3xl font-semibold text-[#2C3956] mb-3 font-montserrat">
              Penerapan Skala Industri
            </h3>
            <p className="text-gray-600 max-w-[550px] mx-auto mb-12 text-base md:text-lg">
              Penerapan skala industri adalah target kami sehingga teruji sampai
              ke tangan konsumen.
            </p>
            <div className="w-[60px] h-1 bg-[#D4AF37] mx-auto rounded"></div>
          </div>

          {/* 3 Industrial Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {[
              {
                id: "industrial1",
                poster:
                  "https://images.unsplash.com/photo-1581093458791-9d42e72eb4d7?w=400&q=80",
                caption: "Proses mixing bahan baku skala industri",
                src: "/skalaindustri1.mp4",
              },
              {
                id: "industrial2",
                poster:
                  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80",
                caption: "Proses produksi dari hasil mixing bahan baku",
                src: "/skalaindustri2.mp4",
              },
              {
                id: "industrial3",
                poster:
                  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80",
                caption: "Hasil akhir proses produksi skala industri & QC",
                src: "/skalaindustri3.mp4",
              },
            ].map((video, idx) => (
              <div key={video.id}>
                <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black">
                  <video
                    className="w-full h-[220px] md:h-[250px] object-contain"
                    controls
                    onPlay={() => handleVideoPlay(video.id)}
                    onPause={() =>
                      setVideoOverlays((prev) => ({
                        ...prev,
                        [video.id]: true,
                      }))
                    }
                    onEnded={() =>
                      setVideoOverlays((prev) => ({
                        ...prev,
                        [video.id]: true,
                      }))
                    }
                    poster={video.poster}
                  >
                    <source src={video.src} type="video/mp4" />
                    Browser Anda tidak mendukung video.
                  </video>
                  {videoOverlays[video.id] && (
                    <div
                      className="absolute inset-0 bg-[#2C3956]/50 flex items-center justify-center cursor-pointer hover:bg-[#2C3956]/30 transition-colors"
                      onClick={() => {
                        const videos = document.querySelectorAll("video");
                        if (videos[idx + 2]) videos[idx + 2].play();
                      }}
                    >
                      <i className="fas fa-play-circle text-[#D4AF37] text-6xl drop-shadow-lg hover:scale-110 transition-transform"></i>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-sm md:text-base text-gray-600 italic">
                  {video.caption}
                </p>
              </div>
            ))}
          </div>

          {/* Single Centered Video */}
          <div className="max-w-[400px] mx-auto mt-10">
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black">
              <video
                className="w-full h-[220px] md:h-[250px] object-contain"
                controls
                onPlay={() => handleVideoPlay("industrial4")}
                onPause={() =>
                  setVideoOverlays((prev) => ({ ...prev, industrial4: true }))
                }
                onEnded={() =>
                  setVideoOverlays((prev) => ({ ...prev, industrial4: true }))
                }
                poster="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80"
              >
                <source src="/skalaindustri4_kebumen.mp4" type="video/mp4" />
                Browser Anda tidak mendukung video.
              </video>
              {videoOverlays.industrial4 && (
                <div
                  className="absolute inset-0 bg-[#2C3956]/50 flex items-center justify-center cursor-pointer hover:bg-[#2C3956]/30 transition-colors"
                  onClick={() => {
                    const videos = document.querySelectorAll("video");
                    if (videos[5]) videos[5].play();
                  }}
                >
                  <i className="fas fa-play-circle text-[#D4AF37] text-6xl drop-shadow-lg hover:scale-110 transition-transform"></i>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm md:text-base text-gray-600 italic text-center">
              Produksi di PT.Juragan Bakso Kebumen Jawa Tengah
            </p>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section
        id="certifications"
        className="bg-[#F8F9FC] py-16 md:py-24 px-4 md:px-8"
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#2C3956] mb-4 font-montserrat">
              Legalitas & Sertifikasi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
              Keamanan, kesehatan, dan kehalalan produk adalah fondasi utama
              dari setiap layanan kami.
            </p>
            <div className="w-[60px] h-1 bg-[#D4AF37] mx-auto mt-4 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="bg-white border-2 border-[#F8F9FC] rounded-2xl p-8 md:p-12 text-center hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Logo_BPOM.png/200px-Logo_BPOM.png"
                alt="Logo BPOM"
                className="w-auto h-auto max-w-full mx-auto mb-6"
              />
              <h3 className="text-2xl md:text-3xl font-semibold text-[#2C3956] mb-4 font-montserrat">
                Terdaftar di BPOM
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                Setiap produk bahan pengolahan kami telah melewati uji keamanan
                pangan ketat dan terdaftar resmi di Badan Pengawas Obat dan
                Makanan Republik Indonesia (BPOM RI).
              </p>
              <span className="inline-block bg-[#9CAF88]/15 text-[#9CAF88] px-6 py-2 rounded-full font-semibold text-sm">
                <i className="fas fa-check-circle mr-2"></i>
                Verified & Certified
              </span>
            </div>

            <div className="bg-white border-2 border-[#F8F9FC] rounded-2xl p-8 md:p-12 text-center hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Halal_Logo.svg/200px-Halal_Logo.svg.png"
                alt="Logo Halal MUI"
                className="w-auto h-auto max-w-full mx-auto mb-6"
              />
              <h3 className="text-2xl md:text-3xl font-semibold text-[#2C3956] mb-4 font-montserrat">
                Sertifikasi Halal MUI
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                Kami menjamin bahwa rantai pasok, proses produksi, dan
                penyimpanan kami sepenuhnya sesuai dengan standar kehalalan dari
                Majelis Ulama Indonesia (MUI).
              </p>
              <span className="inline-block bg-[#9CAF88]/15 text-[#9CAF88] px-6 py-2 rounded-full font-semibold text-sm">
                <i className="fas fa-check-circle mr-2"></i>
                100% Halal Process
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Section */}
      <section id="inventory" className="bg-white py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#2C3956] mb-4 font-montserrat">
              Stock & Inventory
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
              Seamless logistics and transparent, real-time data management.
            </p>
            <div className="w-[60px] h-1 bg-[#D4AF37] mx-auto mt-4 rounded"></div>
          </div>

          <div className="bg-[#2C3956] rounded-2xl p-6 md:p-8 lg:p-12 text-white shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-white/10 gap-2">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-1">
                  Inventory Management System
                </h3>
                <span className="text-sm text-white/60">
                  Real-time Data Overview
                </span>
              </div>
              <div className="text-[#9CAF88] font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                System Online
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="bg-white/5 p-4 md:p-6 rounded-lg border-l-4 border-[#9CAF88]">
                <h4 className="text-2xl md:text-3xl text-[#D4AF37] mb-2 font-semibold">
                  Ready Stock
                </h4>
                <span className="text-sm text-white/60">Tersedia stok</span>
              </div>
              <div className="bg-white/5 p-4 md:p-6 rounded-lg border-l-4 border-[#9CAF88]">
                <h4 className="text-2xl md:text-3xl text-[#D4AF37] mb-2 font-semibold">
                  Continuous Supply
                </h4>
                <span className="text-sm text-white/60">
                  Pasokan berkesinambungan
                </span>
              </div>
              <div className="bg-white/5 p-4 md:p-6 rounded-lg border-l-4 border-[#9CAF88]">
                <h4 className="text-2xl md:text-3xl text-[#D4AF37] mb-2 font-semibold">
                  Processing time
                </h4>
                <span className="text-sm text-white/60">24h</span>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80"
              alt="Logistics Center"
              className="w-full h-[180px] md:h-[250px] object-cover rounded-lg opacity-80 bg-gray-700"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="bg-[#F8F9FC] py-16 md:py-24 px-4 md:px-8"
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#2C3956] mb-4 font-montserrat">
              Testimoni Klien
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
              Simak respon para konsumen yang sudah menjadi partner bisnis
              Bio-Texture Hurode Indonesia.
            </p>
            <div className="w-[60px] h-1 bg-[#D4AF37] mx-auto mt-4 rounded"></div>
          </div>

          {/* Text Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                text: "Seorang konsumen membuat adonan 40kg, menggunakan bio-texture menghasilkan adonan naik 5kg.",
                name: "Konsumen",
                title: "Bagian produksi",
              },
              {
                text: "Seorang konsumen membuat adonan basreng 16kg, menggunakan bio-texture 0.8% maka meningkatkan adonan bertambah volume 4kg.",
                name: "Konsumen",
                title: "Pengusaha warung bakso",
              },
              {
                text: "Seorang konsumen membuat adonan 15kg, menggunakan bio-texture menghasilkan 22kg adonan.",
                name: "Nikman",
                title: "Konsumen Bio-Texture",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-black/5 relative hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="absolute top-6 right-8 text-6xl text-[#9CAF88] opacity-20">
                  <i className="fas fa-quote-left"></i>
                </div>
                <p className="text-sm md:text-base text-gray-600 italic leading-relaxed mb-8">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-[#2C3956]">
                      {testimonial.name}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {testimonial.title}
                    </span>
                  </div>
                  <div className="flex gap-1 text-[#D4AF37] text-sm">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Audio Testimonial */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#2C3956] to-[#3a4d73] rounded-2xl p-6 md:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-6 lg:gap-10 shadow-2xl overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-1/2 -right-[10%] w-[300px] h-[300px] rounded-full bg-[#9CAF88] opacity-10 pointer-events-none"></div>
              <div className="absolute -bottom-[30%] left-[20%] w-[200px] h-[200px] rounded-full bg-[#D4AF37] opacity-10 pointer-events-none"></div>

              <div className="flex-1 text-center lg:text-left relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/25 text-[#D4AF37] px-3 py-1.5 rounded-full text-xs font-semibold mb-3 uppercase tracking-wide">
                  <i className="fas fa-microphone-alt text-[0.7rem]"></i>
                  Testimoni Audio
                </div>
                <p className="text-white/90 italic text-base md:text-lg leading-relaxed mb-2">
                  "Saya sudah coba 15 kg itu, hasilnya menjadi 22 kg."
                </p>
                <p className="text-[#D4AF37] font-montserrat font-semibold text-base">
                  Pak Nikman{" "}
                  <span className="text-white/50 font-inter font-normal text-sm ml-2">
                    — Konsumen Bio-Texture
                  </span>
                </p>
              </div>

              {/* Audio Player */}
              <div className="w-full lg:w-[320px] relative z-10">
                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  {/* Play/Pause Button */}
                  <button
                    onClick={toggleAudioPlay}
                    className="w-11 h-11 md:w-[52px] md:h-[52px] rounded-full bg-gradient-to-br from-[#D4AF37] to-[#c49b2a] flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95 transition-transform shadow-lg"
                    aria-label="Play/Pause audio"
                  >
                    {isAudioPlaying ? (
                      <div className="w-[14px] h-[14px] md:w-[18px] md:h-[18px] border-l-[4px] md:border-l-[5px] border-r-[4px] md:border-r-[5px] border-[#2C3956]"></div>
                    ) : (
                      <div className="w-0 h-0 border-l-[12px] md:border-l-[18px] border-t-[7px] md:border-t-[10px] border-b-[7px] md:border-b-[10px] border-l-[#2C3956] border-t-transparent border-b-transparent ml-1"></div>
                    )}
                  </button>

                  {/* Waveform Progress */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={handleWaveformClick}
                  >
                    <div className="flex items-end gap-[1px] md:gap-[2px] h-8 md:h-9 mb-2 px-[2px]">
                      {waveformBars.map((height, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 min-w-[2px] max-w-[5px] rounded transition-colors ${
                            idx < playedBars
                              ? "bg-[#D4AF37] hover:bg-[#e0bf4a]"
                              : "bg-white/20 hover:bg-white/40"
                          }`}
                          style={{ height: `${height}px` }}
                        ></div>
                      ))}
                    </div>

                    {/* Time Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[0.75rem] text-white/50 font-medium tabular-nums">
                        {formatTime(audioCurrentTime)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeedChange();
                        }}
                        className="bg-white/8 border border-white/10 text-white/60 px-2 py-1 rounded text-[0.7rem] font-semibold hover:bg-white/15 hover:text-white/90 transition-all"
                      >
                        {speeds[speedIndex]}x
                      </button>
                      <span className="text-[0.75rem] text-white/35 tabular-nums">
                        {formatTime(audioDuration)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2 mt-2">
                  <i
                    className={`text-white/40 text-xs cursor-pointer hover:text-white/80 transition-colors ${
                      audioVolume === 0
                        ? "fas fa-volume-mute"
                        : audioVolume < 0.5
                          ? "fas fa-volume-down"
                          : "fas fa-volume-up"
                    }`}
                    onClick={toggleMute}
                  ></i>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioVolume * 100}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/15 rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D4AF37] [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#D4AF37] [&::-moz-range-thumb]:border-0"
                  />
                </div>

                {/* Hidden Audio Element */}
                <audio ref={audioRef} preload="metadata">
                  <source src="/testimoni.ogg" type="audio/ogg" />
                  Browser Anda tidak mendukung elemen audio.
                </audio>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section
        id="partners"
        className="bg-[#F8F9FC] py-16 md:py-24 px-4 md:px-8"
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="relative rounded-xl overflow-hidden shadow-xl bg-[#2C3956] order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80"
                alt="Business Partnership"
                className="w-full h-[280px] md:h-[400px] object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="order-1 md:order-2">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#2C3956] mb-2 font-montserrat">
                Kemitraan Strategis
              </h1>
              <h3 className="text-lg md:text-xl text-[#2C3956] mb-4 font-medium">
                Perusahaan Partner Bio-texture:
              </h3>
              <div className="space-y-2 mb-4">
                <p className="text-base font-semibold text-[#333] leading-relaxed">
                  1. UD. Sedap Sari (Tangerang)
                </p>
                <p className="text-base font-semibold text-[#333] leading-relaxed">
                  2. CV. Ujang Bakso Barokah (Sukabumi)
                </p>
                <p className="text-base font-semibold text-[#333] leading-relaxed">
                  3. PT. Cianjur Artha Makmur (Cianjur)
                </p>
                <p className="text-base font-semibold text-[#333] leading-relaxed">
                  4. PT. Juragan Bakso (Jombang)
                </p>
                <p className="text-base font-semibold text-[#333] leading-relaxed">
                  5. UD. Najwa (Soreang-Bandung)
                </p>
                <p className="text-base font-semibold text-[#333] leading-relaxed">
                  6. CV. Lezatku Food Pringsewu
                </p>
              </div>
              <p className="text-[#2C3956] font-medium mt-4">
                Terima kasih atas kerjasama partner semua
              </p>
              <div className="bg-white p-5 md:p-6 rounded-lg shadow-sm border border-gray-100 text-center mt-4">
                <p className="text-sm md:text-base font-semibold text-[#2C3956] leading-relaxed">
                  Tumbuh bersama membangun kolaborasi dalam industri pangan
                  nasional
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="bg-white py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#2C3956] mb-4 font-montserrat">
              Hubungi Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
              Tertarik dengan produk kami? Silakan isi formulir di bawah ini
              atau hubungi kami via WhatsApp.
            </p>
            <div className="w-[60px] h-1 bg-[#D4AF37] mx-auto mt-4 rounded"></div>
          </div>

          <div className="max-w-2xl mx-auto bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-10 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Nama wajib diisi" })}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full border ${errors.name ? "border-red-500" : "border-[#E5E7EB]"} rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3956] transition-all`}
                />
                {errors.name && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("email", {
                      required: "Email wajib diisi",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Email tidak valid",
                      },
                    })}
                    placeholder="budi@email.com"
                    className={`w-full border ${errors.email ? "border-red-500" : "border-[#E5E7EB]"} rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3956] transition-all`}
                  />
                  {errors.email && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.email.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="+62 8..."
                    className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3956] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pesan / Pertanyaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("message", { required: "Pesan wajib diisi" })}
                  placeholder="Tulis pesan Anda di sini..."
                  rows={5}
                  className={`w-full border ${errors.message ? "border-red-500" : "border-[#E5E7EB]"} rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3956] transition-all resize-none`}
                />
                {errors.message && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {errors.message.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-[#2C3956] text-white py-4 rounded-lg font-semibold text-base hover:bg-[#1f2a3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Kirim Pesan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C3956] text-white/70 py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
            <div>
              <h3 className="text-white text-xl font-semibold mb-6">
                CV. Hurode Raya
              </h3>
              <p className="text-sm md:text-base leading-relaxed mb-4">
                Sebuah perusahaan yang bergerak dibidang pengadaan barang dan
                jasa meliputi industri pengolahan, perdagangan besar dan eceran
                dibidang makanan dan minuman.
              </p>
              <p className="text-sm leading-relaxed">
                Struktur Organisasi : Direktur membawahi (Produksi, Marketing,
                Keuangan), Produksi membawahi (Teknik dan QC), Keuangan
                membawahi (Pembelian dan Umum)
              </p>
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-6">Team IT</h3>
              <ul className="space-y-3">
                <li className="text-sm md:text-base">Dr. Ade Supriatna, MT.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-6">
                E-Mail & Contact-Person:
              </h3>
              <ul className="space-y-3">
                <li className="text-sm md:text-base break-words">
                  E-mail : huroderayaindonesia1@gmail.com
                </li>
                <li className="text-sm md:text-base break-words">
                  Contact: +6285710503901 (Huda Mulia Aryapratama, S.M.)
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} CV. Hurode Raya
            (Bandung-Indonesia). All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Montserrat:wght@500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .font-montserrat {
          font-family: 'Montserrat', sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }

        [id] {
          scroll-margin-top: 80px;
        }
      `}</style>
    </div>
  );
}
