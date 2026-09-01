import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, ChevronLeft, ChevronRight, ImageOff, ExternalLink } from "lucide-react";

// ─── Design system ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    *{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --primary:#22c55e;--primary-dim:rgba(34,197,94,0.12);--primary-border:rgba(34,197,94,0.32);
      --bg:#0b0d10;--card:#14171c;--secondary:#101318;--border:#262b33;
      --muted:#1a1e25;--muted-fg:#8a94a3;--fg:#c7ccd4;--fg-strong:#f2f4f7;--gold:#eab308;
      --shadow:0 8px 28px rgba(0,0,0,0.45);
    }
    html,body{background:var(--bg);color:var(--fg);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
    #root{width:100%;min-height:100%;}
    ::-webkit-scrollbar{width:9px;height:9px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:var(--border);border-radius:6px;}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes modalIn{from{opacity:0;transform:translateY(10px) scale(0.99);}to{opacity:1;transform:translateY(0) scale(1);}}
    @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
    .fade-in{animation:fadeIn 0.2s ease-out;}
    .modal-in{animation:modalIn 0.22s cubic-bezier(0.16,1,0.3,1);}
    .skeleton{background:linear-gradient(90deg,var(--muted) 25%,var(--secondary) 50%,var(--muted) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;}
    .can-card{position:relative;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--card);transition:transform 0.16s ease,box-shadow 0.16s ease,border-color 0.16s ease;cursor:pointer;}
    .can-card:hover{transform:translateY(-2px);box-shadow:var(--shadow);border-color:var(--primary-border);}
    .can-card:hover img{transform:scale(1.04);}
    .can-card img{transition:transform 0.4s cubic-bezier(0.16,1,0.3,1);}
    button{cursor:pointer;font-family:inherit;border-radius:8px;}
    input,select{font-family:inherit;border-radius:8px;}
    .flag{width:14px;height:10px;object-fit:cover;border-radius:2px;flex-shrink:0;box-shadow:0 0 0 1px rgba(0,0,0,0.15);vertical-align:middle;}
  `}</style>
);
const mono = { fontFamily: "'Inter', system-ui, sans-serif" };
const disp = { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, letterSpacing: "-0.01em" };

// ─── Bandiere ──────────────────────────────────────────────────────────────────
const LINGUA_TO_ISO = { "ITALY":"IT","USA":"US","UTAH":"US","GERMANY":"DE","SPAIN":"ES","FRANCE":"FR","UK":"GB","NETHERLANDS":"NL","BELGIUM":"BE","AUSTRIA":"AT","SWITZERLAND":"CH","SWISS":"CH","PORTUGAL":"PT","SWEDEN":"SE","NORWAY":"NO","FINLAND":"FI","DENMARK":"DK","POLAND":"PL","CZECH":"CZ","HUNGARY":"HU","ROMANIA":"RO","BULGARIA":"BG","GREECE":"GR","TURKEY":"TR","RUSSIA":"RU","UKRAINE":"UA","JAPAN":"JP","CHINA":"CN","KOREA":"KR","AUSTRALIA":"AU","BRAZIL":"BR","MEXICO":"MX","CANADA":"CA","ARGENTINA":"AR","CHILE":"CL","SOUTH AFRICA":"ZA","INDIA":"IN","IRELAND":"IE","CROAZIA":"HR","CROATIA":"HR","SLOVAKIA":"SK","SLOVENIA":"SI","SERBIA":"RS","LUXEMBOURG":"LU","MALTA":"MT","CYPRUS":"CY","ESTONIA":"EE","LATVIA":"LV","LITHUANIA":"LT","ISRAEL":"IL","UAE":"AE","SAUDI ARABIA":"SA","EGITTO":"EG","EGYPT":"EG","MOROCCO":"MA","NIGERIA":"NG","KENYA":"KE","NEW ZEALAND":"NZ","THAILAND":"TH","VIETNAM":"VN","PHILIPPINES":"PH","INDONESIA":"ID","MALASYA":"MY","MALAYSIA":"MY","SINGAPORE":"SG","COLOMBIA":"CO","PERÙ":"PE","PERU":"PE","ECUADOR":"EC","MACEDONIA":"MK","HONG KONG":"HK","TAIWAN":"TW","SRI LANKA":"LK","GEORGIA":"GE","JORDAN":"JO","QATAR":"QA","JAMAICA":"JM","DOMINICAN":"DO","COSTA RICA":"CR","GUATEMALA":"GT","URUGUAY":"UY","AZERBAIJAN":"AZ","AFGHANISTAN":"AF","PARAGUAY":"PY","PANAMA":"PA","MYANMAR":"MM","PAKISTAN":"PK","KAZAKISTAN":"KZ","ALBANIA":"AL","TRINIDAD":"TT","BENELUX":"NL","POLKA":"PL" };
function flagIsos(lingua) {
  if (!lingua) return [];
  const up = String(lingua).toUpperCase().trim();
  if (up.includes("CARIB")) return ["🏝️"];
  if (up === "BENELUX") return ["NL", "BE", "LU"];
  const results = new Set();
  if (LINGUA_TO_ISO[up]) results.add(LINGUA_TO_ISO[up]);
  up.replace(/\(.*?\)/g, "").split(/\s*(?:\/|->|-|&)\s*/).forEach(p => { const k = p.trim(); if (LINGUA_TO_ISO[k]) results.add(LINGUA_TO_ISO[k]); });
  return [...results];
}
function Flag({ lingua }) {
  const [err, setErr] = useState({});
  const isos = flagIsos(lingua);
  if (!isos.length) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
      {isos.map((iso, i) => (
        <span key={iso + i} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
          {i > 0 && <span style={{ color: "var(--muted-fg)", fontSize: 10 }}>/</span>}
          {iso === "🏝️" ? <span style={{ fontSize: 13 }}>🏝️</span>
            : err[iso] ? <span style={{ fontSize: 8, fontWeight: 700, color: "var(--muted-fg)", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 3px" }}>{iso}</span>
            : <img className="flag" src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`} alt={iso} loading="lazy" onError={() => setErr(e => ({ ...e, [iso]: true }))} />}
        </span>
      ))}
    </span>
  );
}

// ─── Valore ────────────────────────────────────────────────────────────────────
function parseValore(v) { const n = parseFloat(String(v ?? "").replace(",", ".")); return isNaN(n) ? 0 : n; }
function fmtValore(v) { const n = parseValore(v); return n ? "€ " + n.toLocaleString("it-IT", { maximumFractionDigits: 2 }) : "—"; }

function Spinner() {
  return <div style={{ width: 24, height: 24, border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />;
}

function LazyImage({ src, alt }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { rootMargin: "200px" });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ width: "100%", height: "100%", position: "relative" }}>
      {!loaded && <div className={visible ? "skeleton" : ""} style={{ position: "absolute", inset: 0, background: visible ? undefined : "var(--card)" }} />}
      {visible && <img src={src} alt={alt} loading="lazy" decoding="async" onLoad={() => setLoaded(true)} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease" }} />}
    </div>
  );
}

function MetaTag({ children }) {
  return <span style={{ ...mono, fontSize: 10, color: "var(--muted-fg)", background: "var(--muted)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 6, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>{children}</span>;
}

// ─── Card ──────────────────────────────────────────────────────────────────────
function CanCard({ can, onClick }) {
  const photo = can.p1 || can.p2 || can.p3 || can.p4 || "";
  return (
    <div className="can-card" onClick={onClick}>
      <div style={{ width: "100%", paddingTop: "100%", position: "relative", overflow: "hidden", background: "var(--bg)" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {photo ? <LazyImage src={photo} alt={can.nome} /> : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--border)" }}>
              <ImageOff size={28} />
            </div>
          )}
        </div>
        {can.promo === "YES" && <span style={{ position: "absolute", top: 6, left: 6, ...mono, fontSize: 9, fontWeight: 700, background: "rgba(0,0,0,0.85)", border: "1px solid var(--gold)", color: "var(--gold)", padding: "2px 6px", borderRadius: 5 }}>PROMO</span>}
        {can.valore !== "" && can.valore != null && <span style={{ position: "absolute", bottom: 6, right: 6, ...mono, fontSize: 11, fontWeight: 700, background: "rgba(0,0,0,0.85)", border: "1px solid var(--primary-border)", color: "var(--primary)", padding: "2px 7px", borderRadius: 5 }}>{fmtValore(can.valore)}</span>}
      </div>
      <div style={{ padding: 10, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--fg-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{can.nome || "—"}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}>
          {can.sku && <span style={{ ...mono, fontSize: 10, color: "var(--primary)" }}>{can.sku}</span>}
          {can.produttore && <span style={{ ...mono, fontSize: 10, color: "var(--muted-fg)" }}>· {can.produttore}</span>}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
          {can.size && <MetaTag>{can.size}</MetaTag>}
          {can.lingua && <MetaTag><Flag lingua={can.lingua} />{can.lingua}</MetaTag>}
        </div>
      </div>
    </div>
  );
}

// ─── Dettaglio ─────────────────────────────────────────────────────────────────
function DetailModal({ can, onClose }) {
  const [active, setActive] = useState(0);
  useEffect(() => { setActive(0); }, [can?.id]);
  if (!can) return null;
  const photos = [can.p1, can.p2, can.p3, can.p4].filter(Boolean);
  const fields = [["NOME", can.nome], ["SKU", can.sku], ["PRODUTTORE", can.produttore], ["SIZE", can.size], ["PAESE", can.lingua ? <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Flag lingua={can.lingua} />{can.lingua}</span> : ""], ["TOP", can.top], ["STATO", can.stato], ["PROMO", can.promo || "—"], ["VALORE", fmtValore(can.valore)]];
  if (can.note) fields.push(["NOTE", can.note]);
  if (can.descrizione) fields.push(["DESCRIZIONE", can.descrizione]);
  return (
    <div className="fade-in" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="modal-in" onClick={e => e.stopPropagation()} style={{ background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: 14, width: "100%", maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "var(--shadow)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ flex: 1, ...disp, fontSize: 15, color: "var(--fg-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{can.nome}</div>
          <button onClick={onClose} style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--muted-fg)", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 16 }}>
            <div>
              <div style={{ width: "100%", paddingTop: "100%", position: "relative", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {photos.length ? <img src={photos[active]} alt={can.nome} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <ImageOff size={40} style={{ color: "var(--border)" }} />}
                </div>
              </div>
              {photos.length > 1 && (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${photos.length},1fr)`, gap: 6 }}>
                  {photos.map((p, i) => (
                    <div key={i} onClick={() => setActive(i)} style={{ paddingTop: "100%", position: "relative", border: `1px solid ${i === active ? "var(--primary)" : "var(--border)"}`, borderRadius: 6, overflow: "hidden", cursor: "pointer" }}>
                      <img src={p} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {fields.map(([label, val]) => (
                <div key={label} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                  <div style={{ ...mono, fontSize: 10, color: "var(--muted-fg)", letterSpacing: "0.12em", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: label === "VALORE" || label === "SKU" ? "var(--primary)" : "var(--fg-strong)" }}>{val || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filtri ────────────────────────────────────────────────────────────────────
function FilterSelect({ value, onChange, placeholder, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...mono, fontSize: 11, background: "var(--muted)", border: "1px solid var(--border)", color: value ? "var(--primary)" : "var(--muted-fg)", padding: "7px 8px", width: "100%" }}>
      <option value="">{placeholder}</option>
      {options.map(o => { const v = typeof o === "object" ? o.value : o, l = typeof o === "object" ? o.label : o; return <option key={v} value={v}>{l}</option>; })}
    </select>
  );
}

const PAGE_SIZE = 60;

export default function App() {
  const [cans, setCans] = useState(null);
  const [detail, setDetail] = useState(null);
  const [count, setCount] = useState(PAGE_SIZE);
  const [filters, setFilters] = useState({ search: "", produttore: "", size: "", lingua: "", top: "", promo: "", sort: "default" });

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "cans.json").then(r => r.json()).then(setCans);
  }, []);

  const produttori = useMemo(() => cans ? [...new Set(cans.map(c => c.produttore).filter(Boolean))].sort() : [], [cans]);
  const sizes = useMemo(() => cans ? [...new Set(cans.map(c => c.size).filter(Boolean))].sort() : [], [cans]);
  const nazioni = useMemo(() => cans ? [...new Set(cans.map(c => c.lingua).filter(Boolean))].sort() : [], [cans]);
  const tops = useMemo(() => cans ? [...new Set(cans.map(c => c.top).filter(Boolean))].sort() : [], [cans]);

  const filtered = useMemo(() => {
    if (!cans) return [];
    let r = [...cans];
    if (filters.produttore) r = r.filter(c => c.produttore === filters.produttore);
    if (filters.size) r = r.filter(c => c.size === filters.size);
    if (filters.lingua) r = r.filter(c => c.lingua === filters.lingua);
    if (filters.top) r = r.filter(c => c.top === filters.top);
    if (filters.promo) r = r.filter(c => (filters.promo === "YES" ? c.promo === "YES" : !c.promo));
    if (filters.search) { const s = filters.search.toLowerCase(); r = r.filter(c => `${c.nome} ${c.sku}`.toLowerCase().includes(s)); }
    if (filters.sort === "name_az") r.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
    else if (filters.sort === "valore_desc") r.sort((a, b) => parseValore(b.valore) - parseValore(a.valore));
    else if (filters.sort === "valore_asc") r.sort((a, b) => parseValore(a.valore) - parseValore(b.valore));
    return r;
  }, [cans, filters]);

  const totalValue = useMemo(() => cans ? cans.reduce((s, c) => s + parseValore(c.valore), 0) : 0, [cans]);
  const withPhoto = useMemo(() => cans ? cans.filter(c => c.p1 || c.p2 || c.p3 || c.p4).length : 0, [cans]);
  const countries = useMemo(() => cans ? new Set(cans.map(c => c.lingua).filter(Boolean)).size : 0, [cans]);

  const update = (k, v) => { setFilters(p => ({ ...p, [k]: v })); setCount(PAGE_SIZE); };
  const reset = () => { setFilters({ search: "", produttore: "", size: "", lingua: "", top: "", promo: "", sort: "default" }); setCount(PAGE_SIZE); };

  if (!cans) return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>
    </>
  );

  return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 60 }}>
        <header style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)", padding: "14px 20px" }}>
          <div style={{ ...disp, fontSize: 20, color: "var(--fg-strong)" }}><span style={{ color: "var(--primary)" }}>◆</span> REDMGHOST VAULT</div>
          <div style={{ ...mono, fontSize: 11, color: "var(--muted-fg)", marginTop: 4, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span><b style={{ color: "var(--primary)" }}>{cans.length}</b> lattine</span>
            <span><b style={{ color: "var(--primary)" }}>{countries}</b> paesi</span>
            <span><b style={{ color: "var(--primary)" }}>{withPhoto}</b> con foto</span>
            <span>∑ <b style={{ color: "var(--primary)" }}>{fmtValore(totalValue)}</b> valore totale stimato</span>
          </div>
          <div style={{ ...mono, fontSize: 9, color: "#555", marginTop: 6 }}>
            Copia di consultazione della collezione di RedMghost (Mario Ranieri) · dati e foto originali: <a href="https://monster-vault-server.onrender.com" target="_blank" rel="noreferrer" style={{ color: "var(--muted-fg)" }}>monster-vault-server.onrender.com <ExternalLink size={9} style={{ display: "inline" }} /></a>
          </div>
        </header>

        <div style={{ borderBottom: "1px solid var(--border)", padding: "10px 16px", background: "var(--secondary)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={12} style={{ position: "absolute", left: 8, color: "var(--muted-fg)" }} />
              <input type="text" placeholder="Cerca nome, SKU..." value={filters.search} onChange={e => update("search", e.target.value)} style={{ ...mono, fontSize: 11, background: "var(--muted)", border: "1px solid var(--border)", color: "var(--fg)", padding: "7px 8px 7px 26px", width: "100%" }} />
            </div>
            <FilterSelect value={filters.produttore} onChange={v => update("produttore", v)} placeholder="PRODUTTORI" options={produttori} />
            <FilterSelect value={filters.size} onChange={v => update("size", v)} placeholder="TUTTI I SIZE" options={sizes} />
            <FilterSelect value={filters.lingua} onChange={v => update("lingua", v)} placeholder="NAZIONE" options={nazioni} />
            <FilterSelect value={filters.top} onChange={v => update("top", v)} placeholder="TOP/TAB" options={tops} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => update("promo", filters.promo === "YES" ? "" : "YES")} style={{ ...mono, fontSize: 11, border: "1px solid", padding: "6px 10px", background: filters.promo === "YES" ? "rgba(234,179,8,0.12)" : "transparent", borderColor: filters.promo === "YES" ? "var(--gold)" : "var(--border)", color: filters.promo === "YES" ? "var(--gold)" : "var(--muted-fg)" }}>PROMO</button>
            <FilterSelect value={filters.sort} onChange={v => update("sort", v)} placeholder="ORDINA" options={[{ value: "name_az", label: "NOME A→Z" }, { value: "valore_desc", label: "VALORE ↓ (più alto)" }, { value: "valore_asc", label: "VALORE ↑ (più basso)" }]} />
            <button onClick={reset} style={{ ...mono, fontSize: 11, border: "1px solid transparent", color: "#ef4444", padding: "6px 10px", background: "transparent", display: "flex", alignItems: "center", gap: 4 }}><X size={12} /> RESET</button>
            <div style={{ ...mono, fontSize: 11, color: "var(--muted-fg)", marginLeft: "auto" }}>{filtered.length} / {cans.length} · valore filtro: {fmtValore(filtered.reduce((s, c) => s + parseValore(c.valore), 0))}</div>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
            {filtered.slice(0, count).map(c => <CanCard key={c.id} can={c} onClick={() => setDetail(c)} />)}
          </div>
          {filtered.length > count && (
            <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
              <button onClick={() => setCount(p => p + PAGE_SIZE)} style={{ ...disp, fontSize: 12, background: "var(--primary)", color: "#04140a", border: "none", padding: "12px 40px", borderRadius: 10, letterSpacing: "0.05em" }}>CARICA ALTRI ▼</button>
            </div>
          )}
        </div>
      </div>
      <DetailModal can={detail} onClose={() => setDetail(null)} />
    </>
  );
}
