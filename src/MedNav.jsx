import { useState, useCallback, useMemo, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   MedNav — Accessible Indoor Hospital Navigation
   🏆 Hackathon Build: Multi-floor | OPD/IPD | Emergency Flow | Accessibility
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── HOSPITAL GRAPH: 5 FLOORS, 55+ ROOMS ───

const ROOMS = {
  // ═══ FLOOR G: Main Entry, Emergency, OPD Reception ═══
  mainGate:     { x:300,y:410, labelKey:"mainGate",    type:"entrance",  floor:0 },
  reception:    { x:300,y:310, labelKey:"reception",   type:"service",   floor:0 },
  emergency:    { x:530,y:410, labelKey:"emergency",   type:"critical",  floor:0 },
  ambulanceBay: { x:530,y:310, labelKey:"ambulanceBay",type:"critical",  floor:0 },
  triage:       { x:530,y:210, labelKey:"triage",      type:"critical",  floor:0 },
  pharmacy:     { x:70, y:410, labelKey:"pharmacy",    type:"service",   floor:0 },
  billing:      { x:70, y:310, labelKey:"billing",     type:"service",   floor:0 },
  liftG:        { x:300,y:210, labelKey:"lift",        type:"transport", floor:0 },
  stairsG:      { x:180,y:210, labelKey:"stairs",      type:"transport", floor:0 },
  restroomG:    { x:70, y:210, labelKey:"restroom",    type:"facility",  floor:0 },
  waitingG:     { x:420,y:310, labelKey:"waiting",     type:"waiting",   floor:0 },
  security:     { x:180,y:410, labelKey:"security",    type:"service",   floor:0 },
  info:         { x:180,y:310, labelKey:"info",        type:"service",   floor:0 },
  parking:      { x:70, y:110, labelKey:"parking",     type:"facility",  floor:0 },
  canteen:      { x:300,y:110, labelKey:"canteen",     type:"facility",  floor:0 },

  // ═══ FLOOR 1: OPD — Outpatient Department ═══
  lift1:        { x:300,y:210, labelKey:"lift",         type:"transport", floor:1 },
  stairs1:      { x:180,y:210, labelKey:"stairs",       type:"transport", floor:1 },
  opdReception: { x:300,y:310, labelKey:"opdReception", type:"service",   floor:1 },
  generalOPD:   { x:70, y:310, labelKey:"generalOPD",   type:"department",floor:1 },
  dental:       { x:70, y:210, labelKey:"dental",       type:"department",floor:1 },
  eye:          { x:70, y:110, labelKey:"eye",          type:"department",floor:1 },
  ent:          { x:180,y:110, labelKey:"ent",          type:"department",floor:1 },
  dermatology:  { x:300,y:110, labelKey:"dermatology",  type:"department",floor:1 },
  orthopedics:  { x:420,y:110, labelKey:"orthopedics",  type:"department",floor:1 },
  gynecology:   { x:530,y:110, labelKey:"gynecology",   type:"department",floor:1 },
  pediatricsOPD:{ x:530,y:210, labelKey:"pediatrics",   type:"department",floor:1 },
  waitingOPD:   { x:420,y:310, labelKey:"waiting",      type:"waiting",   floor:1 },
  restroom1:    { x:530,y:310, labelKey:"restroom",     type:"facility",  floor:1 },
  reportCollect:{ x:180,y:310, labelKey:"reportCollect",type:"service",   floor:1 },

  // ═══ FLOOR 2: Diagnostics & Lab ═══
  lift2:        { x:300,y:210, labelKey:"lift",        type:"transport", floor:2 },
  stairs2:      { x:180,y:210, labelKey:"stairs",      type:"transport", floor:2 },
  labReception: { x:300,y:310, labelKey:"labReception",type:"service",   floor:2 },
  bloodTest:    { x:70, y:310, labelKey:"bloodTest",   type:"department",floor:2 },
  xray:         { x:70, y:210, labelKey:"xray",        type:"department",floor:2 },
  mri:          { x:70, y:110, labelKey:"mri",         type:"department",floor:2 },
  ctScan:       { x:180,y:110, labelKey:"ctScan",      type:"department",floor:2 },
  ultrasound:   { x:300,y:110, labelKey:"ultrasound",  type:"department",floor:2 },
  ecg:          { x:420,y:110, labelKey:"ecg",         type:"department",floor:2 },
  pathology:    { x:530,y:110, labelKey:"pathology",   type:"department",floor:2 },
  radiology:    { x:530,y:210, labelKey:"radiology",   type:"department",floor:2 },
  waitingDiag:  { x:420,y:310, labelKey:"waiting",     type:"waiting",   floor:2 },
  restroom2:    { x:530,y:310, labelKey:"restroom",    type:"facility",  floor:2 },

  // ═══ FLOOR 3: IPD — Inpatient Department / Wards ═══
  lift3:        { x:300,y:210, labelKey:"lift",         type:"transport", floor:3 },
  stairs3:      { x:180,y:210, labelKey:"stairs",       type:"transport", floor:3 },
  ipdReception: { x:300,y:310, labelKey:"ipdReception", type:"service",   floor:3 },
  generalWard:  { x:70, y:310, labelKey:"generalWard",  type:"department",floor:3 },
  privateRoom:  { x:70, y:210, labelKey:"privateRoom",  type:"department",floor:3 },
  semiPrivate:  { x:70, y:110, labelKey:"semiPrivate",  type:"department",floor:3 },
  maternity:    { x:180,y:110, labelKey:"maternity",    type:"department",floor:3 },
  pediatricsIPD:{ x:300,y:110, labelKey:"pediatricsIPD",type:"department",floor:3 },
  nurseStation: { x:420,y:210, labelKey:"nurseStation", type:"service",   floor:3 },
  restroom3:    { x:530,y:310, labelKey:"restroom",     type:"facility",  floor:3 },
  cafeteria:    { x:530,y:110, labelKey:"cafeteria",    type:"facility",  floor:3 },
  chapel:       { x:420,y:110, labelKey:"chapel",       type:"facility",  floor:3 },
  visitorsLounge:{ x:420,y:310,labelKey:"visitorsLounge",type:"waiting",  floor:3 },
  dischargeDesk:{ x:180,y:310, labelKey:"dischargeDesk",type:"service",   floor:3 },

  // ═══ FLOOR 4: Surgery, ICU, Critical Care ═══
  lift4:        { x:300,y:210, labelKey:"lift",        type:"transport", floor:4 },
  stairs4:      { x:180,y:210, labelKey:"stairs",      type:"transport", floor:4 },
  icu:          { x:70, y:310, labelKey:"icu",         type:"critical",  floor:4 },
  nicu:         { x:70, y:210, labelKey:"nicu",        type:"critical",  floor:4 },
  operatingA:   { x:300,y:310, labelKey:"operatingA",  type:"critical",  floor:4 },
  operatingB:   { x:420,y:310, labelKey:"operatingB",  type:"critical",  floor:4 },
  preOp:        { x:300,y:410, labelKey:"preOp",       type:"department",floor:4 },
  recovery:     { x:420,y:410, labelKey:"recovery",    type:"department",floor:4 },
  scrub:        { x:180,y:310, labelKey:"scrub",       type:"service",   floor:4 },
  bloodBank:    { x:70, y:110, labelKey:"bloodBank",   type:"critical",  floor:4 },
  sterilize:    { x:180,y:110, labelKey:"sterilize",   type:"service",   floor:4 },
  waitingSurg:  { x:530,y:310, labelKey:"waiting",     type:"waiting",   floor:4 },
  restroom4:    { x:530,y:210, labelKey:"restroom",    type:"facility",  floor:4 },
  onCallRoom:   { x:530,y:110, labelKey:"onCallRoom",  type:"facility",  floor:4 },
  ccu:          { x:300,y:110, labelKey:"ccu",         type:"critical",  floor:4 },
};

const EDGES = [
  // ═══ Floor G ═══
  {from:"mainGate",to:"reception",dist:100,hasStairs:false,width:"wide"},
  {from:"mainGate",to:"security",dist:120,hasStairs:false,width:"wide"},
  {from:"mainGate",to:"pharmacy",dist:230,hasStairs:false,width:"wide"},
  {from:"mainGate",to:"emergency",dist:230,hasStairs:false,width:"wide"},
  {from:"reception",to:"info",dist:120,hasStairs:false,width:"wide"},
  {from:"reception",to:"waitingG",dist:120,hasStairs:false,width:"wide"},
  {from:"reception",to:"liftG",dist:100,hasStairs:false,width:"wide"},
  {from:"reception",to:"billing",dist:230,hasStairs:false,width:"normal"},
  {from:"info",to:"stairsG",dist:100,hasStairs:false,width:"normal"},
  {from:"info",to:"billing",dist:110,hasStairs:false,width:"normal"},
  {from:"liftG",to:"stairsG",dist:120,hasStairs:false,width:"normal"},
  {from:"liftG",to:"canteen",dist:100,hasStairs:false,width:"normal"},
  {from:"stairsG",to:"restroomG",dist:110,hasStairs:false,width:"normal"},
  {from:"restroomG",to:"parking",dist:100,hasStairs:false,width:"normal"},
  {from:"canteen",to:"parking",dist:230,hasStairs:false,width:"normal"},
  {from:"emergency",to:"waitingG",dist:110,hasStairs:false,width:"wide"},
  {from:"emergency",to:"ambulanceBay",dist:100,hasStairs:false,width:"wide"},
  {from:"ambulanceBay",to:"triage",dist:100,hasStairs:false,width:"wide"},
  {from:"triage",to:"liftG",dist:230,hasStairs:false,width:"normal"},
  {from:"pharmacy",to:"billing",dist:100,hasStairs:false,width:"normal"},
  {from:"security",to:"reception",dist:120,hasStairs:false,width:"normal"},

  // ═══ Floor 1: OPD ═══
  {from:"lift1",to:"stairs1",dist:120,hasStairs:false,width:"normal"},
  {from:"lift1",to:"opdReception",dist:100,hasStairs:false,width:"wide"},
  {from:"lift1",to:"dermatology",dist:100,hasStairs:false,width:"normal"},
  {from:"opdReception",to:"generalOPD",dist:230,hasStairs:false,width:"normal"},
  {from:"opdReception",to:"waitingOPD",dist:120,hasStairs:false,width:"wide"},
  {from:"opdReception",to:"reportCollect",dist:120,hasStairs:false,width:"normal"},
  {from:"stairs1",to:"dental",dist:100,hasStairs:false,width:"normal"},
  {from:"dental",to:"generalOPD",dist:100,hasStairs:false,width:"normal"},
  {from:"dental",to:"eye",dist:100,hasStairs:false,width:"normal"},
  {from:"eye",to:"ent",dist:110,hasStairs:false,width:"normal"},
  {from:"ent",to:"dermatology",dist:120,hasStairs:false,width:"normal"},
  {from:"dermatology",to:"orthopedics",dist:120,hasStairs:false,width:"normal"},
  {from:"orthopedics",to:"gynecology",dist:110,hasStairs:false,width:"normal"},
  {from:"gynecology",to:"pediatricsOPD",dist:100,hasStairs:false,width:"normal"},
  {from:"pediatricsOPD",to:"waitingOPD",dist:110,hasStairs:false,width:"normal"},
  {from:"waitingOPD",to:"restroom1",dist:110,hasStairs:false,width:"normal"},
  {from:"reportCollect",to:"generalOPD",dist:110,hasStairs:false,width:"normal"},
  {from:"reportCollect",to:"stairs1",dist:100,hasStairs:false,width:"normal"},

  // ═══ Floor 2: Diagnostics ═══
  {from:"lift2",to:"stairs2",dist:120,hasStairs:false,width:"normal"},
  {from:"lift2",to:"labReception",dist:100,hasStairs:false,width:"wide"},
  {from:"lift2",to:"ultrasound",dist:100,hasStairs:false,width:"normal"},
  {from:"labReception",to:"bloodTest",dist:230,hasStairs:false,width:"normal"},
  {from:"labReception",to:"waitingDiag",dist:120,hasStairs:false,width:"wide"},
  {from:"stairs2",to:"xray",dist:100,hasStairs:false,width:"normal"},
  {from:"xray",to:"bloodTest",dist:100,hasStairs:false,width:"normal"},
  {from:"xray",to:"mri",dist:100,hasStairs:false,width:"normal"},
  {from:"mri",to:"ctScan",dist:110,hasStairs:false,width:"normal"},
  {from:"ctScan",to:"ultrasound",dist:120,hasStairs:false,width:"normal"},
  {from:"ultrasound",to:"ecg",dist:120,hasStairs:false,width:"normal"},
  {from:"ecg",to:"pathology",dist:110,hasStairs:false,width:"normal"},
  {from:"pathology",to:"radiology",dist:100,hasStairs:false,width:"normal"},
  {from:"radiology",to:"waitingDiag",dist:110,hasStairs:false,width:"normal"},
  {from:"waitingDiag",to:"restroom2",dist:110,hasStairs:false,width:"normal"},

  // ═══ Floor 3: IPD ═══
  {from:"lift3",to:"stairs3",dist:120,hasStairs:false,width:"normal"},
  {from:"lift3",to:"ipdReception",dist:100,hasStairs:false,width:"wide"},
  {from:"lift3",to:"pediatricsIPD",dist:100,hasStairs:false,width:"normal"},
  {from:"ipdReception",to:"generalWard",dist:230,hasStairs:false,width:"normal"},
  {from:"ipdReception",to:"visitorsLounge",dist:120,hasStairs:false,width:"wide"},
  {from:"ipdReception",to:"dischargeDesk",dist:120,hasStairs:false,width:"normal"},
  {from:"stairs3",to:"privateRoom",dist:100,hasStairs:false,width:"normal"},
  {from:"privateRoom",to:"generalWard",dist:100,hasStairs:false,width:"normal"},
  {from:"privateRoom",to:"semiPrivate",dist:100,hasStairs:false,width:"normal"},
  {from:"semiPrivate",to:"maternity",dist:110,hasStairs:false,width:"normal"},
  {from:"maternity",to:"pediatricsIPD",dist:120,hasStairs:false,width:"normal"},
  {from:"pediatricsIPD",to:"chapel",dist:120,hasStairs:false,width:"normal"},
  {from:"chapel",to:"cafeteria",dist:110,hasStairs:false,width:"normal"},
  {from:"chapel",to:"nurseStation",dist:100,hasStairs:false,width:"normal"},
  {from:"nurseStation",to:"lift3",dist:120,hasStairs:false,width:"normal"},
  {from:"visitorsLounge",to:"restroom3",dist:110,hasStairs:false,width:"normal"},
  {from:"dischargeDesk",to:"generalWard",dist:110,hasStairs:false,width:"normal"},
  {from:"dischargeDesk",to:"stairs3",dist:100,hasStairs:false,width:"normal"},

  // ═══ Floor 4: Surgery & ICU ═══
  {from:"lift4",to:"stairs4",dist:120,hasStairs:false,width:"normal"},
  {from:"lift4",to:"operatingA",dist:100,hasStairs:false,width:"wide"},
  {from:"lift4",to:"ccu",dist:100,hasStairs:false,width:"normal"},
  {from:"stairs4",to:"scrub",dist:100,hasStairs:false,width:"normal"},
  {from:"scrub",to:"icu",dist:100,hasStairs:false,width:"normal"},
  {from:"scrub",to:"operatingA",dist:120,hasStairs:false,width:"normal"},
  {from:"icu",to:"nicu",dist:100,hasStairs:false,width:"normal"},
  {from:"nicu",to:"bloodBank",dist:100,hasStairs:false,width:"normal"},
  {from:"bloodBank",to:"sterilize",dist:110,hasStairs:false,width:"normal"},
  {from:"sterilize",to:"ccu",dist:120,hasStairs:false,width:"normal"},
  {from:"ccu",to:"onCallRoom",dist:230,hasStairs:false,width:"normal"},
  {from:"operatingA",to:"operatingB",dist:120,hasStairs:false,width:"normal"},
  {from:"operatingA",to:"preOp",dist:100,hasStairs:false,width:"normal"},
  {from:"operatingB",to:"recovery",dist:100,hasStairs:false,width:"normal"},
  {from:"operatingB",to:"waitingSurg",dist:110,hasStairs:false,width:"normal"},
  {from:"waitingSurg",to:"restroom4",dist:100,hasStairs:false,width:"normal"},
  {from:"restroom4",to:"onCallRoom",dist:100,hasStairs:false,width:"normal"},
  {from:"preOp",to:"recovery",dist:120,hasStairs:false,width:"normal"},

  // ═══ INTER-FLOOR: Lifts (wheelchair OK) ═══
  {from:"liftG",to:"lift1",dist:25,hasStairs:false,width:"wide"},
  {from:"lift1",to:"lift2",dist:25,hasStairs:false,width:"wide"},
  {from:"lift2",to:"lift3",dist:25,hasStairs:false,width:"wide"},
  {from:"lift3",to:"lift4",dist:25,hasStairs:false,width:"wide"},
  // ═══ INTER-FLOOR: Stairs (NOT wheelchair OK) ═══
  {from:"stairsG",to:"stairs1",dist:18,hasStairs:true,width:"narrow"},
  {from:"stairs1",to:"stairs2",dist:18,hasStairs:true,width:"narrow"},
  {from:"stairs2",to:"stairs3",dist:18,hasStairs:true,width:"narrow"},
  {from:"stairs3",to:"stairs4",dist:18,hasStairs:true,width:"narrow"},
];

const FLOOR_INFO = {
  0: { color:"#059669", icon:"🏥", en:"Ground — Emergency & Services",      ar:"الطابق الأرضي — الطوارئ", es:"Planta Baja — Urgencias", zh:"一楼 — 急诊服务", hi:"भूतल — आपातकालीन", fr:"RDC — Urgences" },
  1: { color:"#2563EB", icon:"🩺", en:"Floor 1 — OPD (Outpatient)",          ar:"الطابق ١ — العيادات الخارجية", es:"Piso 1 — Consultas Externas", zh:"二楼 — 门诊部", hi:"मंज़िल 1 — OPD", fr:"Étage 1 — Consultations" },
  2: { color:"#7C3AED", icon:"🔬", en:"Floor 2 — Diagnostics & Lab",         ar:"الطابق ٢ — التشخيص والمختبر", es:"Piso 2 — Diagnóstico", zh:"三楼 — 检查诊断", hi:"मंज़िल 2 — निदान", fr:"Étage 2 — Diagnostics" },
  3: { color:"#D97706", icon:"🛏️", en:"Floor 3 — IPD (Inpatient Wards)",     ar:"الطابق ٣ — الأجنحة الداخلية", es:"Piso 3 — Hospitalización", zh:"四楼 — 住院部", hi:"मंज़िल 3 — IPD", fr:"Étage 3 — Hospitalisation" },
  4: { color:"#DC2626", icon:"⚕️",  en:"Floor 4 — Surgery & ICU",             ar:"الطابق ٤ — الجراحة والعناية", es:"Piso 4 — Cirugía y UCI", zh:"五楼 — 手术与重症", hi:"मंज़िल 4 — शल्य एवं ICU", fr:"Étage 4 — Chirurgie & Réa" },
};

const RL = {
  en:{mainGate:"Main Entrance",reception:"Reception",emergency:"Emergency Dept",ambulanceBay:"Ambulance Bay",triage:"Triage",pharmacy:"Pharmacy",billing:"Billing",lift:"Lift",stairs:"Stairs",restroom:"Restroom",waiting:"Waiting Area",security:"Security",info:"Information",parking:"Car Park",canteen:"Canteen",opdReception:"OPD Reception",generalOPD:"General OPD",dental:"Dental",eye:"Ophthalmology",ent:"ENT",dermatology:"Dermatology",orthopedics:"Orthopaedics",gynecology:"Gynaecology",pediatrics:"Paediatrics",reportCollect:"Report Collection",labReception:"Lab Reception",bloodTest:"Blood Test",xray:"X-Ray",mri:"MRI",ctScan:"CT Scan",ultrasound:"Ultrasound",ecg:"ECG",pathology:"Pathology",radiology:"Radiology",ipdReception:"IPD Reception",generalWard:"General Ward",privateRoom:"Private Room",semiPrivate:"Semi-Private",maternity:"Maternity",pediatricsIPD:"Paediatrics Ward",nurseStation:"Nurse Station",cafeteria:"Cafeteria",chapel:"Chapel / Prayer",visitorsLounge:"Visitors' Lounge",dischargeDesk:"Discharge Desk",icu:"ICU",nicu:"NICU",operatingA:"Operating Room A",operatingB:"Operating Room B",preOp:"Pre-Op Holding",recovery:"Recovery Room",scrub:"Scrub Room",bloodBank:"Blood Bank",sterilize:"Sterilisation",onCallRoom:"On-Call Room",ccu:"CCU",waitingC:"Waiting"},
  ar:{mainGate:"المدخل الرئيسي",reception:"الاستقبال",emergency:"قسم الطوارئ",ambulanceBay:"موقف الإسعاف",triage:"الفرز",pharmacy:"الصيدلية",billing:"الفواتير",lift:"المصعد",stairs:"الدرج",restroom:"دورة المياه",waiting:"الانتظار",security:"الأمن",info:"المعلومات",parking:"موقف السيارات",canteen:"المقصف",opdReception:"استقبال العيادات",generalOPD:"العيادة العامة",dental:"الأسنان",eye:"العيون",ent:"الأنف والأذن",dermatology:"الجلدية",orthopedics:"العظام",gynecology:"النساء والتوليد",pediatrics:"الأطفال",reportCollect:"استلام التقارير",labReception:"استقبال المختبر",bloodTest:"تحليل الدم",xray:"الأشعة السينية",mri:"الرنين المغناطيسي",ctScan:"التصوير المقطعي",ultrasound:"الموجات الصوتية",ecg:"تخطيط القلب",pathology:"علم الأمراض",radiology:"الأشعة",ipdReception:"استقبال الأجنحة",generalWard:"الجناح العام",privateRoom:"غرفة خاصة",semiPrivate:"شبه خاصة",maternity:"الولادة",pediatricsIPD:"جناح الأطفال",nurseStation:"محطة التمريض",cafeteria:"الكافيتريا",chapel:"المصلى",visitorsLounge:"صالة الزوار",dischargeDesk:"مكتب الخروج",icu:"العناية المركزة",nicu:"عناية حديثي الولادة",operatingA:"غرفة العمليات أ",operatingB:"غرفة العمليات ب",preOp:"ما قبل العملية",recovery:"الإفاقة",scrub:"غرفة التعقيم",bloodBank:"بنك الدم",sterilize:"التعقيم",onCallRoom:"غرفة المناوبة",ccu:"العناية القلبية",waitingC:"الانتظار"},
  es:{mainGate:"Entrada",reception:"Recepción",emergency:"Urgencias",ambulanceBay:"Ambulancias",triage:"Triaje",pharmacy:"Farmacia",billing:"Facturación",lift:"Ascensor",stairs:"Escaleras",restroom:"Baño",waiting:"Espera",security:"Seguridad",info:"Información",parking:"Parking",canteen:"Comedor",opdReception:"Recepción Consultas",generalOPD:"Consulta General",dental:"Dental",eye:"Oftalmología",ent:"ORL",dermatology:"Dermatología",orthopedics:"Traumatología",gynecology:"Ginecología",pediatrics:"Pediatría",reportCollect:"Recogida Informes",labReception:"Recepción Lab",bloodTest:"Análisis",xray:"Rayos X",mri:"Resonancia",ctScan:"TAC",ultrasound:"Ecografía",ecg:"ECG",pathology:"Patología",radiology:"Radiología",ipdReception:"Recepción Planta",generalWard:"Sala General",privateRoom:"Habitación Privada",semiPrivate:"Semi-Privada",maternity:"Maternidad",pediatricsIPD:"Planta Pediatría",nurseStation:"Enfermería",cafeteria:"Cafetería",chapel:"Capilla",visitorsLounge:"Sala Visitas",dischargeDesk:"Altas",icu:"UCI",nicu:"UCIN",operatingA:"Quirófano A",operatingB:"Quirófano B",preOp:"Pre-Op",recovery:"Recuperación",scrub:"Vestuario",bloodBank:"Banco Sangre",sterilize:"Esterilización",onCallRoom:"Guardia",ccu:"UCC",waitingC:"Espera"},
  zh:{mainGate:"正门",reception:"前台",emergency:"急诊科",ambulanceBay:"急救车位",triage:"分诊",pharmacy:"药房",billing:"收费处",lift:"电梯",stairs:"楼梯",restroom:"洗手间",waiting:"候诊区",security:"安保",info:"咨询台",parking:"停车场",canteen:"食堂",opdReception:"门诊大厅",generalOPD:"全科门诊",dental:"口腔科",eye:"眼科",ent:"耳鼻喉科",dermatology:"皮肤科",orthopedics:"骨科",gynecology:"妇科",pediatrics:"儿科",reportCollect:"报告领取",labReception:"检验大厅",bloodTest:"验血",xray:"X光",mri:"核磁共振",ctScan:"CT",ultrasound:"超声",ecg:"心电图",pathology:"病理",radiology:"放射科",ipdReception:"住院大厅",generalWard:"普通病房",privateRoom:"单人间",semiPrivate:"双人间",maternity:"产科",pediatricsIPD:"儿科病房",nurseStation:"护士站",cafeteria:"餐厅",chapel:"祈祷室",visitorsLounge:"探视区",dischargeDesk:"出院处",icu:"ICU",nicu:"NICU",operatingA:"手术室A",operatingB:"手术室B",preOp:"术前准备",recovery:"恢复室",scrub:"洗手间",bloodBank:"血库",sterilize:"消毒室",onCallRoom:"值班室",ccu:"CCU",waitingC:"候诊"},
  hi:{mainGate:"मुख्य प्रवेश",reception:"स्वागत",emergency:"आपातकालीन",ambulanceBay:"एम्बुलेंस",triage:"ट्राइएज",pharmacy:"दवाखाना",billing:"बिलिंग",lift:"लिफ्ट",stairs:"सीढ़ियाँ",restroom:"शौचालय",waiting:"प्रतीक्षा",security:"सुरक्षा",info:"सूचना",parking:"पार्किंग",canteen:"कैंटीन",opdReception:"OPD स्वागत",generalOPD:"सामान्य OPD",dental:"दंत",eye:"नेत्र",ent:"ENT",dermatology:"त्वचा",orthopedics:"हड्डी",gynecology:"स्त्री रोग",pediatrics:"बाल रोग",reportCollect:"रिपोर्ट संग्रह",labReception:"लैब स्वागत",bloodTest:"रक्त जांच",xray:"एक्स-रे",mri:"MRI",ctScan:"CT स्कैन",ultrasound:"अल्ट्रासाउंड",ecg:"ECG",pathology:"पैथोलॉजी",radiology:"रेडियोलॉजी",ipdReception:"IPD स्वागत",generalWard:"सामान्य वार्ड",privateRoom:"निजी कमरा",semiPrivate:"अर्ध-निजी",maternity:"प्रसूति",pediatricsIPD:"बाल वार्ड",nurseStation:"नर्स स्टेशन",cafeteria:"कैफ़ेटेरिया",chapel:"प्रार्थना कक्ष",visitorsLounge:"मिलने वालों का कक्ष",dischargeDesk:"डिस्चार्ज",icu:"ICU",nicu:"NICU",operatingA:"ऑपरेशन A",operatingB:"ऑपरेशन B",preOp:"प्री-ऑप",recovery:"रिकवरी",scrub:"स्क्रब रूम",bloodBank:"ब्लड बैंक",sterilize:"स्टेरिलाइज़",onCallRoom:"ऑन-कॉल",ccu:"CCU",waitingC:"प्रतीक्षा"},
  fr:{mainGate:"Entrée",reception:"Accueil",emergency:"Urgences",ambulanceBay:"Ambulances",triage:"Triage",pharmacy:"Pharmacie",billing:"Facturation",lift:"Ascenseur",stairs:"Escaliers",restroom:"Toilettes",waiting:"Attente",security:"Sécurité",info:"Information",parking:"Parking",canteen:"Cantine",opdReception:"Accueil Consult.",generalOPD:"Médecine Générale",dental:"Dentaire",eye:"Ophtalmologie",ent:"ORL",dermatology:"Dermatologie",orthopedics:"Orthopédie",gynecology:"Gynécologie",pediatrics:"Pédiatrie",reportCollect:"Retrait Résultats",labReception:"Accueil Labo",bloodTest:"Prise de Sang",xray:"Radiographie",mri:"IRM",ctScan:"Scanner",ultrasound:"Échographie",ecg:"ECG",pathology:"Pathologie",radiology:"Radiologie",ipdReception:"Accueil Hospit.",generalWard:"Salle Commune",privateRoom:"Chambre Privée",semiPrivate:"Semi-Privée",maternity:"Maternité",pediatricsIPD:"Pédiatrie Hospit.",nurseStation:"Poste Infirmier",cafeteria:"Cafétéria",chapel:"Chapelle",visitorsLounge:"Salon Visiteurs",dischargeDesk:"Bureau Sorties",icu:"Réanimation",nicu:"Néonatologie",operatingA:"Bloc A",operatingB:"Bloc B",preOp:"Pré-Op",recovery:"Réveil",scrub:"Vestiaire",bloodBank:"Banque Sang",sterilize:"Stérilisation",onCallRoom:"Garde",ccu:"Soins Cardiaques",waitingC:"Attente"},
};

const LANGS={en:{name:"English",flag:"🇬🇧",dir:"ltr",code:"EN"},ar:{name:"العربية",flag:"🇸🇦",dir:"rtl",code:"AR"},es:{name:"Español",flag:"🇪🇸",dir:"ltr",code:"ES"},zh:{name:"中文",flag:"🇨🇳",dir:"ltr",code:"ZH"},hi:{name:"हिन्दी",flag:"🇮🇳",dir:"ltr",code:"HI"},fr:{name:"Français",flag:"🇫🇷",dir:"ltr",code:"FR"}};

const UI = {
  en:{title:"MedNav",tagline:"Navigate with\nconfidence.\nCommunicate\nwithout barriers.",tagSub:"1 in 5 hospital visitors struggle with navigation due to disability, language, or unfamiliarity. MedNav provides accessible indoor wayfinding with sign language support across 6 languages.",from:"You are here",to:"Going to",go:"Navigate",reset:"New Route",wheelchair:"Wheelchair",vision:"Low Vision",hearing:"Hearing",cognitive:"Simplified",step:"Step",arrived:"You have arrived!",dist:"Distance",meters:"m",time:"Est.",mins:"min",noRoute:"No accessible route found.",search:"Search phrases...",allPhrases:"All",urgent:"Urgent",medical:"Medical",navigation:"Navigation",general:"General",viewDemo:"View Sign",criticalSign:"Critical Sign",selectDest:"Select destination",home:"Home",navigate:"Navigate",phrases:"Phrases",settings:"Settings",stairsWarn:"⚠ Stairs",wheelchairOk:"✓ Step-free",back:"Back",langLabel:"Language",accessLabel:"Accessibility",howToSign:"How to sign",showTo:"Show to staff",floor:"Floor",viaLift:"via Lift",viaStairs:"via Stairs",changeFloor:"Go to floor",opdFlow:"OPD Patient Flow",ipdFlow:"IPD Patient Flow",emergFlow:"Emergency Flow",quickNav:"Quick Navigation",deptSearch:"Find Department",darkMode:"Dark Mode",hearingActive:"Hearing mode active — visual navigation enabled, sign phrases ready"},
  ar:{title:"MedNav",tagline:"تنقّل بثقة.\nتواصل بلا\nحواجز.",tagSub:"١ من كل ٥ زوار للمستشفى يواجهون صعوبة في التنقل بسبب الإعاقة أو اللغة. MedNav يوفر ملاحة داخلية ميسرة مع دعم لغة الإشارة بـ ٦ لغات.",from:"أنت هنا",to:"الوجهة",go:"ابدأ",reset:"مسار جديد",wheelchair:"كرسي متحرك",vision:"ضعف البصر",hearing:"السمع",cognitive:"مبسط",step:"خطوة",arrived:"وصلت!",dist:"المسافة",meters:"م",time:"الوقت",mins:"د",noRoute:"لا يوجد مسار.",search:"بحث...",allPhrases:"الكل",urgent:"عاجل",medical:"طبي",navigation:"ملاحة",general:"عام",viewDemo:"عرض",criticalSign:"حرجة",selectDest:"اختر وجهة",home:"الرئيسية",navigate:"ملاحة",phrases:"إشارات",settings:"إعدادات",stairsWarn:"⚠ درج",wheelchairOk:"✓ بدون درج",back:"رجوع",langLabel:"اللغة",accessLabel:"وصول",howToSign:"كيف تشير",showTo:"أظهر",floor:"طابق",viaLift:"بالمصعد",viaStairs:"بالدرج",changeFloor:"انتقل للطابق",opdFlow:"مسار العيادات",ipdFlow:"مسار التنويم",emergFlow:"مسار الطوارئ",quickNav:"تنقل سريع",deptSearch:"البحث عن قسم",darkMode:"الوضع الداكن",hearingActive:"وضع السمع مفعّل — ملاحة بصرية وعبارات إشارة جاهزة"},
  es:{title:"MedNav",tagline:"Navega con\nconfianza.\nComunica sin\nbarreras.",tagSub:"1 de cada 5 visitantes de hospitales tiene dificultades de navegación por discapacidad, idioma o desconocimiento. MedNav ofrece navegación interior accesible con lengua de señas en 6 idiomas.",from:"Estás aquí",to:"Destino",go:"Navegar",reset:"Nueva Ruta",wheelchair:"Silla",vision:"Visión",hearing:"Auditivo",cognitive:"Simple",step:"Paso",arrived:"¡Llegaste!",dist:"Distancia",meters:"m",time:"Tiempo",mins:"min",noRoute:"Sin ruta.",search:"Buscar...",allPhrases:"Todas",urgent:"Urgente",medical:"Médico",navigation:"Navegación",general:"General",viewDemo:"Ver",criticalSign:"Crítica",selectDest:"Elegir destino",home:"Inicio",navigate:"Navegar",phrases:"Señas",settings:"Ajustes",stairsWarn:"⚠ Escaleras",wheelchairOk:"✓ Sin escaleras",back:"Atrás",langLabel:"Idioma",accessLabel:"Accesibilidad",howToSign:"Cómo señar",showTo:"Mostrar",floor:"Piso",viaLift:"por ascensor",viaStairs:"por escaleras",changeFloor:"Ir al piso",opdFlow:"Flujo Consultas",ipdFlow:"Flujo Hospitalización",emergFlow:"Flujo Urgencias",quickNav:"Navegación Rápida",deptSearch:"Buscar Departamento"},
  zh:{title:"MedNav",tagline:"自信导航。\n无障碍沟通。",tagSub:"每5位医院访客中就有1位因残疾、语言或不熟悉环境而导航困难。MedNav提供无障碍室内导航，支持6种语言的手语交流。",from:"您在这里",to:"前往",go:"导航",reset:"新路线",wheelchair:"轮椅",vision:"视力",hearing:"听力",cognitive:"简化",step:"步骤",arrived:"已到达！",dist:"距离",meters:"米",time:"预计",mins:"分",noRoute:"无路线。",search:"搜索...",allPhrases:"全部",urgent:"紧急",medical:"医疗",navigation:"导航",general:"一般",viewDemo:"查看",criticalSign:"紧急",selectDest:"选择目的地",home:"首页",navigate:"导航",phrases:"手语",settings:"设置",stairsWarn:"⚠ 楼梯",wheelchairOk:"✓ 无阶梯",back:"返回",langLabel:"语言",accessLabel:"无障碍",howToSign:"手语教学",showTo:"展示",floor:"楼",viaLift:"电梯",viaStairs:"楼梯",changeFloor:"去",opdFlow:"门诊流程",ipdFlow:"住院流程",emergFlow:"急诊流程",quickNav:"快速导航",deptSearch:"查找科室"},
  hi:{title:"MedNav",tagline:"आत्मविश्वास से\nनेविगेट करें।\nबिना बाधा\nसंवाद करें।",tagSub:"हर 5 में से 1 अस्पताल आगंतुक को विकलांगता, भाषा या अपरिचितता के कारण नेविगेशन में कठिनाई होती है। MedNav 6 भाषाओं में सांकेतिक भाषा सहायता के साथ सुलभ इनडोर नेविगेशन प्रदान करता है।",from:"आप यहाँ",to:"जाना है",go:"नेविगेट",reset:"नया मार्ग",wheelchair:"व्हीलचेयर",vision:"दृष्टि",hearing:"श्रवण",cognitive:"सरल",step:"चरण",arrived:"पहुँच गए!",dist:"दूरी",meters:"मी",time:"समय",mins:"मि",noRoute:"मार्ग नहीं।",search:"खोजें...",allPhrases:"सभी",urgent:"अत्यावश्यक",medical:"चिकित्सा",navigation:"नेविगेशन",general:"सामान्य",viewDemo:"देखें",criticalSign:"आवश्यक",selectDest:"गंतव्य चुनें",home:"होम",navigate:"नेविगेट",phrases:"सांकेतिक",settings:"सेटिंग्स",stairsWarn:"⚠ सीढ़ियाँ",wheelchairOk:"✓ सीढ़ी-रहित",back:"वापस",langLabel:"भाषा",accessLabel:"सुगम्यता",howToSign:"संकेत",showTo:"दिखाएं",floor:"मंज़िल",viaLift:"लिफ्ट से",viaStairs:"सीढ़ियों से",changeFloor:"मंज़िल बदलें",opdFlow:"OPD प्रवाह",ipdFlow:"IPD प्रवाह",emergFlow:"आपातकालीन प्रवाह",quickNav:"त्वरित नेविगेशन",deptSearch:"विभाग खोजें"},
  fr:{title:"MedNav",tagline:"Naviguer en\nconfiance.\nCommuniquer\nsans barrières.",tagSub:"1 visiteur d'hôpital sur 5 a des difficultés de navigation dues au handicap, à la langue ou à la méconnaissance. MedNav offre un guidage intérieur accessible avec la langue des signes en 6 langues.",from:"Vous êtes ici",to:"Destination",go:"Naviguer",reset:"Nouveau",wheelchair:"Fauteuil",vision:"Malvoyant",hearing:"Auditif",cognitive:"Simplifié",step:"Étape",arrived:"Arrivé !",dist:"Distance",meters:"m",time:"Temps",mins:"min",noRoute:"Pas d'itinéraire.",search:"Chercher...",allPhrases:"Toutes",urgent:"Urgent",medical:"Médical",navigation:"Navigation",general:"Général",viewDemo:"Voir",criticalSign:"Critique",selectDest:"Choisir",home:"Accueil",navigate:"Naviguer",phrases:"Signes",settings:"Réglages",stairsWarn:"⚠ Escaliers",wheelchairOk:"✓ Sans escaliers",back:"Retour",langLabel:"Langue",accessLabel:"Accessibilité",howToSign:"Comment signer",showTo:"Montrer",floor:"Étage",viaLift:"par ascenseur",viaStairs:"par escaliers",changeFloor:"Aller étage",opdFlow:"Parcours Consult.",ipdFlow:"Parcours Hospit.",emergFlow:"Parcours Urgences",quickNav:"Navigation Rapide",deptSearch:"Chercher Service"},
};

// ─── PHRASES ───
const PHRASES=[
  {id:1,emoji:"🆘",cat:"urgent",featured:true,text:{en:"I need help immediately",ar:"أحتاج مساعدة فورية",es:"Necesito ayuda",zh:"我需要帮助",hi:"मदद चाहिए",fr:"J'ai besoin d'aide"},gesture:{en:"Wave hands above head, point to yourself.",ar:"لوّح فوق رأسك وأشر لنفسك.",es:"Agita manos sobre cabeza.",zh:"双手挥动，指向自己。",hi:"हाथ हिलाएं, अपनी ओर इशारा करें।",fr:"Agitez les mains au-dessus."}},
  {id:2,emoji:"🤕",cat:"urgent",text:{en:"I am in pain",ar:"أنا أتألم",es:"Tengo dolor",zh:"我很疼",hi:"दर्द है",fr:"J'ai mal"},gesture:{en:"Point index fingers together and twist.",ar:"وجّه إصبعيك وقم بلفهما.",es:"Índices juntos, gira.",zh:"食指相对旋转。",hi:"तर्जनी मिलाकर घुमाएं।",fr:"Index l'un vers l'autre, tournez."}},
  {id:3,emoji:"⚠️",cat:"urgent",text:{en:"I am in danger",ar:"أنا في خطر",es:"Estoy en peligro",zh:"我处于危险中",hi:"खतरे में हूँ",fr:"Je suis en danger"},gesture:{en:"Knock fists together forcefully.",ar:"اطرق قبضتيك معاً.",es:"Golpea puños juntos.",zh:"双拳撞击。",hi:"मुट्ठियां टकराएं।",fr:"Frappez poings ensemble."}},
  {id:4,emoji:"😵",cat:"urgent",text:{en:"I feel dizzy",ar:"أشعر بدوار",es:"Estoy mareado",zh:"头晕",hi:"चक्कर आ रहे हैं",fr:"Des vertiges"},gesture:{en:"Circular hand motion near head.",ar:"حركة دائرية قرب الرأس.",es:"Mano en círculo cerca de cabeza.",zh:"手在头旁画圈。",hi:"हाथ सिर के पास घुमाएं।",fr:"Main en cercle près de la tête."}},
  {id:5,emoji:"👨‍⚕️",cat:"medical",text:{en:"I need a doctor",ar:"أحتاج طبيب",es:"Necesito doctor",zh:"需要医生",hi:"डॉक्टर चाहिए",fr:"Besoin d'un médecin"},gesture:{en:"Tap wrist (pulse), point outward.",ar:"انقر معصمك وأشر للخارج.",es:"Toca muñeca, señala.",zh:"轻敲手腕，向外指。",hi:"कलाई थपथपाएं।",fr:"Tapotez poignet, pointez."}},
  {id:6,emoji:"💊",cat:"medical",text:{en:"I need medication",ar:"أحتاج دواء",es:"Necesito medicamento",zh:"需要药",hi:"दवा चाहिए",fr:"Besoin de médicaments"},gesture:{en:"Cup hand, drop pill, bring to mouth.",ar:"ضع كفك كالكوب.",es:"Ahueca mano, simula píldora.",zh:"手做杯状，放药。",hi:"हाथ कप बनाएं।",fr:"Creux, mimez comprimé."}},
  {id:7,emoji:"💉",cat:"medical",text:{en:"I am allergic to...",ar:"لدي حساسية من...",es:"Soy alérgico a...",zh:"我过敏",hi:"एलर्जी है",fr:"Allergique à..."},gesture:{en:"Scratch forearm, point to allergen.",ar:"اخدش ساعدك.",es:"Rasca antebrazo.",zh:"挠前臂。",hi:"बांह खरोंचें।",fr:"Grattez avant-bras."}},
  {id:8,emoji:"🤰",cat:"medical",text:{en:"I am pregnant",ar:"أنا حامل",es:"Estoy embarazada",zh:"怀孕了",hi:"गर्भवती हूँ",fr:"Enceinte"},gesture:{en:"Hands on belly, move outward.",ar:"يداك على البطن للخارج.",es:"Manos en vientre.",zh:"手放腹部画弧。",hi:"हाथ पेट पर।",fr:"Mains sur ventre."}},
  {id:11,emoji:"🚻",cat:"navigation",text:{en:"Where is the restroom?",ar:"أين دورة المياه؟",es:"¿Dónde está el baño?",zh:"洗手间在哪？",hi:"शौचालय कहाँ?",fr:"Où sont les toilettes ?"},gesture:{en:"Shake T-handshape side to side.",ar:"حرّك شكل T.",es:"Agita forma T.",zh:"T手势摇动。",hi:"T आकृति हिलाएं।",fr:"Secouez forme T."}},
  {id:12,emoji:"🙏",cat:"general",text:{en:"Thank you",ar:"شكراً",es:"Gracias",zh:"谢谢",hi:"धन्यवाद",fr:"Merci"},gesture:{en:"Touch chin, move hand forward.",ar:"المس ذقنك وحرك للأمام.",es:"Toca barbilla.",zh:"触下巴向前移。",hi:"ठुड्डी छुएं।",fr:"Touchez menton."},desc:{en:"Palm open, chin to outward."}},
  {id:14,emoji:"🥤",cat:"general",text:{en:"I need water",ar:"أحتاج ماء",es:"Necesito agua",zh:"需要水",hi:"पानी चाहिए",fr:"Besoin d'eau"},gesture:{en:"W near mouth, tap chin twice.",ar:"W قرب فمك.",es:"W cerca boca.",zh:"W手势拍下巴。",hi:"W बनाएं, ठुड्डी थपथपाएं।",fr:"W près bouche."}},
];

// ─── PATIENT FLOW PRESETS ───
const PATIENT_FLOWS = {
  opd: ["mainGate","reception","lift1","opdReception"],
  ipd: ["mainGate","reception","billing","lift3","ipdReception"],
  emergency: ["ambulanceBay","emergency","triage"],
};

// ─── DIJKSTRA ───
function dijkstra(s,e,m){const g={};Object.keys(ROOMS).forEach(k=>(g[k]=[]));EDGES.forEach(ed=>{if(m.wheelchair&&(ed.hasStairs||ed.width==="narrow"))return;const w=m.wheelchair?ed.dist*1.15:ed.dist;g[ed.from].push({n:ed.to,w});g[ed.to].push({n:ed.from,w})});const d={},p={},v=new Set();Object.keys(ROOMS).forEach(k=>(d[k]=1/0));d[s]=0;while(1){let u=null,mn=1/0;for(const k of Object.keys(ROOMS)){if(!v.has(k)&&d[k]<mn){mn=d[k];u=k}}if(u===null||u===e)break;v.add(u);for(const{n,w}of g[u]){if(d[u]+w<d[n]){d[n]=d[u]+w;p[n]=u}}}if(d[e]===1/0)return null;const path=[];let c=e;while(c!==undefined){path.unshift(c);c=p[c]}let hs=false;for(let i=0;i<path.length-1;i++){const edge=EDGES.find(ed=>(ed.from===path[i]&&ed.to===path[i+1])||(ed.to===path[i]&&ed.from===path[i+1]));if(edge?.hasStairs)hs=true}return{path,distance:Math.round(d[e]),hasStairs:hs}}
function getDir(f,t){const dx=t.x-f.x,dy=t.y-f.y;if(Math.abs(dx)>Math.abs(dy)*1.5)return dx>0?"→":"←";if(Math.abs(dy)>Math.abs(dx)*1.5)return dy<0?"↑":"↓";return dx>0?(dy<0?"↗":"↘"):(dy<0?"↖":"↙")}
function genDirs(path,lang,simple,t){if(!path||path.length<2)return[];const lb=RL[lang]||RL.en;return path.slice(1).map((rid,i)=>{const fr=ROOMS[path[i]],to=ROOMS[rid];const flC=fr.floor!==to.floor;let tx;if(flC){const via=to.labelKey==="lift"?t.viaLift:t.viaStairs;tx=`🔀 ${t.changeFloor} ${to.floor===0?"G":to.floor} ${via}`}else{const ar=getDir(fr,to),d=Math.round(Math.sqrt((to.x-fr.x)**2+(to.y-fr.y)**2));tx=simple?`${ar} ${lb[to.labelKey]||rid}`:`${ar} ${lb[to.labelKey]||rid} (~${d}m)`}return{text:tx,roomId:rid,floorChange:flC,toFloor:to.floor}})}

const ICONS={entrance:"+",service:"H",transport:"▲",critical:"!",department:"+",waiting:"◷",facility:"~"};
const TCOL={entrance:"#10B981",service:"#3B82F6",transport:"#8B5CF6",critical:"#EF4444",department:"#F59E0B",waiting:"#6366F1",facility:"#14B8A6"};
const CCOL={urgent:"#DC2626",medical:"#7C3AED",navigation:"#2563EB",general:"#6B7280"};
const CBG_={urgent:"#FEF2F2",medical:"#F5F3FF",navigation:"#EFF6FF",general:"#F9FAFB"};
const CBG_D={urgent:"rgba(220,38,38,.12)",medical:"rgba(124,58,237,.12)",navigation:"rgba(37,99,235,.12)",general:"rgba(107,114,128,.12)"};

// ─── THEME SYSTEM ───
const TH={
  light:{bg:"#F8FAFC",w:"#FFFFFF",tx:"#0F172A",tx2:"#64748B",tx3:"#94A3B8",ac:"#2563EB",acL:"#EFF6FF",bd:"#E2E8F0",red:"#DC2626",redBg:"#FEF2F2",grn:"#059669",grnBg:"#ECFDF5",sh:"0 1px 3px rgba(0,0,0,.04),0 1px 2px rgba(0,0,0,.03)",shM:"0 4px 12px rgba(0,0,0,.06)",mapBg:"#FFFFFF",mapDot:"#E2E8F0",mapEdge:"#D1D5DB",mapLabel:"#94A3B8",nodeFill:"#FFFFFF",selectBg:"#FFFFFF"},
  dark:{bg:"#0B1120",w:"#151F32",tx:"#E2E8F0",tx2:"#94A3B8",tx3:"#64748B",ac:"#3B82F6",acL:"rgba(59,130,246,.12)",bd:"#1E293B",red:"#EF4444",redBg:"rgba(239,68,68,.1)",grn:"#10B981",grnBg:"rgba(16,185,129,.1)",sh:"0 1px 3px rgba(0,0,0,.3)",shM:"0 4px 12px rgba(0,0,0,.4)",mapBg:"#131B2E",mapDot:"#1E293B",mapEdge:"#334155",mapLabel:"#64748B",nodeFill:"#1A2540",selectBg:"#1A2540"}
};

// ═══ MAIN ═══
export default function MedNav(){
  const [lang,setLang]=useState("en");
  const [acc,setAcc]=useState({wheelchair:false,vision:false,hearing:false,cognitive:false});
  const [startRoom,setStartRoom]=useState("mainGate");
  const [endRoom,setEndRoom]=useState("");
  const [route,setRoute]=useState(null);
  const [stp,setStp]=useState(-1);
  const [tab,setTab]=useState("home");
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [langOpen,setLangOpen]=useState(false);
  const [expId,setExpId]=useState(null);
  const [showStaff,setShowStaff]=useState(null);
  const [mapFloor,setMapFloor]=useState(0);
  const [deptSearch,setDeptSearch]=useState("");
  const [dark,setDark]=useState(false);
  const stepsRef=useRef(null);

  const t=UI[lang]||UI.en;
  const isRTL=LANGS[lang]?.dir==="rtl";
  const isLg=acc.vision||acc.cognitive;
  const base=isLg?17:14;
  const rl=RL[lang]||RL.en;
  const fi=FLOOR_INFO[mapFloor];
  const c=dark?TH.dark:TH.light;
  const cbg=dark?CBG_D:CBG_;

  // When hearing mode turned on, auto-show phrases tab
  const toggleAcc=m=>{
    setAcc(p=>{const nxt={...p,[m]:!p[m]};if(m==="hearing"&&nxt.hearing)setTab("phrases");return nxt});
    setRoute(null);setStp(-1);
  };

  const doNav=useCallback(()=>{if(!startRoom||!endRoom||startRoom===endRoom)return;const r=dijkstra(startRoom,endRoom,acc);setRoute(r);setStp(0);if(r?.path)setMapFloor(ROOMS[r.path[0]].floor)},[startRoom,endRoom,acc]);
  const reset=()=>{setRoute(null);setStp(-1);setEndRoom("")};
  const dirs=useMemo(()=>route?genDirs(route.path,lang,acc.cognitive,t):[],[route,lang,acc.cognitive,t]);
  useEffect(()=>{if(stepsRef.current&&stp>=0){const el=stepsRef.current.children[stp];if(el)el.scrollIntoView({behavior:"smooth",block:"nearest"})}},[stp]);
  useEffect(()=>{if(dirs[stp]){const rm=ROOMS[dirs[stp].roomId];if(rm)setMapFloor(rm.floor);if((acc.vision||acc.hearing)&&typeof window!=="undefined"&&window.speechSynthesis){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(dirs[stp].text.replace(/[↑↓←→↗↘↖↙🔀]/g,"").trim());u.lang={en:"en-US",ar:"ar-SA",es:"es-ES",zh:"zh-CN",hi:"hi-IN",fr:"fr-FR"}[lang]||"en-US";u.rate=0.9;window.speechSynthesis.speak(u)}}},[stp,dirs,acc.vision,acc.hearing,lang]);
  const phrases=useMemo(()=>{let l=PHRASES;if(filter!=="all")l=l.filter(p=>p.cat===filter);if(search.trim()){const q=search.toLowerCase();l=l.filter(p=>(p.text[lang]||p.text.en).toLowerCase().includes(q)||p.text.en.toLowerCase().includes(q))}return l},[filter,search,lang]);

  // Quick nav to department
  const navToDept=(roomId)=>{setEndRoom(roomId);setMapFloor(ROOMS[roomId].floor);setTab("navigate")};

  // Filtered departments for search
  const deptResults=useMemo(()=>{if(!deptSearch.trim())return[];const q=deptSearch.toLowerCase();return Object.entries(ROOMS).filter(([id,r])=>r.type==="department"&&(rl[r.labelKey]||id).toLowerCase().includes(q)).slice(0,6)},[deptSearch,rl]);

  const floorRooms=Object.entries(ROOMS).filter(([,r])=>r.floor===mapFloor);
  const floorEdges=EDGES.filter(e=>ROOMS[e.from].floor===mapFloor&&ROOMS[e.to].floor===mapFloor);

  // Staff overlay
  if(showStaff!==null){const p=PHRASES.find(x=>x.id===showStaff);if(p)return(
    <div style={{position:"fixed",inset:0,background:c.bg,zIndex:999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&display=swap" rel="stylesheet"/>
      <div style={{fontSize:64,marginBottom:20}}>{p.emoji}</div>
      <div style={{fontSize:36,fontWeight:800,textAlign:"center",color:CCOL[p.cat],marginBottom:12}}>{p.text[lang]||p.text.en}</div>
      <div style={{fontSize:24,color:"#6B7280",textAlign:"center"}}>{p.text.en}</div>
      <div style={{marginTop:32,padding:"8px 16px",background:CBG_[p.cat],borderRadius:20,color:CCOL[p.cat],fontWeight:700,fontSize:14,textTransform:"uppercase"}}>{p.cat}</div>
      <button onClick={()=>setShowStaff(null)} style={{marginTop:40,padding:"14px 40px",background:c.ac,color:"#fff",border:"none",borderRadius:14,fontSize:18,fontWeight:700,cursor:"pointer"}}>✕ Close</button>
    </div>
  )}

  return(
    <div dir={isRTL?"rtl":"ltr"} style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:c.bg,color:c.tx,height:"100dvh",fontSize:base,lineHeight:1.5,display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto",position:"relative",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fi{animation:fadeIn .3s ease both}input::placeholder{color:#9CA3AF}select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236B7280' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}button:active{transform:scale(.97)}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:10px}`}</style>

      {/* TOP BAR */}
      <div style={{padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:c.w,borderBottom:`1px solid ${c.bd}`,position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#2563EB,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:15}}>M</div>
          <span style={{fontWeight:800,fontSize:17}}>{t.title}</span>
        </div>
        <button onClick={()=>setLangOpen(!langOpen)} style={{background:"none",border:`1px solid ${c.bd}`,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:600,color:c.tx2,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{LANGS[lang].flag} {LANGS[lang].code}</button>
      </div>
      {langOpen&&<div style={{position:"absolute",top:52,right:16,zIndex:100,background:c.w,border:`1px solid ${c.bd}`,borderRadius:12,boxShadow:c.shM,padding:6,minWidth:170}} className="fi">{Object.entries(LANGS).map(([code,info])=><button key={code} onClick={()=>{setLang(code);setLangOpen(false)}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",border:"none",background:lang===code?c.acL:"transparent",borderRadius:8,cursor:"pointer",fontSize:base,fontWeight:lang===code?700:400,color:lang===code?c.ac:c.tx}}><span style={{fontSize:18}}>{info.flag}</span>{info.name}{lang===code&&<span style={{marginLeft:"auto",color:c.ac}}>✓</span>}</button>)}</div>}

      <div style={{flex:1,overflowY:"auto",paddingBottom:"calc(80px + env(safe-area-inset-bottom, 0px))",overflowX:"hidden",WebkitOverflowScrolling:"touch"}}>

        {/* ═══ HOME ═══ */}
        {tab==="home"&&<div className="fi">
          <div style={{padding:"24px 24px 16px"}}>
            <h1 style={{fontSize:isLg?32:28,fontWeight:800,lineHeight:1.12,margin:0,whiteSpace:"pre-line"}}>{t.tagline}</h1>
            <p style={{fontSize:base-1,color:c.tx2,marginTop:10,lineHeight:1.6}}>{t.tagSub}</p>
          </div>

          {/* Department search */}
          <div style={{padding:"0 20px 12px"}}>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#9CA3AF"}}>🔍</span>
              <input type="text" value={deptSearch} onChange={e=>setDeptSearch(e.target.value)} placeholder={t.deptSearch} style={{width:"100%",padding:"12px 14px 12px 40px",borderRadius:14,border:`1.5px solid ${c.bd}`,background:c.w,fontSize:base,color:c.tx,outline:"none",boxSizing:"border-box"}}/>
            </div>
            {deptResults.length>0&&<div style={{marginTop:6,background:c.w,border:`1px solid ${c.bd}`,borderRadius:12,boxShadow:c.shM,overflow:"hidden"}}>
              {deptResults.map(([id,r])=><button key={id} onClick={()=>{setDeptSearch("");navToDept(id)}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",border:"none",borderBottom:`1px solid ${c.bd}`,background:"transparent",cursor:"pointer",fontSize:base-1,color:c.tx,textAlign:"left"}}>
                <span style={{fontSize:14}}>{ICONS[r.type]}</span>
                <span style={{fontWeight:600}}>{rl[r.labelKey]||id}</span>
                <span style={{marginLeft:"auto",fontSize:11,color:c.tx2,background:FLOOR_INFO[r.floor].color+"15",padding:"2px 8px",borderRadius:10,fontWeight:600}}>{t.floor} {r.floor===0?"G":r.floor}</span>
              </button>)}
            </div>}
          </div>

          {/* Quick nav buttons */}
          <div style={{padding:"0 20px",display:"flex",gap:8,marginBottom:16}}>
            <button onClick={()=>setTab("navigate")} style={{flex:1,padding:"12px 8px",background:c.ac,color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:base-1,cursor:"pointer",boxShadow:"0 2px 8px rgba(37,99,235,.25)"}}>🗺️ {t.navigate}</button>
            <button onClick={()=>setTab("phrases")} style={{flex:1,padding:"12px 8px",background:c.w,color:c.tx,border:`1.5px solid ${c.bd}`,borderRadius:12,fontWeight:700,fontSize:base-1,cursor:"pointer"}}>🤟 {t.phrases}</button>
          </div>

          {/* Patient flow cards */}
          <div style={{padding:"0 20px",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:c.tx2,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{t.quickNav}</div>
            <div style={{display:"flex",gap:8}}>
              {[
                {key:"opd",icon:"🩺",label:t.opdFlow,color:"#2563EB",bg:"#EFF6FF",dest:"opdReception"},
                {key:"ipd",icon:"🛏️",label:t.ipdFlow,color:"#D97706",bg:"#FFFBEB",dest:"ipdReception"},
                {key:"emergency",icon:"🚨",label:t.emergFlow,color:"#DC2626",bg:"#FEF2F2",dest:"emergency"},
              ].map(f=><button key={f.key} onClick={()=>navToDept(f.dest)} style={{flex:1,padding:"14px 8px",background:f.bg,border:`1.5px solid ${f.color}30`,borderRadius:14,cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:4}}>{f.icon}</div>
                <div style={{fontSize:11,fontWeight:700,color:f.color,lineHeight:1.3}}>{f.label}</div>
              </button>)}
            </div>
          </div>

          {/* Accessibility toggles */}
          <div style={{padding:"0 20px",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:c.tx2,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{t.accessLabel}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{k:"wheelchair",i:"♿",l:t.wheelchair,co:"#059669",bg:"#ECFDF5"},{k:"vision",i:"👁",l:t.vision,co:"#D97706",bg:"#FFFBEB"},{k:"hearing",i:"👂",l:t.hearing,co:"#7C3AED",bg:"#F5F3FF"}].map(m=><button key={m.k} onClick={()=>toggleAcc(m.k)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:acc[m.k]?m.bg:c.w,border:`1.5px solid ${acc[m.k]?m.co:c.bd}`,borderRadius:12,cursor:"pointer"}}><span style={{fontSize:18}}>{m.i}</span><span style={{fontSize:base-2,fontWeight:600,color:acc[m.k]?m.co:c.tx2}}>{m.l}</span></button>)}
            </div>
          </div>

          {/* Featured phrase */}
          {PHRASES.filter(p=>p.featured).map(p=><div key={p.id} onClick={()=>{setTab("phrases");setExpId(p.id)}} style={{margin:"0 20px 16px",padding:18,background:c.redBg,borderRadius:16,cursor:"pointer",position:"relative",overflow:"hidden"}}>
            <span style={{fontSize:10,fontWeight:700,color:c.red,textTransform:"uppercase",letterSpacing:1}}>{t.urgent}</span>
            <div style={{fontSize:isLg?20:17,fontWeight:800,marginTop:4,direction:"rtl"}}>{p.text.ar}</div>
            <div style={{fontSize:base-1,color:c.tx2,marginTop:2}}>{p.text.en}</div>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:8,color:c.red,fontSize:base-2,fontWeight:600}}>{t.viewDemo} ▶</div>
            <span style={{position:"absolute",top:8,right:14,fontSize:48,opacity:.08,color:c.red}}>✳</span>
          </div>)}

          {/* Floor directory */}
          <div style={{padding:"0 20px",marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:c.tx2,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Hospital Directory</div>
            {[0,1,2,3,4].map(f=>{const info=FLOOR_INFO[f];return <button key={f} onClick={()=>{setMapFloor(f);setTab("navigate")}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 14px",background:c.w,border:`1px solid ${c.bd}`,borderRadius:12,cursor:"pointer",marginBottom:6,textAlign:"left"}}>
              <span style={{width:36,height:36,borderRadius:10,background:info.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{info.icon}</span>
              <div><div style={{fontWeight:700,fontSize:base-1,color:info.color}}>{f===0?"G":f}</div><div style={{fontSize:11,color:c.tx2}}>{info[lang]||info.en}</div></div>
              <span style={{marginLeft:"auto",color:c.bd,fontSize:18}}>›</span>
            </button>})}
          </div>
        </div>}

        {/* ═══ NAVIGATE ═══ */}
        {tab==="navigate"&&<div className="fi">
          <div style={{display:"flex",alignItems:"center",gap:0,margin:"12px 12px 0",background:c.w,borderRadius:"14px 14px 0 0",border:`1px solid ${c.bd}`,borderBottom:"none",overflow:"hidden"}}>
            {[0,1,2,3,4].map(f=><button key={f} onClick={()=>setMapFloor(f)} style={{flex:1,padding:"9px 0",border:"none",background:mapFloor===f?FLOOR_INFO[f].color:"transparent",color:mapFloor===f?"#fff":c.tx2,fontWeight:700,fontSize:12,cursor:"pointer",borderRight:f<4?`1px solid ${c.bd}`:"none"}}>{f===0?"G":f}</button>)}
          </div>
          <div style={{margin:"0 12px",padding:"5px 12px",background:fi.color+"12",borderLeft:`1px solid ${c.bd}`,borderRight:`1px solid ${c.bd}`,fontSize:11,fontWeight:600,color:fi.color,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><span>{fi.icon}</span>{fi[lang]||fi.en}</div>
          <div style={{background:c.mapBg,margin:"0 12px",borderRadius:"0 0 14px 14px",border:`1px solid ${c.bd}`,overflow:"hidden",boxShadow:c.sh}}>
            <svg viewBox="-10 40 640 400" style={{width:"100%",height:260,display:"block"}}>
              <defs><pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r=".6" fill={c.mapDot}/></pattern></defs>
              <rect x="-10" y="40" width="640" height="400" fill="url(#dots)"/>
              <rect x="30" y="55" width="540" height="380" rx="14" fill="none" stroke={fi.color+"30"} strokeWidth="1.5" strokeDasharray="6,4"/>
              {floorEdges.map((e,i)=>{const f=ROOMS[e.from],t2=ROOMS[e.to];const on=route?.path&&(()=>{for(let j=0;j<route.path.length-1;j++){if((route.path[j]===e.from&&route.path[j+1]===e.to)||(route.path[j]===e.to&&route.path[j+1]===e.from))return true}return false})();return <g key={i}>{on&&<line x1={f.x} y1={f.y} x2={t2.x} y2={t2.y} stroke={c.ac} strokeWidth="10" strokeLinecap="round" opacity=".12"/>}<line x1={f.x} y1={f.y} x2={t2.x} y2={t2.y} stroke={on?c.ac:c.mapEdge} strokeWidth={on?3.5:1} strokeDasharray={e.hasStairs?"8,5":"none"} strokeLinecap="round" opacity={on?1:.4}/></g>})}
              {route?.path?.slice(0,-1).map((rid,i)=>{const f=ROOMS[rid],t2=ROOMS[route.path[i+1]];if(f.floor!==mapFloor||t2.floor!==mapFloor)return null;const mx=(f.x+t2.x)/2,my=(f.y+t2.y)/2;return <g key={`a${i}`} transform={`translate(${mx},${my}) rotate(${Math.atan2(t2.y-f.y,t2.x-f.x)*180/Math.PI})`}><polygon points="-5,-4 6,0 -5,4" fill={c.ac} opacity=".8"/></g>})}
              {floorRooms.map(([id,rm])=>{const isS=id===startRoom,isE=id===endRoom,onP=route?.path?.includes(id),isA=dirs[stp]?.roomId===id;const col=isS?c.grn:isE?c.ac:TCOL[rm.type]||"#9CA3AF",r=isS||isE?20:onP?16:13;return <g key={id} style={{cursor:route?"default":"pointer"}} onClick={()=>{if(!route)setEndRoom(id)}}>
                {isA&&<circle cx={rm.x} cy={rm.y} r="16" fill="none" stroke={c.ac} strokeWidth="2"><animate attributeName="r" from="16" to="30" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" from=".6" to="0" dur="1.4s" repeatCount="indefinite"/></circle>}
                <circle cx={rm.x} cy={rm.y} r={r} fill={c.nodeFill} stroke={col} strokeWidth={isS||isE?2.5:1.2}/>
                <text x={rm.x} y={rm.y+1} textAnchor="middle" dominantBaseline="middle" fontSize={isS||isE?9:8} fontWeight="800" fill={col}>{ICONS[rm.type]}</text>
                <text x={rm.x} y={rm.y+r+12} textAnchor="middle" fontSize={8} fontWeight={onP?700:500} fill={onP?c.tx:c.mapLabel}>{(rl[rm.labelKey]||id).length>12?(rl[rm.labelKey]||id).slice(0,11)+"…":rl[rm.labelKey]||id}</text>
              </g>})}
            </svg>
          </div>
          <div style={{padding:"12px 16px 0"}}>
            {!route?<div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1}}><label style={{fontSize:11,fontWeight:600,color:c.tx2,marginBottom:4,display:"block"}}>{t.from}</label><select value={startRoom} onChange={e=>{setStartRoom(e.target.value);setMapFloor(ROOMS[e.target.value].floor)}} style={{width:"100%",padding:"10px 30px 10px 12px",borderRadius:10,border:`1.5px solid ${c.bd}`,background:c.w,color:c.tx,fontSize:base-1,outline:"none"}}>{Object.entries(ROOMS).map(([id,r])=><option key={id} value={id}>{ICONS[r.type]} {rl[r.labelKey]||id} ({r.floor===0?"G":"F"+r.floor})</option>)}</select></div>
                <div style={{flex:1}}><label style={{fontSize:11,fontWeight:600,color:c.tx2,marginBottom:4,display:"block"}}>{t.to}</label><select value={endRoom} onChange={e=>{setEndRoom(e.target.value);if(e.target.value)setMapFloor(ROOMS[e.target.value].floor)}} style={{width:"100%",padding:"10px 30px 10px 12px",borderRadius:10,border:`1.5px solid ${c.bd}`,background:c.w,color:c.tx,fontSize:base-1,outline:"none"}}><option value="">— {t.selectDest} —</option>{Object.entries(ROOMS).filter(([id])=>id!==startRoom).map(([id,r])=><option key={id} value={id}>{ICONS[r.type]} {rl[r.labelKey]||id} ({r.floor===0?"G":"F"+r.floor})</option>)}</select></div>
              </div>
              {Object.values(acc).some(v=>v)&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{acc.wheelchair&&<span style={{background:c.grnBg,border:"1px solid #059669",borderRadius:20,padding:"2px 8px",fontSize:11,color:c.grn,fontWeight:600}}>♿</span>}{acc.vision&&<span style={{background:"#FFFBEB",border:"1px solid #D97706",borderRadius:20,padding:"2px 8px",fontSize:11,color:"#D97706",fontWeight:600}}>👁</span>}{acc.hearing&&<span style={{background:"#F5F3FF",border:"1px solid #7C3AED",borderRadius:20,padding:"2px 8px",fontSize:11,color:"#7C3AED",fontWeight:600}}>👂</span>}{acc.cognitive&&<span style={{background:"#FFF7ED",border:"1px solid #EA580C",borderRadius:20,padding:"2px 8px",fontSize:11,color:"#EA580C",fontWeight:600}}>🧠</span>}</div>}
              <button onClick={doNav} disabled={!endRoom} style={{width:"100%",padding:13,borderRadius:14,border:"none",background:endRoom?c.ac:"#E5E7EB",color:endRoom?"#fff":"#9CA3AF",fontSize:base,fontWeight:700,cursor:endRoom?"pointer":"default",boxShadow:endRoom?"0 2px 8px rgba(37,99,235,.3)":"none"}}>{t.go}</button>
            </div>:
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div><span style={{fontWeight:700,color:c.grn,fontSize:base-1}}>{rl[ROOMS[startRoom]?.labelKey]}</span><span style={{margin:"0 5px",color:c.tx2}}>→</span><span style={{fontWeight:700,color:c.ac,fontSize:base-1}}>{rl[ROOMS[endRoom]?.labelKey]}</span></div><button onClick={reset} style={{background:c.w,border:`1px solid ${c.bd}`,borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600,color:c.tx2,cursor:"pointer"}}>{t.reset}</button></div>
              <div style={{display:"flex",gap:10,marginBottom:8,padding:"8px 12px",background:c.w,borderRadius:10,border:`1px solid ${c.bd}`,fontSize:12}}><span style={{color:c.tx2}}>{t.dist}: <b>{route.distance}m</b></span><span style={{color:c.tx2}}>{t.time}: <b>~{Math.max(1,Math.round(route.distance/60))}{t.mins}</b></span>{route.hasStairs?<span style={{color:"#D97706",fontWeight:600}}>{t.stairsWarn}</span>:acc.wheelchair&&<span style={{color:c.grn,fontWeight:600}}>{t.wheelchairOk}</span>}</div>
              {route.path?<div ref={stepsRef} style={{display:"flex",flexDirection:"column",gap:3}}>{dirs.map((s,i)=><div key={i} onClick={()=>setStp(i)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,cursor:"pointer",background:s.floorChange?(i===stp?"#FEF3C7":"#FFFBEB"):i===stp?c.acL:c.w,border:`1.5px solid ${i===stp?s.floorChange?"#F59E0B":c.ac:c.bd}`}}><div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,background:i<stp?c.grn:i===stp?s.floorChange?"#F59E0B":c.ac:c.w,border:`2px solid ${i<stp?c.grn:i===stp?s.floorChange?"#F59E0B":c.ac:c.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i<=stp?"#fff":c.tx2}}>{i<stp?"✓":i+1}</div><span style={{fontSize:base-1,fontWeight:i===stp?700:400,color:i===stp?c.tx:c.tx2}}>{s.text}</span></div>)}
                <div style={{display:"flex",gap:8,marginTop:6}}><button disabled={stp<=0} onClick={()=>setStp(p=>Math.max(0,p-1))} style={{flex:1,padding:9,borderRadius:10,border:`1px solid ${c.bd}`,background:c.w,color:stp>0?c.tx:"#D1D5DB",fontWeight:600,fontSize:base-1,cursor:stp>0?"pointer":"default"}}>← {t.back}</button><button disabled={stp>=dirs.length-1} onClick={()=>setStp(p=>Math.min(dirs.length-1,p+1))} style={{flex:1,padding:9,borderRadius:10,border:"none",background:stp<dirs.length-1?c.ac:"#E5E7EB",color:stp<dirs.length-1?"#fff":"#D1D5DB",fontWeight:600,fontSize:base-1,cursor:stp<dirs.length-1?"pointer":"default"}}>{t.step} {stp+2} →</button></div>
                {stp===dirs.length-1&&<div className="fi" style={{textAlign:"center",padding:14,color:c.grn,fontWeight:800,fontSize:base+2}}>✅ {t.arrived}</div>}
              </div>:<div style={{padding:16,textAlign:"center",color:c.red,fontWeight:600,background:c.redBg,borderRadius:12}}>{t.noRoute}</div>}
            </div>}
          </div>
        </div>}

        {/* ═══ PHRASES ═══ */}
        {tab==="phrases"&&<div className="fi">
          {acc.hearing&&<div style={{margin:"12px 20px 0",padding:"10px 14px",background:dark?"rgba(124,58,237,.15)":"#F5F3FF",border:"1.5px solid #7C3AED",borderRadius:12,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>👂</span><span style={{fontSize:12,fontWeight:600,color:"#7C3AED"}}>{t.hearingActive||"Hearing mode active — visual navigation enabled, sign phrases ready"}</span></div>}
          <div style={{padding:"20px 20px 10px"}}><h2 style={{fontSize:isLg?24:20,fontWeight:800,margin:0,color:c.tx}}>{t.tagline.split("\n")[0]}</h2><p style={{fontSize:base-2,color:c.tx2,marginTop:4}}>{t.tagSub}</p></div>
          <div style={{padding:"0 20px 10px"}}><div style={{position:"relative"}}><span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#9CA3AF"}}>🔍</span><input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} style={{width:"100%",padding:"11px 14px 11px 40px",borderRadius:14,border:`1.5px solid ${c.bd}`,background:c.w,fontSize:base-1,color:c.tx,outline:"none",boxSizing:"border-box"}}/></div></div>
          <div style={{padding:"0 20px 12px",display:"flex",gap:6,overflowX:"auto"}}>{["all","urgent","medical","navigation","general"].map(cat=><button key={cat} onClick={()=>setFilter(cat)} style={{padding:"7px 16px",borderRadius:24,border:"none",whiteSpace:"nowrap",background:filter===cat?c.tx:c.w,color:filter===cat?"#fff":c.tx2,fontSize:base-2,fontWeight:600,cursor:"pointer",boxShadow:filter===cat?"none":c.sh}}>{({all:t.allPhrases,urgent:t.urgent,medical:t.medical,navigation:t.navigation,general:t.general})[cat]}</button>)}</div>
          <div style={{padding:"0 20px",display:"flex",flexDirection:"column",gap:10}}>{phrases.map(p=>{const open=expId===p.id,txt=p.text[lang]||p.text.en,gest=p.gesture?.[lang]||p.gesture?.en;return <div key={p.id} onClick={()=>setExpId(open?null:p.id)} style={{background:p.featured?c.redBg:c.w,border:`1px solid ${p.featured?(dark?"#7F1D1D":"#FECACA"):c.bd}`,borderRadius:14,padding:p.featured?18:"14px 16px",boxShadow:c.sh,cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{width:28,height:28,borderRadius:8,background:cbg[p.cat],display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{p.emoji}</span><span style={{fontSize:9,fontWeight:700,color:CCOL[p.cat],textTransform:"uppercase",letterSpacing:1}}>{t[p.cat]||p.cat}</span></div>
            <div style={{fontSize:isLg?18:15,fontWeight:700,marginBottom:2}}>{txt}</div>
            {lang!=="en"&&<div style={{fontSize:base-2,color:c.tx2}}>{p.text.en}</div>}
            {open&&<div className="fi" style={{marginTop:10,borderTop:`1px solid ${c.bd}`,paddingTop:10}}>
              <div style={{fontSize:11,fontWeight:700,color:CCOL[p.cat],textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t.howToSign}</div>
              <div style={{fontSize:base-2,color:c.tx,lineHeight:1.6,marginBottom:10}}>{gest}</div>
              <button onClick={e=>{e.stopPropagation();setShowStaff(p.id)}} style={{width:"100%",padding:10,background:CCOL[p.cat],color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:base-1,cursor:"pointer"}}>📋 {t.showTo}</button>
            </div>}
            {!open&&<div style={{display:"flex",alignItems:"center",gap:4,marginTop:8,color:p.cat==="urgent"?c.red:c.ac,fontSize:base-2,fontWeight:600}}><span style={{width:18,height:18,borderRadius:"50%",background:CBG_[p.cat],display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>{p.cat==="urgent"?"🔴":"🔵"}</span>{p.cat==="urgent"?t.criticalSign:t.viewDemo}</div>}
          </div>})}</div>
        </div>}

        {/* ═══ SETTINGS ═══ */}
        {tab==="settings"&&<div className="fi" style={{padding:20}}>
          <h2 style={{fontSize:20,fontWeight:800,marginBottom:16,color:c.tx}}>{t.settings}</h2>

          {/* Dark Mode Toggle */}
          <div style={{marginBottom:20}}>
            <button onClick={()=>setDark(d=>!d)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:dark?c.acL:c.w,border:`1.5px solid ${dark?c.ac:c.bd}`,borderRadius:12,cursor:"pointer",width:"100%",textAlign:"left"}}>
              <span style={{fontSize:22}}>{dark?"🌙":"☀️"}</span>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:base-1,color:dark?c.ac:c.tx}}>{t.darkMode||"Dark Mode"}</div><div style={{fontSize:11,color:c.tx2}}>{dark?"Switch to light theme":"Switch to dark theme"}</div></div>
              <div style={{width:38,height:22,borderRadius:11,background:dark?c.ac:"#D1D5DB",position:"relative",flexShrink:0}}><div style={{width:16,height:16,borderRadius:"50%",background:dark?"#0B1120":"#fff",position:"absolute",top:3,left:dark?19:3,transition:"all .2s",boxShadow:"0 1px 2px rgba(0,0,0,.2)"}}/></div>
            </button>
          </div>

          <div style={{marginBottom:20}}><div style={{fontSize:11,fontWeight:700,color:c.tx2,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{t.langLabel}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>{Object.entries(LANGS).map(([code,info])=><button key={code} onClick={()=>setLang(code)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px",background:lang===code?c.acL:c.w,border:`1.5px solid ${lang===code?c.ac:c.bd}`,borderRadius:10,cursor:"pointer"}}><span style={{fontSize:16}}>{info.flag}</span><span style={{fontWeight:600,fontSize:12,color:lang===code?c.ac:c.tx}}>{info.code}</span></button>)}</div></div>
          <div><div style={{fontSize:11,fontWeight:700,color:c.tx2,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{t.accessLabel}</div>
            {[{k:"wheelchair",x:1,i:"♿",l:t.wheelchair,d:t.wheelchairDesc||"Avoids stairs, prefers wider corridors. Routes use lifts only.",co:"#059669",bg:dark?"rgba(5,150,105,.12)":"#ECFDF5"},{k:"vision",x:1,i:"👁",l:t.vision,d:t.visionDesc||"Larger text, higher contrast, thicker map lines.",co:"#D97706",bg:dark?"rgba(217,119,6,.12)":"#FFFBEB"},{k:"hearing",x:1,i:"👂",l:t.hearing,d:t.hearingDesc||"Visual-only navigation. Flashing direction cues replace audio. Auto-opens sign language phrases for quick communication with staff.",co:"#7C3AED",bg:dark?"rgba(124,58,237,.12)":"#F5F3FF"},{k:"cognitive",x:0,i:"🧠",l:t.cognitive,d:t.cognitiveDesc||"One simple instruction per step. No distances or extra info.",co:"#EA580C",bg:dark?"rgba(234,88,12,.12)":"#FFF7ED"}].filter(m=>m.x).map(m=><button key={m.k} onClick={()=>toggleAcc(m.k)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:acc[m.k]?m.bg:c.w,border:`1.5px solid ${acc[m.k]?m.co:c.bd}`,borderRadius:12,cursor:"pointer",width:"100%",marginBottom:6,textAlign:"left"}}><span style={{fontSize:22}}>{m.i}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:base-1,color:acc[m.k]?m.co:c.tx}}>{m.l}</div><div style={{fontSize:11,color:c.tx2,lineHeight:1.4}}>{m.d}</div></div><div style={{width:38,height:22,borderRadius:11,background:acc[m.k]?m.co:"#D1D5DB",position:"relative",flexShrink:0}}><div style={{width:16,height:16,borderRadius:"50%",background:dark?"#0B1120":"#fff",position:"absolute",top:3,left:acc[m.k]?19:3,transition:"all .2s",boxShadow:"0 1px 2px rgba(0,0,0,.2)"}}/></div></button>)}
          </div>
        </div>}
      </div>

      {/* BOTTOM TAB */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:c.w,borderTop:`1px solid ${c.bd}`,display:"flex",padding:"5px 0 env(safe-area-inset-bottom, 6px)",zIndex:50}}>
        {[{id:"home",i:"🏠",l:t.home},{id:"navigate",i:"🧭",l:t.navigate},{id:"phrases",i:"🤟",l:t.phrases},{id:"settings",i:"⚙️",l:t.settings}].map(item=><button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"7px 0",border:"none",cursor:"pointer",background:tab===item.id?c.acL:"transparent",borderRadius:tab===item.id?10:0,margin:tab===item.id?"0 3px":0}}><span style={{fontSize:18}}>{item.i}</span><span style={{fontSize:9,fontWeight:tab===item.id?700:500,color:tab===item.id?c.ac:c.tx2}}>{item.l}</span></button>)}
      </div>
    </div>
  );
}
