'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { VN_VIEWBOX, VN_PROVINCES } from './vietnamMap.data';

const LABEL_FROM_SCALE = 2.2;
const REGION_LABEL_FROM_SCALE = 1.35;
const REGION_LABEL_SLUGS = new Set([
  'ha-noi',
  'hai-phong',
  'quang-ninh',
  'nghe-an',
  'da-nang',
  'khanh-hoa',
  'lam-dong',
  'sai-gon',
  'can-tho',
]);

const VN_ISLAND_LABELS = [
  {
    name: 'Hoàng Sa',
    label: { x: 620, y: 505 },
    islands: [
      'M584.5,486.2l2.8,-1.1l2.1,1.4l-0.8,2.2l-3.1,0.7l-1.7,-1.3z',
      'M603.2,498.4l1.8,-0.8l1.5,1.1l-0.5,1.6l-2,0.5l-1.1,-1z',
      'M626.8,492.1l2.4,-1l1.8,1.2l-0.7,1.8l-2.7,0.6l-1.4,-1z',
      'M642.5,515.1l1.6,-0.7l1.3,0.9l-0.4,1.5l-1.8,0.5l-1,-0.8z',
      'M613.8,526.3l2.1,-0.9l1.6,1.1l-0.6,1.7l-2.3,0.6l-1.3,-1z',
    ],
  },
  {
    name: 'Trường Sa',
    label: { x: 650, y: 770 },
    islands: [
      'M574.8,705.4l1.7,-0.8l1.4,1l-0.5,1.6l-1.9,0.5l-1.1,-0.9z',
      'M606.2,727.6l2.5,-1.1l1.9,1.3l-0.7,2l-2.8,0.7l-1.5,-1.1z',
      'M644.5,714.8l1.6,-0.7l1.2,0.9l-0.4,1.4l-1.8,0.4l-0.9,-0.8z',
      'M681.1,748.3l2.1,-0.9l1.6,1.1l-0.6,1.7l-2.3,0.6l-1.2,-1z',
      'M632.3,765.9l2.2,-1l1.8,1.2l-0.7,1.9l-2.5,0.6l-1.3,-1z',
      'M594.1,790.8l1.6,-0.7l1.2,0.9l-0.4,1.4l-1.8,0.4l-0.9,-0.8z',
      'M671.5,805.5l1.8,-0.8l1.4,1l-0.5,1.5l-2,0.5l-1,-0.8z',
    ],
  },
];

type Props = {
  /** city slugs that have posts in the current context — only these are highlighted/clickable */
  activeSlugs: Set<string>;
  hrefForSlug?: (slug: string) => string;
  className?: string;
  shapeShield?: boolean;
};

export default function InteractiveVietnamMap({ activeSlugs, hrefForSlug, className, shapeShield = false }: Props) {
  const router = useRouter();
  const [scale, setScale] = useState(1);
  const [hover, setHover] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);
  const down = useRef<{ x: number; y: number } | null>(null);

  const go = (slug: string) => {
    if (!activeSlugs.has(slug)) return;
    router.push(hrefForSlug ? hrefForSlug(slug) : `/${slug}`);
  };

  const showLabels = scale >= LABEL_FROM_SCALE;
  const showRegionLabels = scale >= REGION_LABEL_FROM_SCALE;
  const labelFont = 12 / scale;
  const regionLabelFont = 13 / scale;
  const islandLabelFont = 10 / scale;

  return (
    <div className={className ?? 'relative mx-auto h-[calc(100vh-80px)] min-h-[760px] w-[min(980px,94vw)] select-none overflow-hidden bg-transparent'}>
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={6}
        centerOnInit
        smooth
        wheel={{ step: 0.035, wheelDisabled: true }}
        pinch={{ step: 2.5 }}
        doubleClick={{ step: 0.35 }}
        panning={{ velocityDisabled: true }}
        trackPadPanning={{ disabled: true }}
        velocityAnimation={{ disabled: true }}
        onTransform={(_ref, state) => setScale(state.scale)}
      >
        {() => (
          <>
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <svg
                viewBox={VN_VIEWBOX}
                className="h-full w-full"
                style={{ display: 'block', filter: 'drop-shadow(0 18px 34px rgba(15, 23, 42, 0.06))' }}
                onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY }; }}
              >
                {shapeShield && (
                  <defs>
                    <filter id="vn-map-shape-shield" x="-20%" y="-20%" width="140%" height="140%">
                      <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="dilated" />
                      <feGaussianBlur in="dilated" stdDeviation="10" result="blurred" />
                      <feFlood floodColor="#ffffff" floodOpacity="0.82" result="white" />
                      <feComposite in="white" in2="blurred" operator="in" />
                    </filter>
                  </defs>
                )}
                <rect x="0" y="0" width="760" height="940" fill="transparent" />
                {shapeShield && (
                  <>
                    <g pointerEvents="none" filter="url(#vn-map-shape-shield)">
                      {VN_PROVINCES.map((p) => (
                        <path
                          key={`shield-${p.slug}`}
                          d={p.d}
                          fill="#ffffff"
                          stroke="#ffffff"
                          strokeWidth={8}
                          strokeLinejoin="round"
                        />
                      ))}
                      {VN_ISLAND_LABELS.flatMap((group) =>
                        group.islands.map((d, index) => (
                          <path
                            key={`shield-${group.name}-${index}`}
                            d={d}
                            fill="#ffffff"
                            stroke="#ffffff"
                            strokeWidth={5}
                            strokeLinejoin="round"
                          />
                        )),
                      )}
                    </g>
                    <g pointerEvents="none" opacity={0.72}>
                      {VN_PROVINCES.map((p) => (
                        <path
                          key={`shield-core-${p.slug}`}
                          d={p.d}
                          fill="#ffffff"
                          stroke="#ffffff"
                          strokeWidth={2.5}
                          strokeLinejoin="round"
                        />
                      ))}
                    </g>
                  </>
                )}
                {VN_PROVINCES.map((p) => {
                  const active = activeSlugs.has(p.slug);
                  const isHover = hover === p.slug;
                  const fill = isHover && active ? '#edf4fb' : active ? '#fbfdff' : '#ffffff';
                  return (
                    <path
                      key={p.slug}
                      d={p.d}
                      fill={fill}
                      stroke={isHover && active ? '#0A2D5B' : active ? '#17456f' : '#8aa0b8'}
                      strokeWidth={active ? 0.78 : 0.58}
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      style={{ cursor: active ? 'pointer' : 'default', transition: 'fill 0.15s, stroke 0.15s' }}
                      onPointerEnter={(e) => {
                        setHover(p.slug);
                        if (active) setTooltip({ name: p.name, x: e.clientX, y: e.clientY });
                      }}
                      onPointerMove={(e) => {
                        if (active) setTooltip({ name: p.name, x: e.clientX, y: e.clientY });
                      }}
                      onPointerLeave={() => {
                        setHover((h) => (h === p.slug ? null : h));
                        setTooltip(null);
                      }}
                      onClick={(e) => {
                        const d0 = down.current;
                        if (d0 && Math.hypot(e.clientX - d0.x, e.clientY - d0.y) > 6) return; // was a drag
                        go(p.slug);
                      }}
                    />
                  );
                })}

                {showRegionLabels && !showLabels && VN_PROVINCES
                  .filter((p) => REGION_LABEL_SLUGS.has(p.slug))
                  .map((p) => (
                    <text
                      key={`rl-${p.slug}`}
                      x={p.cx}
                      y={p.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={regionLabelFont}
                      fontWeight={650}
                      fill="#0A2D5B"
                      stroke="#ffffff"
                      strokeWidth={regionLabelFont * 0.35}
                      paintOrder="stroke"
                      style={{ pointerEvents: 'none' }}
                    >
                      {p.name}
                    </text>
                  ))}

                {VN_ISLAND_LABELS.map((group) => (
                  <g key={group.name} pointerEvents="none" opacity={0.92}>
                    {group.islands.map((d, index) => (
                      <path
                        key={`${group.name}-${index}`}
                        d={d}
                        fill="#ffffff"
                        stroke="#17456f"
                        strokeWidth={0.78}
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                    <text
                      x={group.label.x}
                      y={group.label.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={islandLabelFont}
                      fontWeight={600}
                      fill="#0A2D5B"
                      stroke="#ffffff"
                      strokeWidth={islandLabelFont * 0.4}
                      paintOrder="stroke"
                    >
                      {group.name}
                    </text>
                  </g>
                ))}

                {showLabels && VN_PROVINCES.map((p) => (
                  <text
                    key={`l-${p.slug}`}
                    x={p.cx}
                    y={p.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={labelFont}
                    fontWeight={600}
                    fill={activeSlugs.has(p.slug) ? '#0A2D5B' : '#6f849b'}
                    stroke="#ffffff"
                    strokeWidth={labelFont * 0.32}
                    paintOrder="stroke"
                    style={{ pointerEvents: 'none' }}
                  >
                    {p.name}
                  </text>
                ))}
              </svg>
            </TransformComponent>

            {tooltip && (
              <div
                className="pointer-events-none fixed z-50 whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0A2D5B] shadow-[0_12px_28px_rgba(10,45,91,0.14)] ring-1 ring-[#0A2D5B]/10"
                style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
              >
                {tooltip.name}
                <span className="ml-2 font-normal text-[#0A2D5B]/55">Xem điểm đến</span>
              </div>
            )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
