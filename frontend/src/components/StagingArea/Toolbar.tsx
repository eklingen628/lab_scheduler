import { useContext } from 'react';
import { StagingAreaContext } from './StangingAreaContext';

type ViewMode = 'side-by-side' | 'stacked';

interface Props {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}

export default function Toolbar({ viewMode, setViewMode }: Props) {
  const { setShowModal, selectedTestsToAdd } = useContext(StagingAreaContext);
  const count = selectedTestsToAdd.size;

  return (
    <div className="staging-toolbar">
      <div className="staging-view-switcher">
        <button
          className={`view-btn${viewMode === 'side-by-side' ? ' view-btn--active' : ''}`}
          onClick={() => setViewMode('side-by-side')}
        >
          Side by side
        </button>
        <button
          className={`view-btn${viewMode === 'stacked' ? ' view-btn--active' : ''}`}
          onClick={() => setViewMode('stacked')}
        >
          Stacked
        </button>
      </div>
      <button
        className="staging-new-btn"
        onClick={() => setShowModal(true)}
        disabled={count === 0}
      >
        + New group{count > 0 ? ` (${count})` : ''}
      </button>
    </div>
  );
}
