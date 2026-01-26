"use client"

import { useState, useRef } from "react"
import { useApp } from "@/lib/app-context"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Camera,
  Plus,
  X,
  MapPin,
  Heart,
  Wine,
  Cigarette,
  Dumbbell,
  UtensilsCrossed,
  Dog,
  Languages,
  User,
  Activity,
  Zap,
  Briefcase,
  GraduationCap,
  Layers
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

// Interest categories and tags
const INTEREST_CATEGORIES = {
  "Sports & Fitness": ["Gym", "Yoga", "Running", "Swimming", "Hiking", "Cycling", "Dancing", "Rock Climbing"],
  "Arts & Culture": ["Music", "Photography", "Painting", "Writing", "Theater", "Museums", "Concerts"],
  "Food & Drink": ["Cooking", "Foodie", "Wine", "Coffee", "Baking", "Vegan", "Craft Beer"],
  "Entertainment": ["Movies", "TV Shows", "Gaming", "Reading", "Podcasts", "Anime", "Stand-up Comedy"],
  "Travel": ["Backpacking", "Luxury Travel", "Road Trips", "Beach", "Mountains", "City Breaks"],
  "Social": ["Volunteering", "Activism", "Nightlife", "Festivals", "Karaoke", "Board Games"]
}

const ALL_INTERESTS = Object.values(INTEREST_CATEGORIES).flat()

const RELATIONSHIP_GOALS = [
  { value: "long-term", label: "Elite Long-term", icon: "❤️" },
  { value: "casual", label: "Casual Synergy", icon: "😊" },
  { value: "friendship", label: "Elite Socials", icon: "👋" },
  { value: "marriage", label: "Eternal Bond", icon: "💍" },
  { value: "open", label: "Open Exploration", icon: "✨" },
]

export function ProfileSetupScreen() {
  const { setCurrentScreen, updateUser, user, mode } = useApp()

  // Basic Info
  const [name, setName] = useState(user?.name || "")
  const [age, setAge] = useState(user?.age?.toString() || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [gender, setGender] = useState<string>(user?.gender?.toString() || "")
  const [interestedIn, setInterestedIn] = useState<string>(user?.interestedIn?.toString() || "")
  const [job, setJob] = useState(user?.jobTitle || "")
  const [school, setSchool] = useState(user?.school || "")

  // Photo Grid (6 Slots)
  const [photos, setPhotos] = useState<(string | null)[]>(() => {
    const p: (string | null)[] = [null, null, null, null, null, null];
    if (user?.photos) {
      user.photos.forEach((url, i) => { if (i < 6) p[i] = url; });
    } else if (user?.photoUrl) {
      p[0] = user.photoUrl;
    }
    return p;
  })

  // Priority Profile Fields
  const initialHeightFt = user?.height ? Math.floor(user.height / 30.48).toString() : ""
  const initialHeightIn = user?.height ? Math.round((user.height % 30.48) / 2.54).toString() : ""

  const [heightFt, setHeightFt] = useState(initialHeightFt)
  const [heightIn, setHeightIn] = useState(initialHeightIn)
  const [location, setLocation] = useState(user?.userLocation || "")
  const [relationshipGoals, setRelationshipGoals] = useState<string[]>(user?.relationshipGoals || [])
  const [drinking, setDrinking] = useState(user?.drinking || "")
  const [smoking, setSmoking] = useState(user?.smoking || "")
  const [exercise, setExercise] = useState(user?.exerciseFrequency || "")
  const [diet, setDiet] = useState(user?.diet || "")
  const [pets, setPets] = useState(user?.pets || "")
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  const mainPhoto = photos[0]
  const isValid = name.length >= 3 && age.length > 0 && gender !== "" && interestedIn !== "" && mainPhoto !== null && bio.length >= 10

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingIndex(index)
    try {
      const res = await api.media.upload(file)
      if (!res.url) throw new Error("Invalid response from server")

      const newPhotos = [...photos]
      newPhotos[index] = res.url
      setPhotos(newPhotos)
      toast.success("Identity asset secured")
    } catch (e) {
      console.error("Upload failed", e)
      toast.error("Upload failed: Please try a smaller image or check connection")
    } finally {
      setUploadingIndex(null)
    }
  }

  const triggerUpload = (index: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("data-index", index.toString())
      fileInputRef.current.click()
    }
  }

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos]
    newPhotos[index] = null
    setPhotos(newPhotos)
  }

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest))
    } else if (selectedInterests.length < 10) {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const toggleRelationshipGoal = (goal: string) => {
    if (relationshipGoals.includes(goal)) {
      setRelationshipGoals(relationshipGoals.filter(g => g !== goal))
    } else if (relationshipGoals.length < 3) {
      setRelationshipGoals([...relationshipGoals, goal])
    }
  }

  const handleContinue = async () => {
    const heightCm = heightFt && heightIn
      ? Math.round((parseInt(heightFt) * 30.48) + (parseInt(heightIn) * 2.54))
      : undefined

    const updates = {
      name,
      age: parseInt(age),
      bio,
      photos: photos.filter(p => p !== null) as string[],
      photoUrl: mainPhoto || "",
      gender: parseInt(gender),
      interestedIn: parseInt(interestedIn),
      jobTitle: job,
      school,
      interests: selectedInterests,
      height: heightCm,
      userLocation: location,
      relationshipGoals,
      drinking,
      smoking,
      exerciseFrequency: exercise,
      diet,
      pets,
      mode: mode || "dating",
      onboardingStep: 3
    }

    try {
      await updateUser(updates)
      setCurrentScreen("prompts")
    } catch (e) {
      toast.error("Sync error: Failed to commit persona data")
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1A0814] overflow-hidden relative font-sans select-none">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const index = parseInt(e.target.getAttribute("data-index") || "0")
          handlePhotoUpload(e, index)
        }}
      />

      {/* Modern Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 border-b border-white/5 bg-black/5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentScreen("mode")}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[#D4AF37] mb-1">Identity Builder</span>
          <span className="text-xs font-bold tracking-widest uppercase text-white/40">Step 03 / 05</span>
        </div>
        <div className="w-12" />
      </header>

      {/* Progress Line */}
      <div className="relative h-[2px] w-full bg-white/5">
        <motion.div
          initial={{ width: "45%" }}
          animate={{ width: "65%" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] shadow-[0_0_10px_#D4AF37]"
        />
      </div>

      <div className="flex-1 overflow-y-auto relative z-10 px-8 pt-10 pb-40 space-y-12 no-scrollbar">

        {/* Title Section */}
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Your Profile</h1>
          <p className="text-sm text-white/40 font-medium tracking-wide">Show the world who you are.</p>

          <div className="mt-4 p-4 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/20">
            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">Elite Tip</p>
            <p className="text-[11px] text-white/60 leading-relaxed font-medium">
              A complete profile gains 4x more resonance in the <span className="text-white">Sovereign Feed</span>. Step 03 is the foundation of your digital signature.
            </p>
          </div>
        </div>

        {/* Photo Grid - Elite Styling */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/60">Photos</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 row-span-2">
              <PhotoSlot
                photo={photos[0]}
                onUpload={() => triggerUpload(0)}
                onRemove={() => handleRemovePhoto(0)}
                isMain
                isUploading={uploadingIndex === 0}
              />
            </div>
            {[1, 2, 3, 4, 5].map((index) => (
              <PhotoSlot
                key={index}
                photo={photos[index]}
                onUpload={() => triggerUpload(index)}
                onRemove={() => handleRemovePhoto(index)}
                isUploading={uploadingIndex === index}
              />
            ))}
          </div>
          <p className="text-[10px] text-white/20 text-center uppercase tracking-widest font-black">Main photo required to continue</p>
        </section>

        {/* Base Identity */}
        <EliteSection title="The Basics" icon={<User className="w-5 h-5 text-[#D4AF37]" />}>
          <div className="grid grid-cols-2 gap-4">
            <EliteInput
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <EliteInput
              placeholder="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <EliteSelect value={gender} onValueChange={setGender} placeholder="Gender" options={[
              { value: "0", label: "Man" },
              { value: "1", label: "Woman" },
              { value: "2", label: "Other" }
            ]} />
            <EliteSelect value={interestedIn} onValueChange={setInterestedIn} placeholder="Looking for" options={[
              { value: "0", label: "Men" },
              { value: "1", label: "Women" },
              { value: "2", label: "Everyone" }
            ]} />
          </div>

          <div className="relative mt-4">
            <textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] p-6 text-sm text-white font-medium placeholder:text-white/10 focus:border-[#D4AF37]/30 outline-none transition-all min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className={cn(
              "absolute bottom-4 right-4 text-[9px] font-black uppercase tracking-widest transition-colors",
              bio.length < 10 ? "text-rose-500" : "text-emerald-500"
            )}>
              {bio.length} / 500 {bio.length < 10 && "(Min 10)"}
            </div>
          </div>
        </EliteSection>

        {/* Social Coordinates */}
        <EliteSection title="Location" icon={<MapPin className="w-5 h-5 text-[#D4AF37]" />}>
          <EliteInput
            placeholder="City, Country"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="mt-6 space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Height</label>
            <div className="grid grid-cols-2 gap-4">
              <EliteSelect value={heightFt} onValueChange={setHeightFt} placeholder="Feet" options={[4, 5, 6, 7].map(ft => ({ value: ft.toString(), label: `${ft} ft` }))} />
              <EliteSelect value={heightIn} onValueChange={setHeightIn} placeholder="Inches" options={Array.from({ length: 12 }, (_, i) => ({ value: i.toString(), label: `${i} in` }))} />
            </div>
          </div>
        </EliteSection>

        {/* Relationship Choice */}
        <EliteSection title="Relationship Goals" icon={<Heart className="w-5 h-5 text-[#D4AF37]" />}>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_GOALS.map((goal) => (
              <motion.button
                key={goal.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleRelationshipGoal(goal.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                  relationshipGoals.includes(goal.value)
                    ? "bg-[#D4AF37] text-[#1A0814] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                )}
              >
                {goal.label}
              </motion.button>
            ))}
          </div>
        </EliteSection>

        {/* Lifestyle Logic */}
        <EliteSection title="Lifestyle" icon={<Activity className="w-5 h-5 text-[#D4AF37]" />}>
          <div className="space-y-6">
            <EliteSelectField label="Drinking" icon={<Wine className="w-4 h-4" />} value={drinking} onValueChange={setDrinking} options={[
              { value: "never", label: "Never" },
              { value: "socially", label: "Socially" },
              { value: "regularly", label: "Regularly" },
              { value: "prefer-not-say", label: "Prefer not to say" }
            ]} />
            <EliteSelectField label="Smoking" icon={<Cigarette className="w-4 h-4" />} value={smoking} onValueChange={setSmoking} options={[
              { value: "never", label: "Never" },
              { value: "socially", label: "Socially" },
              { value: "regularly", label: "Regularly" },
              { value: "trying-quit", label: "Trying to quit" }
            ]} />
            <EliteSelectField label="Exercise" icon={<Dumbbell className="w-4 h-4" />} value={exercise} onValueChange={setExercise} options={[
              { value: "active", label: "Active" },
              { value: "sometimes", label: "Sometimes" },
              { value: "rarely", label: "Rarely" }
            ]} />
            <EliteSelectField label="Diet" icon={<UtensilsCrossed className="w-4 h-4" />} value={diet} onValueChange={setDiet} options={[
              { value: "omnivore", label: "Omnivore" },
              { value: "vegetarian", label: "Vegetarian" },
              { value: "vegan", label: "Vegan" },
              { value: "pescatarian", label: "Pescatarian" }
            ]} />
          </div>
        </EliteSection>

        {/* Industrial Focus */}
        <EliteSection title="Job & School" icon={<Briefcase className="w-5 h-5 text-[#D4AF37]" />}>
          <div className="grid grid-cols-1 gap-4">
            <EliteInput placeholder="Job Title" value={job} onChange={(e) => setJob(e.target.value)} />
            <EliteInput placeholder="School" value={school} onChange={(e) => setSchool(e.target.value)} />
          </div>
        </EliteSection>

        {/* Interest Selection */}
        <EliteSection title="Interests" icon={<Layers className="w-5 h-5 text-[#D4AF37]" />}>
          <div className="flex flex-wrap gap-2">
            {ALL_INTERESTS.map((interest) => (
              <motion.button
                key={interest}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleInterest(interest)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                  selectedInterests.includes(interest)
                    ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                    : "bg-white/5 text-white/30 border-white/5 hover:border-white/10"
                )}
              >
                {interest}
              </motion.button>
            ))}
          </div>
        </EliteSection>

      </div>

      {/* Futuristic Fixed Footer CTA */}
      <motion.div
        layout
        className="fixed bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-[#1A0814] via-[#1A0814]/90 to-transparent z-30"
      >
        <div className="max-w-md mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#7A1F3D] rounded-[24px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={!isValid}
            className="w-full h-18 rounded-[22px] bg-white text-[#1A0814] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 relative overflow-hidden disabled:opacity-30"
          >
            <Zap className="w-5 h-5 fill-current" />
            Complete Profile
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent skew-x-[30deg]"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

function EliteSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
          {icon}
        </div>
        <h2 className="text-xl font-black text-white tracking-tighter uppercase">{title}</h2>
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>
      <div className="px-2">
        {children}
      </div>
    </section>
  )
}

function EliteInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full h-14 bg-white/[0.03] border border-white/10 rounded-[20px] px-6 text-sm text-white font-bold placeholder:text-white/10 focus:border-[#D4AF37]/30 outline-none transition-all",
        props.className
      )}
    />
  )
}

function EliteSelect({ value, onValueChange, placeholder, options }: { value: string; onValueChange: (v: string) => void; placeholder: string; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 rounded-[20px] text-white/40 focus:ring-0 focus:border-[#D4AF37]/30">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-[#1A0814] border-white/10 text-white">
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value} className="focus:bg-[#D4AF37] focus:text-[#1A0814]">{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function EliteSelectField({ label, icon, value, onValueChange, options }: { label: string; icon: React.ReactNode; value: string; onValueChange: (v: string) => void; options: any[] }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
        {icon} {label}
      </label>
      <EliteSelect value={value} onValueChange={onValueChange} placeholder="Select Protocol..." options={options} />
    </div>
  )
}

function PhotoSlot({
  photo,
  onUpload,
  onRemove,
  isMain = false,
  isUploading = false,
}: {
  photo: string | null
  onUpload: () => void
  onRemove: () => void
  isMain?: boolean
  isUploading?: boolean
}) {
  return (
    <div
      className={cn(
        "relative rounded-[28px] overflow-hidden bg-white/[0.02] border-2 border-dashed transition-all group perspective-1000",
        photo ? "border-white/10 shadow-xl" : "border-white/5 hover:border-[#D4AF37]/30",
        isMain ? "aspect-[3/4]" : "aspect-square"
      )}
    >
      {photo ? (
        <>
          <img src={photo} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRemove}
            className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all shadow-2xl"
          >
            <X className="w-5 h-5" />
          </motion.button>
          {isMain && (
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-[#D4AF37] text-[#1A0814] rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl">
              Primary Logic
            </div>
          )}
        </>
      ) : (
        <button
          onClick={onUpload}
          disabled={isUploading}
          className="w-full h-full flex flex-col items-center justify-center gap-4 hover:bg-white/[0.02] transition-all disabled:opacity-50"
        >
          {isUploading ? (
            <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors">
              <Plus className="w-7 h-7 text-white/20 group-hover:text-[#D4AF37]" />
            </div>
          )}
          {isMain && <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{isUploading ? "Uploading Protocol..." : "Add Primary Asset"}</span>}
        </button>
      )}
    </div>
  )
}
