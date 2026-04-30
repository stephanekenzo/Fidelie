import { useState, useMemo } from "react";

const fmt = (n) => Number(n).toLocaleString("fr-FR") + " F";
const today = () => new Date().toISOString().split("T")[0];
const dateStr = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const diffDays = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 86400000);
const addDays = (d, n) => { const r = new Date(d + "T12:00:00"); r.setDate(r.getDate() + n); return r.toISOString().split("T")[0]; };
const monthDays = (y, m) => new Date(y, m + 1, 0).getDate();

const CHAMBRES_INIT = Array.from({ length: 27 }, (_, i) => {
  const num = 101 + i;
  let prix = 15000, type = "Standard";
  if (num === 117) { prix = 45000; type = "Suite"; }
  if (num === 121) { prix = 20000; type = "VIP"; }
  return { num, prix, type, statut: "libre" };
});

const EMPLOYES = ["Réception", "Mamadou", "Clarisse", "Roger"];
const SOURCES = ["Direct / Téléphone", "WhatsApp", "Site web", "Walk-in", "Agence"];
const STATUTS_REZ = ["confirmée", "en attente", "annulée", "check-in", "check-out"];

const MENU_ITEMS = [
  { id: 1, cat: "Plats", nom: "Poulet DG", prix: 3500 },
  { id: 2, cat: "Plats", nom: "Poisson braisé", prix: 4000 },
  { id: 3, cat: "Plats", nom: "Ndolé", prix: 2500 },
  { id: 4, cat: "Plats", nom: "Eru", prix: 2500 },
  { id: 5, cat: "Plats", nom: "Riz sauté", prix: 1500 },
  { id: 6, cat: "Boissons", nom: "Bière 33cl", prix: 800 },
  { id: 7, cat: "Boissons", nom: "Eau minérale", prix: 500 },
  { id: 8, cat: "Boissons", nom: "Jus naturel", prix: 1000 },
  { id: 9, cat: "Boissons", nom: "Cocktail", prix: 2000 },
  { id: 10, cat: "Boissons", nom: "Vin rouge", prix: 3000 },
];

const STOCK_INIT = [
  { id: 1, nom: "Savon de bain", qte: 80, seuil: 20, unite: "pcs" },
  { id: 2, nom: "Shampoing", qte: 60, seuil: 15, unite: "pcs" },
  { id: 3, nom: "Papier toilette", qte: 120, seuil: 30, unite: "roul." },
  { id: 4, nom: "Détergent linge", qte: 25, seuil: 5, unite: "kg" },
  { id: 5, nom: "Eau de Javel", qte: 15, seuil: 3, unite: "L" },
  { id: 6, nom: "Serviettes bain", qte: 55, seuil: 20, unite: "pcs" },
  { id: 7, nom: "Draps (jeux)", qte: 40, seuil: 15, unite: "jeux" },
  { id: 8, nom: "Désinfectant", qte: 8, seuil: 2, unite: "L" },
];

const Input = ({ label, ...p }) => (
  <div style={{ marginBottom: 13 }}>
    {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: .6 }}>{label}</label>}
    <input style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "9px 11px", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" }} {...p} />
  </div>
);
const Sel = ({ label, options, ...p }) => (
  <div style={{ marginBottom: 13 }}>
    {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: .6 }}>{label}</label>}
    <select style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "9px 11px", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" }} {...p}>
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
);
const Btn = ({ children, color = "#1a1a2e", outline, full, sm, ...p }) => (
  <button style={{ background: outline ? "transparent" : color, color: outline ? color : "#fff", border: `2px solid ${color}`, borderRadius: 8, padding: sm ? "6px 12px" : "10px 18px", fontSize: sm ? 12 : 14, fontWeight: 700, cursor: "pointer", width: full ? "100%" : "auto", fontFamily: "inherit" }} {...p}>{children}</button>
);
const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,30,.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: wide ? 640 : 480, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,.3)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1a1a2e" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}>×</button>
      </div>
      <div style={{ padding: "18px 22px 22px" }}>{children}</div>
    </div>
  </div>
);

const statutColor = {
  confirmée: { bg: "#d1fae5", c: "#065f46" },
  "en attente": { bg: "#fef3c7", c: "#92400e" },
  annulée: { bg: "#fee2e2", c: "#991b1b" },
  "check-in": { bg: "#dbeafe", c: "#1e40af" },
  "check-out": { bg: "#f3f4f6", c: "#374151" },
};
const Badge = ({ s }) => { const col = statutColor[s] || statutColor["en attente"]; return <span style={{ background: col.bg, color: col.c, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{s}</span>; };

function ModuleReservations({ reservations, setReservations, chambres, addTransaction }) {
  const [view, setView] = useState("liste");
  const [modal, setModal] = useState(null);
  const [calDate, setCalDate] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [filtre, setFiltre] = useState("tous");
  const [search, setSearch] = useState("");
  const emptyForm = { chambre: "", client: "", tel: "", email: "", checkIn: today(), checkOut: addDays(today(), 1), source: SOURCES[0], statut: "confirmée", employe: EMPLOYES[0], acompte: "", notes: "" };
  const [form, setForm] = useState(emptyForm);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const chambreObj = chambres.find(c => c.num === parseInt(form.chambre));
  const nuits = form.checkIn && form.checkOut ? Math.max(1, diffDays(form.checkIn, form.checkOut)) : 0;
  const montantTotal = chambreObj ? chambreObj.prix * nuits : 0;
  const acompte = parseInt(form.acompte) || 0;
  const chambresDisponibles = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return chambres;
    return chambres.filter(ch => {
      const conflict = reservations.filter(r => r.chambre === ch.num && r.statut !== "annulée" && r.statut !== "check-out" && r.id !== form.id && r.checkIn < form.checkOut && r.checkOut > form.checkIn);
      return conflict.length === 0;
    });
  }, [form.checkIn, form.checkOut, reservations, chambres, form.id]);
  const filteredRez = reservations.filter(r => {
    const matchF = filtre === "tous" || r.statut === filtre;
    const matchS = !search || r.client?.toLowerCase().includes(search.toLowerCase()) || String(r.chambre).includes(search);
    return matchF && matchS;
  });
  const sauverRez = () => {
    if (!form.chambre || !form.client || !form.checkIn || !form.checkOut) return alert("Remplis les champs obligatoires.");
    if (new Date(form.checkOut) <= new Date(form.checkIn)) return alert("La date de départ doit être après l'arrivée.");
    const newRez = { ...form, chambre: parseInt(form.chambre), id: form.id || Date.now(), montantTotal, nuits };
    if (form.id) { setReservations(p => p.map(r => r.id === form.id ? newRez : r)); }
    else {
      setReservations(p => [newRez, ...p]);
      if (acompte > 0) addTransaction({ type: "Chambre", desc: `Acompte — Ch.${form.chambre} · ${form.client}`, montant: acompte, employe: form.employe, date: today() });
    }
    setModal(null); setView("liste");
  };
  const doCheckin = (rez) => {
    setReservations(p => p.map(r => r.id === rez.id ? { ...r, statut: "check-in" } : r));
    const reste = rez.montantTotal - (parseInt(rez.acompte) || 0);
    if (reste > 0) addTransaction({ type: "Chambre", desc: `Ch.${rez.chambre} — ${rez.client} (${rez.nuits} nuit${rez.nuits > 1 ? "s" : ""})`, montant: reste, employe: rez.employe || EMPLOYES[0], date: today() });
  };
  const doCheckout = (rez) => setReservations(p => p.map(r => r.id === rez.id ? { ...r, statut: "check-out" } : r));
  const annuler = (rez) => { if (window.confirm(`Annuler la réservation de ${rez.client} ?`)) setReservations(p => p.map(r => r.id === rez.id ? { ...r, statut: "annulée" } : r)); };
  const demain = addDays(today(), 1);
  const arrivees = reservations.filter(r => r.checkIn === today() && (r.statut === "confirmée" || r.statut === "en attente"));
  const departs = reservations.filter(r => r.checkOut === today() && r.statut === "check-in");
  const arriveesDemain = reservations.filter(r => r.checkIn === demain && (r.statut === "confirmée" || r.statut === "en attente"));
  const { y, m } = calDate;
  const firstDay = new Date(y, m, 1).getDay();
  const days = monthDays(y, m);
  const prevMonth = () => setCalDate(p => p.m === 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m: p.m - 1 });
  const nextMonth = () => setCalDate(p => p.m === 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m: p.m + 1 });
  const rezByDay = useMemo(() => {
    const map = {};
    reservations.filter(r => r.statut !== "annulée").forEach(r => {
      let cur = r.checkIn;
      while (cur < r.checkOut) {
        const d = new Date(cur + "T12:00:00");
        if (d.getFullYear() === y && d.getMonth() === m) { const day = d.getDate(); if (!map[day]) map[day] = []; map[day].push(r); }
        cur = addDays(cur, 1);
      }
    });
    return map;
  }, [reservations, y, m]);
  const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const JOURS = ["D","L","M","M","J","V","S"];

  return (
    <div>
      {(arrivees.length > 0 || departs.length > 0 || arriveesDemain.length > 0) && (
        <div style={{ marginBottom: 14 }}>
          {arrivees.length > 0 && <div style={{ background: "#d1fae5", border: "2px solid #6ee7b7", borderRadius: 10, padding: 12, marginBottom: 8 }}><div style={{ fontWeight: 700, color: "#065f46", fontSize: 13, marginBottom: 4 }}>✈️ Arrivées aujourd'hui ({arrivees.length})</div>{arrivees.map(r => <div key={r.id} style={{ fontSize: 12, color: "#064e3b" }}>• Ch.{r.chambre} — {r.client}</div>)}</div>}
          {departs.length > 0 && <div style={{ background: "#fee2e2", border: "2px solid #fca5a5", borderRadius: 10, padding: 12, marginBottom: 8 }}><div style={{ fontWeight: 700, color: "#991b1b", fontSize: 13, marginBottom: 4 }}>🚪 Départs aujourd'hui ({departs.length})</div>{departs.map(r => <div key={r.id} style={{ fontSize: 12, color: "#7f1d1d" }}>• Ch.{r.chambre} — {r.client}</div>)}</div>}
          {arriveesDemain.length > 0 && <div style={{ background: "#fef3c7", border: "2px solid #fde68a", borderRadius: 10, padding: 12, marginBottom: 8 }}><div style={{ fontWeight: 700, color: "#92400e", fontSize: 13, marginBottom: 4 }}>📅 Arrivées demain ({arriveesDemain.length})</div>{arriveesDemain.map(r => <div key={r.id} style={{ fontSize: 12, color: "#78350f" }}>• Ch.{r.chambre} — {r.client}</div>)}</div>}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Btn color="#059669" onClick={() => { setForm(emptyForm); setModal("form"); }}>+ Nouvelle réservation</Btn>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {["liste","calendrier"].map(v => <button key={v} onClick={() => setView(v)} style={{ padding: "8px 14px", border: "2px solid", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", borderColor: view === v ? "#1a1a2e" : "#e5e7eb", background: view === v ? "#1a1a2e" : "transparent", color: view === v ? "#fff" : "#6b7280", fontFamily: "inherit" }}>{v === "liste" ? "📋" : "📆"}</button>)}
        </div>
      </div>

      {view === "liste" && (
        <>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Chercher client ou chambre..." />
          <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", scrollbarWidth: "none" }}>
            {["tous", ...STATUTS_REZ].map(s => <button key={s} onClick={() => setFiltre(s)} style={{ flex: "0 0 auto", padding: "5px 12px", borderRadius: 20, border: "2px solid", fontSize: 11, fontWeight: 700, cursor: "pointer", borderColor: filtre === s ? "#1a1a2e" : "#e5e7eb", background: filtre === s ? "#1a1a2e" : "transparent", color: filtre === s ? "#fff" : "#6b7280", fontFamily: "inherit", textTransform: "capitalize" }}>{s}</button>)}
          </div>
          {filteredRez.length === 0 ? <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Aucune réservation</div>
            : filteredRez.map(r => (
              <div key={r.id} onClick={() => setModal({ type: "detail", rez: r })} style={{ border: "1.5px solid #e5e7eb", borderRadius: 12, padding: 14, marginBottom: 10, background: "#fff", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div><span style={{ fontWeight: 800, fontSize: 16, color: "#1a1a2e" }}>Ch. {r.chambre}</span><span style={{ margin: "0 8px", color: "#d1d5db" }}>|</span><span style={{ fontWeight: 700, color: "#374151" }}>{r.client}</span></div>
                  <Badge s={r.statut} />
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>📅 {dateStr(r.checkIn)} → {dateStr(r.checkOut)} · {r.nuits} nuit{r.nuits > 1 ? "s" : ""}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{r.source}</span>
                  <span style={{ fontWeight: 800, color: "#059669", fontSize: 14 }}>{fmt(r.montantTotal || 0)}</span>
                </div>
                {(parseInt(r.acompte) || 0) > 0 && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>Acompte: {fmt(r.acompte)} · Reste: {fmt((r.montantTotal || 0) - (parseInt(r.acompte) || 0))}</div>}
              </div>
            ))}
        </>
      )}

      {view === "calendrier" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "4px 10px" }}>‹</button>
            <span style={{ fontWeight: 800, fontSize: 15 }}>{MOIS[m]} {y}</span>
            <button onClick={nextMonth} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "4px 10px" }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 6 }}>
            {JOURS.map((j, i) => <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#9ca3af" }}>{j}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
            {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => <div key={"e" + i} />)}
            {Array.from({ length: days }, (_, i) => {
              const day = i + 1;
              const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = ds === today();
              const occ = (rezByDay[day] || []).length;
              return <div key={day} style={{ borderRadius: 8, padding: "6px 4px", textAlign: "center", background: isToday ? "#1a1a2e" : occ > 0 ? "#dbeafe" : "#f9fafb", border: `1.5px solid ${isToday ? "#1a1a2e" : occ > 0 ? "#93c5fd" : "#f0f0f0"}`, minHeight: 44 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isToday ? "#fff" : "#374151" }}>{day}</div>
                {occ > 0 && <div style={{ fontSize: 10, color: isToday ? "#93c5fd" : "#1e40af", fontWeight: 700 }}>{occ}ch.</div>}
              </div>;
            })}
          </div>
        </div>
      )}

      {modal === "form" && (
        <Modal title={form.id ? `Modifier — ${form.client}` : "Nouvelle réservation"} onClose={() => setModal(null)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <div style={{ gridColumn: "1/-1" }}><Input label="Nom du client *" value={form.client} onChange={e => f("client", e.target.value)} placeholder="Prénom NOM" /></div>
            <Input label="Téléphone" value={form.tel} onChange={e => f("tel", e.target.value)} placeholder="+237..." />
            <Input label="Email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="optionnel" />
            <Input label="Arrivée *" type="date" value={form.checkIn} onChange={e => f("checkIn", e.target.value)} />
            <Input label="Départ *" type="date" value={form.checkOut} onChange={e => f("checkOut", e.target.value)} />
          </div>
          <div style={{ marginBottom: 13 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: .6 }}>Chambre * ({chambresDisponibles.length} disponibles)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(68px,1fr))", gap: 6, maxHeight: 180, overflowY: "auto" }}>
              {chambres.map(ch => {
                const dispo = chambresDisponibles.find(c => c.num === ch.num);
                const sel = form.chambre === String(ch.num);
                return <button key={ch.num} disabled={!dispo} onClick={() => f("chambre", String(ch.num))} style={{ border: `2px solid ${sel ? "#059669" : dispo ? "#e5e7eb" : "#f3f4f6"}`, borderRadius: 8, padding: "6px 4px", background: sel ? "#d1fae5" : dispo ? "#fff" : "#f9fafb", cursor: dispo ? "pointer" : "not-allowed", opacity: dispo ? 1 : .4, fontFamily: "inherit" }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: sel ? "#065f46" : "#374151" }}>{ch.num}</div>
                  <div style={{ fontSize: 9, color: "#6b7280" }}>{ch.type}</div>
                  <div style={{ fontSize: 10, color: sel ? "#059669" : "#9ca3af", fontWeight: 700 }}>{(ch.prix / 1000).toFixed(0)}k</div>
                </button>;
              })}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <Sel label="Source" value={form.source} onChange={e => f("source", e.target.value)} options={SOURCES} />
            <Sel label="Statut" value={form.statut} onChange={e => f("statut", e.target.value)} options={["confirmée", "en attente", "annulée"]} />
            <Sel label="Par" value={form.employe} onChange={e => f("employe", e.target.value)} options={EMPLOYES} />
            <Input label="Acompte (F)" type="number" value={form.acompte} onChange={e => f("acompte", e.target.value)} placeholder="0" />
          </div>
          <Input label="Notes" value={form.notes} onChange={e => f("notes", e.target.value)} placeholder="Demandes spéciales..." />
          {chambreObj && nuits > 0 && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{nuits} nuit{nuits > 1 ? "s" : ""} × {fmt(chambreObj.prix)}</span>
                <span style={{ fontWeight: 800, color: "#059669", fontSize: 15 }}>{fmt(montantTotal)}</span>
              </div>
              {acompte > 0 && <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #bbf7d0", marginTop: 6, paddingTop: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Reste à payer</span>
                <span style={{ fontWeight: 800, color: "#dc2626", fontSize: 15 }}>{fmt(montantTotal - acompte)}</span>
              </div>}
            </div>
          )}
          <Btn full color="#059669" onClick={sauverRez}>✅ {form.id ? "Mettre à jour" : "Confirmer"}</Btn>
        </Modal>
      )}

      {modal?.type === "detail" && (() => {
        const rez = reservations.find(x => x.id === modal.rez.id) || modal.rez;
        const reste = (rez.montantTotal || 0) - (parseInt(rez.acompte) || 0);
        return (
          <Modal title={`Ch.${rez.chambre} — ${rez.client}`} onClose={() => setModal(null)}>
            <div style={{ marginBottom: 14 }}><Badge s={rez.statut} /></div>
            {[["📅 Arrivée", dateStr(rez.checkIn)], ["🚪 Départ", dateStr(rez.checkOut)], ["🌙 Durée", `${rez.nuits} nuit(s)`], ["📞 Tél.", rez.tel || "—"], ["🔗 Source", rez.source], ["👤 Par", rez.employe], ["💰 Total", fmt(rez.montantTotal || 0)], ["✅ Acompte", fmt(parseInt(rez.acompte) || 0)], ["🔴 Reste", fmt(reste < 0 ? 0 : reste)]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{v}</span>
              </div>
            ))}
            {rez.notes && <div style={{ marginTop: 10, fontSize: 13, color: "#6b7280", background: "#f9fafb", borderRadius: 8, padding: 10 }}>📝 {rez.notes}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
              {rez.statut === "confirmée" && <Btn color="#1d4ed8" onClick={() => { doCheckin(rez); setModal(null); }}>✈️ Check-in</Btn>}
              {rez.statut === "en attente" && <Btn color="#1d4ed8" onClick={() => { doCheckin(rez); setModal(null); }}>✈️ Check-in</Btn>}
              {rez.statut === "check-in" && <Btn color="#7c3aed" onClick={() => { doCheckout(rez); setModal(null); }}>🚪 Check-out</Btn>}
              <Btn outline color="#1a1a2e" onClick={() => { setForm({ ...rez }); setModal("form"); }}>✏️ Modifier</Btn>
              {rez.statut !== "annulée" && rez.statut !== "check-out" && <Btn outline color="#dc2626" onClick={() => { annuler(rez); setModal(null); }}>🗑 Annuler</Btn>}
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

function ModuleChambres({ chambres, setChambres, addTransaction, reservations }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [filtre, setFiltre] = useState("tous");
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const getStatut = (ch) => { const active = reservations.find(r => r.chambre === ch.num && r.statut === "check-in"); return active ? "occupée" : ch.statut; };
  const libres = chambres.filter(ch => getStatut(ch) === "libre").length;
  const occupees = chambres.filter(ch => getStatut(ch) === "occupée").length;
  const chambresFilt = filtre === "tous" ? chambres : chambres.filter(ch => getStatut(ch) === filtre);
  const doCheckin = () => {
    if (!form.client || !form.checkIn || !form.checkOut) return alert("Champs obligatoires manquants.");
    const n = Math.max(1, diffDays(form.checkIn, form.checkOut));
    addTransaction({ type: "Chambre", desc: `Ch.${modal.ch.num} — ${form.client} (${n} nuit${n > 1 ? "s" : ""})`, montant: modal.ch.prix * n, employe: form.employe, date: today() });
    setChambres(p => p.map(c => c.num === modal.ch.num ? { ...c, statut: "occupée", client: form.client, checkIn: form.checkIn, checkOut: form.checkOut } : c));
    setModal(null);
  };
  const doCheckout = (ch) => { if (!window.confirm(`Check-out chambre ${ch.num} ?`)) return; setChambres(p => p.map(c => c.num === ch.num ? { ...c, statut: "libre", client: null, checkIn: null, checkOut: null } : c)); };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
        {[{ l: "Libres", v: libres, bg: "#d1fae5", c: "#065f46" }, { l: "Occupées", v: occupees, bg: "#fee2e2", c: "#991b1b" }, { l: "Total", v: 27, bg: "#ede9fe", c: "#5b21b6" }].map(s => (
          <div key={s.l} style={{ background: s.bg, borderRadius: 12, padding: "13px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 11, color: s.c, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["tous", "libre", "occupée", "maintenance"].map(s => <button key={s} onClick={() => setFiltre(s)} style={{ padding: "5px 12px", borderRadius: 20, border: "2px solid", fontSize: 11, fontWeight: 700, cursor: "pointer", borderColor: filtre === s ? "#1a1a2e" : "#e5e7eb", background: filtre === s ? "#1a1a2e" : "transparent", color: filtre === s ? "#fff" : "#6b7280", fontFamily: "inherit", textTransform: "capitalize" }}>{s === "tous" ? "Toutes" : s}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))", gap: 10 }}>
        {chambresFilt.map(ch => {
          const st = getStatut(ch); const rezActive = reservations.find(r => r.chambre === ch.num && r.statut === "check-in");
          return <div key={ch.num} style={{ border: `2px solid ${st === "occupée" ? "#fca5a5" : st === "maintenance" ? "#fde68a" : "#e5e7eb"}`, borderRadius: 12, padding: 12, background: st === "occupée" ? "#fff5f5" : st === "maintenance" ? "#fffbeb" : "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>{ch.num}</span>
              <span style={{ background: st === "occupée" ? "#fee2e2" : st === "maintenance" ? "#fef3c7" : "#d1fae5", color: st === "occupée" ? "#991b1b" : st === "maintenance" ? "#92400e" : "#065f46", padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{st}</span>
            </div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{ch.type}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{fmt(ch.prix)}/nuit</div>
            {rezActive && <><div style={{ fontSize: 11, color: "#374151", marginBottom: 2, fontWeight: 600 }}>👤 {rezActive.client}</div><div style={{ fontSize: 10, color: "#6b7280", marginBottom: 6 }}>→ {dateStr(rezActive.checkOut)}</div></>}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {st === "libre" && <Btn sm color="#059669" onClick={() => { setForm({ client: "", checkIn: today(), checkOut: addDays(today(), 1), employe: EMPLOYES[0] }); setModal({ type: "checkin", ch }); }}>Check-in</Btn>}
              {st === "occupée" && <Btn sm color="#dc2626" onClick={() => doCheckout(ch)}>Check-out</Btn>}
              <Btn sm outline color="#f59e0b" onClick={() => setChambres(p => p.map(c => c.num === ch.num ? { ...c, statut: c.statut === "maintenance" ? "libre" : "maintenance" } : c))}>🔧</Btn>
            </div>
          </div>;
        })}
      </div>
      {modal?.type === "checkin" && (
        <Modal title={`Check-in — Ch.${modal.ch.num}`} onClose={() => setModal(null)}>
          <Input label="Client *" value={form.client} onChange={e => f("client", e.target.value)} placeholder="Nom complet" />
          <Input label="Arrivée *" type="date" value={form.checkIn} onChange={e => f("checkIn", e.target.value)} />
          <Input label="Départ *" type="date" value={form.checkOut} onChange={e => f("checkOut", e.target.value)} />
          <Sel label="Par" value={form.employe} onChange={e => f("employe", e.target.value)} options={EMPLOYES} />
          {form.checkIn && form.checkOut && diffDays(form.checkIn, form.checkOut) > 0 && <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: "#065f46" }}><strong>{diffDays(form.checkIn, form.checkOut)} nuit(s)</strong> × {fmt(modal.ch.prix)} = <strong>{fmt(diffDays(form.checkIn, form.checkOut) * modal.ch.prix)}</strong></div>}
          <Btn full color="#059669" onClick={doCheckin}>✅ Confirmer</Btn>
        </Modal>
      )}
    </div>
  );
}

function ModuleCaisse({ transactions, setTransactions }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: "Divers", desc: "", montant: "", employe: EMPLOYES[0], date: today() });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const todayTx = transactions.filter(t => t.date === today());
  const moisStr = today().slice(0, 7);
  const totalJour = todayTx.reduce((s, t) => s + t.montant, 0);
  const totalMois = transactions.filter(t => t.date?.startsWith(moisStr)).reduce((s, t) => s + t.montant, 0);
  const byType = ["Chambre", "Restaurant", "Bar", "Divers"].map(tp => ({ tp, total: transactions.filter(t => t.type === tp && t.date?.startsWith(moisStr)).reduce((s, t) => s + t.montant, 0) })).filter(x => x.total > 0);
  const typeColors = { Chambre: "#dbeafe", Restaurant: "#d1fae5", Bar: "#ede9fe", Divers: "#f3f4f6" };
  const ajouter = () => { if (!form.desc || !form.montant) return; setTransactions(p => [{ ...form, montant: parseInt(form.montant), id: Date.now() }, ...p]); setModal(false); };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 14, padding: 16, color: "#fff" }}>
          <div style={{ fontSize: 10, opacity: .6, textTransform: "uppercase", letterSpacing: 1 }}>Aujourd'hui</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{fmt(totalJour)}</div>
          <div style={{ fontSize: 10, opacity: .5, marginTop: 2 }}>{todayTx.length} transaction(s)</div>
        </div>
        <div style={{ background: "linear-gradient(135deg,#065f46,#047857)", borderRadius: 14, padding: 16, color: "#fff" }}>
          <div style={{ fontSize: 10, opacity: .6, textTransform: "uppercase", letterSpacing: 1 }}>Ce mois</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{fmt(totalMois)}</div>
        </div>
      </div>
      {byType.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>{byType.map(({ tp, total }) => <div key={tp} style={{ background: typeColors[tp], borderRadius: 10, padding: "10px 12px" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{tp}</div><div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>{fmt(total)}</div></div>)}</div>}
      <Btn full color="#1a1a2e" onClick={() => setModal(true)} style={{ marginBottom: 14 }}>+ Ajouter une recette</Btn>
      {transactions.slice(0, 60).map((t, i) => <div key={t.id ?? i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 11px", borderRadius: 10, marginBottom: 6, background: typeColors[t.type] || "#f9fafb" }}><div><div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>{t.desc}</div><div style={{ fontSize: 11, color: "#6b7280" }}>{t.type} · {t.employe} · {dateStr(t.date)}</div></div><div style={{ fontWeight: 800, fontSize: 14, color: "#059669", whiteSpace: "nowrap" }}>{fmt(t.montant)}</div></div>)}
      {modal && <Modal title="Nouvelle recette" onClose={() => setModal(false)}><Sel label="Type" value={form.type} onChange={e => f("type", e.target.value)} options={["Chambre", "Restaurant", "Bar", "Divers"]} /><Input label="Description *" value={form.desc} onChange={e => f("desc", e.target.value)} /><Input label="Montant (F) *" type="number" value={form.montant} onChange={e => f("montant", e.target.value)} /><Sel label="Encaissé par" value={form.employe} onChange={e => f("employe", e.target.value)} options={EMPLOYES} /><Input label="Date" type="date" value={form.date} onChange={e => f("date", e.target.value)} /><Btn full color="#059669" onClick={ajouter}>✅ Enregistrer</Btn></Modal>}
    </div>
  );
}

function ModuleClients({ transactions, reservations }) {
  const [search, setSearch] = useState("");
  const clientsMap = {};
  [...transactions.filter(t => t.type === "Chambre"), ...reservations].forEach(r => {
    const nom = r.client || r.desc?.split("—")[1]?.split("(")[0]?.trim();
    if (!nom) return;
    if (!clientsMap[nom]) clientsMap[nom] = { nom, sejours: 0, total: 0, tel: r.tel || "", actif: false };
    clientsMap[nom].sejours += 1; clientsMap[nom].total += (r.montantTotal || r.montant || 0);
    if (r.statut === "check-in") clientsMap[nom].actif = true;
    if (r.tel && !clientsMap[nom].tel) clientsMap[nom].tel = r.tel;
  });
  const clients = Object.values(clientsMap).filter(c => c.nom?.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.total - a.total);
  return (
    <div>
      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..." />
      {clients.length === 0 ? <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Aucun client</div>
        : clients.map((c, i) => <div key={i} style={{ border: "1.5px solid #e5e7eb", borderRadius: 12, padding: 14, marginBottom: 10, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>👤 {c.nom}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{c.sejours} séjour{c.sejours > 1 ? "s" : ""}{c.tel && <span style={{ marginLeft: 8 }}>· 📞 {c.tel}</span>}{c.actif && <span style={{ marginLeft: 8, background: "#d1fae5", color: "#065f46", padding: "1px 8px", borderRadius: 10, fontSize: 11 }}>En séjour</span>}</div>
            </div>
            <div style={{ fontWeight: 800, color: "#059669", fontSize: 15 }}>{fmt(c.total)}</div>
          </div>
        </div>)}
    </div>
  );
}

function ModuleStock({ stock, setStock }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const alertes = stock.filter(s => s.qte <= s.seuil);
  return (
    <div>
      {alertes.length > 0 && <div style={{ background: "#fff1f2", border: "2px solid #fecdd3", borderRadius: 12, padding: 14, marginBottom: 14 }}><div style={{ fontWeight: 700, color: "#be123c", marginBottom: 8 }}>🚨 Stock bas ({alertes.length})</div>{alertes.map(s => <div key={s.id} style={{ fontSize: 12, color: "#9f1239", marginBottom: 2 }}>• {s.nom}: <strong>{s.qte} {s.unite}</strong></div>)}</div>}
      <Btn full color="#1a1a2e" onClick={() => { setForm({ id: Date.now(), nom: "", qte: 0, seuil: 0, unite: "pcs" }); setModal("new"); }} style={{ marginBottom: 12 }}>+ Nouvel article</Btn>
      {stock.map(s => { const pct = Math.min(100, (s.qte / Math.max(s.seuil * 3, 1)) * 100); const bas = s.qte <= s.seuil; return <div key={s.id} onClick={() => { setForm({ ...s }); setModal("edit"); }} style={{ border: `1.5px solid ${bas ? "#fecdd3" : "#e5e7eb"}`, borderRadius: 12, padding: 13, marginBottom: 8, background: bas ? "#fff1f2" : "#fff", cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}><span style={{ fontWeight: 600, fontSize: 14 }}>{s.nom}</span><span style={{ fontWeight: 800, fontSize: 14, color: bas ? "#be123c" : "#059669" }}>{s.qte} {s.unite}</span></div><div style={{ background: "#f3f4f6", borderRadius: 4, height: 6 }}><div style={{ width: `${pct}%`, height: "100%", background: bas ? "#ef4444" : "#22c55e", borderRadius: 4 }} /></div><div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Seuil: {s.seuil} {s.unite}</div></div>; })}
      {(modal === "edit" || modal === "new") && <Modal title={modal === "new" ? "Nouvel article" : `Modifier — ${form.nom}`} onClose={() => setModal(null)}><Input label="Nom" value={form.nom} onChange={e => f("nom", e.target.value)} /><Input label="Quantité" type="number" value={form.qte} onChange={e => f("qte", e.target.value)} /><Input label="Seuil d'alerte" type="number" value={form.seuil} onChange={e => f("seuil", e.target.value)} /><Input label="Unité" value={form.unite} onChange={e => f("unite", e.target.value)} /><div style={{ display: "flex", gap: 8 }}><Btn full color="#1a1a2e" onClick={() => { if (modal === "new") setStock(p => [...p, { ...form, qte: +form.qte, seuil: +form.seuil }]); else setStock(p => p.map(s => s.id === form.id ? { ...form, qte: +form.qte, seuil: +form.seuil } : s)); setModal(null); }}>✅ Enregistrer</Btn>{modal === "edit" && <Btn outline color="#dc2626" onClick={() => { setStock(p => p.filter(s => s.id !== form.id)); setModal(null); }}>🗑</Btn>}</div></Modal>}
    </div>
  );
}

function ModuleBar({ addTransaction }) {
  const [commande, setCommande] = useState([]);
  const [table, setTable] = useState("");
  const [employe, setEmploye] = useState(EMPLOYES[0]);
  const [cat, setCat] = useState("Tous");
  const [historique, setHistorique] = useState([]);
  const cats = ["Tous", ...new Set(MENU_ITEMS.map(m => m.cat))];
  const items = cat === "Tous" ? MENU_ITEMS : MENU_ITEMS.filter(m => m.cat === cat);
  const add = (item) => setCommande(p => { const ex = p.find(c => c.id === item.id); return ex ? p.map(c => c.id === item.id ? { ...c, qte: c.qte + 1 } : c) : [...p, { ...item, qte: 1 }]; });
  const rem = (id) => setCommande(p => p.map(c => c.id === id ? { ...c, qte: c.qte - 1 } : c).filter(c => c.qte > 0));
  const total = commande.reduce((s, c) => s + c.prix * c.qte, 0);
  const valider = () => {
    if (!commande.length) return;
    addTransaction({ type: "Restaurant", desc: `${table ? table + " — " : ""}${commande.map(c => `${c.nom}×${c.qte}`).join(", ")}`, montant: total, employe, date: today() });
    setHistorique(p => [{ table, items: [...commande], total, heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }, ...p.slice(0, 9)]);
    setCommande([]); setTable("");
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <Input label="Table / Client" value={table} onChange={e => setTable(e.target.value)} placeholder="Table 3..." />
        <Sel label="Serveur" value={employe} onChange={e => setEmploye(e.target.value)} options={EMPLOYES} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding: "5px 12px", borderRadius: 20, border: "2px solid", fontSize: 11, fontWeight: 700, cursor: "pointer", borderColor: cat === c ? "#7c3aed" : "#e5e7eb", background: cat === c ? "#7c3aed" : "transparent", color: cat === c ? "#fff" : "#6b7280", fontFamily: "inherit" }}>{c}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {items.map(item => <div key={item.id} onClick={() => add(item)} style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", cursor: "pointer", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontWeight: 600, fontSize: 13 }}>{item.nom}</div><div style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>{fmt(item.prix)}</div></div><span style={{ fontSize: 20, color: "#7c3aed", fontWeight: 800 }}>+</span></div>)}
      </div>
      {commande.length > 0 && <div style={{ background: "#faf5ff", border: "2px solid #ddd6fe", borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: "#5b21b6", marginBottom: 10 }}>🧾 Commande en cours</div>
        {commande.map(c => <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontSize: 13 }}>{c.nom}</span><div style={{ display: "flex", alignItems: "center", gap: 8 }}><button onClick={() => rem(c.id)} style={{ background: "#ede9fe", border: "none", borderRadius: 6, width: 24, height: 24, cursor: "pointer", fontWeight: 700 }}>−</button><span style={{ fontWeight: 700, minWidth: 16, textAlign: "center" }}>{c.qte}</span><button onClick={() => add(c)} style={{ background: "#ede9fe", border: "none", borderRadius: 6, width: 24, height: 24, cursor: "pointer", fontWeight: 700 }}>+</button><span style={{ fontSize: 13, fontWeight: 700, color: "#5b21b6", minWidth: 65, textAlign: "right" }}>{fmt(c.prix * c.qte)}</span></div></div>)}
        <div style={{ borderTop: "1.5px solid #ddd6fe", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 800 }}>TOTAL</span><span style={{ fontWeight: 800, fontSize: 16, color: "#059669" }}>{fmt(total)}</span></div>
        <Btn full color="#059669" onClick={valider} style={{ marginTop: 10 }}>✅ Valider & Encaisser</Btn>
      </div>}
      {historique.length > 0 && <div><h4 style={{ color: "#374151", marginBottom: 8 }}>Commandes du jour</h4>{historique.map((h, i) => <div key={i} style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: 12, marginBottom: 8, background: "#fff" }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 600, fontSize: 13 }}>{h.table || "Comptoir"} · {h.heure}</span><span style={{ fontWeight: 800, color: "#059669" }}>{fmt(h.total)}</span></div><div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{h.items.map(it => `${it.nom}×${it.qte}`).join(", ")}</div></div>)}</div>}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("reservations");
  const [chambres, setChambres] = useState(CHAMBRES_INIT);
  const [reservations, setReservations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stock, setStock] = useState(STOCK_INIT);
  const addTransaction = (tx) => setTransactions(p => [{ ...tx, id: Date.now() }, ...p]);
  const alertesStock = stock.filter(s => s.qte <= s.seuil).length;
  const occupees = chambres.filter(c => c.statut === "occupée").length + reservations.filter(r => r.statut === "check-in").length;
  const rezEnAttente = reservations.filter(r => r.statut === "en attente").length;
  const TABS = [
    { id: "chambres", icon: "🛏️", label: "Chambres" },
    { id: "reservations", icon: "📋", label: "Réservations", badge: rezEnAttente },
    { id: "bar", icon: "🍽️", label: "Bar & Resto" },
    { id: "caisse", icon: "💰", label: "Caisse" },
    { id: "clients", icon: "👥", label: "Clients" },
    { id: "stock", icon: "📦", label: "Stock", badge: alertesStock },
  ];
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)", padding: "18px 20px 14px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, opacity: .6, letterSpacing: 2, textTransform: "uppercase" }}>Fidélie Hôtel · Kribi</div>
            <div style={{ fontSize: 19, fontWeight: 800, marginTop: 2 }}>Gestion Hôtel</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, opacity: .6 }}>{new Date().toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}><span style={{ color: "#fbbf24" }}>{occupees}</span>/27 occupées</div>
          </div>
        </div>
      </div>
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", overflowX: "auto", display: "flex", scrollbarWidth: "none" }}>
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "0 0 auto", padding: "11px 13px", border: "none", background: "none", cursor: "pointer", borderBottom: `3px solid ${tab === t.id ? "#1a1a2e" : "transparent"}`, color: tab === t.id ? "#1a1a2e" : "#9ca3af", fontWeight: tab === t.id ? 700 : 500, fontSize: 11, fontFamily: "inherit", position: "relative", whiteSpace: "nowrap" }}>
          <div>{t.icon}</div><div>{t.label}</div>
          {t.badge > 0 && <span style={{ position: "absolute", top: 6, right: 4, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 15, height: 15, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{t.badge}</span>}
        </button>)}
      </div>
      <div style={{ padding: 16, paddingBottom: 48 }}>
        {tab === "chambres" && <ModuleChambres chambres={chambres} setChambres={setChambres} addTransaction={addTransaction} reservations={reservations} />}
        {tab === "reservations" && <ModuleReservations reservations={reservations} setReservations={setReservations} chambres={chambres} addTransaction={addTransaction} />}
        {tab === "bar" && <ModuleBar addTransaction={addTransaction} />}
        {tab === "caisse" && <ModuleCaisse transactions={transactions} setTransactions={setTransactions} />}
        {tab === "clients" && <ModuleClients transactions={transactions} reservations={reservations} />}
        {tab === "stock" && <ModuleStock stock={stock} setStock={setStock} />}
      </div>
    </div>
  );
}
