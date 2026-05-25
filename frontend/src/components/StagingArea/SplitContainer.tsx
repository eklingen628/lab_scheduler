import { useRef } from 'react';

interface Props {
  orientation: 'horizontal' | 'vertical';
  ratio: number;
  onRatioChange: (r: number) => void;
  min?: number;
  max?: number;
  reverseOrder?: boolean;
  children: [React.ReactNode, React.ReactNode];
}

export default function SplitContainer({
  orientation,
  ratio,
  onRatioChange,
  min = 0.25,
  max = 0.75,
  reverseOrder = false,
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!(e.buttons & 1)) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const r =
      orientation === 'horizontal'
        ? (e.clientX - rect.left) / rect.width
        : (e.clientY - rect.top) / rect.height;
    onRatioChange(Math.min(max, Math.max(min, r)));
  }

  const isH = orientation === 'horizontal';
  const dim = isH ? 'width' : 'height';
  // When reverseOrder, pane1 appears second visually; ratio refers to the first VISUAL pane (pane2).
  const pane1Style = { [dim]: `${(reverseOrder ? 1 - ratio : ratio) * 100}%`, order: reverseOrder ? 3 : 1 };
  const pane2Style = { [dim]: `${(reverseOrder ? ratio : 1 - ratio) * 100}%`, order: reverseOrder ? 1 : 3 };

  return (
    <div ref={containerRef} className={`split-container split-container--${orientation}`}>
      <div className="split-pane" style={pane1Style}>{children[0]}</div>
      <div
        className={`split-divider split-divider--${orientation}`}
        style={{ order: 2 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      />
      <div className="split-pane" style={pane2Style}>{children[1]}</div>
    </div>
  );
}
