"use client"

import { FormEvent, useState } from "react"
import { X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const result = mode === "login" ? await createClient().auth.signInWithPassword({ email, password }) : await createClient().auth.signUp({ email, password })
    setMessage(result.error?.message || (mode === "signup" ? "Check your email to confirm your account." : "Signed in successfully."))
    if (!result.error) window.setTimeout(onClose, 700)
  }
  const google = async () => {
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } })
    if (error) setMessage(error.message)
  }
  return <div className="auth-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="auth-close" onClick={onClose} aria-label="Close"><X size={18} /></button><p className="eyebrow gold-text">CLP private client</p><h2 id="auth-title">{mode === "login" ? "Welcome back." : "Create your account."}</h2><button className="google-button" onClick={google}><span className="google-logo" aria-hidden="true">G</span> Continue with Google</button><div className="auth-divider"><span>or continue with email</span></div><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{message && <p className="admin-error" role="alert">{message}</p>}<button className="button button-gold" type="submit">{mode === "login" ? "Sign in" : "Create account"}</button></form><button className="auth-toggle" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "New to CLP? Create an account" : "Already have an account? Sign in"}</button></section></div>
}

export function AuthTrigger() { const [open, setOpen] = useState(false); return <>{<button className="text-link" onClick={() => setOpen(true)}>Sign in</button>}{open && <AuthModal onClose={() => setOpen(false)} />}</> }
