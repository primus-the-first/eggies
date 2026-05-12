import { useState } from 'react'
import { Egg } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Login() {
  const { login, loginError } = useStore()
  const [name, setName]         = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    await login(name, password)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #131210 0%, #1A1814 100%)' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 8px 24px rgba(217,119,6,0.4)' }}
        >
          <Egg size={30} color="white" strokeWidth={2} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white font-jakarta tracking-tight">Eggies</h1>
          <p className="text-sm text-stone-500 font-inter mt-0.5">Sign in to continue</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest font-jakarta">
            Name
          </label>
          <input
            type="text"
            autoComplete="username"
            placeholder="e.g. Primus"
            value={name}
            onChange={e => { setName(e.target.value) }}
            className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-inter outline-none border-2 transition-all"
            style={{
              background:  '#1E1C19',
              borderColor: name ? '#D97706' : 'transparent',
            }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest font-jakarta">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value) }}
            className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-inter outline-none border-2 transition-all"
            style={{
              background:  '#1E1C19',
              borderColor: password ? '#D97706' : 'transparent',
            }}
          />
        </div>

        {/* Error */}
        {loginError && (
          <p className="text-xs text-rose-400 font-inter px-1">{loginError}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-sm font-jakarta text-white transition-all mt-2"
          style={{
            background:  loading ? '#78716C' : 'linear-gradient(135deg, #F59E0B, #D97706)',
            boxShadow:   loading ? 'none'    : '0 4px 20px rgba(217,119,6,0.4)',
          }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
