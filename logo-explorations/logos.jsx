// Logo explorations for Spark I/O
// Each direction: large mark, wordmark lockup, small nav size, reversed on dark, monochrome

const INK = '#1a1918';
const PAPER = '#f5f3ee';
const EMBER = '#d94e2b';
const AMBER = '#e8b24a';
const DIM = '#9a9992';

// ─────────── Direction 1: Current Mark (refined) ───────────
// Diamond/rhombus, kept for reference
function MarkA({ size = 96, color = INK }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 2 L28 12 L22 16 L28 20 L16 30 L4 20 L10 16 L4 12 Z" fill={color}/>
    </svg>
  );
}

// ─────────── Direction 2: I/O Monogram ───────────
// The slash as the hero element — circle-slash-square geometric mark
function MarkB({ size = 96, color = INK, accent = EMBER }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="18" cy="32" r="13" stroke={color} strokeWidth="5"/>
      <rect x="33" y="19" width="26" height="26" stroke={color} strokeWidth="5"/>
      <line x1="12" y1="52" x2="52" y2="12" stroke={accent} strokeWidth="5" strokeLinecap="square"/>
    </svg>
  );
}

// ─────────── Direction 3: Spark Ignition ───────────
// A single tall spark/flame rendered as a tapered shape with a hot core
function MarkC({ size = 96, color = INK, accent = EMBER }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M32 6 C 38 22, 44 26, 44 38 A 12 12 0 0 1 20 38 C 20 26, 26 22, 32 6 Z"
        fill={color}/>
      <path d="M32 22 C 35 30, 38 32, 38 38 A 6 6 0 0 1 26 38 C 26 32, 29 30, 32 22 Z"
        fill={accent}/>
    </svg>
  );
}

// ─────────── Direction 4: Slash Wordmark ───────────
// No separate mark — the wordmark IS the logo. "Spark/IO" with a slash.
// Returns empty mark slot.
function MarkD({ size = 96, color = INK }) {
  return (
    <div style={{width:size, height:size, display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'Fraunces, serif', fontSize:size*0.5, fontWeight:600, color, letterSpacing:'-0.04em'}}>
      S<span style={{color: EMBER, margin:'0 -0.05em', fontStyle:'italic'}}>/</span>O
    </div>
  );
}

// ─────────── Direction 5: Terminal Prompt ───────────
// Technical/mono feel — a chevron prompt + underscore cursor
function MarkE({ size = 96, color = INK, accent = EMBER }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <rect x="4" y="4" width="56" height="56" rx="12" fill={color}/>
      <path d="M20 22 L32 32 L20 42" stroke={PAPER} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <rect x="35" y="40" width="14" height="3" fill={accent}/>
    </svg>
  );
}

// ─────────── Direction 6: Arc / Circuit ───────────
// Abstract — an arc that resolves into a node. "From strategy to ship."
function MarkF({ size = 96, color = INK, accent = EMBER }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M10 50 Q 10 14, 46 14" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="46" cy="14" r="8" fill={accent}/>
      <circle cx="10" cy="50" r="4" fill={color}/>
    </svg>
  );
}

// ─────────── Wordmark components — one per direction ───────────

// Direction 1: Current — Instrument Serif with italic I/O
function WordmarkA({ fontSize = 32, color = INK, accent = EMBER }) {
  return (
    <span style={{fontFamily:'Instrument Serif, serif', fontSize, color, letterSpacing:'-0.01em', lineHeight:1}}>
      Spark <em style={{fontStyle:'italic', color: accent}}>I/O</em>
    </span>
  );
}

// Direction 2: Monogram — all caps, geometric sans
function WordmarkB({ fontSize = 28, color = INK }) {
  return (
    <span style={{fontFamily:'Space Grotesk, sans-serif', fontSize, fontWeight:600, color, letterSpacing:'-0.01em', lineHeight:1, textTransform:'uppercase'}}>
      Spark I/O
    </span>
  );
}

// Direction 3: Flame — editorial serif, lowercase tight
function WordmarkC({ fontSize = 34, color = INK, accent = EMBER }) {
  return (
    <span style={{fontFamily:'Fraunces, serif', fontSize, fontWeight:500, color, letterSpacing:'-0.03em', lineHeight:1}}>
      spark<span style={{color: accent}}>·</span>io
    </span>
  );
}

// Direction 4: Slash wordmark — the mark IS the wordmark
function WordmarkD({ fontSize = 34, color = INK, accent = EMBER }) {
  return (
    <span style={{fontFamily:'Fraunces, serif', fontSize, fontWeight:600, color, letterSpacing:'-0.04em', lineHeight:1}}>
      Spark&nbsp;I<span style={{color: accent, fontStyle:'italic', margin:'0 0.02em'}}>/</span>O
    </span>
  );
}

// Direction 5: Terminal — mono wordmark with prompt
function WordmarkE({ fontSize = 22, color = INK, accent = EMBER }) {
  return (
    <span style={{fontFamily:'JetBrains Mono, monospace', fontSize, fontWeight:500, color, letterSpacing:'0.01em', lineHeight:1}}>
      <span style={{color: accent}}>{'>'}</span> spark.io
    </span>
  );
}

// Direction 6: Arc — humanist sans
function WordmarkF({ fontSize = 30, color = INK }) {
  return (
    <span style={{fontFamily:'Inter, sans-serif', fontSize, fontWeight:600, color, letterSpacing:'-0.025em', lineHeight:1}}>
      Spark I/O
    </span>
  );
}

// ─────────── A single logo exploration card ───────────
function LogoDirection({ number, name, description, tagline, Mark, Wordmark, notes }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 24, width: 920}}>
      {/* Hero artboard: large mark + wordmark stacked */}
      <DCArtboard width={920} height={520} style={{background: PAPER}}>
        <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
          {/* Top label bar */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'18px 28px', borderBottom:'1px solid rgba(0,0,0,0.08)',
            fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color: DIM}}>
            <span>Direction / 0{number}</span>
            <span>{name}</span>
          </div>
          {/* Centerpiece */}
          <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap: 32, padding: 40}}>
            <Mark size={140} />
            <div style={{width:1, height:100, background:'rgba(0,0,0,0.1)'}}/>
            <div style={{display:'flex', flexDirection:'column', gap: 10}}>
              <Wordmark fontSize={48}/>
              <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:'0.1em',
                textTransform:'uppercase', color: DIM}}>{tagline}</div>
            </div>
          </div>
          {/* Bottom row — nav size + footer size */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid rgba(0,0,0,0.08)'}}>
            <div style={{padding:'20px 28px', borderRight:'1px solid rgba(0,0,0,0.08)',
              display:'flex', alignItems:'center', gap: 12}}>
              <Mark size={28} />
              <Wordmark fontSize={20}/>
              <span style={{marginLeft:'auto', fontFamily:'JetBrains Mono, monospace', fontSize:10,
                color: DIM, letterSpacing:'0.1em'}}>NAV</span>
            </div>
            <div style={{padding:'20px 28px', display:'flex', alignItems:'center', gap: 12}}>
              <Mark size={20} />
              <Wordmark fontSize={14}/>
              <span style={{marginLeft:'auto', fontFamily:'JetBrains Mono, monospace', fontSize:10,
                color: DIM, letterSpacing:'0.1em'}}>FOOTER</span>
            </div>
          </div>
        </div>
      </DCArtboard>

      {/* Sub row: reversed (dark), monochrome, favicon */}
      <div style={{display:'flex', gap: 16}}>
        {/* Reversed */}
        <DCArtboard width={340} height={200} style={{background: INK}}>
          <div style={{height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:24}}>
            <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:'0.1em',
              textTransform:'uppercase', color:'rgba(255,255,255,0.4)'}}>Reversed / on dark</div>
            <div style={{display:'flex', alignItems:'center', gap: 14}}>
              <Mark size={40} color={PAPER}/>
              <Wordmark fontSize={26} color={PAPER} accent={AMBER}/>
            </div>
            <div/>
          </div>
        </DCArtboard>
        {/* Monochrome */}
        <DCArtboard width={280} height={200} style={{background: PAPER}}>
          <div style={{height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:24}}>
            <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:'0.1em',
              textTransform:'uppercase', color: DIM}}>Monochrome</div>
            <div style={{display:'flex', alignItems:'center', gap: 14}}>
              <Mark size={40} color={INK} accent={INK}/>
              <Wordmark fontSize={24} color={INK} accent={INK}/>
            </div>
            <div/>
          </div>
        </DCArtboard>
        {/* Favicon grid */}
        <DCArtboard width={280} height={200} style={{background: PAPER}}>
          <div style={{height:'100%', display:'flex', flexDirection:'column', padding:24}}>
            <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:'0.1em',
              textTransform:'uppercase', color: DIM, marginBottom: 18}}>Favicon / app icon</div>
            <div style={{display:'flex', alignItems:'center', gap: 18, flex:1}}>
              <div style={{width:64, height:64, background: INK, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Mark size={36} color={PAPER}/>
              </div>
              <div style={{width:40, height:40, background: INK, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Mark size={22} color={PAPER}/>
              </div>
              <div style={{width:24, height:24, background: INK, borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Mark size={14} color={PAPER}/>
              </div>
              <div style={{width:16, height:16, background: INK, borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Mark size={10} color={PAPER}/>
              </div>
            </div>
          </div>
        </DCArtboard>
      </div>

      {/* Description card */}
      <DCArtboard width={920} height={160} style={{background:'#fff'}}>
        <div style={{padding:'28px 32px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 32, height:'100%'}}>
          <div>
            <div style={{fontFamily:'Instrument Serif, serif', fontSize:28, fontStyle:'italic', color: INK, marginBottom: 8, lineHeight:1.1}}>
              {name}
            </div>
            <div style={{fontFamily:'Inter, sans-serif', fontSize:14, color: '#4a4945', lineHeight:1.6}}>
              {description}
            </div>
          </div>
          <div style={{borderLeft:'1px solid rgba(0,0,0,0.08)', paddingLeft: 32}}>
            <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:'0.1em',
              textTransform:'uppercase', color: DIM, marginBottom: 10}}>Notes</div>
            <ul style={{margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap: 6,
              fontFamily:'Inter, sans-serif', fontSize:13, color: '#4a4945', lineHeight:1.5}}>
              {notes.map((n,i) => <li key={i} style={{paddingLeft:14, position:'relative'}}>
                <span style={{position:'absolute', left:0, top:0, color: EMBER}}>·</span>{n}
              </li>)}
            </ul>
          </div>
        </div>
      </DCArtboard>
    </div>
  );
}

// ─────────── App ───────────
function App() {
  return (
    <DesignCanvas>
      {/* Header card */}
      <div style={{padding:'0 60px 48px', maxWidth: 1200}}>
        <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:'0.15em',
          textTransform:'uppercase', color: DIM, marginBottom: 14}}>Spark I/O · Brand Identity · V1</div>
        <h1 style={{fontFamily:'Instrument Serif, serif', fontSize: 64, fontWeight:400,
          letterSpacing:'-0.02em', lineHeight:1.05, color: INK, margin: 0}}>
          Six directions for the <span style={{fontStyle:'italic', color: EMBER}}>mark</span>.
        </h1>
        <p style={{fontFamily:'Inter, sans-serif', fontSize:17, color:'#4a4945', lineHeight:1.6,
          maxWidth: 680, marginTop: 20}}>
          Each direction is a complete system — mark, wordmark, nav lockup, footer lockup, reversed, monochrome, and favicon. Pan and zoom the canvas to compare. Scroll through and pick one — or a pair — to take further.
        </p>
      </div>

      <DCSection title="Geometric marks" subtitle="Symbolic shapes with a clear, ownable geometry.">
        <LogoDirection
          number={1} name="Diamond (current, refined)"
          tagline="· Kept for reference"
          Mark={MarkA} Wordmark={WordmarkA}
          description="The current rhombus mark with the Instrument Serif wordmark. Keeping this as the baseline — it's what people already recognize. The italic I/O in amber/ember carries the personality."
          notes={[
            "Works, but the mark is geometric-generic",
            "Most recognizable to existing audience",
            "Low switching cost",
          ]}
        />
        <LogoDirection
          number={2} name="I/O Monogram"
          tagline="· Input ⁄ Output"
          Mark={MarkB} Wordmark={WordmarkB}
          description="The mark is literally I/O — a circle and a square separated by a slash. A literal nod to 'input/output,' the technical heritage embedded in the name. Strong, ownable, and reads as a mark even at 16px."
          notes={[
            "Most conceptually tight — name and mark reinforce each other",
            "Reads as 'tech studio' not 'consultancy'",
            "Scales cleanly from favicon to billboard",
          ]}
        />
      </DCSection>

      <DCSection title="Symbolic / illustrative" subtitle="Marks that carry meaning beyond pure geometry.">
        <LogoDirection
          number={3} name="Ember Flame"
          tagline="· The spark, made literal"
          Mark={MarkC} Wordmark={WordmarkC}
          description="A stylized flame with a hot inner core. Leans into the 'Spark' half of the name. Warmer and more approachable than the diamond — positions Spark I/O as the energetic, hands-on partner rather than a cold strategy firm."
          notes={[
            "Distinct on a crowded consulting landscape",
            "Pairs naturally with the ember/amber palette",
            "Risk: 'flame' can read generic if not rendered tightly",
          ]}
        />
        <LogoDirection
          number={6} name="Arc to Node"
          tagline="· Strategy → ship"
          Mark={MarkF} Wordmark={WordmarkF}
          description="An arc that begins as a small dot and resolves into a larger filled node. Abstracts the Spark I/O promise — moving clients from an uncertain starting point to a concrete delivered outcome. Minimal, confident, and unusual."
          notes={[
            "Conceptually rich — 'we get you from A to shipped'",
            "Most abstract option; needs the wordmark at first",
            "Feels premium, research-y, quietly confident",
          ]}
        />
      </DCSection>

      <DCSection title="Wordmark-led" subtitle="The typography does the work. No separate mark required.">
        <LogoDirection
          number={4} name="Slash Wordmark"
          tagline="· Typography as identity"
          Mark={MarkD} Wordmark={WordmarkD}
          description="The wordmark is the logo. 'Spark I/O' with an italic ember slash between 'I' and 'O' — the slash is the hinge of the identity, echoing input/output. No mark to design around; strong in editorial, weak in small spaces, so we'd pair it with a simple 'I/O' monogram for favicons."
          notes={[
            "Most distinctive as a wordmark",
            "Works beautifully in magazine-style layouts",
            "Needs a simple derivative mark for favicon use",
          ]}
        />
        <LogoDirection
          number={5} name="Terminal Prompt"
          tagline="· $ spark.io"
          Mark={MarkE} Wordmark={WordmarkE}
          description="Pure technical heritage — a dark squircle with a chevron prompt and blinking cursor. Wordmark set in JetBrains Mono. Signals 'we are engineers, we ship code.' Best for a pivot toward a more technical / implementation-heavy positioning."
          notes={[
            "Strongest signal to a technical buyer",
            "Can feel niche or excluding to SMB workshop audience",
            "The mark animates well (blinking cursor, typed wordmark)",
          ]}
        />
      </DCSection>

      <div style={{padding:'60px 60px 40px', maxWidth: 1000}}>
        <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:'0.15em',
          textTransform:'uppercase', color: DIM, marginBottom: 14}}>Recommendation</div>
        <h2 style={{fontFamily:'Instrument Serif, serif', fontSize: 40, fontWeight:400,
          letterSpacing:'-0.02em', lineHeight:1.15, color: INK, margin: 0}}>
          Lead with <span style={{fontStyle:'italic', color: EMBER}}>Direction 02 (I/O Monogram)</span> for the mark.
        </h2>
        <p style={{fontFamily:'Inter, sans-serif', fontSize:16, color:'#4a4945', lineHeight:1.6,
          maxWidth: 720, marginTop: 18}}>
          Direction 02 is the only option where the name and the mark reinforce each other — the mark <em>is</em> 'I/O'. It scales from 16px favicons to billboards without losing meaning, and the simple geometry ages well. Pair it with the current Instrument Serif wordmark and you keep continuity for existing customers while upgrading the mark from generic to conceptual.
        </p>
        <p style={{fontFamily:'Inter, sans-serif', fontSize:16, color:'#4a4945', lineHeight:1.6,
          maxWidth: 720, marginTop: 14}}>
          If you want more warmth in the brand, pair Direction 02 with Direction 03's ember-toned palette. If you want more premium distance, pair it with Direction 06's arc-to-node treatment in marketing layouts.
        </p>
      </div>
    </DesignCanvas>
  );
}

Object.assign(window, { App, LogoDirection,
  MarkA, MarkB, MarkC, MarkD, MarkE, MarkF,
  WordmarkA, WordmarkB, WordmarkC, WordmarkD, WordmarkE, WordmarkF });
