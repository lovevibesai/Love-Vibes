"use client"

export const sounds = {
    match: "/assets/sounds/match.mp3",
    message: "/assets/sounds/message.mp3",
    swipe: "/assets/sounds/swipe.mp3",
    click: "/assets/sounds/click.mp3",
}

export function playSound(name: keyof typeof sounds) {
    try {
        const audio = new Audio(sounds[name])
        audio.play().catch(e => console.warn("Sound playback failed:", e))
    } catch (e) {
        console.warn("Audio initialization failed:", e)
    }
}
