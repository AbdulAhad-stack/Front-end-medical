import React, { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "./navbar";
import { Upload, FlaskConical, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, AlertCircle, X, FileText, Loader2 } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const API = "http://localhost:5050";

const STATUS_CONFIG = {
  good:     { color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)", label: "Good",     icon: CheckCircle  },
  moderate: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", label: "Moderate", icon: AlertCircle   },
  bad:      { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)",  label: "Critical", icon: AlertTriangle },
};

const CATEGORY_ICONS = {
  CBC: "🩸", Metabolic: "⚡", Kidney: "🫘", Electrolytes: "⚗️",
  Lipids: "💧", Liver: "🫀", Thyroid: "🦋", Vitamins: "🌿",
};

// ── Particle Canvas (matches LoginPage) ────────────────────────────────────────
function ParticleCanvas({ accent }) {
  const canvasRef = useRef(null);
  const accentRef = useRef(accent);
  useEffect(() => { accentRef.current = accent; }, [accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      opacity: Math.random() * 0.3 + 0.06,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const c = accentRef.current || "56,189,248";
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},${p.opacity})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${c},${0.05 * (1 - d / 100)})`; ctx.lineWidth = 0.4; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none" />;
}

// ── Score Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, grade, color }) {
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
        <text x="70" y="65" textAnchor="middle" fill="white" fontSize="26" fontWeight="700"
          fontFamily="'Playfair Display', serif">{score}</text>
        <text x="70" y="83" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11"
          fontFamily="'DM Sans', sans-serif">out of 100</text>
      </svg>
      <span className="text-sm font-semibold tracking-widest uppercase" style={{ color, fontFamily: "'DM Sans', sans-serif" }}>
        {grade}
      </span>
    </div>
  );
}

// ── Result Card ────────────────────────────────────────────────────────────────
function ResultCard({ result }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[result.status];
  const Icon = cfg.icon;
  const ref = result.good_range;

  return (
    <div className="rounded-2xl border overflow-hidden transition-all duration-300"
      style={{ background: cfg.bg, borderColor: cfg.border }}>
      <button className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-3">
          <Icon size={18} color={cfg.color} />
          <div>
            <p className="text-sm font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {result.display}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
              {result.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-base font-bold" style={{ color: cfg.color, fontFamily: "'Playfair Display', serif" }}>
              {result.value} <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>{result.unit}</span>
            </p>
            <span className="text-[0.65rem] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full"
              style={{ background: `${cfg.color}22`, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          {open ? <ChevronUp size={15} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={15} color="rgba(255,255,255,0.3)" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: cfg.border }}>
          <div className="pt-4 space-y-3">
            {/* Range bar */}
            {ref && (
              <div>
                <div className="flex justify-between text-[0.7rem] mb-1.5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
                  <span>Normal: {ref[0]} – {ref[1]} {result.unit}</span>
                  <span>Your value: {result.value}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full" style={{
                    width: `${Math.min(100, (result.value / (ref[1] * 1.4)) * 100)}%`,
                    background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                    transition: "width 0.8s ease",
                  }} />
                </div>
                <div className="flex justify-between text-[0.65rem] mt-1" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
                  <span>0</span><span style={{ color: "#4ade8066" }}>✓ Normal zone</span><span>{Math.round(ref[1] * 1.4)}</span>
                </div>
              </div>
            )}

            {/* Info */}
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}>
              {result.description}
            </p>

            {/* Risk note */}
            {result.status !== "good" && (
              <div className="flex gap-2 p-3 rounded-xl" style={{ background: `${cfg.color}11`, border: `1px solid ${cfg.border}` }}>
                <AlertTriangle size={13} color={cfg.color} className="mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed" style={{ color: cfg.color, fontFamily: "'DM Sans', sans-serif" }}>
                  {result.risk_note}
                </p>
              </div>
            )}

            {/* Health score */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[0.7rem]" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>Health score contribution</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full" style={{ width: `${result.severity_score}%`, background: cfg.color }} />
                </div>
                <span className="text-[0.7rem] font-semibold" style={{ color: cfg.color }}>{result.severity_score}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Category Summary Cards ─────────────────────────────────────────────────────
function CategoryCard({ name, score }) {
  const grade = score >= 85 ? "#4ade80" : score >= 55 ? "#fbbf24" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
      <span className="text-xl">{CATEGORY_ICONS[name] || "🔬"}</span>
      <span className="text-[0.7rem] text-white/40 text-center tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>{name}</span>
      <span className="text-base font-bold" style={{ color: grade, fontFamily: "'Playfair Display', serif" }}>{score}</span>
    </div>
  );
}

// ── PDF Drop Zone ──────────────────────────────────────────────────────────────
function PDFDropZone({ onFile, loading }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") onFile(f);
  }, [onFile]);

  return (
    <div
      className="relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300"
      style={{
        borderColor: drag ? "rgba(56,189,248,0.6)" : "rgba(255,255,255,0.1)",
        background: drag ? "rgba(56,189,248,0.05)" : "rgba(255,255,255,0.015)",
      }}
      onClick={() => !loading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
    >
      <input ref={inputRef} type="file" accept=".pdf" className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      {loading
        ? <Loader2 size={36} color="#38bdf8" className="animate-spin" />
        : <Upload size={36} color={drag ? "#38bdf8" : "rgba(255,255,255,0.2)"} />}
      <div className="text-center">
        <p className="text-sm font-medium text-white/60" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {loading ? "Analyzing your report…" : "Drop your lab report PDF here"}
        </p>
        <p className="text-xs text-white/25 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          or click to browse — PDF only
        </p>
      </div>
    </div>
  );
}

// ── Dataset: 19 tests with full range definitions ─────────────────────────────
const TESTS_DATASET = [
  { key:"hemoglobin",        display:"Hemoglobin",              unit:"g/dL",    category:"CBC",          desc:"Oxygen-carrying protein in red blood cells",            hasGender:true,  male:{good:[13.5,17.5],moderate:[[11.0,13.5],[17.5,20.0]]},  female:{good:[12.0,15.5],moderate:[[10.0,12.0],[15.5,18.0]]},  lowRisk:"Anemia, fatigue, weakness",                     highRisk:"Polycythemia, blood clots" },
  { key:"wbc",               display:"WBC",                     unit:"x10³/µL", category:"CBC",          desc:"White blood cells — immune system fighters",            hasGender:false, general:{good:[4.5,11.0],moderate:[[3.0,4.5],[11.0,20.0]]},                                                                lowRisk:"Infection risk, immune deficiency",              highRisk:"Infection, inflammation, leukemia screening" },
  { key:"platelets",         display:"Platelets",               unit:"x10³/µL", category:"CBC",          desc:"Cells responsible for blood clotting",                  hasGender:false, general:{good:[150,400],moderate:[[100,150],[400,600]]},                                                                    lowRisk:"Bleeding risk, bruising",                        highRisk:"Clotting disorders, thrombocytosis" },
  { key:"rbc",               display:"RBC",                     unit:"x10⁶/µL", category:"CBC",          desc:"Red blood cells that carry oxygen",                      hasGender:true,  male:{good:[4.5,5.9],moderate:[[3.5,4.5],[5.9,7.0]]},        female:{good:[4.1,5.1],moderate:[[3.2,4.1],[5.1,6.5]]},         lowRisk:"Anemia, fatigue",                               highRisk:"Polycythemia, dehydration" },
  { key:"glucose",           display:"Blood Glucose (Fasting)", unit:"mg/dL",   category:"Metabolic",    desc:"Blood sugar measured after fasting",                    hasGender:false, general:{good:[70,99],moderate:[[60,70],[100,125]]},                                                                        lowRisk:"Hypoglycemia, dizziness, fainting",              highRisk:"Pre-diabetes (100-125), Diabetes (>=126)" },
  { key:"hba1c",             display:"HbA1c",                   unit:"%",       category:"Metabolic",    desc:"3-month average blood sugar indicator",                 hasGender:false, general:{good:[4.0,5.6],moderate:[[3.0,4.0],[5.7,6.4]]},                                                                  lowRisk:"Hypoglycemia risk",                              highRisk:"Pre-diabetes (5.7-6.4%), Diabetes (>=6.5%)" },
  { key:"creatinine",        display:"Creatinine",              unit:"mg/dL",   category:"Kidney",       desc:"Waste product filtered by kidneys",                     hasGender:true,  male:{good:[0.74,1.35],moderate:[[0.5,0.74],[1.35,2.0]]},    female:{good:[0.59,1.04],moderate:[[0.4,0.59],[1.04,1.8]]},    lowRisk:"Muscle loss, malnutrition",                      highRisk:"Kidney disease, CKD risk" },
  { key:"bun",               display:"BUN",                     unit:"mg/dL",   category:"Kidney",       desc:"Nitrogen in blood from protein breakdown",              hasGender:false, general:{good:[7,20],moderate:[[3,7],[20,40]]},                                                                             lowRisk:"Malnutrition, liver disease",                    highRisk:"Kidney dysfunction, dehydration" },
  { key:"sodium",            display:"Sodium",                  unit:"mEq/L",   category:"Electrolytes", desc:"Electrolyte for fluid balance and nerve function",       hasGender:false, general:{good:[136,145],moderate:[[130,136],[145,150]]},                                                                   lowRisk:"Hyponatremia: nausea, seizures",                 highRisk:"Hypernatremia: dehydration, neurological issues" },
  { key:"potassium",         display:"Potassium",               unit:"mEq/L",   category:"Electrolytes", desc:"Electrolyte vital for heart and muscle function",        hasGender:false, general:{good:[3.5,5.0],moderate:[[3.0,3.5],[5.0,5.5]]},                                                                  lowRisk:"Hypokalemia: muscle weakness, arrhythmia",       highRisk:"Hyperkalemia: cardiac arrest risk" },
  { key:"total_cholesterol", display:"Total Cholesterol",       unit:"mg/dL",   category:"Lipids",       desc:"Total fat-like substance in blood",                     hasGender:false, general:{good:[0,200],moderate:[null,[200,239]]},                                                                           lowRisk:"Rarely a concern",                               highRisk:"Cardiovascular disease, atherosclerosis" },
  { key:"ldl",               display:"LDL Cholesterol",         unit:"mg/dL",   category:"Lipids",       desc:"Bad cholesterol that builds up in artery walls",        hasGender:false, general:{good:[0,100],moderate:[null,[100,159]]},                                                                           lowRisk:"Not typically a concern",                        highRisk:"Heart attack, stroke, arterial plaque" },
  { key:"hdl",               display:"HDL Cholesterol",         unit:"mg/dL",   category:"Lipids",       desc:"Good cholesterol that removes bad cholesterol",         hasGender:true,  male:{good:[40,300],moderate:[[20,40],null]},                 female:{good:[50,300],moderate:[[25,50],null]},                 lowRisk:"Increased cardiovascular risk",                  highRisk:"Rarely a concern" },
  { key:"triglycerides",     display:"Triglycerides",           unit:"mg/dL",   category:"Lipids",       desc:"Type of fat in blood from excess calories",             hasGender:false, general:{good:[0,150],moderate:[null,[150,199]]},                                                                           lowRisk:"Rarely a concern",                               highRisk:"Pancreatitis, cardiovascular disease" },
  { key:"alt",               display:"ALT (Liver Enzyme)",      unit:"U/L",     category:"Liver",        desc:"Enzyme released when liver cells are damaged",          hasGender:true,  male:{good:[7,56],moderate:[null,[56,120]]},                  female:{good:[7,45],moderate:[null,[45,100]]},                  lowRisk:"Not typically a concern",                        highRisk:"Liver damage, hepatitis, fatty liver" },
  { key:"ast",               display:"AST (Liver Enzyme)",      unit:"U/L",     category:"Liver",        desc:"Enzyme found in liver and heart muscle cells",          hasGender:false, general:{good:[10,40],moderate:[null,[40,120]]},                                                                            lowRisk:"Not typically a concern",                        highRisk:"Liver damage, heart disease" },
  { key:"tsh",               display:"TSH (Thyroid)",           unit:"mIU/L",   category:"Thyroid",      desc:"Hormone controlling thyroid gland activity",            hasGender:false, general:{good:[0.4,4.0],moderate:[[0.1,0.4],[4.0,10.0]]},                                                                 lowRisk:"Hyperthyroidism: rapid heartbeat, weight loss",  highRisk:"Hypothyroidism: fatigue, weight gain" },
  { key:"vitamin_d",         display:"Vitamin D",               unit:"ng/mL",   category:"Vitamins",     desc:"Fat-soluble vitamin essential for bone health",         hasGender:false, general:{good:[30,100],moderate:[[20,30],[100,150]]},                                                                       lowRisk:"Bone loss, immune deficiency, fatigue",          highRisk:"Toxicity: nausea, kidney issues" },
  { key:"vitamin_b12",       display:"Vitamin B12",             unit:"pg/mL",   category:"Vitamins",     desc:"Vitamin critical for nerve function and red cells",     hasGender:false, general:{good:[200,900],moderate:[[150,200],[900,2000]]},                                                                   lowRisk:"Anemia, nerve damage, cognitive decline",        highRisk:"Rarely harmful: may indicate liver disorder" },
];

// ── Frontend analysis engine ───────────────────────────────────────────────────
function runAnalysis(valuesObj, gender) {
  const results = [];
  for (const [key, rawVal] of Object.entries(valuesObj)) {
    const val = parseFloat(rawVal);
    if (isNaN(val)) continue;
    const t = TESTS_DATASET.find(x => x.key === key);
    if (!t) continue;
    const ranges = (t.hasGender && gender !== "general") ? t[gender] : (t.general || t.male);
    if (!ranges) continue;
    const { good, moderate } = ranges;
    const modLow  = moderate?.[0] || null;
    const modHigh = moderate?.[1] || null;
    let status = "bad", direction = "normal", score = 10;
    if (good && val >= good[0] && val <= good[1]) {
      status = "good"; direction = "normal";
      const mid = (good[0]+good[1])/2, span = (good[1]-good[0])/2 || 1;
      score = 100 - 20*(Math.abs(val-mid)/span);
    } else if (modLow && val >= modLow[0] && val <= modLow[1]) {
      status = "moderate"; direction = "low";
      score = 40 + 20*((val-modLow[0])/(modLow[1]-modLow[0] || 1));
    } else if (modHigh && val >= modHigh[0] && val <= modHigh[1]) {
      status = "moderate"; direction = "high";
      score = 40 + 20*(1-(val-modHigh[0])/(modHigh[1]-modHigh[0] || 1));
    } else if (good && val < good[0]) {
      status = "bad"; direction = "low"; score = 10;
    } else {
      status = "bad"; direction = "high"; score = 10;
    }
    results.push({
      key: t.key, display: t.display, unit: t.unit, category: t.category,
      description: t.desc, value: val, status, direction,
      severity_score: Math.round(Math.min(100, Math.max(0, score)) * 10) / 10,
      good_range: good,
      risk_note: direction==="low" ? t.lowRisk : direction==="high" ? t.highRisk : "Values are within healthy range.",
    });
  }
  if (!results.length) return null;
  const WEIGHTS = { CBC:1.2, Metabolic:1.3, Kidney:1.2, Electrolytes:1.1, Lipids:1.1, Liver:1.1, Thyroid:1.0, Vitamins:0.9 };
  let wSum=0, wTotal=0;
  results.forEach(r => { const w=WEIGHTS[r.category]||1; wSum+=r.severity_score*w; wTotal+=w; });
  const overall = Math.round((wSum/wTotal)*10)/10;
  const [,grade,grade_color] = [[85,"Excellent","#4ade80"],[70,"Good","#86efac"],[55,"Fair","#fbbf24"],[40,"Poor","#f97316"],[0,"Critical","#ef4444"]].find(([m])=>overall>=m);
  const catMap = {};
  results.forEach(r => { catMap[r.category] = catMap[r.category]||[]; catMap[r.category].push(r.severity_score); });
  const category_scores = Object.fromEntries(Object.entries(catMap).map(([c,s])=>[c, Math.round((s.reduce((a,b)=>a+b)/s.length)*10)/10]));
  const bad=results.filter(r=>r.status==="bad"), mod=results.filter(r=>r.status==="moderate"), good2=results.filter(r=>r.status==="good");
  return { results, overall_score:overall, grade, grade_color, category_scores,
    summary:{ total:results.length, good:good2.length, moderate:mod.length, bad:bad.length, critical_flags:bad.map(r=>r.display) } };
}

// ── Manual Entry Form — button-driven UX ──────────────────────────────────────
function ManualForm({ onSubmit, loading }) {
  const [gender, setGender]       = useState("general");
  const [activeKey, setActiveKey] = useState(null);
  const [inputVal, setInputVal]   = useState("");
  const [added, setAdded]         = useState({});
  const inputRef = useRef(null);

  const activeTest = TESTS_DATASET.find(t => t.key === activeKey);
  const addedCount = Object.keys(added).length;
  const categories = [...new Set(TESTS_DATASET.map(t => t.category))];

  const selectTest = (key) => {
    setActiveKey(key);
    setInputVal(added[key] !== undefined ? String(added[key]) : "");
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const confirmValue = () => {
    const num = parseFloat(inputVal);
    if (isNaN(num) || inputVal.trim() === "") return;
    setAdded(prev => ({ ...prev, [activeKey]: num }));
    setActiveKey(null);
    setInputVal("");
  };

  const removeTest = (key) => setAdded(prev => { const n={...prev}; delete n[key]; return n; });

  const handleAnalyze = () => {
    if (addedCount === 0) return;
    const result = runAnalysis(added, gender);
    if (result) onSubmit(result);
  };

  return (
    <div className="space-y-5">

      {/* Gender */}
      <div>
        <p className="text-[0.68rem] uppercase tracking-widest mb-2"
          style={{ color:"rgba(255,255,255,0.25)", fontFamily:"'DM Sans', sans-serif" }}>
          Biological Sex
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[["general","Not specified"],["male","Male"],["female","Female"]].map(([g,label]) => (
            <button key={g} onClick={() => setGender(g)}
              className="py-2 rounded-xl text-xs font-semibold transition-all duration-200 border"
              style={{
                fontFamily:"'DM Sans', sans-serif",
                background: gender===g ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.03)",
                borderColor: gender===g ? "rgba(56,189,248,0.45)" : "rgba(255,255,255,0.07)",
                color: gender===g ? "#38bdf8" : "rgba(255,255,255,0.3)",
              }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Test buttons by category */}
      <div>
        <p className="text-[0.68rem] uppercase tracking-widest mb-3"
          style={{ color:"rgba(255,255,255,0.25)", fontFamily:"'DM Sans', sans-serif" }}>
          Click a test to enter its value
        </p>
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{CATEGORY_ICONS[cat]||"test"}</span>
                <span className="text-[0.62rem] uppercase tracking-widest"
                  style={{ color:"rgba(255,255,255,0.18)", fontFamily:"'DM Sans', sans-serif" }}>{cat}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TESTS_DATASET.filter(t => t.category===cat).map(test => {
                  const isDone   = added[test.key] !== undefined;
                  const isActive = activeKey === test.key;
                  const res      = isDone ? runAnalysis({[test.key]:added[test.key]}, gender)?.results?.[0] : null;
                  const cfg      = res ? STATUS_CONFIG[res.status] : null;
                  return (
                    <button key={test.key} onClick={() => selectTest(test.key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border"
                      style={{
                        fontFamily:"'DM Sans', sans-serif",
                        background: isActive ? "rgba(56,189,248,0.18)" : isDone ? `${cfg.color}18` : "rgba(255,255,255,0.03)",
                        borderColor: isActive ? "rgba(56,189,248,0.55)" : isDone ? `${cfg.color}50` : "rgba(255,255,255,0.08)",
                        color: isActive ? "#38bdf8" : isDone ? cfg.color : "rgba(255,255,255,0.4)",
                        transform: isActive ? "scale(1.04)" : "scale(1)",
                      }}>
                      {isDone && <span style={{ fontSize:"0.55rem" }}>checkmark</span>}
                      {test.display}
                      {isDone && <span className="font-bold opacity-70">{added[test.key]}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active test input panel */}
      {activeTest && (
        <div className="rounded-2xl border p-5 space-y-4"
          style={{ background:"rgba(56,189,248,0.05)", borderColor:"rgba(56,189,248,0.25)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white" style={{ fontFamily:"'DM Sans', sans-serif" }}>
                {activeTest.display}
              </p>
              <p className="text-[0.7rem] mt-0.5" style={{ color:"rgba(255,255,255,0.35)", fontFamily:"'DM Sans', sans-serif" }}>
                {activeTest.desc}
              </p>
            </div>
            <button onClick={() => setActiveKey(null)} className="text-white/20 hover:text-white/50 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Normal range hint */}
          {(() => {
            const ranges = (activeTest.hasGender && gender !== "general") ? activeTest[gender] : (activeTest.general || activeTest.male);
            const g = ranges?.good;
            return g ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background:"rgba(74,222,128,0.07)", border:"1px solid rgba(74,222,128,0.2)" }}>
                <CheckCircle size={12} color="#4ade80" />
                <span className="text-[0.68rem]" style={{ color:"#4ade80", fontFamily:"'DM Sans', sans-serif" }}>
                  Normal range: {g[0]} to {g[1]} {activeTest.unit}
                </span>
              </div>
            ) : null;
          })()}

          {/* Input row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="number" step="any"
                placeholder={"Enter value in " + activeTest.unit}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && confirmValue()}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-200"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(56,189,248,0.4)", fontFamily:"'DM Sans', sans-serif" }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] pointer-events-none"
                style={{ color:"rgba(255,255,255,0.25)", fontFamily:"'DM Sans', sans-serif" }}>
                {activeTest.unit}
              </span>
            </div>
            <button onClick={confirmValue}
              className="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
              style={{ background:"rgba(56,189,248,0.2)", border:"1px solid rgba(56,189,248,0.45)", color:"#38bdf8", fontFamily:"'DM Sans', sans-serif" }}>
              <CheckCircle size={15} /> Add
            </button>
          </div>

          {/* Risk hints */}
          <div className="grid grid-cols-2 gap-2">
            {[["Low risk", activeTest.lowRisk, "#fbbf24"], ["High risk", activeTest.highRisk, "#ef4444"]].map(([label, risk, color]) => (
              <div key={label} className="p-2.5 rounded-xl"
                style={{ background:`${color}0d`, border:`1px solid ${color}22` }}>
                <p className="text-[0.62rem] font-semibold mb-0.5" style={{ color, fontFamily:"'DM Sans', sans-serif" }}>{label}</p>
                <p className="text-[0.62rem] leading-relaxed" style={{ color:"rgba(255,255,255,0.3)", fontFamily:"'DM Sans', sans-serif" }}>{risk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Added tests chips */}
      {addedCount > 0 && (
        <div>
          <p className="text-[0.68rem] uppercase tracking-widest mb-2"
            style={{ color:"rgba(255,255,255,0.2)", fontFamily:"'DM Sans', sans-serif" }}>
            {addedCount} test{addedCount!==1?"s":""} ready to analyze
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(added).map(([key, val]) => {
              const t   = TESTS_DATASET.find(x=>x.key===key);
              const res = runAnalysis({[key]:val}, gender)?.results?.[0];
              const cfg = res ? STATUS_CONFIG[res.status] : STATUS_CONFIG.good;
              return (
                <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
                  style={{ background:`${cfg.color}12`, borderColor:`${cfg.color}35`, fontFamily:"'DM Sans', sans-serif" }}>
                  <span style={{ color:cfg.color }}>{t?.display}</span>
                  <span className="font-bold" style={{ color:"rgba(255,255,255,0.7)" }}>{val} {t?.unit}</span>
                  <button onClick={() => removeTest(key)} style={{ marginLeft:"2px", opacity:0.5 }}>
                    <X size={11} color={cfg.color} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analyze button */}
      <button onClick={handleAnalyze} disabled={loading || addedCount===0}
        className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2"
        style={{
          fontFamily:"'DM Sans', sans-serif",
          background: addedCount>0 && !loading ? "linear-gradient(135deg, rgba(56,189,248,0.25), rgba(56,189,248,0.12))" : "rgba(255,255,255,0.03)",
          border: "1px solid " + (addedCount>0 ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.07)"),
          color: addedCount>0 && !loading ? "#38bdf8" : "rgba(255,255,255,0.2)",
          cursor: addedCount>0 && !loading ? "pointer" : "not-allowed",
        }}>
        {loading
          ? <><Loader2 size={16} className="animate-spin"/> Analyzing…</>
          : <><FlaskConical size={16}/> {addedCount>0 ? "Analyze " + addedCount + " Test" + (addedCount!==1?"s":"") : "Select at least one test"}</>}
      </button>
    </div>
  );
}

// ── Results Panel ──────────────────────────────────────────────────────────────
function ResultsPanel({ data, onReset }) {
  const { results, overall_score, grade, grade_color, category_scores, summary } = data;

  return (
    <div className="space-y-6" style={{ animation: "fadeUp 0.5s ease both" }}>
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Analysis Complete
          </h2>
          <p className="text-xs text-white/30 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {summary.total} tests analyzed · {summary.good} good · {summary.moderate} moderate · {summary.bad} critical
          </p>
        </div>
        <button onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-2 rounded-xl border"
          style={{ borderColor: "rgba(255,255,255,0.08)", fontFamily: "'DM Sans', sans-serif" }}>
          <X size={13} /> New Report
        </button>
      </div>

      {/* Score + summary stats */}
      <div className="flex items-center gap-6 p-6 rounded-2xl border"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
        <ScoreRing score={overall_score} grade={grade} color={grade_color} />
        <div className="flex-1 space-y-3">
          {[
            { label: "Healthy", count: summary.good,     color: "#4ade80" },
            { label: "Moderate", count: summary.moderate, color: "#fbbf24" },
            { label: "Critical", count: summary.bad,      color: "#ef4444" },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[0.7rem] w-16 text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(count / summary.total) * 100}%`, background: color }} />
              </div>
              <span className="text-xs font-semibold w-4 text-right" style={{ color, fontFamily: "'DM Sans', sans-serif" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical flags */}
      {summary.critical_flags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 rounded-2xl border"
          style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.2)" }}>
          <AlertTriangle size={14} color="#ef4444" className="mt-0.5" />
          <p className="text-xs text-red-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <span className="font-semibold">Needs attention: </span>
            {summary.critical_flags.join(", ")}
          </p>
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(category_scores).length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-white/25 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            By System
          </p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(category_scores).map(([cat, sc]) => (
              <CategoryCard key={cat} name={cat} score={sc} />
            ))}
          </div>
        </div>
      )}

      {/* Individual results */}
      <div>
        <p className="text-xs uppercase tracking-widest text-white/25 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Detailed Results
        </p>
        <div className="space-y-2">
          {[...results].sort((a, b) => a.severity_score - b.severity_score).map((r, i) => (
            <ResultCard key={i} result={r} />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[0.68rem] text-white/20 leading-relaxed text-center pt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        This analysis is for informational purposes only. Always consult a licensed physician for medical advice and diagnosis.
      </p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const MedicalAnalyzer = () => {
  const [mode, setMode] = useState("upload"); // "upload" | "manual"
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [parsedCount, setParsedCount] = useState(0);

  const handlePdfUpload = async (file) => {
    setPdfFile(file);
    setError("");
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("gender", "general");
    try {
      const res = await fetch(`${API}/api/analyzer/upload-pdf`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to analyze PDF.");
        setLoading(false);
        return;
      }
      setParsedCount(Object.keys(data.parsed_values || {}).length);
      setResults(data);
    } catch {
      setError("Cannot connect to backend. Make sure Flask is running on port 5000.");
    }
    setLoading(false);
  };

  const handleManualSubmit = async (payload) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/analyzer/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Analysis failed."); setLoading(false); return; }
      setResults(data);
    } catch {
      setError("Cannot connect to backend. Make sure Flask is running on port 5000.");
    }
    setLoading(false);
  };

  const reset = () => { setResults(null); setError(""); setPdfFile(null); setParsedCount(0); };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#06060e", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <ParticleCanvas accent="56,189,248" />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: "radial-gradient(ellipse at 70% 30%, rgba(14,116,144,0.18) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(56,189,248,0.06) 0%, transparent 50%)"
      }} />
      {/* Grid */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: "linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <Navbar />

      {/* Page content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-20">

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-5" style={{ animation: "fadeUp 0.5s ease both" }}>
          <div className="w-8 h-px" style={{ background: "linear-gradient(90deg, transparent, #38bdf8)" }} />
          <span className="text-[0.68rem] tracking-[0.2em] uppercase font-medium text-sky-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Medical Report Intelligence
          </span>
          <div className="w-8 h-px" style={{ background: "linear-gradient(90deg, #38bdf8, transparent)" }} />
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-black text-white leading-tight mb-2"
          style={{ fontFamily: "'Playfair Display', serif", animation: "fadeUp 0.5s 0.08s ease both" }}>
          Lab Report{" "}
          <em className="not-italic" style={{
            backgroundImage: "linear-gradient(135deg, #38bdf8, #7dd3fc)",
            WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Analyzer</em>
        </h1>
        <p className="text-white/30 text-sm mb-8 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", animation: "fadeUp 0.5s 0.14s ease both" }}>
          Upload a PDF lab report or enter values manually — get instant clinical classification with actionable insights.
        </p>

        {/* ── Results ── */}
        {results ? (
          <div style={{ animation: "fadeUp 0.5s ease both" }}>
            {pdfFile && parsedCount > 0 && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl border"
                style={{ background: "rgba(56,189,248,0.06)", borderColor: "rgba(56,189,248,0.2)" }}>
                <FileText size={14} color="#38bdf8" />
                <p className="text-xs text-sky-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Extracted <strong>{parsedCount}</strong> test values from <strong>{pdfFile.name}</strong>
                </p>
              </div>
            )}
            <ResultsPanel data={results} onReset={reset} />
          </div>
        ) : (
          <div style={{ animation: "fadeUp 0.5s 0.2s ease both" }}>
            {/* Mode switcher */}
            <div className="flex rounded-2xl p-1 mb-6 border"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
              {[
                { id: "upload", label: "📄 Upload PDF" },
                { id: "manual", label: "Manual Entry" },
              ].map(({ id, label }) => (
                <button key={id} onClick={() => { setMode(id); setError(""); }}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: mode === id ? "rgba(56,189,248,0.15)" : "transparent",
                    color: mode === id ? "#38bdf8" : "rgba(255,255,255,0.3)",
                    border: mode === id ? "1px solid rgba(56,189,248,0.3)" : "1px solid transparent",
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex gap-2 p-4 rounded-2xl border mb-4"
                style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
                <AlertTriangle size={15} color="#ef4444" className="shrink-0 mt-0.5" />
                <p className="text-xs text-red-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
              </div>
            )}

            {/* Panel */}
            <div className="p-6 rounded-3xl border" style={{ background: "rgba(255,255,255,0.015)", borderColor: "rgba(255,255,255,0.07)" }}>
              {mode === "upload"
                ? <PDFDropZone onFile={handlePdfUpload} loading={loading} />
                : <ManualForm onSubmit={setResults} loading={loading} />
              }
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { icon: "🧬", title: "19 Tests Covered", desc: "CBC, metabolic, lipids, liver, thyroid, vitamins" },
                { icon: "⚡", title: "Instant Results", desc: "Rule-based clinical engine with WHO/AHA guidelines" },
                { icon: "🔒", title: "100% Local", desc: "Your data never leaves your machine" },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="p-4 rounded-2xl border text-center"
                  style={{ background: "rgba(255,255,255,0.015)", borderColor: "rgba(255,255,255,0.06)" }}>
                  <p className="text-xl mb-2">{icon}</p>
                  <p className="text-xs font-semibold text-white/60 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</p>
                  <p className="text-[0.68rem] text-white/25 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalAnalyzer;
