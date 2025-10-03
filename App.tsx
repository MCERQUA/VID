
import React from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import CenterPanel from './components/CenterPanel';
import RightSidebar from './components/RightSidebar';
import Timeline from './components/Timeline';

const MIN_PANEL_WIDTH = 220;
const MAX_PANEL_WIDTH = 420;
const MIN_CENTER_WIDTH = 480;

type MobilePanelToggleProps = {
  side: 'left' | 'right';
  isOpen: boolean;
  onToggle: () => void;
};

const MobilePanelToggle: React.FC<MobilePanelToggleProps> = ({ side, isOpen, onToggle }) => {
  const isLeft = side === 'left';
  const label = `${isOpen ? 'Hide' : 'Show'} ${isLeft ? 'assets' : 'properties'} panel`;
  const rotateClass = isLeft ? (isOpen ? 'rotate-180' : '') : isOpen ? '' : 'rotate-180';
  const edgeRounding = isLeft ? 'rounded-r-lg' : 'rounded-l-lg';
  const offsetStyle: React.CSSProperties = isLeft
    ? {
        left: isOpen ? 'calc(min(18rem, 85vw) + 0.5rem)' : '0.75rem',
      }
    : {
        right: isOpen ? 'calc(min(20rem, 85vw) + 0.5rem)' : '0.75rem',
      };

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      className={`fixed top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-9 h-16 bg-black/60 border border-white/10 text-white backdrop-blur ${edgeRounding} shadow-lg transition-colors hover:bg-black/70`}
      style={offsetStyle}
    >
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${rotateClass}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

const App: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [leftPanelWidth, setLeftPanelWidth] = React.useState(300);
  const [rightPanelWidth, setRightPanelWidth] = React.useState(320);
  const [draggingPanel, setDraggingPanel] = React.useState<'left' | 'right' | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [leftOpen, setLeftOpen] = React.useState(true);
  const [rightOpen, setRightOpen] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const node = containerRef.current;
    const updateIsMobile = (width: number) => {
      const next = width < 1024;
      setIsMobile((prev) => (prev === next ? prev : next));
    };

    const fallbackResizeHandler = () => updateIsMobile(window.innerWidth);

    if (node) {
      const rectWidth = node.getBoundingClientRect().width || window.innerWidth;
      updateIsMobile(Math.min(rectWidth, window.innerWidth));
    } else {
      updateIsMobile(window.innerWidth);
    }
    window.addEventListener('resize', fallbackResizeHandler);

    let resizeObserver: ResizeObserver | null = null;
    if (node && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect?.width ?? node.getBoundingClientRect().width;
          updateIsMobile(Math.min(width, window.innerWidth));
        }
      });
      resizeObserver.observe(node);
    }

    return () => {
      window.removeEventListener('resize', fallbackResizeHandler);
      resizeObserver?.disconnect();
    };
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      setLeftOpen(false);
      setRightOpen(false);
    } else {
      setLeftOpen(true);
      setRightOpen(true);
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingPanel || isMobile) {
        return;
      }

      if (draggingPanel === 'left') {
        const rawWidth = event.clientX;
        const maxAllowed = window.innerWidth - (rightOpen ? rightPanelWidth : 0) - MIN_CENTER_WIDTH;
        const constrainedMax = Math.max(MIN_PANEL_WIDTH, maxAllowed);
        const clamped = Math.min(
          MAX_PANEL_WIDTH,
          Math.max(MIN_PANEL_WIDTH, Math.min(rawWidth, constrainedMax)),
        );
        setLeftPanelWidth(clamped);
      } else if (draggingPanel === 'right') {
        const rawWidth = window.innerWidth - event.clientX;
        const maxAllowed = window.innerWidth - (leftOpen ? leftPanelWidth : 0) - MIN_CENTER_WIDTH;
        const constrainedMax = Math.max(MIN_PANEL_WIDTH, maxAllowed);
        const clamped = Math.min(
          MAX_PANEL_WIDTH,
          Math.max(MIN_PANEL_WIDTH, Math.min(rawWidth, constrainedMax)),
        );
        setRightPanelWidth(clamped);
      }
    };

    const stopDragging = () => {
      setDraggingPanel(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
    };
  }, [draggingPanel, isMobile, leftOpen, leftPanelWidth, rightOpen, rightPanelWidth]);

  const handleToggleLeft = React.useCallback(() => {
    setLeftOpen((prev) => {
      const next = !prev;
      if (isMobile && next) {
        setRightOpen(false);
      }
      return next;
    });
  }, [isMobile]);

  const handleToggleRight = React.useCallback(() => {
    setRightOpen((prev) => {
      const next = !prev;
      if (isMobile && next) {
        setLeftOpen(false);
      }
      return next;
    });
  }, [isMobile]);

  const startDragging = React.useCallback((panel: 'left' | 'right') => (event: React.PointerEvent) => {
    if (isMobile) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setDraggingPanel(panel);
  }, [isMobile]);

  const closePanels = React.useCallback(() => {
    setLeftOpen(false);
    setRightOpen(false);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden">
      <Header
        isMobile={isMobile}
        onToggleLeft={handleToggleLeft}
        onToggleRight={handleToggleRight}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
      />
      <div className="flex flex-1 min-h-0 relative">
        {!isMobile && leftOpen && (
          <div className="h-full flex-shrink-0" style={{ width: leftPanelWidth }}>
            <LeftSidebar />
          </div>
        )}
        {!isMobile && leftOpen && (
          <div
            className="w-1 cursor-col-resize flex-shrink-0 relative group"
            onPointerDown={startDragging('left')}
          >
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-700 group-hover:bg-blue-400 transition-colors" />
          </div>
        )}

        <CenterPanel />

        {!isMobile && rightOpen && (
          <div
            className="w-1 cursor-col-resize flex-shrink-0 relative group"
            onPointerDown={startDragging('right')}
          >
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-700 group-hover:bg-blue-400 transition-colors" />
          </div>
        )}
        {!isMobile && rightOpen && (
          <div className="h-full flex-shrink-0" style={{ width: rightPanelWidth }}>
            <RightSidebar />
          </div>
        )}

        {isMobile && leftOpen && (
          <LeftSidebar isMobile onClose={() => setLeftOpen(false)} className="lg:hidden" />
        )}
        {isMobile && rightOpen && (
          <RightSidebar isMobile onClose={() => setRightOpen(false)} className="lg:hidden" />
        )}
        {isMobile && (
          <>
            <MobilePanelToggle side="left" isOpen={leftOpen} onToggle={handleToggleLeft} />
            <MobilePanelToggle side="right" isOpen={rightOpen} onToggle={handleToggleRight} />
          </>
        )}
        {isMobile && (leftOpen || rightOpen) && (
          <button
            type="button"
            aria-label="Close panels"
            className="fixed inset-x-0 top-14 bottom-0 bg-black/40 z-30"
            onClick={closePanels}
          />
        )}
      </div>
      <Timeline />
    </div>
  );
};

export default App;
