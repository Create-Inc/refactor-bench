import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageCircle,
  Send,
  CheckCircle,
} from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/constants";

export function ContactSection({ lang }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const msg = `مرحباً، اسمي ${form.name}، رقمي ${form.phone}، أريد الاستفسار عن: ${form.service}. ${form.message}`;
    if (typeof window !== "undefined") {
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
    }
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="py-20 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-4 py-1.5 rounded-full mb-4 border border-blue-100">
            {lang === "ar" ? "تواصل معنا" : "Contactez-nous"}
          </span>
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
            {lang === "ar" ? "ابدأ رحلتك اليوم" : "Commencez Votre Voyage"}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {lang === "ar"
              ? "فريقنا جاهز للرد على استفساراتك"
              : "Notre équipe est prête à répondre à vos questions"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* WhatsApp Card */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 bg-green-500 text-white p-5 rounded-xl hover:bg-green-600 transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle size={22} />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {lang === "ar"
                    ? "واتساب — تواصل فوري"
                    : "WhatsApp — Contact Direct"}
                </p>
                <p className="text-green-100 text-xs mt-0.5">
                  {lang === "ar" ? "الأسرع في الرد" : "Réponse rapide"}
                </p>
              </div>
            </a>

            {[
              {
                icon: Phone,
                label: lang === "ar" ? "الهاتف" : "Téléphone",
                value: "+213 XX XX XX XX",
              },
              {
                icon: Mail,
                label: lang === "ar" ? "البريد الإلكتروني" : "Email",
                value: "contact@ainmoussa-travel.dz",
              },
              {
                icon: MapPin,
                label: lang === "ar" ? "الموقع" : "Adresse",
                value: lang === "ar" ? "الجزائر" : "Algérie",
              },
              {
                icon: Globe,
                label: lang === "ar" ? "أوقات العمل" : "Horaires",
                value:
                  lang === "ar"
                    ? "السبت — الخميس، 8ص — 6م"
                    : "Sam — Jeu, 8h — 18h",
              },
            ].map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.label}
                  className="flex items-center gap-4 bg-white border border-gray-200 p-4 rounded-xl hover:border-gray-300 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{info.label}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {info.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-5">
              {lang === "ar" ? "أرسل لنا طلبك" : "Envoyez votre demande"}
            </h3>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle size={28} className="text-green-500" />
                </div>
                <p className="font-semibold text-gray-900">
                  {lang === "ar" ? "تم إرسال طلبك!" : "Demande envoyée!"}
                </p>
                <p className="text-sm text-gray-500">
                  {lang === "ar"
                    ? "سيتواصل معك فريقنا قريباً"
                    : "Notre équipe vous contactera bientôt"}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1.5">
                      {lang === "ar" ? "الاسم الكامل *" : "Nom Complet *"}
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder={lang === "ar" ? "أدخل اسمك" : "Votre nom"}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1.5">
                      {lang === "ar" ? "رقم الهاتف *" : "Téléphone *"}
                    </label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+213 XX XX XX XX"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">
                    {lang === "ar" ? "نوع الخدمة" : "Type de Service"}
                  </label>
                  <select
                    value={form.service}
                    onChange={(e) =>
                      setForm({ ...form, service: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">
                      {lang === "ar" ? "اختر الخدمة" : "Choisissez le service"}
                    </option>
                    <option value="تذكرة طيران">
                      {lang === "ar" ? "✈️ تذكرة طيران" : "✈️ Billet d'Avion"}
                    </option>
                    <option value="حجز فندق">
                      {lang === "ar" ? "🏨 حجز فندق" : "🏨 Hôtel"}
                    </option>
                    <option value="فيزا صين">
                      {lang === "ar" ? "🇨🇳 فيزا الصين" : "🇨🇳 Visa Chine"}
                    </option>
                    <option value="فيزا تركيا">
                      {lang === "ar" ? "🇹🇷 فيزا تركيا" : "🇹🇷 Visa Turquie"}
                    </option>
                    <option value="فيزا إلكترونية">
                      {lang === "ar" ? "💻 فيزا إلكترونية" : "💻 e-Visa"}
                    </option>
                    <option value="باقة سياحية">
                      {lang === "ar"
                        ? "🌍 باقة سياحية"
                        : "🌍 Package Touristique"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">
                    {lang === "ar" ? "رسالتك" : "Votre Message"}
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder={
                      lang === "ar"
                        ? "أخبرنا عن رحلتك المطلوبة..."
                        : "Parlez-nous de votre voyage..."
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <Send size={16} />
                  {lang === "ar" ? "إرسال عبر واتساب" : "Envoyer via WhatsApp"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
