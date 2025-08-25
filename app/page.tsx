"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Brain, Database, TrendingUp, Shuffle, CoffeeIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

interface FlowchartNode {
  id: string
  label: string
  description: string
  x: number
  y: number
  width: number
  height: number
  type: "process" | "decision" | "data" | "terminal"
  isActive: boolean
  icon?: React.ReactNode
}

interface Connection {
  from: string
  to: string
  label?: string
  condition?: "true" | "false"
  isActive: boolean
}


export default function MLPipelineVisualization() {
  const { t, i18n } = useTranslation()

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === "en" ? "es" : "en")
  }
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [randomValue, setRandomValue] = useState(0.5)
  const [epsilonValue] = useState(0.4)
  const [isExploring, setIsExploring] = useState(false)
  const [iterationCount, setIterationCount] = useState(1)
  const [isWarmup, setIsWarmup] = useState(true)

  const BASE_W = 900
  const BASE_H = 1200

  // example nodes (you can add the rest back in the same style)
  const nodes: FlowchartNode[] = [
    {
      id: "database",
      label: t("nodes.database.label"),
      description: t("nodes.database.description"),
      x: 350,
      y: 0,
      width: 200,
      height: 60,
      type: "data",
      isActive: currentStep >= 0,
      icon: <Database className="w-5 h-5" />,
    },
    {
      id: "warmup-note",
      label: isWarmup
        ? t("nodes.warmup-note.warmupLabel")
        : t("nodes.warmup-note.activeLabel"),
      description: isWarmup
        ? t("nodes.warmup-note.warmupDesc")
        : t("nodes.warmup-note.activeDesc"),
      x: 340,
      y: 140,
      width: 220,
      height: 50,
      type: "process",
      isActive: currentStep >= 1,
      icon: <CoffeeIcon className="h-9" />,
    },
    {
      id: "decision",
      label: `${t("nodes.decision.label")}: random(${randomValue.toFixed(
        3
      )}) < epsilon? ${randomValue < epsilonValue}`,
      description: `${t("nodes.decision.description")}: Random value ${randomValue.toFixed(
        3
      )} ${
        randomValue < epsilonValue ? "is less than" : "is greater than or equal to"
      } epsilon (${epsilonValue})`,
      x: 370,
      y: 240,
      width: 160,
      height: 80,
      type: "decision",
      isActive: currentStep >= 2,
    },
    {
      id: "introspector",
      label: t("nodes.introspector.label"),
      description: t("nodes.introspector.description"),
      x: 150,
      y: 380,
      width: 180,
      height: 70,
      type: "process",
      isActive: currentStep >= 3 && !isExploring,
      icon: <Brain className="h-9" />,
    },
    {
      id: "random-picker",
      label: t("nodes.random-picker.label"),
      description: t("nodes.random-picker.description"),
      x: 570,
      y: 380,
      width: 180,
      height: 70,
      type: "process",
      isActive: currentStep >= 3 && isExploring,
      icon: <Shuffle className="w-5 h-5" />,
    },
    {
      id: "selected-vars",
      label: t("nodes.selected-vars.label"),
      description: t("nodes.selected-vars.description"),
      x: 350,
      y: 500,
      width: 160,
      height: 50,
      type: "data",
      isActive: currentStep >= 4,
      icon: <Database className="h-6" />,
    },
    {
      id: "embedder",
      label: t("nodes.embedder.label"),
      description: t("nodes.embedder.description"),
      x: 150,
      y: 600,
      width: 180,
      height: 80,
      type: "process",
      isActive: currentStep >= 5,
      icon: <Brain className="h-9" />,
    },
    {
      id: "forecasting",
      label: t("nodes.forecasting.label"),
      description: t("nodes.forecasting.description"),
      x: 570,
      y: 600,
      width: 180,
      height: 80,
      type: "process",
      isActive: currentStep >= 6,
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: "history",
      label: t("nodes.history.label"),
      description: t("nodes.history.description"),
      x: 320,
      y: 740,
      width: 220,
      height: 60,
      type: "data",
      isActive: currentStep >= 7,
      icon: <Database className="w-5 h-5" />,
    },
    {
      id: "iteration-check",
      label: t("nodes.iteration-check.label"),
      description: t("nodes.iteration-check.description"),
      x: 370,
      y: 860,
      width: 120,
      height: 80,
      type: "decision",
      isActive: currentStep >= 8,
    },
    {
      id: "update",
      label: t("nodes.update.label"),
      description: t("nodes.update.description"),
      x: 310,
      y: 1000,
      width: 240,
      height: 80,
      type: "process",
      isActive: currentStep >= 9,
      icon: <Brain className="w-5 h-5" />,
    },
  ]


  const connections: Connection[] = [
    { from: "database", to: "warmup-note", isActive: currentStep >= 1 },
    { from: "warmup-note", to: "decision", isActive: currentStep >= 2 },
    {
      from: "decision",
      to: "introspector",
      condition: "false",
      label: t("connections.false"),
      isActive: currentStep >= 3 && !isExploring,
    },
    {
      from: "decision",
      to: "random-picker",
      condition: "true",
      label: t("connections.true"),
      isActive: currentStep >= 3 && isExploring,
    },
    { from: "introspector", to: "selected-vars", isActive: currentStep >= 4 && !isExploring },
    { from: "random-picker", to: "selected-vars", isActive: currentStep >= 4 && isExploring },
    { from: "selected-vars", to: "embedder", isActive: currentStep >= 5 },
    { from: "selected-vars", to: "forecasting", isActive: currentStep >= 6 },
    { from: "embedder", to: "history", label: "Embeddings", isActive: currentStep >= 7 },
    { from: "forecasting", to: "history", label: "Forecast Loss", isActive: currentStep >= 7 },
    { from: "history", to: "iteration-check", isActive: currentStep >= 8 },
    {
      from: "iteration-check",
      to: "update",
      condition: "true",
      label: t("connections.true"),
      isActive: currentStep >= 9,
    },
    {
      from: "iteration-check",
      to: "warmup-note",
      condition: "false",
      label: t("connections.false"),
      isActive: currentStep >= 8 && currentStep < 9,
    },
    {
      from: "update",
      to: "warmup-note",
      label: t("connections.meta_update"),
      isActive: currentStep >= 9,
    },
  ]


  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentStep < 10) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = prev + 1
          if (nextStep === 2) {
            const newRandom = Math.random()
            setRandomValue(newRandom)
            setIsExploring(newRandom < epsilonValue)
          }
          if (nextStep === 8) {
            setIterationCount((prev) => prev + 1)
            if (iterationCount > 3) {
              setIsWarmup(false)
            }
          }
          return nextStep
        })
      }, 2500)
    } else if (currentStep >= 10) {
      setIsPlaying(false)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentStep, epsilonValue, iterationCount])

  const handlePlay = () => {
    if (currentStep >= 10) {
      setCurrentStep(0)
      setIterationCount(1)
      setIsWarmup(true)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setRandomValue(0.5)
    setIsExploring(false)
    setIterationCount(1)
    setIsWarmup(true)
  }

  const getNodeColor = (node: FlowchartNode) => {
    if (!node.isActive) return "bg-muted/50 text-muted-foreground border-muted"
    if (selectedNode === node.id)
      return "bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/25 animate-pulse"

    switch (node.type) {
      case "data":
        return "bg-amber-100 text-amber-900 border-amber-300 shadow-md"
      case "decision":
        return `${isExploring ? "bg-green-100 text-green-900 border-green-400" : "bg-blue-100 text-blue-900 border-blue-400"} shadow-md`
      case "process":
        return "bg-red-100 text-red-900 border-red-300 shadow-md"
      default:
        return "bg-gray-100 text-gray-900 border-gray-300"
    }
  }

  const renderConnection = (conn: Connection) => {
    const fromNode = nodes.find((n) => n.id === conn.from)
    const toNode = nodes.find((n) => n.id === conn.to)

    if (!fromNode || !toNode) return null

    const fromX = fromNode.x + fromNode.width / 2
    const fromY = fromNode.y + fromNode.height
    const toX = toNode.x + toNode.width / 2
    const toY = toNode.y

    // Horizontal offset to push elbows outward
    const offsetX = Math.max(150, Math.abs(toX - fromX) / 2)

    let pathD: string

    if (toY >= fromY) {
      // Normal forward flow: downwards
      pathD = `
        M ${fromX} ${fromY}
        L ${fromX} ${(fromY + toY) / 2}
        L ${toX} ${(fromY + toY) / 2}
        L ${toX} ${toY}
      `
    } else {
      // Feedback loop: goes upward
      pathD = `
        M ${fromX} ${fromY}
        L ${fromX + offsetX} ${fromY}
        L ${fromX + offsetX} ${toY}
        L ${toX} ${toY}
      `
    }

    return (
      <g key={`${conn.from}-${conn.to}`}>
        <path
          d={pathD}
          fill="none"
          stroke={conn.isActive ? "#ff0000ff" : "#94a3b8"}  // indigo active, slate muted
          strokeWidth={conn.isActive ? 3 : 2}
          className={conn.isActive ? "animate-pulse" : ""}
          markerEnd="url(#arrowhead)"
          strokeDasharray={conn.isActive ? "0" : "5,5"}
        />
        {conn.label && (
          <text
            x={(fromX + toX) / 2}
            y={(fromY + toY) / 2}
            textAnchor="middle"
            className={`text-xs font-semibold ${conn.isActive ? "fill-red-600" : "fill-gray-500"}`}
            dy="-8"
          >
            {conn.label}
          </text>
        )}
      </g>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-700">
                {t("title")}
              </h1>
              <p className="text-slate-600">{t("subtitle")}</p>
              <p className="text-sm text-gray-600 mt-1 font-[family-name:var(--font-dm-sans)]">
                {t("author")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePlay}
                variant={isPlaying ? "secondary" : "default"}
                size="lg"
                className="shadow-md"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 mr-2" />
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                {isPlaying ? t("controls.pause") : t("controls.play")}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="shadow-md bg-transparent"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {t("controls.reset")}
              </Button>
              <Button
                onClick={toggleLang}
                variant="outline"
                size="lg"
                className="shadow-md"
              >
                {i18n.language === "en"
                  ? t("controls.lang.es")
                  : t("controls.lang.en")}
              </Button>
            </div>
          </div>
        </div>
      </header>

<main className="container mx-auto px-4 py-6">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Flowchart */}
    <div className="lg:col-span-3">
      <Card className="p-4 shadow-xl bg-white/95">
        <div className="relative w-full">
          <svg
            viewBox={`0 0 ${BASE_W} ${BASE_H}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <marker id="arrowhead" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" fill="#ff0000ff" />
              </marker>
                <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                </defs>
            {connections.map(renderConnection)}
          </svg>

          {nodes.map((node) => (
              <div
              key={node.id}
              className={`absolute rounded-xl border-2 p-4 cursor-pointer transition-all duration-500 hover:scale-105 ${getNodeColor(node)} ${
                node.isActive ? "animate-fadeInUp" : "opacity-30"
              }`}
              style={{
                left: `${(node.x / BASE_W) * 100}%`,
                top: `${(node.y / BASE_H) * 100}%`,
                width: `${(node.width / BASE_W) * 100}%`,
                height: `${(node.height / BASE_H) * 100}%`,
                transform: node.type === "decision" ? "rotate(45deg)" : "none",
                boxShadow: node.isActive ? "0 8px 25px rgba(0,0,0,0.15)" : "none",
              }}
              onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
            >
              <div
                className={`flex items-center gap-2 text-center justify-center h-full ${node.type === "decision" ? "transform -rotate-45" : ""}`}
              >
                {node.icon}
                <span className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] leading-tight">
                  {node.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    {/* Side Panel */}
    <div className="space-y-6">
    {/* Epsilon-Greedy Status */}
    <Card className="p-4 shadow-lg bg-white/95">
      <h3 className="font-bold mb-3 font-[family-name:var(--font-space-grotesk)] text-red-800">
        {t("epsilon_status")}
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{t("phase")}:</span>
          <Badge
            variant="secondary"
            className={`${
              isWarmup
                ? "bg-orange-100 text-orange-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {isWarmup ? t("warmup") : t("active")}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{t("epsilon")}:</span>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {(epsilonValue * 100).toFixed(0)}%
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{t("random_value")}:</span>
          <Badge
            variant="outline"
            className={`${
              randomValue < epsilonValue
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {randomValue.toFixed(3)}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{t("strategy")}:</span>
          <Badge className={`${isExploring ? "bg-green-500" : "bg-blue-500"}`}>
            {isExploring ? t("explore") : t("exploit")}
          </Badge>
        </div>

        {/* the explanatory box goes here */}
        <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
          {isWarmup
            ? t("epsilon_expl.warmup")
            : isExploring
              ? t("epsilon_expl.explore", {
                  value: randomValue.toFixed(3),
                  epsilon: epsilonValue,
                })
              : t("epsilon_expl.exploit", {
                  value: randomValue.toFixed(3),
                  epsilon: epsilonValue,
                })}
        </div>
      </div>
    </Card>


    {/* Progress */}
    <Card className="p-4 shadow-lg bg-white/95">
      <h3 className="font-bold mb-3 font-[family-name:var(--font-space-grotesk)] text-red-800">
        {t("progress")}
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{t("step", { current: currentStep + 1, total: 11 })}</span>
          <span>{Math.round(((currentStep + 1) / 11) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-red-500 to-amber-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / 11) * 100}%` }}
          />
        </div>
      </div>
    </Card>

    {/* Current Step */}
    <Card className="p-4 shadow-lg bg-white/95">
      <h3 className="font-bold mb-3 font-[family-name:var(--font-space-grotesk)] text-red-800">
        {t("current_step")}
      </h3>
      {currentStep < nodes.length ? (
        <div className="space-y-2">
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {nodes[currentStep]?.label}
          </Badge>
          <p className="text-sm text-gray-700 font-[family-name:var(--font-dm-sans)]">
            {nodes[currentStep]?.description}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-700 font-[family-name:var(--font-dm-sans)]">
          {t("complete")}
        </p>
      )}
    </Card>

    {/* Node Details */}
    {selectedNode && (
      <Card className="p-4 shadow-lg bg-white/95">
        <h3 className="font-bold mb-3 font-[family-name:var(--font-space-grotesk)] text-red-800">
          {t("node_details")}
        </h3>
        {(() => {
          const node = nodes.find((n) => n.id === selectedNode)
          return node ? (
            <div className="space-y-2">
              <Badge variant="outline" className="border-red-300 text-red-800">
                {node.label}
              </Badge>
              <p className="text-sm text-gray-700 font-[family-name:var(--font-dm-sans)]">
                {node.description}
              </p>
            </div>
          ) : null
        })()}
      </Card>
    )}

    {/* Legend */}
    <Card className="p-4 shadow-lg bg-white/95">
      <h3 className="font-bold mb-3 font-[family-name:var(--font-space-grotesk)] text-red-800">
        {t("legend")}
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>{t("legend_items.process")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
          <span>{t("legend_items.data")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded transform rotate-45"></div>
          <span>{t("legend_items.decision_exploit")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-400 rounded transform rotate-45"></div>
          <span>{t("legend_items.decision_explore")}</span>
        </div>
      </div>
    </Card>

    </div>
  </div>
</main>
<style jsx>{`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out;
  }
`}</style>
</div>
)
}