import { useState } from "react";
import {
  Plane,
  X,
  Calendar,
  MapPinned,
  User,
  Baby,
  Briefcase,
  Users,
  Send,
  CheckCircle,
} from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/constants";

export function FlightBookingModal({ isOpen, onClose, lang }) {
  const [tripType, setTripType] = useState("roundtrip");
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    departDate: "",
    returnDate: "",
    adults: 1,
    children: 0,
    infants: 0,
    class: "economy",
    name: "",
    phone: "",
    notes: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format message for WhatsApp
    let message = `🎫 *طلب حجز تذكرة طيران*\n\n`;
    message += `👤 *الاسم:* ${formData.name}\n`;
    message += `📞 *الهاتف:* ${formData.phone}\n\n`;
    message += `✈️ *تفاصيل الرحلة:*\n`;
    message += `━━━━━━━━━━━━━━━\n`;
    message += `📍 *من:* ${formData.from}\n`;
    message += `📍 *إلى:* ${formData.to}\n`;
    message += `📅 *تاريخ المغادرة:* ${formData.departDate}\n`;
    if (tripType === "roundtrip") {
      message += `📅 *تاريخ العودة:* ${formData.returnDate}\n`;
    }
    message += `🎟️ *نوع الرحلة:* ${tripType === "roundtrip" ? "ذهاب وعودة" : "ذهاب فقط"}\n\n`;
    message += `👥 *عدد المسافرين:*\n`;
    message += `  • بالغين: ${formData.adults}\n`;
    if (formData.children > 0) message += `  • أطفال: ${formData.children}\n`;
    if (formData.infants > 0) message += `  • رضع: ${formData.infants}\n`;
    message += `\n💺 *الدرجة:* ${formData.class === "economy" ? "اقتصادية" : formData.class === "business" ? "بزنس" : "أولى"}\n`;
    if (formData.notes) {
      message += `\n📝 *ملاحظات:* ${formData.notes}\n`;
    }
    message += `\n━━━━━━━━━━━━━━━\n`;
    message += `نرجو منكم تزويدنا بأفضل العروض المتاحة 🙏`;

    if (typeof window !== "undefined") {
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    }
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
      setFormData({
        from: "",
        to: "",
        departDate: "",
        returnDate: "",
        adults: 1,
        children: 0,
        infants: 0,
        class: "economy",
        name: "",
        phone: "",
        notes: "",
      });
      setTripType("roundtrip");
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-l from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plane size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {lang === "ar"
                  ? "حجز تذكرة طيران"
                  : "Réservation de Billet d'Avion"}
              </h2>
              <p className="text-blue-100 text-sm">
                {lang === "ar"
                  ? "املأ النموذج وسنرسل لك أفضل العروض"
                  : "Remplissez le formulaire"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {lang === "ar"
                ? "تم إرسال طلبك بنجاح!"
                : "Demande envoyée avec succès!"}
            </h3>
            <p className="text-gray-600 text-center">
              {lang === "ar"
                ? "سيتواصل معك فريقنا قريباً عبر واتساب بأفضل العروض المتاحة"
                : "Notre équipe vous contactera bientôt"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Trip Type */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-3">
                {lang === "ar" ? "نوع الرحلة" : "Type de Voyage"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTripType("roundtrip")}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    tripType === "roundtrip"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-sm">
                    {lang === "ar" ? "ذهاب وعودة" : "Aller-Retour"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">↔️</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("oneway")}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    tripType === "oneway"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-sm">
                    {lang === "ar" ? "ذهاب فقط" : "Aller Simple"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">→</div>
                </button>
              </div>
            </div>

            {/* From / To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                  <MapPinned size={16} className="text-blue-600" />
                  {lang === "ar" ? "من (المغادرة)" : "De (Départ)"}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.from}
                  onChange={(e) =>
                    setFormData({ ...formData, from: e.target.value })
                  }
                  placeholder={
                    lang === "ar" ? "مثال: الجزائر العاصمة" : "Ex: Alger"
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                  <MapPinned size={16} className="text-orange-600" />
                  {lang === "ar" ? "إلى (الوصول)" : "À (Arrivée)"}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.to}
                  onChange={(e) =>
                    setFormData({ ...formData, to: e.target.value })
                  }
                  placeholder={lang === "ar" ? "مثال: إسطنبول" : "Ex: Istanbul"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-blue-600" />
                  {lang === "ar" ? "تاريخ المغادرة" : "Date de Départ"}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={formData.departDate}
                  onChange={(e) =>
                    setFormData({ ...formData, departDate: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
              {tripType === "roundtrip" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-orange-600" />
                    {lang === "ar" ? "تاريخ العودة" : "Date de Retour"}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    required={tripType === "roundtrip"}
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) =>
                      setFormData({ ...formData, returnDate: e.target.value })
                    }
                    min={
                      formData.departDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>

            {/* Passengers */}
            <div>
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Users size={16} className="text-blue-600" />
                {lang === "ar" ? "عدد المسافرين" : "Nombre de Passagers"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {lang === "ar" ? "بالغين" : "Adultes"}
                      </p>
                      <p className="text-xs text-gray-500">
                        +12 {lang === "ar" ? "سنة" : "ans"}
                      </p>
                    </div>
                    <User size={16} className="text-gray-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          adults: Math.max(1, formData.adults - 1),
                        })
                      }
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700 transition-all"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-semibold text-gray-900">
                      {formData.adults}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          adults: Math.min(9, formData.adults + 1),
                        })
                      }
                      className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center font-bold text-white transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {lang === "ar" ? "أطفال" : "Enfants"}
                      </p>
                      <p className="text-xs text-gray-500">
                        2-11 {lang === "ar" ? "سنة" : "ans"}
                      </p>
                    </div>
                    <User size={14} className="text-gray-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          children: Math.max(0, formData.children - 1),
                        })
                      }
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700 transition-all"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-semibold text-gray-900">
                      {formData.children}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          children: Math.min(9, formData.children + 1),
                        })
                      }
                      className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center font-bold text-white transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {lang === "ar" ? "رضع" : "Bébés"}
                      </p>
                      <p className="text-xs text-gray-500">
                        &lt;2 {lang === "ar" ? "سنة" : "ans"}
                      </p>
                    </div>
                    <Baby size={16} className="text-gray-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          infants: Math.max(0, formData.infants - 1),
                        })
                      }
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700 transition-all"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-semibold text-gray-900">
                      {formData.infants}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          infants: Math.min(4, formData.infants + 1),
                        })
                      }
                      className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center font-bold text-white transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Class */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Briefcase size={16} className="text-blue-600" />
                {lang === "ar" ? "الدرجة" : "Classe"}
              </label>
              <select
                value={formData.class}
                onChange={(e) =>
                  setFormData({ ...formData, class: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
              >
                <option value="economy">
                  {lang === "ar" ? "اقتصادية" : "Économique"}
                </option>
                <option value="business">
                  {lang === "ar" ? "درجة رجال الأعمال" : "Classe Affaires"}
                </option>
                <option value="first">
                  {lang === "ar" ? "الدرجة الأولى" : "Première Classe"}
                </option>
              </select>
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {lang === "ar" ? "معلومات الاتصال" : "Coordonnées"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {lang === "ar" ? "الاسم الكامل" : "Nom Complet"}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={lang === "ar" ? "أدخل اسمك" : "Votre nom"}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {lang === "ar" ? "رقم الهاتف" : "Téléphone"}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+213 XX XX XX XX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {lang === "ar"
                  ? "ملاحظات إضافية (اختياري)"
                  : "Notes Additionnelles"}
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={
                  lang === "ar"
                    ? "أي طلبات خاصة أو ملاحظات..."
                    : "Demandes spéciales..."
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-l from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              <Send size={18} />
              {lang === "ar"
                ? "إرسال الطلب عبر واتساب"
                : "Envoyer via WhatsApp"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              {lang === "ar"
                ? "سيتم فتح واتساب مع رسالة تحتوي على كل التفاصيل"
                : "WhatsApp s'ouvrira avec votre demande"}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
