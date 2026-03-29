import { useState, useCallback, useMemo, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   MedNav — Accessible Indoor Hospital Navigation
   Hackathon Build: React + Dijkstra + Accessibility + i18n + Sign Language
   ═══════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────
//  DATA LAYER: Hospital Graph
// ─────────────────────────────────────

const ROOMS = {
  entrance:    { x: 310, y: 570, label: "Main Entrance",  labelKey: "entrance",   type: "entrance",   floor: 1 },
  reception:   { x: 310, y: 470, label: "Reception",       labelKey: "reception",  type: "service",    floor: 1 },
  elevator:    { x: 310, y: 360, label: "Elevator",        labelKey: "elevator",   type: "transport",  floor: 1 },
  stairs:      { x: 170, y: 360, label: "Stairs",          labelKey: "stairs",     type: "transport",  floor: 1 },
  emergency:   { x: 510, y: 470, label: "Emergency",       labelKey: "emergency",  type: "critical",   floor: 1 },
  pharmacy:    { x: 110, y: 470, label: "Pharmacy",        labelKey: "pharmacy",   type: "service",    floor: 1 },
  radiology:   { x: 110, y: 265, label: "Radiology",       labelKey: "radiology",  type: "department", floor: 1 },
  lab:         { x: 310, y: 265, label: "Lab & Testing",   labelKey: "lab",        type: "department", floor: 1 },
  cardiology:  { x: 510, y: 265, label: "Cardiology",      labelKey: "cardiology", type: "department", floor: 1 },
  icu:         { x: 510, y: 160, label: "ICU",             labelKey: "icu",        type: "critical",   floor: 1 },
  waitingA:    { x: 510, y: 360, label: "Waiting Area",    labelKey: "waiting",    type: "waiting",    floor: 1 },
  restroom:    { x: 170, y: 160, label: "Restroom",        labelKey: "restroom",   type: "facility",   floor: 1 },
  cafeteria:   { x: 310, y: 160, label: "Cafeteria",       labelKey: "cafeteria",  type: "facility",   floor: 1 },
  maternity:   { x: 110, y: 160, label: "Maternity",       labelKey: "maternity",  type: "department", floor: 1 },
  parking:     { x: 510, y: 570, label: "Parking",         labelKey: "parking",    type: "facility",   floor: 1 },
};

const EDGES = [
  { from: "entrance",  to: "reception",  dist: 100, hasStairs: false, width: "wide" },
  { from: "entrance",  to: "parking",    dist: 200, hasStairs: false, width: "wide" },
  { from: "reception", to: "elevator",   dist: 110, hasStairs: false, width: "wide" },
  { from: "reception", to: "pharmacy",   dist: 200, hasStairs: false, width: "wide" },
  { from: "reception", to: "emergency",  dist: 200, hasStairs: false, width: "wide" },
  { from: "reception", to: "stairs",     dist: 160, hasStairs: false, width: "normal" },
  { from: "elevator",  to: "lab",        dist: 95,  hasStairs: false, width: "wide" },
  { from: "elevator",  to: "waitingA",   dist: 200, hasStairs: false, width: "wide" },
  { from: "elevator",  to: "stairs",     dist: 140, hasStairs: false, width: "normal" },
  { from: "stairs",    to: "radiology",  dist: 105, hasStairs: true,  width: "narrow" },
  { from: "stairs",    to: "pharmacy",   dist: 110, hasStairs: false, width: "normal" },
  { from: "lab",       to: "cardiology", dist: 200, hasStairs: false, width: "normal" },
  { from: "lab",       to: "radiology",  dist: 200, hasStairs: false, width: "normal" },
  { from: "lab",       to: "cafeteria",  dist: 105, hasStairs: false, width: "wide" },
  { from: "cardiology",to: "icu",        dist: 105, hasStairs: false, width: "normal" },
  { from: "cardiology",to: "waitingA",   dist: 95,  hasStairs: false, width: "normal" },
  { from: "cafeteria", to: "restroom",   dist: 140, hasStairs: false, width: "normal" },
  { from: "cafeteria", to: "icu",        dist: 220, hasStairs: false, width: "normal" },
  { from: "radiology", to: "restroom",   dist: 115, hasStairs: false, width: "normal" },
  { from: "radiology", to: "maternity",  dist: 105, hasStairs: false, width: "normal" },
  { from: "restroom",  to: "maternity",  dist: 80,  hasStairs: false, width: "normal" },
  { from: "emergency", to: "waitingA",   dist: 110, hasStairs: false, width: "wide" },
  { from: "emergency", to: "parking",    dist: 100, hasStairs: false, width: "wide" },
];

// ─────────────────────────────────────
//  INTERNATIONALIZATION
// ─────────────────────────────────────

const LANGS = {
  en: { name: "English",  flag: "🇬🇧", dir: "ltr" },
  es: { name: "Español",  flag: "🇪🇸", dir: "ltr" },
  zh: { name: "中文",      flag: "🇨🇳", dir: "ltr" },
  ar: { name: "العربية",   flag: "🇸🇦", dir: "rtl" },
  hi: { name: "हिन्दी",     flag: "🇮🇳", dir: "ltr" },
  fr: { name: "Français", flag: "🇫🇷", dir: "ltr" },
};

const ROOM_LABELS = {
  en: { entrance: "Main Entrance", reception: "Reception", elevator: "Elevator", stairs: "Stairs", emergency: "Emergency", pharmacy: "Pharmacy", radiology: "Radiology", lab: "Lab & Testing", cardiology: "Cardiology", icu: "ICU", waiting: "Waiting Area", restroom: "Restroom", cafeteria: "Cafeteria", maternity: "Maternity", parking: "Parking" },
  es: { entrance: "Entrada Principal", reception: "Recepción", elevator: "Ascensor", stairs: "Escaleras", emergency: "Urgencias", pharmacy: "Farmacia", radiology: "Radiología", lab: "Laboratorio", cardiology: "Cardiología", icu: "UCI", waiting: "Sala de Espera", restroom: "Baño", cafeteria: "Cafetería", maternity: "Maternidad", parking: "Aparcamiento" },
  zh: { entrance: "正门", reception: "前台", elevator: "电梯", stairs: "楼梯", emergency: "急诊", pharmacy: "药房", radiology: "放射科", lab: "检验科", cardiology: "心内科", icu: "重症监护", waiting: "候诊区", restroom: "洗手间", cafeteria: "餐厅", maternity: "产科", parking: "停车场" },
  ar: { entrance: "المدخل الرئيسي", reception: "الاستقبال", elevator: "المصعد", stairs: "الدرج", emergency: "الطوارئ", pharmacy: "الصيدلية", radiology: "الأشعة", lab: "المختبر", cardiology: "القلب", icu: "العناية المركزة", waiting: "الانتظار", restroom: "دورة المياه", cafeteria: "المقهى", maternity: "الولادة", parking: "موقف السيارات" },
  hi: { entrance: "मुख्य प्रवेश", reception: "स्वागत", elevator: "लिफ्ट", stairs: "सीढ़ियाँ", emergency: "आपातकालीन", pharmacy: "दवाखाना", radiology: "रेडियोलॉजी", lab: "प्रयोगशाला", cardiology: "हृदय रोग", icu: "आईसीयू", waiting: "प्रतीक्षा क्षेत्र", restroom: "शौचालय", cafeteria: "कैफ़ेटेरिया", maternity: "प्रसूति", parking: "पार्किंग" },
  fr: { entrance: "Entrée Principale", reception: "Accueil", elevator: "Ascenseur", stairs: "Escaliers", emergency: "Urgences", pharmacy: "Pharmacie", radiology: "Radiologie", lab: "Laboratoire", cardiology: "Cardiologie", icu: "Réanimation", waiting: "Salle d'Attente", restroom: "Toilettes", cafeteria: "Cafétéria", maternity: "Maternité", parking: "Parking" },
};

const UI_TEXT = {
  en: { title: "MedNav", subtitle: "Accessible Hospital Navigation", from: "You are here", to: "Going to", go: "Navigate", reset: "New Route", access: "Accessibility", lang: "Language", wheelchair: "Wheelchair", vision: "Low Vision", hearing: "Hearing", cognitive: "Simplified", step: "Step", arrived: "You have arrived!", dist: "Distance", meters: "m", time: "Est. time", mins: "min", noRoute: "No accessible route found. Try different accessibility settings.", phrases: "Sign Language Phrases", tapPhrase: "Common hospital phrases for quick communication", selectDest: "Select a destination on the map or from the dropdown", navTab: "Navigate", accessTab: "Access", langTab: "Language", phrasesTab: "Phrases", back: "Back", stairsWarning: "⚠ This route includes stairs", wheelchairOk: "✓ Step-free route", emergencyCall: "Emergency", close: "Close" },
  es: { title: "MedNav", subtitle: "Navegación Hospitalaria Accesible", from: "Estás aquí", to: "Destino", go: "Navegar", reset: "Nueva Ruta", access: "Accesibilidad", lang: "Idioma", wheelchair: "Silla de ruedas", vision: "Baja Visión", hearing: "Auditivo", cognitive: "Simplificado", step: "Paso", arrived: "¡Has llegado!", dist: "Distancia", meters: "m", time: "Tiempo est.", mins: "min", noRoute: "No se encontró ruta accesible.", phrases: "Lengua de Señas", tapPhrase: "Frases hospitalarias comunes", selectDest: "Selecciona un destino en el mapa", navTab: "Navegar", accessTab: "Acceso", langTab: "Idioma", phrasesTab: "Señas", back: "Volver", stairsWarning: "⚠ Esta ruta incluye escaleras", wheelchairOk: "✓ Ruta sin escaleras", emergencyCall: "Emergencia", close: "Cerrar" },
  zh: { title: "MedNav", subtitle: "无障碍医院导航", from: "您在这里", to: "前往", go: "开始导航", reset: "新路线", access: "无障碍", lang: "语言", wheelchair: "轮椅", vision: "低视力", hearing: "听力", cognitive: "简化", step: "步骤", arrived: "您已到达！", dist: "距离", meters: "米", time: "预计时间", mins: "分钟", noRoute: "未找到无障碍路线", phrases: "手语短语", tapPhrase: "常用医院短语", selectDest: "在地图上选择目的地", navTab: "导航", accessTab: "无障碍", langTab: "语言", phrasesTab: "手语", back: "返回", stairsWarning: "⚠ 此路线包含楼梯", wheelchairOk: "✓ 无阶梯路线", emergencyCall: "急救", close: "关闭" },
  ar: { title: "MedNav", subtitle: "ملاحة المستشفى الميسرة", from: "أنت هنا", to: "الوجهة", go: "ابدأ", reset: "مسار جديد", access: "إمكانية الوصول", lang: "اللغة", wheelchair: "كرسي متحرك", vision: "ضعف البصر", hearing: "السمع", cognitive: "مبسط", step: "خطوة", arrived: "!لقد وصلت", dist: "المسافة", meters: "م", time: "الوقت المقدر", mins: "دقيقة", noRoute: "لم يتم العثور على مسار", phrases: "لغة الإشارة", tapPhrase: "عبارات شائعة", selectDest: "اختر وجهة على الخريطة", navTab: "ملاحة", accessTab: "وصول", langTab: "لغة", phrasesTab: "إشارة", back: "رجوع", stairsWarning: "⚠ يتضمن درج", wheelchairOk: "✓ بدون درج", emergencyCall: "طوارئ", close: "إغلاق" },
  hi: { title: "MedNav", subtitle: "सुलभ अस्पताल नेविगेशन", from: "आप यहाँ हैं", to: "जाना है", go: "नेविगेट करें", reset: "नया मार्ग", access: "सुगम्यता", lang: "भाषा", wheelchair: "व्हीलचेयर", vision: "कम दृष्टि", hearing: "श्रवण", cognitive: "सरल", step: "चरण", arrived: "आप पहुँच गए!", dist: "दूरी", meters: "मी", time: "अनुमानित समय", mins: "मिनट", noRoute: "कोई सुलभ मार्ग नहीं", phrases: "सांकेतिक भाषा", tapPhrase: "अस्पताल के सामान्य वाक्यांश", selectDest: "मानचित्र पर गंतव्य चुनें", navTab: "नेविगेट", accessTab: "सुगम्यता", langTab: "भाषा", phrasesTab: "सांकेतिक", back: "वापस", stairsWarning: "⚠ इस मार्ग में सीढ़ियाँ हैं", wheelchairOk: "✓ सीढ़ी-रहित मार्ग", emergencyCall: "आपातकाल", close: "बंद" },
  fr: { title: "MedNav", subtitle: "Navigation Hospitalière Accessible", from: "Vous êtes ici", to: "Destination", go: "Naviguer", reset: "Nouveau Trajet", access: "Accessibilité", lang: "Langue", wheelchair: "Fauteuil roulant", vision: "Malvoyant", hearing: "Auditif", cognitive: "Simplifié", step: "Étape", arrived: "Vous êtes arrivé !", dist: "Distance", meters: "m", time: "Temps est.", mins: "min", noRoute: "Aucun itinéraire accessible trouvé.", phrases: "Langue des Signes", tapPhrase: "Phrases courantes", selectDest: "Sélectionnez une destination", navTab: "Naviguer", accessTab: "Accès", langTab: "Langue", phrasesTab: "Signes", back: "Retour", stairsWarning: "⚠ Escaliers sur le trajet", wheelchairOk: "✓ Trajet sans escaliers", emergencyCall: "Urgence", close: "Fermer" },
};

// ─────────────────────────────────────
//  SIGN LANGUAGE PHRASE DATA
// ─────────────────────────────────────

const SIGN_PHRASES = [
  { emoji: "🤕", en: "I am in pain",             cat: "urgent",  translations: { es: "Tengo dolor", zh: "我很疼", ar: "أنا أتألم", hi: "मुझे दर्द है", fr: "J'ai mal" }},
  { emoji: "💊", en: "I need medication",         cat: "urgent",  translations: { es: "Necesito medicamento", zh: "我需要药", ar: "أحتاج دواء", hi: "मुझे दवा चाहिए", fr: "J'ai besoin de médicaments" }},
  { emoji: "🚻", en: "Where is the restroom?",    cat: "nav",     translations: { es: "¿Dónde está el baño?", zh: "洗手间在哪？", ar: "أين دورة المياه؟", hi: "शौचालय कहाँ है?", fr: "Où sont les toilettes ?" }},
  { emoji: "⏰", en: "How long is the wait?",     cat: "general", translations: { es: "¿Cuánto tiempo de espera?", zh: "需要等多久？", ar: "كم مدة الانتظار؟", hi: "कितना इंतज़ार?", fr: "Combien de temps d'attente ?" }},
  { emoji: "📋", en: "I have an appointment",     cat: "general", translations: { es: "Tengo una cita", zh: "我有预约", ar: "لدي موعد", hi: "मेरा अपॉइंटमेंट है", fr: "J'ai un rendez-vous" }},
  { emoji: "🆘", en: "I need help",               cat: "urgent",  translations: { es: "Necesito ayuda", zh: "我需要帮助", ar: "أحتاج مساعدة", hi: "मुझे मदद चाहिए", fr: "J'ai besoin d'aide" }},
  { emoji: "👨‍⚕️", en: "I need a doctor",           cat: "urgent",  translations: { es: "Necesito un doctor", zh: "我需要医生", ar: "أحتاج طبيب", hi: "मुझे डॉक्टर चाहिए", fr: "J'ai besoin d'un médecin" }},
  { emoji: "💉", en: "I am allergic to...",        cat: "medical", translations: { es: "Soy alérgico a...", zh: "我对...过敏", ar: "...لدي حساسية من", hi: "मुझे...से एलर्जी है", fr: "Je suis allergique à..." }},
  { emoji: "🩺", en: "Check-up visit",            cat: "general", translations: { es: "Visita de control", zh: "体检", ar: "زيارة فحص", hi: "जांच के लिए", fr: "Visite de contrôle" }},
  { emoji: "📞", en: "Call my family",             cat: "general", translations: { es: "Llamen a mi familia", zh: "请联系我家人", ar: "اتصلوا بعائلتي", hi: "मेरे परिवार को बुलाएं", fr: "Appelez ma famille" }},
  { emoji: "🥤", en: "I need water",              cat: "general", translations: { es: "Necesito agua", zh: "我需要水", ar: "أحتاج ماء", hi: "मुझे पानी चाहिए", fr: "J'ai besoin d'eau" }},
  { emoji: "🤰", en: "I am pregnant",             cat: "medical", translations: { es: "Estoy embarazada", zh: "我怀孕了", ar: "أنا حامل", hi: "मैं गर्भवती हूँ", fr: "Je suis enceinte" }},
  { emoji: "😵", en: "I feel dizzy",              cat: "urgent",  translations: { es: "Me siento mareado", zh: "我头晕", ar: "أشعر بدوار", hi: "चक्कर आ रहे हैं", fr: "J'ai des vertiges" }},
  { emoji: "🙏", en: "Thank you",                 cat: "general", translations: { es: "Gracias", zh: "谢谢", ar: "شكراً", hi: "धन्यवाद", fr: "Merci" }},
];

// ─────────────────────────────────────
//  PATHFINDING: Dijkstra's Algorithm
// ─────────────────────────────────────

function dijkstra(start, end, accessModes) {
  // Build adjacency list, filtering edges by accessibility needs
  const graph = {};
  Object.keys(ROOMS).forEach(k => (graph[k] = []));

  EDGES.forEach(e => {
    // Wheelchair: skip stairs and narrow corridors
    if (accessModes.wheelchair && (e.hasStairs || e.width === "narrow")) return;
    // Wheelchair users get slightly higher weights (wider corridors preferred)
    const weight = accessModes.wheelchair ? e.dist * 1.15 : e.dist;
    graph[e.from].push({ node: e.to, weight });
    graph[e.to].push({ node: e.from, weight });
  });

  // Standard Dijkstra
  const dist = {}, prev = {}, visited = new Set();
  Object.keys(ROOMS).forEach(k => (dist[k] = Infinity));
  dist[start] = 0;

  while (true) {
    let u = null, minD = Infinity;
    for (const k of Object.keys(ROOMS)) {
      if (!visited.has(k) && dist[k] < minD) { minD = dist[k]; u = k; }
    }
    if (u === null || u === end) break;
    visited.add(u);
    for (const { node: v, weight: w } of graph[u]) {
      if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; }
    }
  }

  if (dist[end] === Infinity) return null;

  // Reconstruct path
  const path = [];
  let cur = end;
  while (cur !== undefined) { path.unshift(cur); cur = prev[cur]; }

  // Check if route has stairs
  let hasStairs = false;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = EDGES.find(e =>
      (e.from === path[i] && e.to === path[i + 1]) ||
      (e.to === path[i] && e.from === path[i + 1])
    );
    if (edge?.hasStairs) hasStairs = true;
  }

  return { path, distance: Math.round(dist[end]), hasStairs };
}

// Direction helper
function getDirection(from, to) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const absDx = Math.abs(dx), absDy = Math.abs(dy);
  if (absDx > absDy * 1.5) return dx > 0 ? "right" : "left";
  if (absDy > absDx * 1.5) return dy < 0 ? "forward" : "back";
  return dx > 0 ? (dy < 0 ? "forward-right" : "back-right") : (dy < 0 ? "forward-left" : "back-left");
}

const DIR_ARROWS = { right: "→", left: "←", forward: "↑", back: "↓", "forward-right": "↗", "forward-left": "↖", "back-right": "↘", "back-left": "↙" };

function generateDirections(path, lang, simplified) {
  if (!path || path.length < 2) return [];
  const roomLabels = ROOM_LABELS[lang] || ROOM_LABELS.en;
  return path.slice(1).map((roomId, i) => {
    const from = ROOMS[path[i]], to = ROOMS[roomId];
    const dir = getDirection(from, to);
    const arrow = DIR_ARROWS[dir] || "→";
    const dist = Math.round(Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2));
    const label = roomLabels[ROOMS[roomId].labelKey] || ROOMS[roomId].label;
    return { text: simplified ? `${arrow}  ${label}` : `${arrow}  ${label} (~${dist}m)`, roomId, arrow, dist };
  });
}

// ─────────────────────────────────────
//  ROOM ICONS & COLORS
// ─────────────────────────────────────

const ROOM_ICONS = { entrance: "🚪", service: "🏥", transport: "🛗", critical: "🚨", department: "🔬", waiting: "🪑", facility: "☕" };
const TYPE_COLORS = { entrance: "#10B981", service: "#3B82F6", transport: "#8B5CF6", critical: "#EF4444", department: "#F59E0B", waiting: "#6366F1", facility: "#14B8A6" };

// ─────────────────────────────────────
//  THEME SYSTEM
// ─────────────────────────────────────

const THEMES = {
  normal: {
    bg: "#050E1A", card: "#0B1929", surface: "#112240", text: "#CBD5E1",
    heading: "#E2E8F0", accent: "#38BDF8", accentGlow: "rgba(56,189,248,0.15)",
    secondary: "#FB923C", border: "#1E3A5F", muted: "#4A6A8A",
    routeLine: "#38BDF8", routeGlow: "rgba(56,189,248,0.4)",
    success: "#10B981", danger: "#EF4444", warning: "#F59E0B",
    gradientStart: "#050E1A", gradientEnd: "#0B1929",
  },
  highContrast: {
    bg: "#000000", card: "#0A0A0A", surface: "#141414", text: "#FFFFFF",
    heading: "#FFD700", accent: "#00FF88", accentGlow: "rgba(0,255,136,0.25)",
    secondary: "#FF6B35", border: "#FFD700", muted: "#CCCCCC",
    routeLine: "#00FF88", routeGlow: "rgba(0,255,136,0.5)",
    success: "#00FF88", danger: "#FF4444", warning: "#FFD700",
    gradientStart: "#000000", gradientEnd: "#0A0A0A",
  },
};

// ═══════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════

export default function MedNav() {
  const [lang, setLang] = useState("en");
  const [access, setAccess] = useState({ wheelchair: false, vision: false, hearing: false, cognitive: false });
  const [startRoom, setStartRoom] = useState("entrance");
  const [endRoom, setEndRoom] = useState("");
  const [route, setRoute] = useState(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [panel, setPanel] = useState("nav");
  const [expandedPhrase, setExpandedPhrase] = useState(null);
  const [animateIn, setAnimateIn] = useState(true);
  const stepsRef = useRef(null);

  const t = UI_TEXT[lang] || UI_TEXT.en;
  const theme = access.vision ? THEMES.highContrast : THEMES.normal;
  const isRTL = LANGS[lang]?.dir === "rtl";
  const isLarge = access.vision || access.cognitive;
  const base = isLarge ? 17 : 14;
  const roomLabels = ROOM_LABELS[lang] || ROOM_LABELS.en;

  useEffect(() => { setAnimateIn(true); const tm = setTimeout(() => setAnimateIn(false), 600); return () => clearTimeout(tm); }, []);

  const handleNavigate = useCallback(() => {
    if (!startRoom || !endRoom || startRoom === endRoom) return;
    const result = dijkstra(startRoom, endRoom, access);
    setRoute(result);
    setActiveStep(0);
  }, [startRoom, endRoom, access]);

  const handleReset = () => { setRoute(null); setActiveStep(-1); setEndRoom(""); };

  const toggleAccess = (mode) => {
    setAccess(prev => ({ ...prev, [mode]: !prev[mode] }));
    setRoute(null); setActiveStep(-1);
  };

  const directions = useMemo(
    () => route ? generateDirections(route.path, lang, access.cognitive) : [],
    [route, lang, access.cognitive]
  );

  useEffect(() => {
    if (stepsRef.current && activeStep >= 0) {
      const el = stepsRef.current.children[activeStep];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeStep]);

  const mapRoomClick = (id) => { if (!route) { if (!endRoom) setEndRoom(id); else if (id !== endRoom) setEndRoom(id); } };

  // ─── Inline styles ───
  const S = {
    app: {
      fontFamily: "'DM Sans', 'Nunito', system-ui, sans-serif",
      background: `linear-gradient(165deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
      color: theme.text, minHeight: "100vh", fontSize: base, lineHeight: 1.55,
      direction: isRTL ? "rtl" : "ltr", overflow: "hidden",
    },
    header: {
      background: theme.card, borderBottom: `1px solid ${theme.border}`,
      padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "relative", zIndex: 10,
    },
    logo: { display: "flex", alignItems: "center", gap: 10 },
    logoIcon: {
      width: 38, height: 38, borderRadius: 10,
      background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, fontWeight: 900, color: "#fff",
      boxShadow: `0 0 20px ${theme.accentGlow}`,
    },
    tab: (active) => ({
      background: active ? theme.accent : "transparent",
      border: `1.5px solid ${active ? theme.accent : theme.border}`,
      borderRadius: 8, padding: "5px 9px", fontSize: 11, fontWeight: 600,
      cursor: "pointer", color: active ? "#fff" : theme.muted,
      transition: "all 0.2s ease", letterSpacing: 0.3,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
    }),
    map: { flex: 1, position: "relative", overflow: "hidden", minHeight: 280 },
    panel: {
      background: theme.card, borderTop: `1px solid ${theme.border}`,
      padding: "14px 16px", maxHeight: "48vh", overflowY: "auto",
      scrollbarWidth: "thin", scrollbarColor: `${theme.border} transparent`,
    },
    select: {
      width: "100%", padding: "10px 12px", borderRadius: 10,
      border: `1.5px solid ${theme.border}`, background: theme.surface,
      color: theme.text, fontSize: base, outline: "none",
      transition: "border-color 0.2s",
    },
    btn: (enabled) => ({
      width: "100%", padding: "13px", borderRadius: 12, border: "none",
      background: enabled ? `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})` : theme.surface,
      color: enabled ? "#fff" : theme.muted, fontSize: base + 2, fontWeight: 700,
      cursor: enabled ? "pointer" : "default", transition: "all 0.25s ease",
      boxShadow: enabled ? `0 4px 20px ${theme.accentGlow}` : "none",
      letterSpacing: 0.5,
    }),
    badge: (color) => ({
      background: `${color}15`, border: `1px solid ${color}40`,
      borderRadius: 20, padding: "3px 11px", fontSize: base - 2,
      color, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4,
    }),
    stepItem: (active, done) => ({
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", borderRadius: 10, cursor: "pointer",
      background: active ? theme.accentGlow : "transparent",
      border: `1.5px solid ${active ? theme.accent : "transparent"}`,
      transition: "all 0.2s ease", opacity: done ? 0.5 : 1,
    }),
    stepNum: (active, done) => ({
      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
      background: done ? theme.success : active ? theme.accent : theme.surface,
      border: `2px solid ${done ? theme.success : active ? theme.accent : theme.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, color: done || active ? "#fff" : theme.muted,
      transition: "all 0.2s",
    }),
    accessCard: (active, color) => ({
      background: active ? `${color}12` : theme.surface,
      border: `2px solid ${active ? color : theme.border}`,
      borderRadius: 14, padding: "16px 14px", cursor: "pointer",
      transition: "all 0.25s ease", textAlign: isRTL ? "right" : "left",
      position: "relative", overflow: "hidden",
    }),
    phraseCard: (cat) => ({
      background: cat === "urgent" ? `${theme.danger}10` : theme.surface,
      border: `1.5px solid ${cat === "urgent" ? `${theme.danger}50` : theme.border}`,
      borderRadius: 12, padding: "14px 12px", cursor: "pointer",
      transition: "all 0.2s ease", textAlign: "center",
    }),
  };

  // ─── Font import ───
  const fontLink = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800&display=swap";

  return (
    <div style={S.app}>
      <link href={fontLink} rel="stylesheet" />
      <style>{`
        @keyframes pulseRing { 0% { r: 18; opacity: 0.6; } 100% { r: 32; opacity: 0; } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        select:focus { border-color: ${theme.accent} !important; box-shadow: 0 0 0 3px ${theme.accentGlow}; }
        button:hover { filter: brightness(1.08); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={S.header}>
        <div style={S.logo}>
          <div style={S.logoIcon}>M</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: isLarge ? 20 : 17, color: theme.heading, letterSpacing: 0.5 }}>{t.title}</div>
            <div style={{ fontSize: isLarge ? 11 : 9, color: theme.muted, letterSpacing: 0.3 }}>{t.subtitle}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[
            { id: "nav", icon: "🗺️", label: t.navTab },
            { id: "access", icon: "♿", label: t.accessTab },
            { id: "lang", icon: "🌐", label: t.langTab },
            { id: "phrases", icon: "🤟", label: t.phrasesTab },
          ].map(tab => (
            <button key={tab.id} onClick={() => setPanel(tab.id)} style={S.tab(panel === tab.id)} aria-label={tab.label}>
              <span style={{ fontSize: 15 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 62px)" }}>

        {/* ═══ SVG MAP ═══ */}
        <div style={S.map}>
          <svg viewBox="0 80 620 540" style={{ width: "100%", height: "100%" }} role="img" aria-label="Hospital floor map">
            <defs>
              <pattern id="gridDots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="0.6" fill={theme.border} opacity="0.5" />
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={theme.accent} />
                <stop offset="100%" stopColor={theme.secondary} />
              </linearGradient>
            </defs>

            <rect width="620" height="620" fill="url(#gridDots)" />

            {/* Corridor edges */}
            {EDGES.map((e, i) => {
              const from = ROOMS[e.from], to = ROOMS[e.to];
              const onRoute = route?.path && (() => {
                for (let j = 0; j < route.path.length - 1; j++) {
                  if ((route.path[j] === e.from && route.path[j + 1] === e.to) ||
                      (route.path[j] === e.to && route.path[j + 1] === e.from)) return true;
                }
                return false;
              })();
              return (
                <g key={`edge-${i}`}>
                  {onRoute && (
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={theme.routeGlow} strokeWidth="12" strokeLinecap="round" opacity="0.4" />
                  )}
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={onRoute ? "url(#routeGrad)" : theme.border}
                    strokeWidth={onRoute ? 4 : 1.2}
                    strokeDasharray={e.hasStairs ? "8,5" : "none"}
                    strokeLinecap="round"
                    opacity={onRoute ? 1 : 0.35}
                  />
                </g>
              );
            })}

            {/* Route arrows */}
            {route?.path?.slice(0, -1).map((rid, i) => {
              const from = ROOMS[rid], to = ROOMS[route.path[i + 1]];
              const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
              const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
              return (
                <g key={`arr-${i}`} transform={`translate(${mx},${my}) rotate(${angle})`}>
                  <polygon points="-5,-4 6,0 -5,4" fill={theme.accent} opacity={0.85} />
                </g>
              );
            })}

            {/* Room nodes */}
            {Object.entries(ROOMS).map(([id, room]) => {
              const isStart = id === startRoom, isEnd = id === endRoom;
              const onPath = route?.path?.includes(id);
              const isActive = directions[activeStep]?.roomId === id;
              const nodeCol = isStart ? theme.success : isEnd ? theme.secondary : TYPE_COLORS[room.type] || theme.muted;
              const r = isStart || isEnd ? 22 : onPath ? 18 : 15;
              const label = roomLabels[room.labelKey] || room.label;

              return (
                <g key={id} style={{ cursor: route ? "default" : "pointer" }} onClick={() => mapRoomClick(id)} role="button" aria-label={label}>
                  {isActive && (
                    <circle cx={room.x} cy={room.y} r="18" fill="none" stroke={theme.accent} strokeWidth="2.5">
                      <animate attributeName="r" from="18" to="32" dur="1.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="1.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {(isStart || isEnd) && (
                    <circle cx={room.x} cy={room.y} r={r + 5} fill="none" stroke={nodeCol} strokeWidth="1" opacity="0.3" />
                  )}
                  <circle cx={room.x} cy={room.y} r={r}
                    fill={theme.card} stroke={nodeCol}
                    strokeWidth={isStart || isEnd ? 2.5 : onPath ? 2 : 1.2}
                    filter={isActive ? "url(#glow)" : "none"}
                  />
                  <text x={room.x} y={room.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize={isStart || isEnd ? 15 : 12}>
                    {ROOM_ICONS[room.type] || "📍"}
                  </text>
                  <text x={room.x} y={room.y + r + 13} textAnchor="middle"
                    fontSize={access.vision ? 11 : 9} fontWeight={onPath ? 700 : 500}
                    fill={onPath ? theme.heading : theme.muted}>
                    {label}
                  </text>
                  {isStart && (
                    <text x={room.x} y={room.y - r - 8} textAnchor="middle"
                      fontSize="8" fontWeight="700" fill={theme.success} letterSpacing="0.5">
                      {t.from.toUpperCase()}
                    </text>
                  )}
                  {isEnd && (
                    <text x={room.x} y={room.y - r - 8} textAnchor="middle"
                      fontSize="8" fontWeight="700" fill={theme.secondary} letterSpacing="0.5">
                      {t.to.toUpperCase()}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Legend */}
            <g transform="translate(12, 96)">
              <rect width="88" height="60" rx="8" fill={theme.card} stroke={theme.border} strokeWidth="0.8" opacity="0.9" />
              <circle cx="14" cy="16" r="5" fill="none" stroke={theme.success} strokeWidth="1.8" />
              <text x="24" y="19" fontSize="8" fill={theme.muted} fontWeight="500">{t.from}</text>
              <circle cx="14" cy="34" r="5" fill="none" stroke={theme.secondary} strokeWidth="1.8" />
              <text x="24" y="37" fontSize="8" fill={theme.muted} fontWeight="500">{t.to}</text>
              <line x1="9" y1="50" x2="19" y2="50" stroke={theme.muted} strokeWidth="1" strokeDasharray="4,3" />
              <text x="24" y="53" fontSize="8" fill={theme.muted} fontWeight="500">Stairs</text>
            </g>
          </svg>
        </div>

        {/* ═══ BOTTOM PANEL ═══ */}
        <div style={S.panel}>

          {/* ── NAV PANEL ── */}
          {panel === "nav" && !route && (
            <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 130 }}>
                  <label style={{ fontSize: base - 2, color: theme.muted, marginBottom: 5, display: "block", fontWeight: 600 }}>{t.from}</label>
                  <select value={startRoom} onChange={e => setStartRoom(e.target.value)} style={S.select}>
                    {Object.entries(ROOMS).map(([id, r]) => (
                      <option key={id} value={id}>{ROOM_ICONS[r.type]} {roomLabels[r.labelKey] || r.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 130 }}>
                  <label style={{ fontSize: base - 2, color: theme.muted, marginBottom: 5, display: "block", fontWeight: 600 }}>{t.to}</label>
                  <select value={endRoom} onChange={e => setEndRoom(e.target.value)} style={S.select}>
                    <option value="">— {t.selectDest} —</option>
                    {Object.entries(ROOMS).filter(([id]) => id !== startRoom).map(([id, r]) => (
                      <option key={id} value={id}>{ROOM_ICONS[r.type]} {roomLabels[r.labelKey] || r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active accessibility badges */}
              {Object.entries(access).some(([, v]) => v) && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {access.wheelchair && <span style={S.badge(theme.success)}>♿ {t.wheelchair}</span>}
                  {access.vision && <span style={S.badge(theme.warning)}>👁 {t.vision}</span>}
                  {access.hearing && <span style={S.badge("#8B5CF6")}>👂 {t.hearing}</span>}
                  {access.cognitive && <span style={S.badge(theme.secondary)}>🧠 {t.cognitive}</span>}
                </div>
              )}

              <button onClick={handleNavigate} disabled={!endRoom} style={S.btn(!!endRoom)}>
                {t.go}
              </button>
            </div>
          )}

          {/* ── ROUTE RESULTS ── */}
          {panel === "nav" && route && (
            <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
              {/* Route header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, color: theme.success }}>{roomLabels[ROOMS[startRoom]?.labelKey]}</span>
                  <span style={{ color: theme.muted }}>→</span>
                  <span style={{ fontWeight: 800, color: theme.secondary }}>{roomLabels[ROOMS[endRoom]?.labelKey]}</span>
                </div>
                <button onClick={handleReset} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "6px 14px", color: theme.text, cursor: "pointer", fontSize: base - 1, fontWeight: 600 }}>
                  {t.reset}
                </button>
              </div>

              {/* Stats bar */}
              <div style={{ display: "flex", gap: 16, marginBottom: 10, padding: "8px 12px", background: theme.surface, borderRadius: 10, fontSize: base - 1 }}>
                <span style={{ color: theme.muted }}>{t.dist}: <strong style={{ color: theme.heading }}>{route.distance}m</strong></span>
                <span style={{ color: theme.muted }}>{t.time}: <strong style={{ color: theme.heading }}>~{Math.max(1, Math.round(route.distance / 60))}{t.mins}</strong></span>
                {route.hasStairs
                  ? <span style={{ color: theme.warning, fontWeight: 600 }}>{t.stairsWarning}</span>
                  : access.wheelchair && <span style={{ color: theme.success, fontWeight: 600 }}>{t.wheelchairOk}</span>
                }
              </div>

              {route.path ? (
                <div ref={stepsRef} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {directions.map((step, i) => (
                    <div key={i} onClick={() => setActiveStep(i)} style={S.stepItem(i === activeStep, i < activeStep)}>
                      <div style={S.stepNum(i === activeStep, i < activeStep)}>
                        {i < activeStep ? "✓" : i + 1}
                      </div>
                      <span style={{ fontSize: base, fontWeight: i === activeStep ? 700 : 400, color: i === activeStep ? theme.heading : theme.text }}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                  {/* Navigation buttons */}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button disabled={activeStep <= 0} onClick={() => setActiveStep(p => Math.max(0, p - 1))}
                      style={{ ...S.btn(activeStep > 0), flex: 1, padding: "10px", fontSize: base }}>
                      ← {t.back}
                    </button>
                    <button disabled={activeStep >= directions.length - 1} onClick={() => setActiveStep(p => Math.min(directions.length - 1, p + 1))}
                      style={{ ...S.btn(activeStep < directions.length - 1), flex: 1, padding: "10px", fontSize: base }}>
                      {t.step} {activeStep + 2} →
                    </button>
                  </div>
                  {activeStep === directions.length - 1 && (
                    <div style={{ textAlign: "center", padding: "14px", color: theme.success, fontWeight: 800, fontSize: base + 4, animation: "fadeSlideUp 0.4s ease" }}>
                      ✅ {t.arrived}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: "center", color: theme.danger, fontWeight: 600, background: `${theme.danger}10`, borderRadius: 12 }}>
                  {t.noRoute}
                </div>
              )}
            </div>
          )}

          {/* ── ACCESSIBILITY PANEL ── */}
          {panel === "access" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
              <div style={{ fontWeight: 800, fontSize: base + 4, color: theme.heading, marginBottom: 14 }}>{t.access}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { key: "wheelchair", icon: "♿", label: t.wheelchair, desc: "Avoids stairs & narrow corridors. Optimises for wider, step-free routes.", color: theme.success },
                  { key: "vision", icon: "👁", label: t.vision, desc: "High-contrast colours, larger text, enhanced map visibility.", color: theme.warning },
                  { key: "hearing", icon: "👂", label: t.hearing, desc: "Visual-only alerts, vibration cues, sign language quick phrases.", color: "#8B5CF6" },
                  { key: "cognitive", icon: "🧠", label: t.cognitive, desc: "Simplified step-by-step directions. One action per step.", color: theme.secondary },
                ].map(mode => (
                  <button key={mode.key} onClick={() => toggleAccess(mode.key)} style={S.accessCard(access[mode.key], mode.color)}>
                    {access[mode.key] && (
                      <div style={{ position: "absolute", top: 8, right: 10, width: 20, height: 20, borderRadius: "50%", background: mode.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800 }}>✓</div>
                    )}
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{mode.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: base + 1, color: access[mode.key] ? mode.color : theme.heading, marginBottom: 4 }}>{mode.label}</div>
                    <div style={{ fontSize: base - 3, color: theme.muted, lineHeight: 1.4 }}>{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── LANGUAGE PANEL ── */}
          {panel === "lang" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
              <div style={{ fontWeight: 800, fontSize: base + 4, color: theme.heading, marginBottom: 14 }}>{t.lang}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(LANGS).map(([code, info]) => (
                  <button key={code} onClick={() => setLang(code)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                    background: lang === code ? theme.accentGlow : theme.surface,
                    border: `2px solid ${lang === code ? theme.accent : theme.border}`,
                    transition: "all 0.2s",
                  }}>
                    <span style={{ fontSize: 22 }}>{info.flag}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 700, fontSize: base + 1, color: lang === code ? theme.accent : theme.heading }}>{info.name}</div>
                      <div style={{ fontSize: base - 3, color: theme.muted }}>{info.dir === "rtl" ? "RTL" : "LTR"}</div>
                    </div>
                    {lang === code && <span style={{ marginLeft: "auto", color: theme.accent, fontSize: 18, fontWeight: 800 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── SIGN LANGUAGE PHRASES ── */}
          {panel === "phrases" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
              <div style={{ fontWeight: 800, fontSize: base + 4, color: theme.heading, marginBottom: 2 }}>{t.phrases}</div>
              <div style={{ fontSize: base - 2, color: theme.muted, marginBottom: 14 }}>{t.tapPhrase}</div>

              {/* Category filter pills */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {["all", "urgent", "medical", "nav", "general"].map(cat => {
                  const catColors = { urgent: theme.danger, medical: "#8B5CF6", nav: theme.accent, general: theme.muted };
                  const catLabels = { all: "All", urgent: "🚨 Urgent", medical: "🩺 Medical", nav: "🗺️ Navigation", general: "💬 General" };
                  return (
                    <button key={cat} onClick={() => setExpandedPhrase(expandedPhrase === cat ? null : cat)}
                      style={{
                        background: expandedPhrase === cat ? `${catColors[cat] || theme.accent}20` : "transparent",
                        border: `1px solid ${expandedPhrase === cat ? catColors[cat] || theme.accent : theme.border}`,
                        borderRadius: 20, padding: "4px 12px", fontSize: base - 2, fontWeight: 600,
                        color: expandedPhrase === cat ? catColors[cat] || theme.accent : theme.muted,
                        cursor: "pointer", transition: "all 0.2s",
                      }}>
                      {catLabels[cat]}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SIGN_PHRASES
                  .filter(p => !expandedPhrase || expandedPhrase === "all" || p.cat === expandedPhrase)
                  .map((phrase, i) => {
                    const phraseText = lang === "en" ? phrase.en : (phrase.translations[lang] || phrase.en);
                    const catColors = { urgent: theme.danger, medical: "#8B5CF6", nav: theme.accent, general: theme.muted };
                    return (
                      <div key={i} style={S.phraseCard(phrase.cat)}>
                        <div style={{ fontSize: 34, marginBottom: 6 }}>{phrase.emoji}</div>
                        <div style={{ fontSize: base, fontWeight: 700, color: theme.heading, marginBottom: 2 }}>{phraseText}</div>
                        {lang !== "en" && (
                          <div style={{ fontSize: base - 3, color: theme.muted, fontStyle: "italic" }}>{phrase.en}</div>
                        )}
                        <div style={{
                          marginTop: 6, fontSize: 9, padding: "2px 10px", fontWeight: 700, letterSpacing: 0.5,
                          background: `${catColors[phrase.cat]}20`, borderRadius: 10, display: "inline-block",
                          color: catColors[phrase.cat], textTransform: "uppercase",
                        }}>
                          {phrase.cat}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
