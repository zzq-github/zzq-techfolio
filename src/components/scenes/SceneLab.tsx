import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Expand,
  Hand,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Waves,
  Wind,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { sceneDefinitions, type SceneKind } from './sceneData'
import type { SceneController, SceneOptions } from './sceneEngine'
import './scenes.css'

const icons = { earthwork: Layers3, uav: ScanLine, 'offshore-wind': Wind, 'water-twin': Waves }

function SceneViewport({ kind, paused, onPause }: { kind: SceneKind; paused: boolean; onPause: () => void }) {
  const definition = sceneDefinitions[kind]
  const [value, setValue] = useState<number>(definition.initial)
  const [interactive, setInteractive] = useState(false)
  const [status, setStatus] = useState<'waiting' | 'loading' | 'ready' | 'error'>('waiting')
  const [attempt, setAttempt] = useState(0)
  const host = useRef<HTMLDivElement>(null)
  const controller = useRef<SceneController | null>(null)
  const options = useRef<SceneOptions>({ value, paused, interactive })
  useEffect(() => {
    options.current = { value, paused, interactive }
    controller.current?.update(options.current)
  }, [value, paused, interactive])
  useEffect(() => {
    const element = host.current
    if (!element) return
    let cancelled = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setStatus('loading')
        import('./sceneEngine')
          .then(({ createScene }) => {
            if (cancelled) return
            controller.current = createScene(element, kind, options.current, () => {
              controller.current?.dispose()
              controller.current = null
              setStatus('error')
            })
            setStatus('ready')
          })
          .catch(() => {
            if (!cancelled) setStatus('error')
          })
      },
      { rootMargin: '200px' },
    )
    observer.observe(element)
    return () => {
      cancelled = true
      observer.disconnect()
      controller.current?.dispose()
      controller.current = null
    }
  }, [kind, attempt])
  const command = (action: Parameters<SceneController['camera']>[0]) => controller.current?.camera(action)
  return (
    <div className="scene-lab-body">
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
          <span>LOCAL SPACE / 3D</span>
        </div>
        <div className="simulation-watermark">概念场景 · 模拟数据</div>
        {status !== 'ready' && (
          <div className="simulation-fallback" role="status">
            <Box size={32} strokeWidth={1} />
            <strong>{status === 'error' ? '当前设备暂时无法显示三维场景' : '正在准备三维场景'}</strong>
            <p>
              {status === 'error'
                ? '可继续浏览下方项目说明，或开启浏览器硬件加速后重试。'
                : '模型由本地参数生成，无需加载外部地图服务。'}
            </p>
            {status === 'error' && (
              <button type="button" onClick={() => setAttempt(attempt + 1)}>
                重新加载
              </button>
            )}
          </div>
        )}
        <div className="scene-camera-tools" role="group" aria-label="三维视角控制">
          <button
            type="button"
            disabled={status !== 'ready'}
            aria-label="向左旋转视角"
            onClick={() => command('left')}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            disabled={status !== 'ready'}
            aria-label="向右旋转视角"
            onClick={() => command('right')}
          >
            <ArrowRight size={16} />
          </button>
          <span />
          <button
            type="button"
            disabled={status !== 'ready'}
            aria-label="放大三维场景"
            onClick={() => command('in')}
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            disabled={status !== 'ready'}
            aria-label="缩小三维场景"
            onClick={() => command('out')}
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            disabled={status !== 'ready'}
            aria-label="重置三维视角"
            onClick={() => command('reset')}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
      <aside className="simulation-panel" aria-label={`${definition.name}演示参数`}>
        <p className="simulation-kicker">SCENE EXPLORER</p>
        <h4>{definition.title}</h4>
        <p className="simulation-description">{definition.description}</p>
        <div className="simulation-parameter">
          <label htmlFor={`scene-value-${kind}`}>
            {definition.parameter}
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
            disabled={status !== 'ready'}
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
        <div className="simulation-controls">
          <button type="button" onClick={onPause} disabled={status !== 'ready'} aria-pressed={paused}>
            {paused ? <Play size={15} /> : <Pause size={15} />} {paused ? '播放动画' : '暂停动画'}
          </button>
          <button
            type="button"
            onClick={() => setInteractive(!interactive)}
            disabled={status !== 'ready'}
            aria-pressed={interactive}
          >
            <Hand size={15} />
            {interactive ? '退出拖动' : '拖动视角'}
          </button>
        </div>
        <p className="simulation-hint">
          {interactive
            ? '在场景内拖动旋转。退出拖动后，可正常滑动页面。'
            : '点击「拖动视角」自由观察，或使用画面下方按钮。'}
        </p>
        <ul className="simulation-legend">
          {definition.legend.map((label) => (
            <li key={label}>
              <i
                className={`legend-${label.startsWith('琥珀') ? 'amber' : label.startsWith('白色') ? 'white' : label.startsWith('蓝色') ? 'blue' : 'mint'}`}
              />
              {label}
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
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => {
      if (preference.matches) setPaused(true)
    }
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])
  return (
    <div className="scene-lab" id="scene-lab" tabIndex={-1} aria-labelledby="scene-lab-title">
      <div className="scene-lab-heading">
        <div>
          <span className="lab-icon">
            <Expand size={20} />
          </span>
          <div>
            <p>INTERACTIVE SPATIAL LAB</p>
            <h3 id="scene-lab-title">空间实验室</h3>
          </div>
        </div>
        <span className="simulation-badge">模拟演示 / 非项目实景</span>
      </div>
      <div className="scene-selector" role="group" aria-label="选择模拟三维场景">
        {(Object.keys(sceneDefinitions) as SceneKind[]).map((kind) => {
          const Icon = icons[kind]
          return (
            <button key={kind} type="button" aria-pressed={selected === kind} onClick={() => onSelect(kind)}>
              <Icon size={17} />
              <span>{sceneDefinitions[kind].name}</span>
              <small>0{Object.keys(sceneDefinitions).indexOf(kind) + 1}</small>
            </button>
          )
        })}
      </div>
      <SceneViewport key={selected} kind={selected} paused={paused} onPause={() => setPaused(!paused)} />
      <div className="scene-lab-note">
        <span>PROCEDURAL / WEBGL</span>
        <p>所有模型、路线和参数均为本地合成，仅展示三维交互能力，不对应真实项目数据或运行状态。</p>
      </div>
    </div>
  )
}
