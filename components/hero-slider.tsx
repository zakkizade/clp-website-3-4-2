"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

type Slide = { id: string; image: string; href: string; label: string }

const fallbackSlides: Slide[] = [
  { id: "sale", image: "/hero-emerald-gold.png", href: "/shop?category=Gold", label: "Explore gold fine jewelry" },
  { id: "gemstones", image: "/category-loose-gemstones.png", href: "/shop?category=Emerald", label: "Shop natural gemstones" },
  { id: "atelier", image: "/category-jaipur-craft.png", href: "/contact", label: "Start a custom inquiry" },
]

export function HeroSlider({ slides = fallbackSlides }: { slides?: Slide[] }) {
  const [index, setIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const activeSlides = slides.length ? slides : fallbackSlides
  const go = (direction: number) => setIndex((current) => (current + direction + activeSlides.length) % activeSlides.length)
  useEffect(() => { const timer = window.setInterval(() => go(1), 3000); return () => window.clearInterval(timer) }, [activeSlides.length])
  return <div className="hero-slider" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={(event) => { if (touchStart === null) return; const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart; if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1); setTouchStart(null) }}><a className="hero-slider-link" href={activeSlides[index].href} aria-label={activeSlides[index].label}><img src={activeSlides[index].image} alt={activeSlides[index].label} /><span className="hero-slider-caption">{activeSlides[index].label}</span></a><button className="hero-slider-arrow hero-slider-prev" onClick={(event) => { event.preventDefault(); go(-1) }} aria-label="Previous banner"><ArrowLeft /></button><button className="hero-slider-arrow hero-slider-next" onClick={(event) => { event.preventDefault(); go(1) }} aria-label="Next banner"><ArrowRight /></button><div className="hero-slider-dots" aria-label="Banner slides">{activeSlides.map((slide, slideIndex) => <button key={slide.id} className={slideIndex === index ? "active" : ""} onClick={() => setIndex(slideIndex)} aria-label={`Go to banner ${slideIndex + 1}`} />)}</div></div>
}
