import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Building2,
  Check,
  ChevronRight,
  Expand,
  Hand,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
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
import './scenes.css'
import './scenario.css'

const icons = {
  earthwork: Layers3,
  uav: ScanLine,
  'offshore-wind': Wind,
  'water-twin': Waves,
  campus: Building2,
}
const defaultMode = (kind: SceneKind): SceneOptions['mode'] =>
  kind === 'earthwork' || kind === 'water-twin' ? 'analysis' : 'overview'
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
  paused,
  onPausedChange,
}: {
  kind: SceneKind
  paused: boolean
  onPausedChange: (value: boolean) => void
}) {
  const { t } = usePreferences()
  const reduced = useMotionPreference()
  const definition = sceneDefinitions[kind]
  const [value, setValue] = useState<number>(definition.initial)
  const [mode, setMode] = useState<SceneOptions['mode']>(defaultMode(kind))
  const [progress, setProgress] = useState(0)
  const [autoProcess, setAutoProcess] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reviewedIds, setReviewedIds] = useState<string[]>([])
  const [showBuildings, setShowBuildings] = useState(true)
  const [showRoads, setShowRoads] = useState(true)
  const [showGreenery, setShowGreenery] = useState(true)
  const [xray, setXray] = useState(false)
  const [resetVersion, setResetVersion] = useState(0)
  const [snapshot, setSnapshot] = useState<SceneSnapshot>(emptySnapshot)
  const [status, setStatus] = useState<'waiting' | 'loading' | 'ready' | 'error'>('waiting')
  const [attempt, setAttempt] = useState(0)
  const [filter, setFilter] = useState('all')
  const host = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const inView = useRef(false)
  const controller = useRef<SceneController | null>(null)
  const progressRef = useRef(0)
  const options = useRef<SceneOptions>({
    value,
    paused,
    interactive,
    mode,
    progress,
    showOriginal,
    selectedId,
    reviewedIds,
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
    showBuildings,
    showRoads,
    showGreenery,
    xray,
    resetVersion,
  ])
  useEffect(() => {
    if (!selectedId) return
    controller.current?.select(selectedId)
    const sidebar = panel.current
    const details = sidebar?.querySelector<HTMLElement>('.scene-object-detail')
    if (sidebar && details && sidebar.scrollHeight > sidebar.clientHeight + 2) {
      sidebar.scrollTo({
        top:
          sidebar.scrollTop + details.getBoundingClientRect().top - sidebar.getBoundingClientRect().top - 20,
        behavior: reduced ? 'instant' : 'smooth',
      })
    }
  }, [selectedId, reduced])
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
              if (!cancelled) setSnapshot(result)
            },
            (id) => {
              if (!cancelled) {
                setSelectedId(id)
                onPausedChange(true)
              }
            },
          )
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
    setSelectedId(id)
    onPausedChange(true)
    if (id === selectedId) controller.current?.select(id)
  }
  const reset = () => {
    setValue(definition.initial)
    setProgress(0)
    setMode(defaultMode(kind))
    setAutoProcess(false)
    setSelectedId(null)
    setReviewedIds([])
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
      }
    } else {
      if (progress >= 100) setProgress(0)
      setAutoProcess(true)
    }
    onPausedChange(false)
  }

  return (
    <div className="scene-lab-body" data-status={status} data-scene={kind}>
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
      <aside
        ref={panel}
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
        {(kind === 'earthwork' || kind === 'water-twin') && (
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
                autoProcess && !paused ? '暂停过程' : kind === 'earthwork' ? '播放施工过程' : '播放水位推演',
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
              disabled={!ready || progress >= 100}
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
          <section className="scene-object-detail" aria-label={t('选中对象详情')}>
            <h5>{t(selected.title)}</h5>
            <dl>
              {selected.details.map((detail) => (
                <div key={detail.label}>
                  <dt>{t(detail.label)}</dt>
                  <dd>{t(detail.value)}</dd>
                </div>
              ))}
            </dl>
            {kind === 'uav' && selected.status === 'pending' && (
              <button
                type="button"
                className="scenario-primary"
                onClick={() => setReviewedIds((current) => [...new Set([...current, selected.id])])}
              >
                <Check size={14} />
                {t('标记已复核')}
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
        <div className="simulation-controls">
          <button
            type="button"
            onClick={() => onPausedChange(!paused)}
            disabled={!ready || reduced}
            aria-pressed={paused}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
            {t(paused ? '播放动画' : '暂停动画')}
          </button>
          <button
            type="button"
            onClick={() => setInteractive(!interactive)}
            disabled={!ready}
            aria-pressed={interactive}
          >
            <Hand size={15} />
            {t(interactive ? '退出拖动' : '拖动视角')}
          </button>
        </div>
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
  const [paused, setPaused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => {
    if (!expanded || !dialog.current) return
    const node = dialog.current
    const opener = document.activeElement as HTMLElement | null
    node.close()
    node.showModal()
    document.body.classList.add('scene-expanded')
    closeButton.current?.focus()
    return () => {
      node.close()
      node.show()
      document.body.classList.remove('scene-expanded')
      opener?.focus({ preventScroll: true })
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
      <SceneViewport key={selected} kind={selected} paused={paused || reduced} onPausedChange={setPaused} />
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
