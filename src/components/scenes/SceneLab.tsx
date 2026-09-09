import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Expand,
  Hand,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  SlidersHorizontal,
  Waves,
  Wind,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { usePreferences } from '../../preferences/context'
import { useMotionPreference } from '../../hooks/useMotionPreference'
import { sceneDefinitions, type SceneKind } from './sceneData'
import type { SceneController } from './sceneEngine'
import type { SceneOptions, SceneSnapshot } from './sceneTypes'
import { createSceneSession, defaultMode, type SceneSession } from './sceneSession'
import './scenes.css'
import './scenario.css'

const icons = {
  earthwork: Layers3,
  uav: ScanLine,
  'offshore-wind': Wind,
  'water-twin': Waves,
  campus: Building2,
}
const emptySnapshot: SceneSnapshot = { metrics: [], objects: [] }
const statusLabels = {
  normal: '可查看',
  undiscovered: '未检查',
  pending: '待复核',
  reviewed: '已复核',
  affected: '受影响',
}

function SceneViewport({
  kind,
  initialSession,
  onSessionChange,
}: {
  kind: SceneKind
  initialSession: SceneSession
  onSessionChange: (kind: SceneKind, session: SceneSession) => void
}) {
  const { t } = usePreferences()
  const reduced = useMotionPreference()
  const definition = sceneDefinitions[kind]
  const [userPaused, onPausedChange] = useState(initialSession.paused)
  const paused = userPaused || reduced
  const [value, setValue] = useState(initialSession.value)
  const [mode, setMode] = useState(initialSession.mode)
  const [progress, setProgress] = useState(initialSession.progress)
  const [autoProcess, setAutoProcess] = useState(initialSession.autoProcess)
  const [interactive, setInteractive] = useState(initialSession.interactive)
  const [showOriginal, setShowOriginal] = useState(initialSession.showOriginal)
  const [selectedId, setSelectedId] = useState(initialSession.selectedId)
  const [reviewedIds, setReviewedIds] = useState(initialSession.reviewedIds)
  const [discoveredIds, setDiscoveredIds] = useState(initialSession.discoveredIds)
  const [showBuildings, setShowBuildings] = useState(initialSession.showBuildings)
  const [showRoads, setShowRoads] = useState(initialSession.showRoads)
  const [showGreenery, setShowGreenery] = useState(initialSession.showGreenery)
  const [xray, setXray] = useState(initialSession.xray)
  const [resetVersion, setResetVersion] = useState(initialSession.resetVersion)
  const [snapshot, setSnapshot] = useState<SceneSnapshot>(emptySnapshot)
  const [status, setStatus] = useState<'waiting' | 'loading' | 'ready' | 'error'>('waiting')
  const [attempt, setAttempt] = useState(0)
  const [filter, setFilter] = useState(initialSession.filter)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [selectionRequest, setSelectionRequest] = useState(0)
  const host = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const inView = useRef(false)
  const controller = useRef<SceneController | null>(null)
  const progressRef = useRef(initialSession.progress)
  const focusDetailsOnSelection = useRef(false)
  const options = useRef<SceneOptions>({
    value,
    paused,
    interactive,
    mode,
    progress,
    showOriginal,
    selectedId,
    reviewedIds,
    discoveredIds,
    showBuildings,
    showRoads,
    showGreenery,
    xray,
    resetVersion,
  })

  useEffect(() => {
    options.current = {
      value,
      paused,
      interactive,
      mode,
      progress,
      showOriginal,
      selectedId,
      reviewedIds,
      discoveredIds,
      showBuildings,
      showRoads,
      showGreenery,
      xray,
      resetVersion,
    }
    controller.current?.update(options.current)
    progressRef.current = progress
  }, [
    value,
    paused,
    interactive,
    mode,
    progress,
    showOriginal,
    selectedId,
    reviewedIds,
    discoveredIds,
    showBuildings,
    showRoads,
    showGreenery,
    xray,
    resetVersion,
  ])
  useEffect(() => {
    onSessionChange(kind, {
      value,
      paused: userPaused,
      interactive,
      mode,
      progress,
      autoProcess,
      filter,
      showOriginal,
      selectedId,
      reviewedIds,
      discoveredIds,
      showBuildings,
      showRoads,
      showGreenery,
      xray,
      resetVersion,
    })
  }, [
    kind,
    onSessionChange,
    value,
    userPaused,
    interactive,
    mode,
    progress,
    autoProcess,
    filter,
    showOriginal,
    selectedId,
    reviewedIds,
    discoveredIds,
    showBuildings,
    showRoads,
    showGreenery,
    xray,
    resetVersion,
  ])
  useEffect(() => {
    if (!selectedId || status !== 'ready') return
    controller.current?.select(selectedId)
    // Restoring a selection must not steal focus from the scene selector.
    if (!focusDetailsOnSelection.current) return
    focusDetailsOnSelection.current = false
    const sidebar = panel.current
    const details = sidebar?.querySelector<HTMLElement>('.scene-object-detail')
    details?.focus({ preventScroll: true })
    if (sidebar && details && sidebar.scrollHeight > sidebar.clientHeight + 2) {
      sidebar.scrollTo({
        top:
          sidebar.scrollTop + details.getBoundingClientRect().top - sidebar.getBoundingClientRect().top - 20,
        behavior: reduced ? 'instant' : 'smooth',
      })
    }
  }, [selectedId, reduced, status, selectionRequest])
  useEffect(() => {
    if (!autoProcess || paused || reduced || mode !== 'process') return
    const timer = window.setInterval(() => {
      if (!inView.current || document.hidden) return
      const next = Math.min(100, progressRef.current + 1)
      progressRef.current = next
      setProgress(next)
      if (next === 100) {
        setAutoProcess(false)
        onPausedChange(true)
      }
    }, 150)
    return () => clearInterval(timer)
  }, [autoProcess, paused, reduced, mode, onPausedChange])
  useEffect(() => {
    const element = host.current
    if (!element) return
    let cancelled = false,
      started = false
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting
      if (!entry.isIntersecting || started) return
      started = true
      setStatus('loading')
      import('./sceneEngine')
        .then(({ createScene }) => {
          if (cancelled) return
          controller.current = createScene(
            element,
            kind,
            options.current,
            () => {
              if (cancelled) return
              controller.current?.dispose()
              controller.current = null
              setStatus('error')
            },
            (result) => {
              if (cancelled) return
              setSnapshot(result)
              if (kind === 'uav') {
                // Coverage is an engine output, not a new manual-progress command.
                const found = result.objects
                  .filter((object) => object.status !== 'undiscovered')
                  .map((object) => object.id)
                setDiscoveredIds((current) => (current.join('|') === found.join('|') ? current : found))
              }
            },
            (id) => {
              if (!cancelled) {
                focusDetailsOnSelection.current = true
                setPanelCollapsed(false)
                setSelectionRequest((current) => current + 1)
                setSelectedId(id)
                onPausedChange(true)
              }
            },
          )
          // Restore module data before the selection effect tries to focus an object.
          controller.current.update(options.current)
          setStatus('ready')
        })
        .catch(() => {
          if (!cancelled) setStatus('error')
        })
    })
    observer.observe(element)
    return () => {
      cancelled = true
      observer.disconnect()
      controller.current?.dispose()
      controller.current = null
    }
  }, [kind, attempt, onPausedChange])

  const ready = status === 'ready'
  const selected = snapshot.objects.find((object) => object.id === selectedId)
  const visibleObjects = snapshot.objects.filter((object) => filter === 'all' || object.status === filter)
  const command = (action: Parameters<SceneController['camera']>[0]) => controller.current?.camera(action)
  const choose = (id: string) => {
    focusDetailsOnSelection.current = true
    setPanelCollapsed(false)
    setSelectionRequest((current) => current + 1)
    setSelectedId(id)
    onPausedChange(true)
  }
  const reset = () => {
    setValue(definition.initial)
    setProgress(0)
    setMode(defaultMode(kind))
    setAutoProcess(false)
    setSelectedId(null)
    setReviewedIds([])
    setDiscoveredIds([])
    setInteractive(false)
    setShowOriginal(false)
    setXray(false)
    setShowBuildings(true)
    setShowRoads(true)
    setShowGreenery(true)
    setFilter('all')
    setResetVersion((current) => current + 1)
    onPausedChange(true)
  }
  const parameterChanged =
    value !== definition.initial ||
    progress !== 0 ||
    reviewedIds.length > 0 ||
    discoveredIds.length > 0 ||
    interactive ||
    filter !== 'all' ||
    selectedId !== null ||
    showOriginal ||
    xray ||
    !showBuildings ||
    !showRoads ||
    !showGreenery ||
    mode !== defaultMode(kind)
  const start = () => {
    if (!inView.current) host.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setSelectedId(null)
    setMode('process')
    command('reset')
    if (kind === 'uav') {
      if ((snapshot.progress ?? 0) >= 100) {
        setResetVersion((current) => current + 1)
        setProgress(0)
        setReviewedIds([])
        setDiscoveredIds([])
      }
    } else {
      if (progress >= 100) setProgress(0)
      setAutoProcess(true)
    }
    onPausedChange(false)
  }

  return (
    <div
      className="scene-lab-body"
      data-status={status}
      data-scene={kind}
      data-panel-collapsed={panelCollapsed}
    >
      <div className="simulation-stage">
        <div
          ref={host}
          className={`simulation-canvas ${interactive ? 'is-interactive' : ''}`}
          aria-hidden="true"
        />
        <div className="simulation-hud" aria-hidden="true">
          <span>
            <i />
            {definition.code}
          </span>
          <span>{kind === 'campus' ? 'CONCEPT CAMPUS' : 'SCENARIO EXPLORER'}</span>
        </div>
        <div className="simulation-watermark">{t('概念场景 · 模拟数据')}</div>
        <div className="scene-stage-actions" role="group" aria-label={t('场景播放与拖动')}>
          <button
            type="button"
            onClick={() => onPausedChange(!paused)}
            disabled={!ready || reduced}
            aria-pressed={paused}
            aria-label={t(paused ? '播放动画' : '暂停动画')}
            title={t(paused ? '播放动画' : '暂停动画')}
          >
            {paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
          <button
            type="button"
            onClick={() => setInteractive(!interactive)}
            disabled={!ready}
            aria-pressed={interactive}
            aria-label={t(interactive ? '退出拖动' : '拖动视角')}
            title={t(interactive ? '退出拖动' : '拖动视角')}
          >
            <Hand size={17} />
          </button>
        </div>
        {status !== 'ready' && (
          <div className="simulation-fallback" role="status">
            <Box size={32} strokeWidth={1} />
            <strong>{t(status === 'error' ? '当前设备暂时无法显示三维场景' : '正在准备三维场景')}</strong>
            <p>
              {t(
                status === 'error'
                  ? '可继续浏览下方项目说明，或开启浏览器硬件加速后重试。'
                  : '模型由本地参数生成，无需加载外部地图服务。',
              )}
            </p>
            {status === 'error' && (
              <button type="button" onClick={() => setAttempt(attempt + 1)}>
                {t('重新加载')}
              </button>
            )}
          </div>
        )}
        {ready && (
          <div className="scene-event" role="status">
            <span className="status-dot" />
            {t(snapshot.message ?? '点选场景对象，查看详细信息。')}
          </div>
        )}
        <div className="scene-camera-tools" role="group" aria-label={t('三维视角控制')}>
          <button
            type="button"
            disabled={!ready}
            aria-label={t('向左旋转视角')}
            data-tooltip={t('向左旋转视角')}
            onClick={() => command('left')}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            disabled={!ready}
            aria-label={t('向右旋转视角')}
            data-tooltip={t('向右旋转视角')}
            onClick={() => command('right')}
          >
            <ArrowRight size={16} />
          </button>
          <span />
          <button
            type="button"
            disabled={!ready}
            aria-label={t('放大三维场景')}
            data-tooltip={t('放大三维场景')}
            onClick={() => command('in')}
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            disabled={!ready}
            aria-label={t('缩小三维场景')}
            data-tooltip={t('缩小三维场景')}
            onClick={() => command('out')}
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            disabled={!ready}
            aria-label={t('重置三维视角')}
            data-tooltip={t('重置三维视角')}
            onClick={() => {
              setSelectedId(null)
              command('reset')
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
        {selected && (
          <div className="scene-selection-label">
            <span>{t(selected.title)}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedId(null)
                command('reset')
              }}
              aria-label={t('返回场景全览')}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <div className={`scene-panel-shell${panelCollapsed ? ' is-collapsed' : ''}`}>
        <button
          type="button"
          className="scene-panel-toggle"
          aria-label={t(panelCollapsed ? '展开控制面板' : '收起控制面板')}
          aria-expanded={!panelCollapsed}
          aria-controls={`scene-panel-${kind}`}
          onClick={() => setPanelCollapsed(!panelCollapsed)}
        >
          <span>
            <SlidersHorizontal size={15} />
            {t('参数与对象')}
            <small>
              {value}
              {definition.unit}
            </small>
          </span>
          {panelCollapsed ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>
        <aside
          ref={panel}
          id={`scene-panel-${kind}`}
          className="simulation-panel"
          aria-label={t('{name}演示参数', { name: t(definition.name) })}
        >
          <p className="simulation-kicker">SCENE EXPLORER</p>
          <h4>{t(definition.title)}</h4>
          <p className="simulation-description">{t(definition.description)}</p>
          <div className="scenario-modes" role="group" aria-label={t('场景模式')}>
            {(['overview', 'analysis', 'process'] as const)
              .filter((item) => item !== 'process' || (kind !== 'campus' && kind !== 'offshore-wind'))
              .map((item) => (
                <button
                  type="button"
                  key={item}
                  disabled={!ready}
                  aria-pressed={mode === item}
                  onClick={() => {
                    setMode(item)
                    setAutoProcess(false)
                  }}
                >
                  {t(
                    item === 'overview'
                      ? '场景总览'
                      : item === 'analysis'
                        ? kind === 'uav'
                          ? '病害复核'
                          : '分析结果'
                        : kind === 'uav'
                          ? '巡检过程'
                          : '过程推演',
                  )}
                </button>
              ))}
          </div>
          {kind === 'earthwork' && (
            <p className="scene-mode-summary">
              <span>{t('当前显示')}</span>
              <strong>
                {t(mode === 'analysis' ? '设计完成面' : mode === 'overview' ? '原始地形' : '施工过程')}
              </strong>
            </p>
          )}
          <div className="simulation-parameter">
            <label htmlFor={`scene-value-${kind}`}>
              {t(definition.parameter)}
              <output>
                {value}
                <small>{definition.unit}</small>
              </output>
            </label>
            <input
              id={`scene-value-${kind}`}
              type="range"
              min={definition.min}
              max={definition.max}
              value={value}
              disabled={!ready}
              onChange={(event) => setValue(Number(event.target.value))}
              aria-valuetext={`${value}${definition.unit}`}
            />
            <div className="parameter-range">
              <span>
                {definition.min}
                {definition.unit}
              </span>
              <span>
                {definition.max}
                {definition.unit}
              </span>
            </div>
          </div>
          {kind === 'water-twin' && (
            <div className="scenario-presets" role="group" aria-label={t('水位情景')}>
              {[
                [8, '低水位'],
                [18, '高水位'],
                [28, '漫坝情景'],
              ].map(([level, label]) => (
                <button
                  type="button"
                  disabled={!ready}
                  key={level}
                  aria-pressed={value === level}
                  onClick={() => {
                    setValue(Number(level))
                    setMode('analysis')
                    setAutoProcess(false)
                  }}
                >
                  {t(String(label))}
                </button>
              ))}
            </div>
          )}
          {(kind === 'earthwork' || kind === 'water-twin') && mode === 'process' && (
            <div className="scenario-progress">
              <label htmlFor={`progress-${kind}`}>
                {t(kind === 'earthwork' ? '施工进度' : '水位推演进度')}
                <output>{progress}%</output>
              </label>
              <input
                id={`progress-${kind}`}
                type="range"
                min={0}
                max={100}
                value={progress}
                disabled={!ready}
                onChange={(event) => {
                  setProgress(Number(event.target.value))
                  setMode('process')
                  setAutoProcess(false)
                  onPausedChange(true)
                }}
              />
              <button
                type="button"
                className="scenario-primary"
                disabled={!ready || reduced}
                onClick={() => (autoProcess && !paused ? onPausedChange(true) : start())}
              >
                {autoProcess && !paused ? <Pause size={14} /> : <Play size={14} />}
                {t(
                  autoProcess && !paused
                    ? '暂停过程'
                    : kind === 'earthwork'
                      ? '播放施工过程'
                      : '播放水位推演',
                )}
              </button>
            </div>
          )}
          {kind === 'uav' && (
            <div className="inspection-actions">
              <div className="inspection-progress">
                <span>{t('巡检覆盖')}</span>
                <strong>{Math.round(snapshot.progress ?? 0)}%</strong>
              </div>
              <progress value={snapshot.progress ?? 0} max={100} aria-label={t('巡检覆盖')} />
              <button type="button" className="scenario-primary" disabled={!ready || reduced} onClick={start}>
                <Play size={14} />
                {t((snapshot.progress ?? 0) >= 100 ? '重新巡检' : '开始巡检')}
              </button>
              <button
                type="button"
                className="scenario-secondary"
                disabled={!ready || (snapshot.progress ?? 0) >= 100}
                onClick={() => {
                  setProgress(Math.min(100, Math.floor((snapshot.progress ?? progress) / 25) * 25 + 25))
                  onPausedChange(true)
                }}
              >
                <ChevronRight size={14} />
                {t('下一检查点')}
              </button>
            </div>
          )}
          {kind === 'earthwork' && (
            <label className="scenario-toggle">
              <input
                type="checkbox"
                disabled={!ready}
                checked={showOriginal}
                onChange={(event) => setShowOriginal(event.target.checked)}
              />
              {t('叠加原始地形')}
            </label>
          )}
          {kind === 'campus' && (
            <fieldset className="scenario-layers">
              <legend>{t('园区图层')}</legend>
              <label>
                <input
                  type="checkbox"
                  disabled={!ready}
                  checked={showBuildings}
                  onChange={(event) => {
                    setShowBuildings(event.target.checked)
                    if (!event.target.checked) setSelectedId(null)
                  }}
                />
                {t('建筑')}
              </label>
              <label>
                <input
                  type="checkbox"
                  disabled={!ready}
                  checked={showRoads}
                  onChange={(event) => setShowRoads(event.target.checked)}
                />
                {t('道路')}
              </label>
              <label>
                <input
                  type="checkbox"
                  disabled={!ready}
                  checked={showGreenery}
                  onChange={(event) => setShowGreenery(event.target.checked)}
                />
                {t('绿化')}
              </label>
              <label>
                <input
                  type="checkbox"
                  disabled={!ready || !showBuildings}
                  checked={xray}
                  onChange={(event) => setXray(event.target.checked)}
                />
                {t('楼层剖切')}
              </label>
            </fieldset>
          )}
          <div className="scene-metrics" aria-label={t('场景分析指标')}>
            {snapshot.metrics.map((metric) => (
              <div key={metric.label}>
                <span>{t(metric.label)}</span>
                <strong>
                  {typeof metric.value === 'number'
                    ? metric.value.toLocaleString('en-US', { maximumFractionDigits: 1 })
                    : t(metric.value)}
                  <small>{metric.unit ? t(metric.unit) : ''}</small>
                </strong>
              </div>
            ))}
          </div>
          {snapshot.objects.length > 0 && (
            <div className="scene-object-section">
              <div className="scene-object-heading">
                <h5>{t(kind === 'uav' ? '检查记录' : kind === 'campus' ? '建筑目录' : '分析对象')}</h5>
                <span>{snapshot.objects.length}</span>
              </div>
              {kind === 'uav' && (
                <div className="object-filters" role="group" aria-label={t('病害状态筛选')}>
                  {['all', 'pending', 'reviewed'].map((item) => (
                    <button
                      type="button"
                      key={item}
                      aria-pressed={filter === item}
                      onClick={() => setFilter(item)}
                    >
                      {t(item === 'all' ? '全部' : statusLabels[item as keyof typeof statusLabels])}
                    </button>
                  ))}
                </div>
              )}
              <div className="scene-object-list">
                {visibleObjects.map((object) => (
                  <button
                    type="button"
                    key={object.id}
                    data-object-id={object.id}
                    className={`scene-object is-${object.status}`}
                    aria-pressed={object.id === selectedId}
                    disabled={
                      !ready || object.status === 'undiscovered' || (kind === 'campus' && !showBuildings)
                    }
                    onClick={() => choose(object.id)}
                  >
                    <span>
                      <strong>{t(object.title)}</strong>
                      <small>{t(object.subtitle)}</small>
                    </span>
                    <em>{t(statusLabels[object.status])}</em>
                  </button>
                ))}
              </div>
              {visibleObjects.length === 0 && <p className="scene-empty">{t('当前筛选下没有记录。')}</p>}
            </div>
          )}
          {selected && (
            <section className="scene-object-detail" aria-label={t('选中对象详情')} tabIndex={-1}>
              <h5>{t(selected.title)}</h5>
              <dl>
                {selected.details.map((detail) => (
                  <div key={detail.label}>
                    <dt>{t(detail.label)}</dt>
                    <dd>{t(detail.value)}</dd>
                  </div>
                ))}
              </dl>
              {kind === 'uav' && (selected.status === 'pending' || selected.status === 'reviewed') && (
                <button
                  type="button"
                  className="scenario-primary"
                  aria-disabled={selected.status === 'reviewed'}
                  onClick={() => {
                    if (selected.status === 'pending')
                      setReviewedIds((current) => [...new Set([...current, selected.id])])
                  }}
                >
                  <Check size={14} />
                  {t(selected.status === 'reviewed' ? '已复核' : '标记已复核')}
                </button>
              )}
            </section>
          )}
          <button
            type="button"
            className="parameter-reset"
            disabled={!ready || !parameterChanged}
            onClick={reset}
          >
            <RotateCcw size={13} />
            {t('恢复默认参数')}
          </button>
          <p className="simulation-hint">
            {t(
              reduced
                ? '已按系统设置减少动态效果，可用滑块和单步操作查看结果。'
                : interactive
                  ? '在场景内拖动旋转。退出拖动后，可正常滑动页面。'
                  : '点选模型或列表可定位；开启拖动后可自由观察。',
            )}
          </p>
          <ul className="simulation-legend">
            {definition.legend.map((label) => (
              <li key={label}>
                <i
                  className={`legend-${label.startsWith('珊瑚') ? 'red' : label.startsWith('琥珀') ? 'amber' : label.startsWith('白色') ? 'white' : label.includes('蓝') ? 'blue' : 'mint'}`}
                />
                {t(label)}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}

export function SceneLab({
  selected,
  onSelect,
}: {
  selected: SceneKind
  onSelect: (kind: SceneKind) => void
}) {
  const { t } = usePreferences()
  const reduced = useMotionPreference()
  const [expanded, setExpanded] = useState(false)
  const sessions = useRef<Partial<Record<SceneKind, SceneSession>>>({})
  const saveSession = useCallback((kind: SceneKind, session: SceneSession) => {
    sessions.current[kind] = session
  }, [])
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => {
    if (!expanded || !dialog.current) return
    const node = dialog.current
    const expandButton = closeButton.current
    const opener = document.activeElement as HTMLElement | null
    node.close()
    node.showModal()
    document.body.classList.add('scene-expanded')
    expandButton?.focus()
    return () => {
      node.close()
      node.show()
      document.body.classList.remove('scene-expanded')
      opener?.focus({ preventScroll: true })
      // The inline dialog's show() may refocus its last active control after layout.
      requestAnimationFrame(() => {
        if (node.isConnected && !node.matches(':modal')) expandButton?.focus({ preventScroll: true })
      })
    }
  }, [expanded])
  return (
    <dialog
      ref={dialog}
      open
      className={`scene-lab${expanded ? ' is-expanded' : ''}`}
      id="scene-lab"
      tabIndex={-1}
      role={expanded ? 'dialog' : 'region'}
      aria-modal={expanded || undefined}
      aria-labelledby="scene-lab-title"
      onCancel={(event) => {
        if (expanded) {
          event.preventDefault()
          setExpanded(false)
        }
      }}
    >
      <div className="scene-lab-heading">
        <div>
          <span className="lab-icon">
            <Layers3 size={20} />
          </span>
          <div>
            <p>INTERACTIVE SPATIAL LAB</p>
            <h3 id="scene-lab-title">{t('空间实验室')}</h3>
          </div>
        </div>
        <div className="scene-heading-actions">
          <span className="simulation-badge">{t('模拟演示 / 非项目实景')}</span>
          <button
            ref={closeButton}
            type="button"
            className="scene-expand"
            onClick={() => setExpanded(!expanded)}
            aria-label={t(expanded ? '收起场景' : '展开场景')}
          >
            {expanded ? <X size={16} /> : <Expand size={16} />}
            <span>{t(expanded ? '收起' : '展开体验')}</span>
          </button>
        </div>
      </div>
      <div className="scene-selector" role="group" aria-label={t('选择模拟三维场景')}>
        {(Object.keys(sceneDefinitions) as SceneKind[]).map((kind, index) => {
          const Icon = icons[kind]
          return (
            <button key={kind} type="button" aria-pressed={selected === kind} onClick={() => onSelect(kind)}>
              {selected === kind && (
                <motion.span
                  className="scene-indicator"
                  layoutId="scene-indicator"
                  transition={{ duration: reduced ? 0 : 0.24 }}
                  aria-hidden="true"
                />
              )}
              <Icon size={17} aria-hidden="true" />
              <span>{t(sceneDefinitions[kind].name)}</span>
              <small>0{index + 1}</small>
            </button>
          )
        })}
      </div>
      <SceneViewport
        key={selected}
        kind={selected}
        initialSession={sessions.current[selected] ?? createSceneSession(selected)}
        onSessionChange={saveSession}
      />
      <div className="scene-lab-note">
        <span>LOCAL DATA / INTERACTIVE</span>
        <p>
          {t(
            selected === 'campus'
              ? '园区为本地概念模型，展示超图相关业务交互思路，未接入实景模型或 SuperMap 服务。'
              : selected === 'water-twin'
                ? '静态水位与栅格连通性演示，不计算降雨、流速或洪水到达时间。'
                : selected === 'earthwork'
                  ? '采用合成地形和预设施工范围；方量为网格近似值，不用于工程计量。'
                  : selected === 'uav'
                    ? '病害与检查任务为预设示例，展示发现及复核流程，未接入图像识别模型。'
                    : '所有模型、路线和参数均为本地合成，仅展示三维交互能力，不对应真实项目数据或运行状态。',
          )}
        </p>
      </div>
    </dialog>
  )
}
