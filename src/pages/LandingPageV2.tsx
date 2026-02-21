import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Hand-drawn SVG shapes that look like whiteboard marker doodles.
 * Each path is intentionally imperfect to mimic chisel-tip marker strokes.
 */

const MarkerCircle = ({ cx, cy, r, color = '#222', strokeWidth = 2.5, delay = 0 }: {
  cx: number; cy: number; r: number; color?: string; strokeWidth?: number; delay?: number;
}) => (
  <motion.ellipse
    cx={cx} cy={cy} rx={r} ry={r * 0.92}
    fill="none" stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ delay, duration: 1.2, ease: 'easeInOut' }}
    style={{ filter: 'url(#marker-rough)' }}
  />
);

const MarkerLine = ({ x1, y1, x2, y2, color = '#222', strokeWidth = 2.5, delay = 0 }: {
  x1: number; y1: number; x2: number; y2: number; color?: string; strokeWidth?: number; delay?: number;
}) => (
  <motion.line
    x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ delay, duration: 0.8, ease: 'easeInOut' }}
    style={{ filter: 'url(#marker-rough)' }}
  />
);

/** Lightbulb doodle */
const LightbulbDoodle = ({ x, y, scale = 1, delay = 0 }: { x: number; y: number; scale?: number; delay?: number }) => (
  <motion.g
    transform={`translate(${x}, ${y}) scale(${scale})`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
  >
    {/* Bulb */}
    <motion.path
      d="M0,-30 C-18,-30 -22,-12 -22,0 C-22,8 -16,16 -12,20 L-10,28 L10,28 L12,20 C16,16 22,8 22,0 C22,-12 18,-30 0,-30 Z"
      fill="none" stroke="#e8b931" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay, duration: 1.2, ease: 'easeInOut' }}
      style={{ filter: 'url(#marker-rough)' }}
    />
    {/* Filament */}
    <motion.path
      d="M-5,28 L-5,34 L5,34 L5,28"
      fill="none" stroke="#e8b931" strokeWidth={2.5} strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: delay + 0.3, duration: 0.5, ease: 'easeInOut' }}
      style={{ filter: 'url(#marker-rough)' }}
    />
    {/* Rays */}
    {[[-30, -20, -38, -26], [30, -20, 38, -26], [0, -38, 0, -48], [-26, 8, -36, 10], [26, 8, 36, 10]].map(
      ([lx1, ly1, lx2, ly2], i) => (
        <motion.line
          key={i} x1={lx1} y1={ly1} x2={lx2} y2={ly2}
          stroke="#e8b931" strokeWidth={2} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: delay + 0.6 + i * 0.1, duration: 0.3, ease: 'easeOut' }}
          style={{ filter: 'url(#marker-rough)' }}
        />
      )
    )}
  </motion.g>
);

/** Arrow doodle */
const ArrowDoodle = ({ x, y, rotation = 0, scale = 1, color = '#333', delay = 0 }: {
  x: number; y: number; rotation?: number; scale?: number; color?: string; delay?: number;
}) => (
  <motion.g
    transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.3 }}
  >
    <motion.path
      d="M0,0 C10,-5 30,-8 50,-3"
      fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay, duration: 0.8, ease: 'easeInOut' }}
      style={{ filter: 'url(#marker-rough)' }}
    />
    <motion.path
      d="M42,-10 L50,-3 L42,5"
      fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: delay + 0.5, duration: 0.4, ease: 'easeOut' }}
      style={{ filter: 'url(#marker-rough)' }}
    />
  </motion.g>
);

/** Star doodle */
const StarDoodle = ({ x, y, scale = 1, color = '#d94f4f', delay = 0 }: {
  x: number; y: number; scale?: number; color?: string; delay?: number;
}) => (
  <motion.g
    transform={`translate(${x}, ${y}) scale(${scale})`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4, ease: 'backOut' }}
  >
    <motion.path
      d="M0,-18 L5,-6 L18,-6 L8,3 L12,16 L0,8 L-12,16 L-8,3 L-18,-6 L-5,-6 Z"
      fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay, duration: 1, ease: 'easeInOut' }}
      style={{ filter: 'url(#marker-rough)' }}
    />
  </motion.g>
);

/** Sticky note doodle */
const StickyDoodle = ({ x, y, scale = 1, color = '#4ecdc4', delay = 0, text = '' }: {
  x: number; y: number; scale?: number; color?: string; delay?: number; text?: string;
}) => (
  <motion.g
    transform={`translate(${x}, ${y}) scale(${scale})`}
    initial={{ opacity: 0, rotate: -5 }}
    animate={{ opacity: 1, rotate: Math.random() * 6 - 3 }}
    transition={{ delay, duration: 0.5 }}
  >
    <motion.path
      d="M-30,-25 L30,-25 L30,20 L20,30 L-30,30 Z"
      fill={color} fillOpacity={0.12} stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay, duration: 0.8, ease: 'easeInOut' }}
      style={{ filter: 'url(#marker-rough)' }}
    />
    <motion.path
      d="M20,30 L20,20 L30,20"
      fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: delay + 0.5, duration: 0.3 }}
      style={{ filter: 'url(#marker-rough)' }}
    />
    {text && (
      <motion.text
        y={5} textAnchor="middle"
        fill={color} fontSize={10}
        style={{ fontFamily: "'Caveat', cursive" }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}
        transition={{ delay: delay + 0.6 }}
      >
        {text}
      </motion.text>
    )}
  </motion.g>
);

/** Checkbox doodle */
const CheckboxDoodle = ({ x, y, scale = 1, delay = 0 }: {
  x: number; y: number; scale?: number; delay?: number;
}) => (
  <motion.g
    transform={`translate(${x}, ${y}) scale(${scale})`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.3 }}
  >
    <motion.rect
      x={-10} y={-10} width={20} height={20} rx={2}
      fill="none" stroke="#555" strokeWidth={2.2}
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay, duration: 0.6 }}
      style={{ filter: 'url(#marker-rough)' }}
    />
    <motion.path
      d="M-5,1 L-1,6 L7,-5"
      fill="none" stroke="#4ecdc4" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: delay + 0.4, duration: 0.4, ease: 'easeOut' }}
      style={{ filter: 'url(#marker-rough)' }}
    />
  </motion.g>
);

export default function LandingPageV2() {
  const navigate = useNavigate();

  return (
    <div
      className="relative h-screen w-screen overflow-hidden select-none"
      style={{
        background: 'linear-gradient(145deg, #d9d7d2 0%, #dbd9d4 30%, #d6d4cf 70%, #d3d1cc 100%)',
        backgroundImage: `
          linear-gradient(145deg, #d9d7d2 0%, #dbd9d4 30%, #d6d4cf 70%, #d3d1cc 100%),
          radial-gradient(circle, #c2c0bb 0.5px, transparent 0.5px)
        `,
        backgroundSize: '100% 100%, 24px 24px',
      }}
    >
      {/* SVG filter for marker texture */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="marker-rough">
            <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
          </filter>
        </defs>
      </svg>

      {/* Full-page SVG canvas for doodles */}
      <svg
        viewBox="0 0 1280 720"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Scattered doodles */}
        <LightbulbDoodle x={920} y={120} scale={1.3} delay={1.8} />
        <StarDoodle x={180} y={80} scale={1.2} color="#d94f4f" delay={2.2} />
        <StarDoodle x={1100} y={380} scale={0.8} color="#e8b931" delay={2.5} />
        <ArrowDoodle x={750} y={200} rotation={25} color="#888" delay={2} />
        <ArrowDoodle x={350} y={550} rotation={-15} scale={0.8} color="#aaa" delay={2.8} />
        <StickyDoodle x={1050} y={550} scale={1.3} color="#4ecdc4" delay={2.3} text="ideas!" />
        <StickyDoodle x={950} y={280} scale={1} color="#ff6b35" delay={2.6} text="sketch" />
        <CheckboxDoodle x={820} y={480} scale={1.3} delay={2.4} />
        <CheckboxDoodle x={870} y={520} scale={1.3} delay={2.7} />
        <MarkerCircle cx={200} cy={600} r={25} color="#c3b1e1" strokeWidth={2.2} delay={2.9} />
        <MarkerCircle cx={1150} cy={150} r={18} color="#ff8b94" strokeWidth={2} delay={3} />
        <MarkerLine x1={100} y1={500} x2={170} y2={480} color="#bbb" strokeWidth={1.8} delay={3.1} />
        <MarkerLine x1={1000} y1={650} x2={1080} y2={640} color="#ccc" strokeWidth={1.5} delay={3.2} />

        {/* Underline for "take shape" */}
        <motion.path
          d="M182,365 C250,370 420,355 560,368"
          fill="none" stroke="#4ecdc4" strokeWidth={5} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 1.4, duration: 0.8, ease: 'easeInOut' }}
          style={{ filter: 'url(#marker-rough)' }}
        />
      </svg>

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full px-8 md:px-16 lg:px-24 pointer-events-none max-w-5xl">

        {/* Blueprint mark */}
        <motion.div
          className="absolute top-8 left-8 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <span
            className="text-sm tracking-widest uppercase"
            style={{ color: '#999', fontFamily: "'Caveat', cursive", fontSize: '1.1rem' }}
          >
            ~ blueprint ~
          </span>
        </motion.div>

        {/* Overline */}
        <motion.p
          className="mb-4"
          style={{
            color: '#888',
            fontFamily: "'Caveat', cursive",
            fontSize: '1.4rem',
            letterSpacing: '0.05em',
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          your project's idea room
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="leading-[0.95] mb-6"
          style={{
            fontFamily: "'Caveat', cursive",
            fontWeight: 700,
            fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
            color: '#1a1a1a',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          Where ideas<br />
          <span style={{ color: '#3aafa9' }}>take shape.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="max-w-lg mb-14 leading-relaxed"
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '1.5rem',
            color: '#777',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
        >
          Sketch on whiteboards. Map out flows. Track tasks.
          Write docs. All in one space that lives with your project.
        </motion.p>

        {/* Hand-drawn button */}
        <motion.div
          className="pointer-events-auto relative"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
        >
          <button
            onClick={() => navigate('/home')}
            className="relative group"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <svg width="220" height="68" viewBox="0 0 220 68" fill="none">
              {/* Hand-drawn rectangle */}
              <motion.path
                d="M8,8 C8,6 12,4 16,5 L198,4 C204,4 208,6 210,10 L212,52 C212,56 210,60 206,61 L18,62 C12,63 8,60 6,56 L8,8 Z"
                fill="#1a1a1a"
                fillOpacity={0.05}
                stroke="#1a1a1a"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.3, duration: 0.8, ease: 'easeInOut' }}
                style={{ filter: 'url(#marker-rough)' }}
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#1a1a1a',
                letterSpacing: '0.08em',
              }}
            >
              Launch →
            </span>
            {/* Hover: hand-drawn fill */}
            <svg
              width="220" height="68" viewBox="0 0 220 68" fill="none"
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <path
                d="M8,8 C8,6 12,4 16,5 L198,4 C204,4 208,6 210,10 L212,52 C212,56 210,60 206,61 L18,62 C12,63 8,60 6,56 L8,8 Z"
                fill="#3aafa9"
                fillOpacity={0.15}
                stroke="#3aafa9"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'url(#marker-rough)' }}
              />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Bottom-right tools list */}
      <motion.div
        className="absolute bottom-8 right-8 text-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <p
          className="leading-relaxed"
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '1rem',
            color: '#aaa',
          }}
        >
          whiteboard · flow · tasks<br />docs · calendar
        </p>
      </motion.div>

      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
