"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Camera, Plus, X, MapPin, Heart, Wine, Cigarette, Dumbbell, UtensilsCrossed, Dog, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api-client"
import { useRef } from "react"

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
  { value: "long-term", label: "Long-term relationship", icon: "❤️" },
  { value: "casual", label: "Something casual", icon: "😊" },
  { value: "friendship", label: "New friends", icon: "👋" },
  { value: "marriage", label: "Marriage", icon: "💍" },
  { value: "open", label: "Open to anything", icon: "✨" },
]

export function ProfileSetupScreen() {
  const { setCurrentScreen, setCurrentUser, mode } = useApp()

  // Basic Info
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [bio, setBio] = useState("")
  const [gender, setGender] = useState<string>("")
  const [interestedIn, setInterestedIn] = useState<string>("")
  const [job, setJob] = useState("")
  const [school, setSchool] = useState("")

  // Photo Grid (6 Slots)
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null, null])

  // Priority Profile Fields
  const [heightFt, setHeightFt] = useState("")
  const [heightIn, setHeightIn] = useState("")
  const [location, setLocation] = useState("")
  const [relationshipGoals, setRelationshipGoals] = useState<string[]>([])
  const [drinking, setDrinking] = useState("")
  const [smoking, setSmoking] = useState("")
  const [exercise, setExercise] = useState("")
  const [diet, setDiet] = useState("")
  const [pets, setPets] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  const mainPhoto = photos[0]
  const isValid = name.length >= 2 && age.length > 0 && gender !== "" && interestedIn !== "" && mainPhoto !== null

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingIndex(index)
    try {
      const res = await api.media.upload(file)
      const newPhotos = [...photos]
      newPhotos[index] = res.url
      setPhotos(newPhotos)
    } catch (e) {
      console.error("Upload failed", e)
      alert("Photo upload failed. Please check your connection.")
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
    // Convert height to cm
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
      isOnboarded: true
    }

    try {
      await setCurrentUser({ ...updates, id: "self", trustScore: 0, isVerified: false, credits: 0 })
      // The updates object is mapped to backend fields in AppContext.updateUser
      // But here we'll directly call it to be sure
      // await api.user.updateProfile(updates);
      setCurrentScreen("prompts")
    } catch (e) {
      console.error("Profile update failed", e)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6EDEE] dark:bg-[#1A0814] overflow-y-auto relative flex flex-col items-center">
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
      <div className="w-full max-w-md min-h-screen relative flex flex-col bg-[#F6EDEE] dark:bg-[#1A0814] text-[#2A0D1F] dark:text-[#F6EDEE] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-[#F6EDEE] dark:from-[#1A0814] to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setCurrentScreen("mode")} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-sm font-medium opacity-60">Step 1 of 3</div>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-6 pb-32">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif font-medium mb-2">Create your profile</h1>
            <p className="opacity-60">Add at least 1 photo to continue</p>
          </div>

          {/* Photo Grid - 6 Slots */}
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-3">
              {/* Main Photo (Larger) */}
              <div className="col-span-2 row-span-2">
                <PhotoSlot
                  photo={photos[0]}
                  onUpload={() => triggerUpload(0)}
                  onRemove={() => handleRemovePhoto(0)}
                  isMain
                  isUploading={uploadingIndex === 0}
                />
              </div>

              {/* Side Photos */}
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
          </div>

          {/* Basic Info Section */}
          <Section title="Basic Info">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Input
                placeholder="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="I am..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Man</SelectItem>
                  <SelectItem value="1">Woman</SelectItem>
                  <SelectItem value="2">Non-binary</SelectItem>
                </SelectContent>
              </Select>

              <Select value={interestedIn} onValueChange={setInterestedIn}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Interested in..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Men</SelectItem>
                  <SelectItem value="1">Women</SelectItem>
                  <SelectItem value="2">Everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-4 bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
              maxLength={500}
            />
            <div className="text-right text-xs text-white/50 mt-1">{bio.length}/500</div>
          </Section>

          {/* Location & Height */}
          <Section title="Location & Physical" icon={<MapPin className="w-5 h-5" />}>
            <Input
              placeholder="City, Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />

            <div className="mt-4">
              <label className="text-sm text-white/70 mb-2 block">Height</label>
              <div className="grid grid-cols-2 gap-4">
                <Select value={heightFt} onValueChange={setHeightFt}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Feet" />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 5, 6, 7].map(ft => (
                      <SelectItem key={ft} value={ft.toString()}>{ft} ft</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={heightIn} onValueChange={setHeightIn}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Inches" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>{i} in</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* Relationship Goals */}
          <Section title="What are you looking for?" icon={<Heart className="w-5 h-5" />}>
            <p className="text-sm text-white/60 mb-3">Select up to 3</p>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_GOALS.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => toggleRelationshipGoal(goal.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    relationshipGoals.includes(goal.value)
                      ? "bg-white text-[#5A2A4A]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {goal.icon} {goal.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Lifestyle */}
          <Section title="Lifestyle" icon={<Wine className="w-5 h-5" />}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-2 block flex items-center gap-2">
                  <Wine className="w-4 h-4" /> Drinking
                </label>
                <Select value={drinking} onValueChange={setDrinking}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="socially">Socially</SelectItem>
                    <SelectItem value="regularly">Regularly</SelectItem>
                    <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block flex items-center gap-2">
                  <Cigarette className="w-4 h-4" /> Smoking
                </label>
                <Select value={smoking} onValueChange={setSmoking}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="socially">Socially</SelectItem>
                    <SelectItem value="regularly">Regularly</SelectItem>
                    <SelectItem value="trying-quit">Trying to quit</SelectItem>
                    <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" /> Exercise
                </label>
                <Select value={exercise} onValueChange={setExercise}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (4+ times/week)</SelectItem>
                    <SelectItem value="sometimes">Sometimes (1-3 times/week)</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4" /> Diet
                </label>
                <Select value={diet} onValueChange={setDiet}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="omnivore">Omnivore</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="pescatarian">Pescatarian</SelectItem>
                    <SelectItem value="kosher">Kosher</SelectItem>
                    <SelectItem value="halal">Halal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block flex items-center gap-2">
                  <Dog className="w-4 h-4" /> Pets
                </label>
                <Select value={pets} onValueChange={setPets}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog person</SelectItem>
                    <SelectItem value="cat">Cat person</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="neither">Neither</SelectItem>
                    <SelectItem value="have-pets">Have pets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* Work & Education */}
          <Section title="Work & Education">
            <Input
              placeholder="Job Title"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Input
              placeholder="School"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="mt-4 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </Section>

          {/* Interests */}
          <Section title="Interests" icon={<Heart className="w-5 h-5" />}>
            <p className="text-sm text-white/60 mb-3">Select up to 10 interests</p>
            <div className="flex flex-wrap gap-2">
              {ALL_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm transition-all",
                    selectedInterests.includes(interest)
                      ? "bg-white text-[#5A2A4A] font-medium"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="text-right text-xs text-white/50 mt-2">
              {selectedInterests.length}/10 selected
            </div>
          </Section>
        </div>

        {/* Bottom Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#5A2A4A] via-[#5A2A4A]/95 to-transparent z-40">
          <Button
            onClick={handleContinue}
            disabled={!isValid}
            className="w-full h-14 bg-white text-[#5A2A4A] hover:bg-white/90 font-semibold text-base rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-serif font-medium mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
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
        "relative rounded-2xl overflow-hidden bg-white/5 border-2 border-dashed border-white/20 hover:border-white/40 transition-all group",
        isMain ? "aspect-[3/4]" : "aspect-square"
      )}
    >
      {photo ? (
        <>
          <img src={photo} alt="Profile" className="w-full h-full object-cover" />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          {isMain && (
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium">
              Main Photo
            </div>
          )}
        </>
      ) : (
        <button
          onClick={onUpload}
          disabled={isUploading}
          className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
          )}
          {isMain && <span className="text-sm font-medium">{isUploading ? "Uploading..." : "Add Main Photo"}</span>}
        </button>
      )}
    </div>
  )
}
