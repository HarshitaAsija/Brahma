import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0d0f14",
  bgSurface: "#13161d",
  bgCard: "#181c26",
  bgElevated: "#1e2330",
  border: "rgba(255,255,255,0.07)",
  borderMed: "rgba(255,255,255,0.12)",
  text: "#e8eaf0",
  textMuted: "#7a8196",
  textDim: "#4a5068",
  blue: "#3b82f6",
  blueLight: "#93c5fd",
  blueDim: "rgba(59,130,246,0.12)",
  emerald: "#10b981",
  emeraldLight: "#6ee7b7",
  emeraldDim: "rgba(16,185,129,0.12)",
  amber: "#f59e0b",
  amberLight: "#fcd34d",
  amberDim: "rgba(245,158,11,0.12)",
  violet: "#8b5cf6",
  violetLight: "#c4b5fd",
  violetDim: "rgba(139,92,246,0.12)",
  red: "#ef4444",
  redLight: "#fca5a5",
  redDim: "rgba(239,68,68,0.12)",
  cyan: "#06b6d4",
};

const navItems = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "literature", icon: "◫", label: "Literature" },
  { id: "assistant", icon: "◈", label: "AI Assistant" },
  { id: "graph", icon: "◉", label: "Knowledge Graph" },
  { id: "hypothesis", icon: "◇", label: "Hypotheses" },
  { id: "gaps", icon: "△", label: "Research Gaps" },
  { id: "study", icon: "▣", label: "Study Designer" },
  { id: "collab", icon: "◎", label: "Collaboration" },
];

// ─── Reusable Components ────────────────────────────────────────────────────

function Badge({ color = "blue", children, size = "sm" }) {
  const map = {
    blue: { bg: COLORS.blueDim, text: COLORS.blueLight, border: "rgba(59,130,246,0.25)" },
    emerald: { bg: COLORS.emeraldDim, text: COLORS.emeraldLight, border: "rgba(16,185,129,0.25)" },
    amber: { bg: COLORS.amberDim, text: COLORS.amberLight, border: "rgba(245,158,11,0.25)" },
    violet: { bg: COLORS.violetDim, text: COLORS.violetLight, border: "rgba(139,92,246,0.25)" },
    red: { bg: COLORS.redDim, text: COLORS.redLight, border: "rgba(239,68,68,0.25)" },
    gray: { bg: "rgba(120,130,160,0.12)", text: "#9aa3bf", border: "rgba(120,130,160,0.2)" },
  };
  const c = map[color] || map.blue;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 4, padding: size === "sm" ? "2px 7px" : "3px 10px",
      fontSize: size === "sm" ? 11 : 12, fontWeight: 500, letterSpacing: "0.02em",
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function ScoreBar({ value, color = COLORS.blue, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {label && <span style={{ fontSize: 11, color: COLORS.textMuted, width: 70, flexShrink: 0 }}>{label}</span>}
      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: COLORS.textMuted, width: 28, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function Stat({ label, value, sub, color = COLORS.blue, delta }) {
  return (
    <div style={{ padding: "14px 16px", background: COLORS.bgCard, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4 }}>{sub}</div>}
      {delta && <div style={{ fontSize: 11, color: delta > 0 ? COLORS.emerald : COLORS.red, marginTop: 4 }}>
        {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}% this week
      </div>}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
      <div>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{title}</span>
        {sub && <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 8 }}>{sub}</span>}
      </div>
      {action && <span style={{ fontSize: 11, color: COLORS.blue, cursor: "pointer" }}>{action}</span>}
    </div>
  );
}

// ─── NAV ────────────────────────────────────────────────────────────────────

function NavRail({ active, setActive }) {
  return (
    <div style={{
      width: 56, background: COLORS.bgSurface, borderRight: `1px solid ${COLORS.border}`,
      display: "flex", flexDirection: "column", alignItems: "center",
      paddingTop: 16, gap: 2, flexShrink: 0, zIndex: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16, flexShrink: 0,
      }}>B</div>
      {navItems.map(item => (
        <button key={item.id} onClick={() => setActive(item.id)}
          title={item.label}
          style={{
            width: 40, height: 40, borderRadius: 8, border: "none", cursor: "pointer",
            background: active === item.id ? COLORS.blueDim : "transparent",
            color: active === item.id ? COLORS.blue : COLORS.textDim,
            fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
          {item.icon}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#10b981)", marginBottom: 16 }} />
    </div>
  );
}

function TopBar({ page }) {
  const pageLabel = navItems.find(n => n.id === page)?.label || "Dashboard";
  return (
    <div style={{
      height: 48, background: COLORS.bgSurface, borderBottom: `1px solid ${COLORS.border}`,
      display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0,
    }}>
      <span style={{ fontSize: 12, color: COLORS.textMuted }}>BRAHMA</span>
      <span style={{ color: COLORS.textDim }}>›</span>
      <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{pageLabel}</span>
      <div style={{ flex: 1 }} />
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
        borderRadius: 6, padding: "5px 12px", width: 280,
      }}>
        <span style={{ fontSize: 13, color: COLORS.textDim }}>⌕</span>
        <span style={{ fontSize: 12, color: COLORS.textDim }}>Search literature, entities, hypotheses…</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: COLORS.textDim, background: "rgba(255,255,255,0.05)", borderRadius: 3, padding: "1px 5px" }}>⌘K</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8 }}>
        <div style={{ position: "relative" }}>
          <span style={{ fontSize: 14, color: COLORS.textMuted }}>🔔</span>
          <span style={{ position: "absolute", top: -3, right: -3, width: 7, height: 7, borderRadius: "50%", background: COLORS.blue }} />
        </div>
        <Badge color="violet">3 agents running</Badge>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#fff" }}>AK</div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function Dashboard() {
  const activityItems = [
    { type: "discovery", color: COLORS.emerald, icon: "●", text: "PCSK9 inhibitor resistance mechanism identified via 3 new RCTs", time: "2m ago" },
    { type: "contradiction", color: COLORS.red, icon: "◆", text: "Contradictory outcomes detected: IL-6 blockade in heart failure (GALACTIC vs SOCRATES)", time: "18m ago" },
    { type: "trend", color: COLORS.violet, icon: "▲", text: "Emerging: GLP-1 agonists showing neuroprotective effects — 47 papers in 30 days", time: "1h ago" },
    { type: "gap", color: COLORS.amber, icon: "◈", text: "Underexplored: SGLT2i + CKD in pediatric cohorts — 0 RCTs identified", time: "2h ago" },
    { type: "discovery", color: COLORS.blue, icon: "●", text: "New entity cluster: SOD1, TDP-43, FUS co-aggregation in ALS — high confidence", time: "3h ago" },
    { type: "suggestion", color: COLORS.violet, icon: "◇", text: "Study design suggested: Phase II adaptive design for PD-L1 × KRAS combo", time: "4h ago" },
  ];
  const recentPapers = [
    { title: "PCSK9 Inhibition in Statin-Resistant Hypercholesterolemia: A 5-Year Follow-Up", journal: "NEJM", year: 2024, score: 97, tag: "RCT" },
    { title: "Tau Phosphorylation Dynamics in Early Alzheimer's: CSF Biomarker Correlates", journal: "Nature Neuroscience", year: 2024, score: 94, tag: "Cohort" },
    { title: "CRISPR-Cas9 Off-Target Editing in Hematopoietic Stem Cells: Safety Profile", journal: "Nature Medicine", year: 2024, score: 91, tag: "Safety" },
    { title: "GLP-1 Receptor Agonists and Cardiovascular Outcomes in T2DM + CKD", journal: "Lancet", year: 2024, score: 89, tag: "Meta-analysis" },
  ];

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
        <Stat label="Papers Ingested" value="284,917" delta={12} color={COLORS.blue} />
        <Stat label="Entities Discovered" value="1.2M" delta={8} color={COLORS.emerald} />
        <Stat label="Active Hypotheses" value="347" delta={23} color={COLORS.violet} />
        <Stat label="Graph Nodes" value="4.8M" color={COLORS.cyan} />
        <Stat label="Research Gaps" value="1,204" delta={5} color={COLORS.amber} />
        <Stat label="Contradictions" value="89" color={COLORS.red} sub="Flagged for review" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

        {/* Main area */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Knowledge growth sparkline */}
          <Card style={{ padding: "14px 16px" }}>
            <SectionHeader title="Knowledge Graph Growth" sub="Last 90 days" action="Full analytics →" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>Papers indexed over time</div>
                <svg width="100%" height="60" viewBox="0 0 300 60">
                  <polyline points="0,55 30,50 60,44 90,40 120,32 150,28 180,22 210,16 240,12 270,8 300,4"
                    fill="none" stroke={COLORS.blue} strokeWidth="2" />
                  <polygon points="0,55 30,50 60,44 90,40 120,32 150,28 180,22 210,16 240,12 270,8 300,4 300,60 0,60"
                    fill="rgba(59,130,246,0.08)" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>Entity extraction rate</div>
                <svg width="100%" height="60" viewBox="0 0 300 60">
                  <polyline points="0,50 30,45 60,40 90,38 120,30 150,25 180,20 210,18 240,14 270,10 300,7"
                    fill="none" stroke={COLORS.emerald} strokeWidth="2" />
                  <polygon points="0,50 30,45 60,40 90,38 120,30 150,25 180,20 210,18 240,14 270,10 300,7 300,60 0,60"
                    fill="rgba(16,185,129,0.08)" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Recent papers */}
          <Card style={{ padding: "14px 16px" }}>
            <SectionHeader title="Recently Indexed Papers" sub={`${recentPapers.length} new today`} action="Open explorer →" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recentPapers.map((p, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", borderRadius: 7, background: COLORS.bgElevated,
                  border: `1px solid ${COLORS.border}`,
                }}>
                  <div style={{ width: 3, height: 36, borderRadius: 2, background: i === 0 ? COLORS.blue : i === 1 ? COLORS.emerald : i === 2 ? COLORS.violet : COLORS.amber }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 500, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{p.journal} · {p.year}</div>
                  </div>
                  <Badge color={i % 2 === 0 ? "blue" : "emerald"}>{p.tag}</Badge>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.blue, width: 28, textAlign: "right" }}>{p.score}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[
              { label: "Import Literature", icon: "↑", color: COLORS.blue },
              { label: "New Hypothesis", icon: "◇", color: COLORS.violet },
              { label: "Open AI Workspace", icon: "◈", color: COLORS.emerald },
              { label: "Build Graph", icon: "◉", color: COLORS.amber },
            ].map((a, i) => (
              <button key={i} style={{
                padding: "12px 14px", borderRadius: 8, border: `1px solid ${COLORS.borderMed}`,
                background: COLORS.bgCard, color: COLORS.text, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500,
              }}>
                <span style={{ fontSize: 16, color: a.color }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <Card style={{ padding: "14px 16px", display: "flex", flexDirection: "column" }}>
          <SectionHeader title="AI Activity Feed" sub="Live" />
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {activityItems.map((item, i) => (
              <div key={i} style={{
                padding: "10px 0",
                borderBottom: i < activityItems.length - 1 ? `1px solid ${COLORS.border}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ fontSize: 8, color: item.color, marginTop: 4, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11.5, color: COLORS.text, margin: 0, lineHeight: 1.5 }}>{item.text}</p>
                    <span style={{ fontSize: 10, color: COLORS.textDim }}>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── LITERATURE EXPLORER ─────────────────────────────────────────────────────

function LiteratureExplorer() {
  const [selectedPaper, setSelectedPaper] = useState(0);

  const papers = [
    {
      id: 0,
      title: "Evolocumab and Clinical Outcomes in Patients with Cardiovascular Disease and Statin Intolerance",
      authors: "Sabatine MS, Giugliano RP, Keech AC et al.",
      journal: "New England Journal of Medicine", year: 2024, volume: "390(8):712-724",
      score: 97, type: "RCT", phase: "Phase III",
      abstract: "Background: PCSK9 inhibitors reduce LDL cholesterol in patients with familial hypercholesterolemia but long-term cardiovascular outcomes in statin-intolerant patients remain unclear. Methods: In this double-blind trial, 27,564 patients were randomized to evolocumab or placebo. Primary endpoint was cardiovascular death, MI, or stroke at 5 years. Results: Evolocumab reduced LDL-C by 59% (95% CI 57–61%). The primary endpoint occurred in 9.8% evolocumab vs 11.3% placebo (HR 0.85, 95% CI 0.79–0.92, p<0.001). All-cause mortality was non-significantly reduced (HR 0.91, 95% CI 0.82–1.01).",
      entities: ["PCSK9", "Evolocumab", "LDL-C", "MACE", "Cardiovascular Disease", "Familial Hypercholesterolemia"],
      stats: { hr: "0.85", ci: "0.79–0.92", p: "<0.001", n: "27,564", nnt: "67", followup: "5 years" },
      evidence: "high", citations: 342,
      aiInsight: "Strong RCT evidence supporting PCSK9 inhibition in statin-intolerant patients. Consider in hypothesis: PCSK9 × ASCVD risk stratification in FH populations.",
    },
    {
      id: 1,
      title: "Phosphorylated Tau-217 as a Predictive Biomarker for Alzheimer's Disease Conversion: A 10-Year Longitudinal Cohort",
      authors: "Hansson O, Palmqvist S, Janelidze S et al.",
      journal: "Nature Neuroscience", year: 2024, volume: "27(3):411-423",
      score: 94, type: "Cohort", phase: "Observational",
      abstract: "Plasma p-tau217 demonstrated superior discrimination for amyloid-positive MCI conversion to AD dementia compared to p-tau181 and NfL. In 2,847 participants from BioFINDER-2, AUC 0.94 (95% CI 0.92–0.96) at 24-month prediction. Key finding: p-tau217 elevation precedes amyloid PET positivity by a median 3.2 years, opening a critical therapeutic window.",
      entities: ["p-tau217", "Alzheimer's Disease", "Amyloid-β", "BioFINDER-2", "MCI", "NfL", "p-tau181"],
      stats: { auc: "0.94", ci: "0.92–0.96", n: "2,847", sensitivity: "91%", specificity: "89%", lead: "3.2 yrs" },
      evidence: "high", citations: 218,
      aiInsight: "p-tau217 outperforms current biomarkers. Potential research gap: combined p-tau217 + GFAP prediction model in non-amnestic MCI variants.",
    },
    {
      id: 2,
      title: "Tirzepatide vs Semaglutide in Obesity with Metabolic Syndrome: SURPASS-STEP Head-to-Head RCT",
      authors: "Rosenstock J, Frías JP, Jastreboff AM et al.",
      journal: "Lancet", year: 2024, volume: "403(10430):1175-1188",
      score: 92, type: "RCT", phase: "Phase III",
      abstract: "Tirzepatide (15mg/wk) produced significantly greater weight loss than semaglutide (2.4mg/wk) at 72 weeks (-22.4% vs -15.1% body weight, p<0.001). Metabolic improvements were concordant: HbA1c reduction -2.1% vs -1.7%, HOMA-IR reduction 48% vs 31%. Adverse event profiles were similar; GI events slightly higher with tirzepatide (38% vs 33%).",
      entities: ["Tirzepatide", "Semaglutide", "GLP-1", "GIP", "Obesity", "Metabolic Syndrome", "HbA1c"],
      stats: { weightLoss: "-22.4% vs -15.1%", p: "<0.001", n: "5,308", hba1c: "-2.1% vs -1.7%", duration: "72 weeks" },
      evidence: "high", citations: 156,
      aiInsight: "Dual GIP/GLP-1 agonism confers superior metabolic control. Research gap: tirzepatide in CKD stage 3b–4, data extrapolation from SURPASS-KIDNEY needed.",
    },
    {
      id: 3,
      title: "CAR-T Cell Therapy for Relapsed/Refractory Multiple Myeloma: Real-World Outcomes Registry",
      authors: "Munshi NC, Anderson LD Jr, Shah N et al.",
      journal: "Journal of Clinical Oncology", year: 2024, volume: "42(4):398-411",
      score: 88, type: "Registry", phase: "Real-world",
      abstract: "Multi-center registry of 1,244 patients receiving BCMA-directed CAR-T (ide-cel or cilta-cel). ORR 78% (cilta-cel: 84% vs ide-cel: 73%). Median PFS 12.4 months (cilta-cel: 15.2 vs ide-cel: 10.6). CRS occurred in 84%; grade ≥3 in 9%. Neurotoxicity (ICANS) in 19%. Key predictor of response: baseline serum M-protein <2g/dL (OR 2.8, 95% CI 2.1–3.7).",
      entities: ["CAR-T", "BCMA", "Ide-cel", "Cilta-cel", "Multiple Myeloma", "CRS", "ICANS"],
      stats: { orr: "78%", pfs: "12.4 months", crs: "84%", n: "1,244", predictor: "M-protein <2g/dL" },
      evidence: "moderate", citations: 89,
      aiInsight: "Real-world efficacy lower than pivotal trials (KarMMa-3). Hypothesis: early CAR-T in 3rd-line vs late-line may shift PFS significantly.",
    },
  ];

  const paper = papers[selectedPaper];

  return (
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "220px 1fr 340px", overflow: "hidden" }}>

      {/* LEFT: Filters */}
      <div style={{ borderRight: `1px solid ${COLORS.border}`, overflow: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: COLORS.bgCard, borderRadius: 6, padding: "7px 10px", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 12, color: COLORS.textDim }}>⌕</span>
          <input placeholder="Search literature…" style={{ background: "transparent", border: "none", outline: "none", color: COLORS.text, fontSize: 12, width: "100%" }} />
        </div>

        {[
          { label: "Source Type", opts: ["All Sources", "PubMed / MEDLINE", "bioRxiv / medRxiv", "Cochrane", "ClinicalTrials.gov", "WHO ICTRP"] },
          { label: "Study Design", opts: ["All Designs", "RCT", "Meta-analysis", "Cohort Study", "Case-Control", "Cross-sectional"] },
          { label: "Evidence Level", opts: ["All Levels", "Level I (SR/Meta-analysis)", "Level II (RCT)", "Level III (Cohort)", "Level IV (Case series)"] },
          { label: "Publication Date", opts: ["Any time", "Last 12 months", "2020–2024", "2015–2020", "2010–2015"] },
          { label: "Specialty", opts: ["All", "Cardiology", "Oncology", "Neurology", "Endocrinology", "Immunology"] },
        ].map((section, i) => (
          <div key={i}>
            <div style={{ fontSize: 10, color: COLORS.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{section.label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {section.opts.map((opt, j) => (
                <label key={j} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: j === 0 ? COLORS.blue : COLORS.textMuted, cursor: "pointer", padding: "3px 4px", borderRadius: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: j === 0 ? "50%" : 3, border: `1.5px solid ${j === 0 ? COLORS.blue : COLORS.textDim}`, background: j === 0 ? COLORS.blue : "transparent", flexShrink: 0 }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CENTER: Paper Feed */}
      <div style={{ overflow: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>4,817 results · sorted by relevance</span>
          <div style={{ display: "flex", gap: 6 }}>
            <Badge color="blue">Semantic search</Badge>
            <Badge color="gray">Export</Badge>
          </div>
        </div>
        {papers.map((p, i) => (
          <div key={i} onClick={() => setSelectedPaper(i)}
            style={{
              padding: "12px 14px", borderRadius: 8, cursor: "pointer",
              background: selectedPaper === i ? COLORS.bgElevated : COLORS.bgCard,
              border: `1px solid ${selectedPaper === i ? COLORS.blue : COLORS.border}`,
              transition: "border-color 0.15s",
            }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.text, lineHeight: 1.4, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{p.authors}</div>
                <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>{p.journal} · {p.year} · {p.volume}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.blue, lineHeight: 1 }}>{p.score}</div>
                <div style={{ fontSize: 9, color: COLORS.textDim }}>RELEVANCE</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge color={p.evidence === "high" ? "emerald" : "amber"}>{p.evidence === "high" ? "High evidence" : "Moderate evidence"}</Badge>
              <Badge color="blue">{p.type}</Badge>
              <Badge color="gray">{p.phase}</Badge>
              <span style={{ fontSize: 11, color: COLORS.textDim, alignSelf: "center", marginLeft: "auto" }}>
                {p.citations} citations
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: Paper Inspector */}
      <div style={{ borderLeft: `1px solid ${COLORS.border}`, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, lineHeight: 1.4, marginBottom: 6 }}>{paper.title}</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{paper.authors}</div>
          <div style={{ fontSize: 11, color: COLORS.textDim }}>{paper.journal} · {paper.year}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <Badge color="emerald">High evidence</Badge>
            <Badge color="blue">{paper.type}</Badge>
            <Badge color="gray">{paper.phase}</Badge>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Abstract</div>
          <p style={{ fontSize: 11.5, color: COLORS.textMuted, lineHeight: 1.6, margin: 0 }}>{paper.abstract}</p>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Key Statistics</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {Object.entries(paper.stats).map(([k, v]) => (
              <div key={k} style={{ background: COLORS.bgElevated, borderRadius: 6, padding: "7px 10px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2, textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Extracted Entities</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {paper.entities.map((e, i) => (
              <Badge key={i} color={["blue","emerald","violet","amber","gray","blue","violet"][i % 7]}>{e}</Badge>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12, background: COLORS.violetDim, borderRadius: 8, padding: 12, border: `1px solid rgba(139,92,246,0.2)` }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.violet, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>◈ AI Insight</div>
          <p style={{ fontSize: 11.5, color: COLORS.violetLight, lineHeight: 1.6, margin: 0 }}>{paper.aiInsight}</p>
        </div>
      </div>
    </div>
  );
}

// ─── AI RESEARCH ASSISTANT ────────────────────────────────────────────────────

function AIAssistant() {
  const [input, setInput] = useState("");
  const messages = [
    {
      role: "user",
      content: "What is the current evidence for PCSK9 inhibitors in statin-intolerant patients with familial hypercholesterolemia? Include effect sizes and major trials."
    },
    {
      role: "assistant",
      content: null,
      structured: {
        summary: "PCSK9 inhibitors demonstrate strong, consistent cardiovascular benefit in statin-intolerant FH patients, supported by Level I evidence from three major RCTs encompassing 58,000+ participants.",
        keyFindings: [
          { text: "Evolocumab reduces major adverse cardiovascular events by 15% (HR 0.85, 95% CI 0.79–0.92) in FOURIER-OLE at 5 years", source: "FOURIER-OLE, NEJM 2024", type: "emerald" },
          { text: "Alirocumab achieves 24% all-cause mortality reduction in post-ACS patients (ODYSSEY OUTCOMES, HR 0.76, 95% CI 0.65–0.87)", source: "ODYSSEY OUTCOMES, Lancet 2018", type: "emerald" },
          { text: "Mean LDL-C reduction of 59% maintained at 5 years with evolocumab 140mg Q2W without tachyphylaxis", source: "FOURIER 5yr follow-up 2024", type: "blue" },
          { text: "Inclisiran (siRNA, twice-yearly dosing) shows non-inferior LDL-C reduction: ORION-3 trial 52% reduction at 18 months", source: "ORION-3, NEJM 2020", type: "blue" },
          { text: "NNT = 67 over 5 years to prevent one MACE in high-risk statin-intolerant FH patients (pooled analysis, n=41,200)", source: "Pooled analysis, JACC 2023", type: "amber" },
        ],
        gaps: ["No head-to-head evolocumab vs alirocumab RCT in pure FH cohort", "Long-term cognitive safety data beyond 7 years lacking", "Pediatric FH (age 10–17) outcomes data sparse"],
        recommendation: "Consider expanding current hypothesis: PCSK9 inhibition + inclisiran combination vs monotherapy in FH patients with residual LDLR activity (>20%).",
      }
    },
    {
      role: "user",
      content: "Generate a hypothesis based on this evidence. What's the most promising unexplored question?"
    },
    {
      role: "assistant",
      content: null,
      structured: {
        hypothesis: true,
        title: "PCSK9 Inhibition + ANGPTL3 Blockade Synergy in Homozygous FH",
        rationale: "Homozygous FH patients with <1% LDLR activity respond poorly to PCSK9 inhibitors alone. ANGPTL3 inhibitors (evinacumab) work via an LDLR-independent mechanism (LPL pathway). Dual blockade may achieve >80% LDL-C reduction in HoFH — a population with near-universal premature ASCVD.",
        noveltyScore: 89,
        feasibilityScore: 74,
        impactScore: 94,
        nextStep: "Design Phase II adaptive dose-finding trial: evinacumab 15mg/kg/month + evolocumab 420mg/month in HoFH (n=120). Primary endpoint: LDL-C <70mg/dL at 52 weeks.",
      }
    },
  ];

  const evidenceSources = [
    { title: "FOURIER-OLE", journal: "NEJM 2024", score: 97, type: "RCT" },
    { title: "ODYSSEY OUTCOMES", journal: "Lancet 2018", score: 95, type: "RCT" },
    { title: "ORION-3", journal: "NEJM 2020", score: 88, type: "RCT" },
    { title: "JACC Pooled Analysis", journal: "JACC 2023", score: 84, type: "Meta-analysis" },
    { title: "HoFH Registry 2023", journal: "ATVB 2023", score: 76, type: "Registry" },
  ];

  return (
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 300px", overflow: "hidden" }}>

      {/* Chat area */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 6 }}>
              {msg.role === "user" ? (
                <div style={{ maxWidth: "75%", background: COLORS.bgElevated, border: `1px solid ${COLORS.borderMed}`, borderRadius: "10px 10px 3px 10px", padding: "10px 14px" }}>
                  <p style={{ fontSize: 13, color: COLORS.text, margin: 0, lineHeight: 1.6 }}>{msg.content}</p>
                </div>
              ) : msg.structured?.hypothesis ? (
                <div style={{ maxWidth: "85%", background: COLORS.bgCard, border: `1px solid rgba(139,92,246,0.3)`, borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.violet, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>◈ AI-Generated Hypothesis</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>{msg.structured.title}</div>
                  <p style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6, margin: "0 0 12px" }}>{msg.structured.rationale}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                    {[
                      { label: "Novelty", val: msg.structured.noveltyScore, color: COLORS.violet },
                      { label: "Feasibility", val: msg.structured.feasibilityScore, color: COLORS.blue },
                      { label: "Impact", val: msg.structured.impactScore, color: COLORS.emerald },
                    ].map((s, j) => (
                      <div key={j} style={{ background: COLORS.bgElevated, borderRadius: 6, padding: "8px 10px", border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11.5, color: COLORS.textMuted, background: COLORS.bgElevated, borderRadius: 6, padding: "8px 10px", borderLeft: `3px solid ${COLORS.blue}` }}>
                    <span style={{ color: COLORS.blue, fontWeight: 600 }}>Suggested next step: </span>{msg.structured.nextStep}
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: "90%", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>B</div>
                    <span style={{ fontSize: 11, color: COLORS.textDim }}>BRAHMA · Evidence synthesis</span>
                  </div>
                  <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "3px 10px 10px 10px", padding: 16 }}>
                    <p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6, margin: "0 0 12px", fontWeight: 500 }}>{msg.structured.summary}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                      {msg.structured.keyFindings.map((f, j) => (
                        <div key={j} style={{ display: "flex", gap: 10, padding: "8px 10px", background: COLORS.bgElevated, borderRadius: 6, borderLeft: `3px solid ${f.type === "emerald" ? COLORS.emerald : f.type === "amber" ? COLORS.amber : COLORS.blue}` }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 12, color: COLORS.text, margin: "0 0 3px", lineHeight: 1.5 }}>{f.text}</p>
                            <span style={{ fontSize: 10, color: COLORS.textDim }}>Source: {f.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {msg.structured.gaps && (
                      <div style={{ background: COLORS.amberDim, borderRadius: 6, padding: "8px 10px", border: `1px solid rgba(245,158,11,0.2)` }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.amber, marginBottom: 6 }}>△ Research Gaps Identified</div>
                        {msg.structured.gaps.map((g, j) => (
                          <div key={j} style={{ fontSize: 11.5, color: COLORS.amberLight, marginBottom: 2 }}>· {g}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask about any disease, drug, gene, mechanism, or clinical trial…"
              style={{
                flex: 1, background: COLORS.bgCard, border: `1px solid ${COLORS.borderMed}`,
                borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 13,
                outline: "none",
              }}
            />
            <button style={{ padding: "10px 20px", background: COLORS.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Send
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {["Summarize current evidence", "Find contradictions", "Suggest next study", "Compare treatments", "Identify gaps"].map((s, i) => (
              <button key={i} onClick={() => setInput(s)}
                style={{ fontSize: 11, color: COLORS.textMuted, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 5, padding: "3px 9px", cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence panel */}
      <div style={{ borderLeft: `1px solid ${COLORS.border}`, overflow: "auto", padding: 14 }}>
        <SectionHeader title="Evidence Sources" sub="5 active" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {evidenceSources.map((s, i) => (
            <div key={i} style={{ padding: "10px 12px", background: COLORS.bgCard, borderRadius: 7, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.text, marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{s.journal}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Badge color="blue">{s.type}</Badge>
                <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.blue }}>{s.score}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <SectionHeader title="Reasoning Trace" />
          <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.7 }}>
            <div style={{ marginBottom: 6, padding: "6px 8px", background: COLORS.bgCard, borderRadius: 5, borderLeft: `2px solid ${COLORS.blue}` }}>
              1. Retrieved 847 papers matching PCSK9 × FH query
            </div>
            <div style={{ marginBottom: 6, padding: "6px 8px", background: COLORS.bgCard, borderRadius: 5, borderLeft: `2px solid ${COLORS.emerald}` }}>
              2. Filtered to RCT/meta-analysis, n≥500
            </div>
            <div style={{ marginBottom: 6, padding: "6px 8px", background: COLORS.bgCard, borderRadius: 5, borderLeft: `2px solid ${COLORS.violet}` }}>
              3. Extracted effect sizes, CIs, endpoints
            </div>
            <div style={{ padding: "6px 8px", background: COLORS.bgCard, borderRadius: 5, borderLeft: `2px solid ${COLORS.amber}` }}>
              4. Identified 3 unresolved gaps in synthesis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KNOWLEDGE GRAPH ──────────────────────────────────────────────────────────

function KnowledgeGraph() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const nodes = [
    { id: "PCSK9", x: 350, y: 200, type: "gene", r: 22, color: COLORS.blue },
    { id: "LDL-C", x: 220, y: 150, type: "biomarker", r: 18, color: COLORS.cyan },
    { id: "Evolocumab", x: 480, y: 140, type: "drug", r: 20, color: COLORS.emerald },
    { id: "Alirocumab", x: 500, y: 260, type: "drug", r: 16, color: COLORS.emerald },
    { id: "FH", x: 200, y: 280, type: "disease", r: 20, color: COLORS.red },
    { id: "ASCVD", x: 320, y: 340, type: "disease", r: 22, color: COLORS.red },
    { id: "LDLR", x: 130, y: 200, type: "gene", r: 16, color: COLORS.blue },
    { id: "APOB", x: 160, y: 330, type: "gene", r: 14, color: COLORS.blue },
    { id: "ANGPTL3", x: 440, y: 360, type: "gene", r: 14, color: COLORS.blue },
    { id: "Evinacumab", x: 560, y: 340, type: "drug", r: 14, color: COLORS.emerald },
    { id: "Inclisiran", x: 610, y: 190, type: "drug", r: 14, color: COLORS.emerald },
    { id: "FOURIER", x: 350, y: 100, type: "paper", r: 12, color: COLORS.violet },
    { id: "ODYSSEY", x: 240, y: 80, type: "paper", r: 12, color: COLORS.violet },
    { id: "CV Death", x: 460, y: 420, type: "outcome", r: 16, color: COLORS.amber },
    { id: "MI", x: 550, y: 420, type: "outcome", r: 14, color: COLORS.amber },
  ];
  const edges = [
    ["PCSK9", "LDL-C", 0.95], ["PCSK9", "Evolocumab", 0.98], ["PCSK9", "Alirocumab", 0.95],
    ["PCSK9", "FOURIER", 0.9], ["PCSK9", "ODYSSEY", 0.88], ["PCSK9", "LDLR", 0.85],
    ["LDL-C", "FH", 0.92], ["LDL-C", "ASCVD", 0.89], ["LDLR", "FH", 0.96],
    ["Evolocumab", "FOURIER", 0.98], ["Alirocumab", "ODYSSEY", 0.97],
    ["FH", "ASCVD", 0.88], ["ASCVD", "CV Death", 0.82], ["ASCVD", "MI", 0.78],
    ["ANGPTL3", "Evinacumab", 0.91], ["ANGPTL3", "FH", 0.65],
    ["PCSK9", "Inclisiran", 0.9], ["APOB", "FH", 0.75], ["Evinacumab", "CV Death", 0.6],
  ];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const typeColors = { gene: COLORS.blue, drug: COLORS.emerald, disease: COLORS.red, paper: COLORS.violet, biomarker: COLORS.cyan, outcome: COLORS.amber };
  const typeLabels = ["gene", "drug", "disease", "paper", "biomarker", "outcome"];

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Graph */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 740 500" style={{ background: COLORS.bg }}>
          <defs>
            <radialGradient id="bgGrad">
              <stop offset="0%" stopColor="rgba(59,130,246,0.03)" />
              <stop offset="100%" stopColor={COLORS.bg} />
            </radialGradient>
          </defs>
          <rect width="740" height="500" fill="url(#bgGrad)" />

          {/* Grid */}
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 26} x2="740" y2={i * 26} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          ))}
          {Array.from({ length: 30 }, (_, i) => (
            <line key={`v${i}`} x1={i * 26} y1="0" x2={i * 26} y2="500" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          ))}

          {/* Edges */}
          {edges.map(([a, b, conf], i) => {
            const na = nodeMap[a], nb = nodeMap[b];
            if (!na || !nb) return null;
            return (
              <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={`rgba(${conf > 0.85 ? "59,130,246" : conf > 0.7 ? "139,92,246" : "120,130,160"},${conf * 0.4})`}
                strokeWidth={conf > 0.85 ? 2 : 1} />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => (
            <g key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} style={{ cursor: "pointer" }}>
              <circle cx={node.x} cy={node.y} r={node.r + 6} fill={`${node.color}10`} />
              <circle cx={node.x} cy={node.y} r={node.r}
                fill={hoveredNode === node.id ? node.color : `${node.color}25`}
                stroke={node.color} strokeWidth={hoveredNode === node.id ? 2 : 1.5}
              />
              <text x={node.x} y={node.y + (node.r + 13)} textAnchor="middle"
                fontSize="10" fill={COLORS.textMuted}>{node.id}</text>
            </g>
          ))}

          {/* Hover tooltip */}
          {hoveredNode && (() => {
            const n = nodeMap[hoveredNode];
            return (
              <g>
                <rect x={n.x - 60} y={n.y - n.r - 36} width={120} height={26} rx={4} fill={COLORS.bgElevated} stroke={n.color} strokeWidth={1} />
                <text x={n.x} y={n.y - n.r - 19} textAnchor="middle" fontSize="11" fill={n.color} fontWeight="600">{n.id}</text>
                <text x={n.x} y={n.y - n.r - 8} textAnchor="middle" fontSize="9" fill={COLORS.textMuted}>{n.type}</text>
              </g>
            );
          })()}
        </svg>

        {/* Legend */}
        <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(13,15,20,0.9)", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Node Types</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {typeLabels.map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: typeColors[t], border: `1px solid ${typeColors[t]}` }} />
                <span style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "capitalize" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 260, borderLeft: `1px solid ${COLORS.border}`, padding: 14, overflow: "auto" }}>
        <SectionHeader title="Graph Controls" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {["Expand node", "Filter by confidence", "Show pathway", "Time evolution", "AI suggestions"].map((ctrl, i) => (
            <button key={i} style={{ padding: "7px 10px", background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.textMuted, fontSize: 12, cursor: "pointer", textAlign: "left" }}>
              {ctrl}
            </button>
          ))}
        </div>

        <SectionHeader title="Selected Node" />
        <div style={{ background: COLORS.bgCard, borderRadius: 8, padding: 12, border: `1px solid ${COLORS.border}`, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.blue, marginBottom: 4 }}>PCSK9</div>
          <Badge color="blue">Gene</Badge>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Connections: <span style={{ color: COLORS.text }}>8 direct</span></div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Papers: <span style={{ color: COLORS.text }}>4,217</span></div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Confidence: <span style={{ color: COLORS.emerald }}>0.97</span></div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Last updated: <span style={{ color: COLORS.text }}>Today</span></div>
          </div>
        </div>

        <SectionHeader title="Relationship Confidence" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[["PCSK9 → Evolocumab", 98], ["PCSK9 → LDLR", 85], ["LDL-C → ASCVD", 89], ["ANGPTL3 → FH", 65]].map(([label, val], i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{label}</span>
                <span style={{ fontSize: 11, color: val > 85 ? COLORS.emerald : COLORS.amber }}>{val}%</span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                <div style={{ width: `${val}%`, height: "100%", background: val > 85 ? COLORS.emerald : COLORS.amber, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, background: COLORS.violetDim, borderRadius: 8, padding: 10, border: `1px solid rgba(139,92,246,0.2)` }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.violet, marginBottom: 6 }}>◈ AI Suggestion</div>
          <p style={{ fontSize: 11, color: COLORS.violetLight, margin: 0, lineHeight: 1.5 }}>Missing edge detected: PCSK9 × NLRP3 inflammasome pathway — 12 papers support indirect link. Add relationship?</p>
        </div>
      </div>
    </div>
  );
}

// ─── HYPOTHESIS GENERATOR ─────────────────────────────────────────────────────

function HypothesisGenerator() {
  const [selected, setSelected] = useState(0);
  const hypotheses = [
    {
      id: 0,
      status: "active",
      title: "PCSK9 Inhibition + ANGPTL3 Blockade Synergy in Homozygous FH",
      rationale: "HoFH patients (<1% LDLR activity) respond poorly to PCSK9 inhibitors. ANGPTL3 inhibitors act via LPL pathway, independent of LDLR. Dual blockade may achieve additive LDL-C reduction exceeding 80%, with potential ASCVD risk reduction beyond LDL-lowering via ANGPTL3's pleiotropic vascular effects.",
      supporting: ["Evinacumab achieves 47% LDL-C reduction in HoFH (ELIPSE HoFH trial, n=65)", "Evolocumab reduces MACE 15% in FH (FOURIER-OLE)", "ANGPTL3 KO mice show 40% reduction in atherosclerotic plaque area"],
      contradicting: ["HoFH residual LDLR activity <5%: limited PCSK9 substrate — may reduce evolocumab efficacy (Raal et al., Circulation 2021)"],
      novelty: 89, feasibility: 74, impact: 94,
      tags: ["FH", "PCSK9", "ANGPTL3", "RCT candidate"],
    },
    {
      id: 1,
      status: "validated",
      title: "p-tau217 + GFAP Combined Plasma Biomarker Panel for Pre-Symptomatic AD Detection",
      rationale: "p-tau217 outperforms p-tau181 for amyloid prediction (AUC 0.94 BioFINDER-2). GFAP reflects astrocytic neuroinflammation, an independent AD pathway. Combined panel may improve specificity in non-amnestic MCI variants where p-tau217 alone is suboptimal.",
      supporting: ["p-tau217 AUC 0.94 for amyloid prediction (BioFINDER-2, Nat Neurosci 2024)", "GFAP independent predictor: HR 2.8 for dementia conversion (UK Biobank n=12,000)", "Combined p-tau217+GFAP AUC 0.97 in single-center pilot (n=320)"],
      contradicting: ["GFAP elevation non-specific: elevated in TDP-43 proteinopathy, VCI (Zetterberg et al. 2023)", "Commercial GFAP assay CV >8% at low concentrations — analytical noise concern"],
      novelty: 76, feasibility: 88, impact: 91,
      tags: ["Alzheimer's", "Biomarker", "p-tau217", "GFAP"],
    },
    {
      id: 2,
      status: "active",
      title: "Early CAR-T Therapy (3rd Line) vs Late-Line (≥5th Line) in RRMM: PFS Impact",
      rationale: "Real-world CAR-T data shows median PFS 12.4 months overall, but line of therapy is a strong predictor. Patients receiving CAR-T earlier (3rd line) may have better tumor microenvironment, higher CAR-T persistence, and superior bone marrow reserve. Retrospective signal exists; prospective RCT needed.",
      supporting: ["Registry: ORR 84% cilta-cel vs 73% ide-cel; earlier use correlates with PFS (JCO 2024)", "Mouse model: CAR-T earlier → 3.2x longer persistence in MM xenograft", "CARTITUDE-4: 3rd/4th line shows PFS 24 months vs historical 10–12 months"],
      contradicting: ["MAIA trial: lenalidomide + dara remains superior frontline, questioning early CAR-T cost-benefit", "Manufacturing failure rate 8% in early-line may deny therapy at progression"],
      novelty: 82, feasibility: 67, impact: 88,
      tags: ["CAR-T", "Myeloma", "BCMA", "Phase III candidate"],
    },
    {
      id: 3,
      status: "gap",
      title: "SGLT2i Nephroprotection in Pediatric CKD Stages 3b–4: Safety and Efficacy",
      rationale: "SGLT2 inhibitors reduce CKD progression 30–40% in adults (DAPA-CKD, CREDENCE, EMPA-KIDNEY). Pediatric CKD data is absent from all major trials. Mechanism (tubuloglomerular feedback, hypoxia-inducible pathways) should operate similarly in children. Critical evidence gap with high prevalence of pediatric CKD in low-income countries.",
      supporting: ["EMPA-KIDNEY: eGFR decline reduced 28% in adults with eGFR 20–45 (n=6,609)", "Pediatric SGLT2 off-label use growing 12%/year (FDA adverse event database)"],
      contradicting: ["Growth plate safety signal in rodent models at supratherapeutic doses (Merck preclinical 2022)", "Euglycemic DKA risk unknown in pediatric T1DM overlap"],
      novelty: 94, feasibility: 58, impact: 97,
      tags: ["SGLT2i", "Pediatrics", "CKD", "Critical gap"],
    },
  ];

  const h = hypotheses[selected];
  const statusColors = { active: "blue", validated: "emerald", gap: "amber" };

  return (
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr", overflow: "hidden" }}>

      {/* Pipeline list */}
      <div style={{ borderRight: `1px solid ${COLORS.border}`, overflow: "auto", padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Hypothesis Pipeline</span>
          <button style={{ fontSize: 11, color: COLORS.blue, background: COLORS.blueDim, border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}>+ Generate</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {hypotheses.map((h, i) => (
            <div key={i} onClick={() => setSelected(i)}
              style={{
                padding: "12px 12px", borderRadius: 8, cursor: "pointer",
                background: selected === i ? COLORS.bgElevated : COLORS.bgCard,
                border: `1px solid ${selected === i ? COLORS.blue : COLORS.border}`,
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <Badge color={statusColors[h.status]}>{h.status}</Badge>
                <span style={{ fontSize: 11, color: COLORS.blue, fontWeight: 600 }}>{h.impact}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.text, lineHeight: 1.4, marginBottom: 6 }}>{h.title}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {h.tags.slice(0, 2).map((t, j) => <Badge key={j} color="gray">{t}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div style={{ overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <Badge color={statusColors[h.status]}>{h.status}</Badge>
              {h.tags.map((t, i) => <Badge key={i} color="gray">{t}</Badge>)}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, lineHeight: 1.3, marginBottom: 8 }}>{h.title}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button style={{ padding: "7px 14px", background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 7, color: COLORS.text, fontSize: 12, cursor: "pointer" }}>Validate</button>
            <button style={{ padding: "7px 14px", background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 7, color: COLORS.text, fontSize: 12, cursor: "pointer" }}>Refine</button>
            <button style={{ padding: "7px 14px", background: COLORS.blue, border: "none", borderRadius: 7, color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Generate Study</button>
          </div>
        </div>

        {/* Scores */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "Novelty Score", val: h.novelty, color: COLORS.violet, sub: "vs existing literature" },
            { label: "Feasibility Score", val: h.feasibility, color: COLORS.blue, sub: "resources & timeline" },
            { label: "Potential Impact", val: h.impact, color: COLORS.emerald, sub: "clinical & scientific" },
          ].map((s, i) => (
            <div key={i} style={{ background: COLORS.bgCard, borderRadius: 10, padding: 16, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>{s.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</span>
                <span style={{ fontSize: 14, color: COLORS.textDim }}>/100</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                <div style={{ width: `${s.val}%`, height: "100%", background: s.color, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 6 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Rationale */}
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Scientific Rationale</div>
          <p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.7, margin: 0 }}>{h.rationale}</p>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Supporting evidence */}
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.emerald, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>● Supporting Evidence</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {h.supporting.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.5, padding: "8px 10px", background: COLORS.emeraldDim, borderRadius: 6, borderLeft: `3px solid ${COLORS.emerald}` }}>
                  {s}
                </div>
              ))}
            </div>
          </Card>

          {/* Contradicting evidence */}
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.red, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>◆ Contradicting Evidence</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {h.contradicting.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.5, padding: "8px 10px", background: COLORS.redDim, borderRadius: 6, borderLeft: `3px solid ${COLORS.red}` }}>
                  {s}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── RESEARCH GAPS ────────────────────────────────────────────────────────────

function ResearchGaps() {
  const gaps = [
    { id: 1, title: "SGLT2 Inhibitors in Pediatric CKD", importance: 97, papers: 0, why: "All major SGLT2i trials excluded patients under 18. Pediatric CKD is rising globally (+14%/decade). Mechanism is age-independent.", impact: "High", area: "Nephrology", suggestion: "Phase II safety/PK trial, age 8–17, eGFR 15–45, n=180" },
    { id: 2, title: "GLP-1 Agonists + Neurodegeneration in T2DM", importance: 91, papers: 12, why: "GLP-1 receptors expressed in substantia nigra and hippocampus. Semaglutide reduces α-synuclein in rodents. No human RCT in T2DM + PD population.", impact: "Very High", area: "Neurology", suggestion: "Liraglutide RCT in early PD + T2DM comorbidity, n=520, 3-year MDS-UPDRS endpoint" },
    { id: 3, title: "CAR-T Cell Persistence Predictors in Solid Tumors", importance: 88, papers: 4, why: "CAR-T succeeds in heme malignancies but fails in solid tumors. Tumor microenvironment immunosuppression is likely. CAR-T persistence <1% at 3 months in NSCLC trials.", impact: "High", area: "Oncology", suggestion: "Multiomics: scRNA-seq + TCR sequencing in pre/post CAR-T solid tumor biopsies, n=60" },
    { id: 4, title: "Racial Disparities in FH Diagnosis Rate", importance: 85, papers: 8, why: "Dutch Lipid Clinic Network criteria biased toward European ancestry. African-American and South Asian FH likely misdiagnosed by 40–60%. No population-based genomic screening cohort.", impact: "High", area: "Cardiology", suggestion: "Genomic + LDL-C screening in NHANES-linked cohort, targeted FH panel in non-European ancestry" },
    { id: 5, title: "Long-COVID Cognitive Impairment Mechanisms", importance: 83, papers: 27, why: "Cognitive impairment in 15–30% of Long-COVID patients at 12 months. Microglial activation, spike protein persistence, and autoantibody hypotheses unproven in human studies.", impact: "Very High", area: "Neurology", suggestion: "CSF proteomics + brain PET imaging (microglial activation) in Long-COVID cognitive impairment, n=200" },
  ];

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        <Stat label="Total Gaps Identified" value="1,204" color={COLORS.amber} delta={5} />
        <Stat label="High Impact Gaps" value="287" color={COLORS.red} />
        <Stat label="Zero-paper Gaps" value="143" color={COLORS.violet} sub="No existing literature" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SectionHeader title="Top Priority Research Gaps" sub="Ranked by AI importance score" />
          {gaps.map((gap, i) => (
            <Card key={i} style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <Badge color="amber">Gap #{gap.id}</Badge>
                    <Badge color={gap.papers === 0 ? "red" : gap.papers < 10 ? "amber" : "gray"}>{gap.papers === 0 ? "Zero evidence" : `${gap.papers} papers`}</Badge>
                    <Badge color="gray">{gap.area}</Badge>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{gap.title}</div>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.amber, lineHeight: 1 }}>{gap.importance}</div>
                  <div style={{ fontSize: 9, color: COLORS.textDim }}>IMPORTANCE</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6, margin: "0 0 10px" }}>{gap.why}</p>
              <div style={{ background: COLORS.violetDim, borderRadius: 6, padding: "8px 12px", border: `1px solid rgba(139,92,246,0.2)` }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.violet }}>◈ Suggested study: </span>
                <span style={{ fontSize: 11, color: COLORS.violetLight }}>{gap.suggestion}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Gap cluster map */}
        <Card style={{ padding: 14 }}>
          <SectionHeader title="Gap Clusters" sub="By specialty" />
          <svg width="100%" height="260" viewBox="0 0 250 260">
            {[
              { x: 80, y: 80, r: 38, color: COLORS.red, label: "Oncology", n: 234 },
              { x: 170, y: 90, r: 32, color: COLORS.amber, label: "Cardiology", n: 187 },
              { x: 110, y: 180, r: 42, color: COLORS.violet, label: "Neurology", n: 298 },
              { x: 200, y: 190, r: 24, color: COLORS.blue, label: "Nephrology", n: 143 },
              { x: 45, y: 195, r: 20, color: COLORS.emerald, label: "Endocrine", n: 89 },
            ].map((c, i) => (
              <g key={i}>
                <circle cx={c.x} cy={c.y} r={c.r} fill={`${c.color}20`} stroke={c.color} strokeWidth={1} />
                <text x={c.x} y={c.y - 4} textAnchor="middle" fontSize="9" fill={c.color} fontWeight="600">{c.label}</text>
                <text x={c.x} y={c.y + 9} textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>{c.n}</text>
              </g>
            ))}
          </svg>

          <SectionHeader title="Emerging Topics" />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              { label: "GLP-1 + Neurodegeneration", trend: "+847% citations", color: COLORS.emerald },
              { label: "Senolytic Therapy + Aging", trend: "+523%", color: COLORS.violet },
              { label: "Long-COVID Mechanisms", trend: "+394%", color: COLORS.amber },
              { label: "CRISPR Base Editing Safety", trend: "+312%", color: COLORS.blue },
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: COLORS.bgElevated, borderRadius: 5 }}>
                <span style={{ fontSize: 11, color: COLORS.text }}>{t.label}</span>
                <span style={{ fontSize: 10, color: t.color, fontWeight: 600 }}>{t.trend}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── STUDY DESIGNER ───────────────────────────────────────────────────────────

function StudyDesigner() {
  const [qualScore] = useState(84);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>PCSK9i + ANGPTL3 Blockade in HoFH — Phase II Protocol</div>
          <div style={{ display: "flex", gap: 6 }}>
            <Badge color="emerald">Draft</Badge>
            <Badge color="blue">Phase II</Badge>
            <Badge color="gray">Adaptive design</Badge>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: qualScore > 80 ? COLORS.emerald : COLORS.amber }}>{qualScore}</div>
          <div style={{ fontSize: 10, color: COLORS.textDim }}>QUALITY SCORE</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          {
            label: "Objective (PICO)",
            content: "In adults with homozygous familial hypercholesterolemia (HoFH, age ≥18) with documented residual LDLR activity <5%, does combination therapy with evolocumab 420mg/month + evinacumab 15mg/kg/month (Q) versus evinacumab monotherapy (C) reduce LDL-C to <70mg/dL at week 52 (O) as measured by direct enzymatic assay?",
            aiNote: "PICO structure complete. Consider adding time frame for secondary outcomes.",
          },
          {
            label: "Population & Eligibility",
            content: "Inclusion: HoFH confirmed by genetic testing (2 pathogenic LDLR variants) or clinical criteria (LDL-C >500mg/dL untreated); Age 18–70; eGFR ≥45 mL/min/1.73m²; LFTs <3×ULN.\n\nExclusion: Active hepatic disease; Pregnancy/lactation; Prior ANGPTL3 inhibitor exposure; Active CV event in 90 days.",
            aiNote: "Consider adding LDLR residual activity strata (0–2% vs 2–5%) as pre-specified subgroup.",
          },
          {
            label: "Intervention & Comparator",
            content: "Arm A (Combination): Evolocumab 420mg SC Q4W + Evinacumab 15mg/kg IV Q4W\nArm B (Active Control): Evinacumab 15mg/kg IV Q4W + Placebo SC Q4W\nArm C (Add-on): Evolocumab 420mg SC Q4W (in current max-tolerated statin)\n\nBackground therapy: Maximum tolerated statin ± ezetimibe maintained throughout.",
            aiNote: "3-arm design increases power to detect interaction. Adaptive interim at n=60.",
          },
          {
            label: "Primary & Secondary Outcomes",
            content: "Primary: % change in LDL-C from baseline to week 52 (superiority margin: 15% additional reduction)\n\nSecondary: Proportion achieving LDL-C <70mg/dL; ApoB change; Lp(a) change; hsCRP; ASCVD event rate (composite); Safety and tolerability\n\nExploratory: ANGPTL3 levels; Hepatic steatosis (FibroScan); EHR-linked MACE at 5 years",
            aiNote: "Primary endpoint well-powered. Lp(a) endpoint may require separate sub-study power.",
          },
        ].map((section, i) => (
          <Card key={i} style={{ padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{section.label}</div>
            <p style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.7, margin: "0 0 10px", whiteSpace: "pre-line" }}>{section.content}</p>
            <div style={{ background: COLORS.violetDim, borderRadius: 5, padding: "7px 10px", border: `1px solid rgba(139,92,246,0.15)` }}>
              <span style={{ fontSize: 10, color: COLORS.violet, fontWeight: 600 }}>◈ AI: </span>
              <span style={{ fontSize: 10.5, color: COLORS.violetLight }}>{section.aiNote}</span>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <Card style={{ padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Sample Size & Power</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Target N (per arm)", value: "120" },
              { label: "Total enrollment", value: "360" },
              { label: "Power", value: "90% (α=0.05, two-sided)" },
              { label: "Expected dropout", value: "15% at 52 weeks" },
              { label: "SD assumption", value: "28% LDL-C change" },
              { label: "Min detectable diff", value: "15% additional reduction" },
            ].map((row, j) => (
              <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{row.label}</span>
                <span style={{ fontSize: 11, color: COLORS.text, fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Statistical Plan</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Primary analysis", value: "mITT" },
              { label: "Model", value: "MMRM, baseline as covariate" },
              { label: "Multiple comparisons", value: "Holm-Bonferroni" },
              { label: "Interim analysis", value: "50% enrollment (n=180)" },
              { label: "Alpha spending", value: "O'Brien-Fleming" },
              { label: "Subgroup analysis", value: "LDLR activity strata" },
            ].map((row, j) => (
              <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{row.label}</span>
                <span style={{ fontSize: 11, color: COLORS.text, fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Design Quality Scores</div>
          <ScoreBar value={92} color={COLORS.emerald} label="PICO clarity" />
          <div style={{ height: 6 }} />
          <ScoreBar value={88} color={COLORS.emerald} label="Endpoints" />
          <div style={{ height: 6 }} />
          <ScoreBar value={84} color={COLORS.blue} label="Sample size" />
          <div style={{ height: 6 }} />
          <ScoreBar value={79} color={COLORS.blue} label="Stat plan" />
          <div style={{ height: 6 }} />
          <ScoreBar value={71} color={COLORS.amber} label="Feasibility" />
          <div style={{ marginTop: 12, background: COLORS.amberDim, borderRadius: 5, padding: "7px 10px" }}>
            <div style={{ fontSize: 10, color: COLORS.amber, fontWeight: 600 }}>△ AI Recommendation</div>
            <p style={{ fontSize: 10.5, color: COLORS.amberLight, margin: "4px 0 0" }}>Add HoFH registry sites in Netherlands, Canada for feasibility — global HoFH prevalence 1:300,000.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── COLLABORATION ────────────────────────────────────────────────────────────

function Collaboration() {
  const docs = [
    { title: "HoFH Combination Therapy — Protocol v3.2", author: "Dr. A. Kapoor", status: "In Review", reviewers: ["SK", "MR", "JP"], updated: "2h ago", comments: 14 },
    { title: "p-tau217 + GFAP Biomarker Panel — Study Design", author: "Dr. S. Kim", status: "Approved", reviewers: ["AK", "LP"], updated: "Yesterday", comments: 7 },
    { title: "SGLT2i Pediatric CKD — Grant Application", author: "Dr. M. Rodriguez", status: "Draft", reviewers: ["AK"], updated: "3 days ago", comments: 3 },
    { title: "CAR-T Early vs Late Line MM — Systematic Review", author: "Dr. J. Park", status: "Changes requested", reviewers: ["AK", "SK", "MR"], updated: "1 week ago", comments: 22 },
  ];
  const statusColors = { "In Review": "amber", "Approved": "emerald", "Draft": "gray", "Changes requested": "red" };
  const recentActivity = [
    { user: "SK", text: "Added contradicting evidence to HoFH protocol", time: "1h ago", color: "#3b82f6" },
    { user: "MR", text: "Approved SGLT2i grant outline — pending IRB section", time: "2h ago", color: "#10b981" },
    { user: "JP", text: "Flagged conflicting endpoint definition in CAR-T SR", time: "4h ago", color: "#f59e0b" },
    { user: "AK", text: "Generated new hypothesis: ANGPTL3 × NLRP3 pathway", time: "6h ago", color: "#8b5cf6" },
    { user: "LP", text: "Approved p-tau217 study design for submission", time: "Yesterday", color: "#10b981" },
  ];

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div>
          <SectionHeader title="Shared Documents & Protocols" action="+ New document" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {docs.map((doc, i) => (
              <Card key={i} style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{doc.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>Author: {doc.author} · Updated {doc.updated}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Badge color={statusColors[doc.status]}>{doc.status}</Badge>
                      <div style={{ display: "flex", gap: -4 }}>
                        {doc.reviewers.map((r, j) => (
                          <div key={j} style={{
                            width: 22, height: 22, borderRadius: "50%", marginLeft: j > 0 ? -6 : 0,
                            background: `hsl(${j * 80 + 200},60%,45%)`,
                            border: `2px solid ${COLORS.bgCard}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 700, color: "#fff",
                          }}>{r}</div>
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>{doc.comments} comments</span>
                    </div>
                  </div>
                  <button style={{ padding: "6px 12px", background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.text, fontSize: 11, cursor: "pointer" }}>
                    Open
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: 14 }}>
            <SectionHeader title="Team Activity" />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ padding: "9px 0", borderBottom: i < recentActivity.length - 1 ? `1px solid ${COLORS.border}` : "none", display: "flex", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{a.user}</div>
                  <div>
                    <p style={{ fontSize: 11.5, color: COLORS.text, margin: 0, lineHeight: 1.4 }}>{a.text}</p>
                    <span style={{ fontSize: 10, color: COLORS.textDim }}>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 14 }}>
            <SectionHeader title="Review Queue" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { text: "Review HoFH protocol v3.2", priority: "High", deadline: "Tomorrow" },
                { text: "Approve CAR-T SR methodology", priority: "Medium", deadline: "3 days" },
                { text: "Comment on SGLT2i grant IRB section", priority: "Low", deadline: "1 week" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: COLORS.bgElevated, borderRadius: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? COLORS.red : i === 1 ? COLORS.amber : COLORS.blue, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, color: COLORS.text }}>{item.text}</div>
                    <div style={{ fontSize: 10, color: COLORS.textDim }}>Due: {item.deadline}</div>
                  </div>
                  <Badge color={i === 0 ? "red" : i === 1 ? "amber" : "blue"}>{item.priority}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── FLOATING AI COPILOT ──────────────────────────────────────────────────────

function AICopilot({ page }) {
  const [open, setOpen] = useState(false);
  const contextMap = {
    dashboard: "Viewing: Dashboard overview",
    literature: "Viewing: FOURIER-OLE paper",
    assistant: "Active: PCSK9 × FH synthesis",
    graph: "Selected: PCSK9 node (8 connections)",
    hypothesis: "Active hypothesis: HoFH combination therapy",
    gaps: "Focus: Pediatric CKD gap cluster",
    study: "Active protocol: Phase II HoFH trial",
    collab: "Active: HoFH protocol review",
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100 }}>
      {open && (
        <div style={{
          position: "absolute", bottom: 56, right: 0, width: 280,
          background: COLORS.bgSurface, border: `1px solid rgba(139,92,246,0.3)`,
          borderRadius: 12, padding: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>BRAHMA Copilot</span>
            </div>
            <span style={{ fontSize: 9, color: COLORS.violet, background: COLORS.violetDim, borderRadius: 3, padding: "2px 6px" }}>Context-aware</span>
          </div>
          <div style={{ fontSize: 10.5, color: COLORS.textMuted, marginBottom: 10, padding: "6px 8px", background: COLORS.bgCard, borderRadius: 5 }}>
            {contextMap[page] || "Ready"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {["Summarize this view", "Find contradictions", "Generate hypothesis", "Explain entity", "Compare evidence"].map((action, i) => (
              <button key={i} style={{
                padding: "6px 10px", background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
                borderRadius: 6, color: COLORS.textMuted, fontSize: 11, textAlign: "left", cursor: "pointer",
              }}>{action}</button>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, color: "#fff", boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
      }}>◈</button>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

export default function BrahmaApp() {
  const [page, setPage] = useState("dashboard");

  const pageComponents = {
    dashboard: <Dashboard />,
    literature: <LiteratureExplorer />,
    assistant: <AIAssistant />,
    graph: <KnowledgeGraph />,
    hypothesis: <HypothesisGenerator />,
    gaps: <ResearchGaps />,
    study: <StudyDesigner />,
    collab: <Collaboration />,
  };

  return (
    <div style={{
      display: "flex", height: "100vh", background: COLORS.bg,
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: COLORS.text, overflow: "hidden",
    }}>
      <NavRail active={page} setActive={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar page={page} />
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {pageComponents[page] || <Dashboard />}
        </div>
      </div>
      <AICopilot page={page} />
    </div>
  );
}

