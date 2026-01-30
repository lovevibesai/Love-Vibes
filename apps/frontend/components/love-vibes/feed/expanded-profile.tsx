"use client"

import { useState } from "react"
import { useApp, type User } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import {
  X,
  Heart,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Flag,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Wine,
  Cigarette,
  Dumbbell,
  UtensilsCrossed,
  Dog
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ReportModal } from "../safety/report-modal"

interface ExpandedProfileProps {
  profile: User
  onClose: () => void
  onLike: () => void
  onPass: () => void
  onSuperLike: () => void
}

export function ExpandedProfile({ profile, onClose, onLike, onPass, onSuperLike }: ExpandedProfileProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showReportModal, setShowReportModal] = useState(false)
  const [direction, setDirection] = useState(0)

  const photos = profile.photos && profile.photos.length > 0
    ? profile.photos
    : profile.photoUrl
      ? [profile.photoUrl]
      : []

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setDirection(1)
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setDirection(-1)
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  const goToPhoto = (index: number) => {
    setDirection(index > currentPhotoIndex ? 1 : -1)
    setCurrentPhotoIndex(index)
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto flex flex-col items-center"
    >
      <div className="w-full max-w-md bg-background min-h-screen relative shadow-2xl">
        {/* Photo Carousel */}
        <div className="relative h-[60vh] bg-black">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <Flag className="w-5 h-5" />
          </button>

          {/* Photo Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            {currentPhotoIndex + 1} / {photos.length}
          </div>

          {/* Photo Slider */}
          <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={currentPhotoIndex}
                src={photos[currentPhotoIndex]}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0 w-full h-full object-cover"
                alt={`${profile.name} - Photo ${currentPhotoIndex + 1}`}
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                {currentPhotoIndex > 0 && (
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {currentPhotoIndex < photos.length - 1 && (
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}

            {/* Dot Indicators */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPhoto(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentPhotoIndex
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/70"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        {/* Profile Info */}
        <div className="px-6 py-6">
          {/* Name, Age, Verification */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
              <span className="text-2xl text-muted-foreground">{profile.age}</span>
              {profile.isVerified && (
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {profile.compatibilityScore && (
              <div className="flex flex-col items-end">
                <div className="px-3 py-1 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full text-white text-sm font-bold shadow-lg shadow-rose-500/20">
                  {profile.compatibilityScore}% Vibe Match
                </div>
              </div>
            )}
          </div>

          {/* AI Insight Card */}
          {profile.compatibilityScore && profile.compatibilityScore > 80 && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-purple-500/10 border border-rose-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-rose-500 fill-current" />
                <span className="text-sm font-bold text-rose-500 uppercase tracking-wider">AI Smart Match</span>
              </div>
              <p className="text-sm text-foreground/80 italic font-medium">
                &quot;{profile.matchReason || `You both have highly compatible relationship goals and shared interests in ${profile.interests?.[0] || 'lifestyle'}!`}&quot;
              </p>
            </div>
          )}

          {/* Location & Distance */}
          {profile.userLocation && (
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{profile.userLocation}</span>
              {profile.distance && <span>• {profile.distance}</span>}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-foreground mb-6 leading-relaxed">{profile.bio}</p>
          )}

          {/* Relationship Goals */}
          {profile.relationshipGoals && profile.relationshipGoals.length > 0 && (
            <InfoSection icon={<Heart className="w-5 h-5" />} title="Looking for">
              <div className="flex flex-wrap gap-2">
                {profile.relationshipGoals.map((goal) => (
                  <span key={goal} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {goal.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </InfoSection>
          )}

          {/* Physical Info */}
          {profile.height && (
            <InfoSection icon={<Ruler className="w-5 h-5" />} title="Height">
              <span>{Math.floor(profile.height / 30.48)}&apos;{Math.round((profile.height % 30.48) / 2.54)}&quot;</span>
            </InfoSection>
          )}

          {/* Work & Education */}
          {(profile.jobTitle || profile.school) && (
            <div className="space-y-3 mb-6">
              {profile.jobTitle && (
                <InfoSection icon={<Briefcase className="w-5 h-5" />} title="Job">
                  <span>{profile.jobTitle}</span>
                  {profile.company && <span className="text-muted-foreground"> at {profile.company}</span>}
                </InfoSection>
              )}
              {profile.school && (
                <InfoSection icon={<GraduationCap className="w-5 h-5" />} title="Education">
                  <span>{profile.school}</span>
                </InfoSection>
              )}
            </div>
          )}

          {/* Lifestyle */}
          {(profile.drinking || profile.smoking || profile.exerciseFrequency || profile.diet || profile.pets) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-foreground">Lifestyle</h3>
              <div className="grid grid-cols-2 gap-3">
                {profile.drinking && (
                  <LifestyleItem icon={<Wine className="w-4 h-4" />} label="Drinking" value={profile.drinking} />
                )}
                {profile.smoking && (
                  <LifestyleItem icon={<Cigarette className="w-4 h-4" />} label="Smoking" value={profile.smoking} />
                )}
                {profile.exerciseFrequency && (
                  <LifestyleItem icon={<Dumbbell className="w-4 h-4" />} label="Exercise" value={profile.exerciseFrequency} />
                )}
                {profile.diet && (
                  <LifestyleItem icon={<UtensilsCrossed className="w-4 h-4" />} label="Diet" value={profile.diet} />
                )}
                {profile.pets && (
                  <LifestyleItem icon={<Dog className="w-4 h-4" />} label="Pets" value={profile.pets} />
                )}
              </div>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-foreground">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 bg-muted text-foreground rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mutual Interests - Trust Signal */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-primary fill-current" />
                <span className="text-sm font-bold text-primary">You Both Like</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.slice(0, 3).map((interest) => (
                  <span
                    key={interest}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent z-40">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={onPass}
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="w-7 h-7" />
            </Button>

            <Button
              onClick={onSuperLike}
              variant="outline"
              size="lg"
              className="w-14 h-14 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Star className="w-6 h-6" />
            </Button>

            <Button
              onClick={onLike}
              size="lg"
              className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Heart className="w-7 h-7 fill-current" />
            </Button>
          </div>
        </div>

        {/* Report Modal */}
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={profile.id}
          reportedUserName={profile.name || "User"}
        />
      </div>
    </motion.div>
  )
}

function InfoSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-1">{title}</h4>
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  )
}

function LifestyleItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground capitalize">{value.replace("-", " ")}</div>
      </div>
    </div>
  )
}
