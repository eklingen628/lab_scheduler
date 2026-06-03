type PaneMode = 'grouped' | 'flat';

interface Props {
  paneMode: PaneMode;
  setPaneMode: (v: PaneMode) => void;
}

export default function Toolbar({ paneMode, setPaneMode }: Props) {
  return (
    <div className="staging-toolbar">
      <div className="staging-view-switcher">
        <button
          className={`view-btn${paneMode === 'grouped' ? ' view-btn--active' : ''}`}
          onClick={() => setPaneMode('grouped')}
        >
          Grouped
        </button>
        <button
          className={`view-btn${paneMode === 'flat' ? ' view-btn--active' : ''}`}
          onClick={() => setPaneMode('flat')}
        >
          Flat
        </button>
      </div>
    </div>
  );
}
