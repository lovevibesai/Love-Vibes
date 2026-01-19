"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  ChevronLeft,
  RotateCcw,
  MapPin,
  Ruler,
  Heart,
  Wine,
  Cigarette,
  Shield,
  Video,
  Crown,
  Lock
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Filters {
  distance: number
  ageRange: [number, number]
  heightRange: [number, number] // in cm
  showMe: string
  education: string[]
  hasKids: string[]
  wantsKids: string[]
  relationshipGoals: string[]
  drinking: string[]
  smoking: string[]
  showVerifiedOnly: boolean
  showWithVideoOnly: boolean
  minTrustScore: number
}

export function FiltersScreen() {
  const { setCurrentScreen } = useApp()
  const [filters, setFilters] = useState<Filters>({
    distance: 25,
    ageRange: [21, 45],
    heightRange: [150, 200], // 4'11" to 6'7"
    showMe: "everyone",
    education: [],
    hasKids: [],
    wantsKids: [],
    relationshipGoals: [],
    drinking: [],
    smoking: [],
    showVerifiedOnly: false,
    showWithVideoOnly: false,
    minTrustScore: 0,
  })

  const [isPremium] = useState(false) // Mock premium status

  const resetFilters = () => {
    setFilters({
      distance: 25,
      ageRange: [21, 45],
      heightRange: [150, 200],
      showMe: "everyone",
      education: [],
      hasKids: [],
      wantsKids: [],
      relationshipGoals: [],
      drinking: [],
      smoking: [],
      showVerifiedOnly: false,
      showWithVideoOnly: false,
      minTrustScore: 0,
    })
  }

  const applyFilters = () => {
    // In a real app, save to API/state
    setCurrentScreen("feed")
  }

  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return `${feet}'${inches}"`
  }

  const toggleArrayFilter = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(v => v !== value))
    } else {
      setter([...array, value])
    }
  }

  return (
    <div className="h-full flex flex-col items-center bg-background overflow-y-auto">
      <div className="w-full max-w-md min-h-full flex flex-col bg-background relative shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen("feed")}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Discovery Preferences</h1>
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-primary text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Distance */}
          <Section icon={<MapPin className="w-5 h-5 text-primary" />} title="Distance">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Maximum distance</span>
              <span className="text-sm font-semibold text-foreground">{filters.distance} miles</span>
            </div>
            <Slider
              value={[filters.distance]}
              onValueChange={([value]) => setFilters({ ...filters, distance: value })}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </Section>

          {/* Show Me */}
          <Section icon={<Heart className="w-5 h-5 text-primary" />} title="Show Me">
            <Select value={filters.showMe} onValueChange={(value) => setFilters({ ...filters, showMe: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="everyone">Everyone</SelectItem>
              </SelectContent>
            </Select>
          </Section>

          {/* Age Range */}
          <Section icon={<Heart className="w-5 h-5 text-primary" />} title="Age Range">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Age</span>
              <span className="text-sm font-semibold text-foreground">
                {filters.ageRange[0]} - {filters.ageRange[1]}
              </span>
            </div>
            <Slider
              value={filters.ageRange}
              onValueChange={(value) => setFilters({ ...filters, ageRange: value as [number, number] })}
              min={18}
              max={99}
              step={1}
              className="w-full"
            />
          </Section>

          {/* Height Range */}
          <Section icon={<Ruler className="w-5 h-5 text-primary" />} title="Height Range">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Height</span>
              <span className="text-sm font-semibold text-foreground">
                {cmToFeetInches(filters.heightRange[0])} - {cmToFeetInches(filters.heightRange[1])}
              </span>
            </div>
            <Slider
              value={filters.heightRange}
              onValueChange={(value) => setFilters({ ...filters, heightRange: value as [number, number] })}
              min={140}
              max={220}
              step={1}
              className="w-full"
            />
          </Section>

          {/* Education Filter (Free) */}
          <Section icon={<Heart className="w-5 h-5 text-primary" />} title="Education">
            <p className="text-sm text-muted-foreground mb-3">Show people with:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "high-school", label: "High School" },
                { value: "bachelors", label: "Bachelor's" },
                { value: "masters", label: "Master's" },
                { value: "phd", label: "PhD" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleArrayFilter(
                    filters.education,
                    option.value,
                    (arr) => setFilters({ ...filters, education: arr })
                  )}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filters.education.includes(option.value)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Kids Filters (Free) */}
          <Section icon={<Heart className="w-5 h-5 text-primary" />} title="Kids">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Has kids:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleArrayFilter(
                        filters.hasKids,
                        option.value,
                        (arr) => setFilters({ ...filters, hasKids: arr })
                      )}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filters.hasKids.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Wants kids:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                    { value: "maybe", label: "Maybe" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleArrayFilter(
                        filters.wantsKids,
                        option.value,
                        (arr) => setFilters({ ...filters, wantsKids: arr })
                      )}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filters.wantsKids.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Advanced Filters - Premium */}
          <div className="relative">
            {!isPremium && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                <div className="text-center p-6">
                  <Crown className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Love Vibes Gold</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unlock advanced filters to find your perfect match
                  </p>
                  <Button className="bg-gradient-to-r from-[#8B3A3A] to-[#C75B5C] text-white">
                    Upgrade Now
                  </Button>
                </div>
              </div>
            )}

            {/* Relationship Goals Filter */}
            <Section
              icon={<Heart className="w-5 h-5 text-primary" />}
              title="Relationship Goals"
              premium
            >
              <p className="text-sm text-muted-foreground mb-3">Show only people looking for:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "long-term", label: "Long-term" },
                  { value: "casual", label: "Casual" },
                  { value: "friendship", label: "Friendship" },
                  { value: "marriage", label: "Marriage" },
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => toggleArrayFilter(
                      filters.relationshipGoals,
                      goal.value,
                      (arr) => setFilters({ ...filters, relationshipGoals: arr })
                    )}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filters.relationshipGoals.includes(goal.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Drinking Filter */}
            <Section
              icon={<Wine className="w-5 h-5 text-primary" />}
              title="Drinking"
              premium
            >
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "never", label: "Never" },
                  { value: "socially", label: "Socially" },
                  { value: "regularly", label: "Regularly" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter(
                      filters.drinking,
                      option.value,
                      (arr) => setFilters({ ...filters, drinking: arr })
                    )}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filters.drinking.includes(option.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Smoking Filter */}
            <Section
              icon={<Cigarette className="w-5 h-5 text-primary" />}
              title="Smoking"
              premium
            >
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "never", label: "Never" },
                  { value: "socially", label: "Socially" },
                  { value: "regularly", label: "Regularly" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter(
                      filters.smoking,
                      option.value,
                      (arr) => setFilters({ ...filters, smoking: arr })
                    )}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filters.smoking.includes(option.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Section>
          </div>

          {/* Quick Filters */}
          <Section icon={<Shield className="w-5 h-5 text-primary" />} title="Quick Filters">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Verified profiles only</p>
                    <p className="text-xs text-muted-foreground">Show only verified users</p>
                  </div>
                </div>
                <Switch
                  checked={filters.showVerifiedOnly}
                  onCheckedChange={(checked) => setFilters({ ...filters, showVerifiedOnly: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Video intro only</p>
                    <p className="text-xs text-muted-foreground">Show profiles with video intros</p>
                  </div>
                </div>
                <Switch
                  checked={filters.showWithVideoOnly}
                  onCheckedChange={(checked) => setFilters({ ...filters, showWithVideoOnly: checked })}
                />
              </div>
            </div>
          </Section>

          {/* Trust Score */}
          <Section icon={<Shield className="w-5 h-5 text-primary" />} title="Minimum Trust Score">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Trust score</span>
              <span className="text-sm font-semibold text-foreground">{filters.minTrustScore}+</span>
            </div>
            <Slider
              value={[filters.minTrustScore]}
              onValueChange={([value]) => setFilters({ ...filters, minTrustScore: value })}
              min={0}
              max={100}
              step={10}
              className="w-full"
            />
          </Section>
        </div>

        {/* Apply Button */}
        <div className="p-4 border-t border-border bg-card">
          <Button
            onClick={applyFilters}
            className="w-full h-12 bg-gradient-to-r from-[#8B3A3A] to-[#C75B5C] text-white font-semibold"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}

function Section({
  icon,
  title,
  children,
  premium = false
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  premium?: boolean
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            {title}
            {premium && <Crown className="w-4 h-4 text-primary" />}
          </h2>
        </div>
      </div>
      {children}
    </section>
  )
}
