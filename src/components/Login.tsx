import React, { useState } from 'react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-3 py-1 text-on-primary-fixed">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Acceso seguro</span>
            </div>

            <div className="space-y-5">
              <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Volver al inventario
              </a>
              <h1 className="max-w-xl text-5xl font-black tracking-tighter leading-[0.95] text-on-surface sm:text-6xl lg:text-7xl">
                Bienvenido al <span className="text-primary italic">Showroom Digital.</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-on-surface-variant">
                Inicia sesión para gestionar tu inventario, revisar publicaciones y operar la administración sin distracciones.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-2 gap-4">
              <div className="rounded-2xl bg-surface-container-low p-6">
                <div className="text-3xl font-black text-primary">12k+</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-outline">Curadores activos</div>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-6">
                <div className="text-3xl font-black text-primary">98%</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-outline">Tasa de precisión</div>
              </div>
            </div>
          </section>

          <section className="w-full">
            <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm sm:p-10">
              <div className="mb-8 space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">Iniciar sesión</h2>
                <p className="text-sm text-on-surface-variant">Ingresa tus datos para gestionar tu inventario.</p>
              </div>

              <div className="space-y-4">
                <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-outline-variant bg-surface px-4 py-3 transition-colors hover:bg-surface-container">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="text-sm font-semibold text-on-surface">Inicia sesión con Google</span>
                </button>

                <div className="relative flex items-center py-4">
                  <div className="flex-1 border-t border-outline-variant/30" />
                  <span className="mx-4 flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.3em] text-outline">O vía correo</span>
                  <div className="flex-1 border-t border-outline-variant/30" />
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-bold uppercase tracking-[0.3em] text-outline" htmlFor="email">
                      Correo electrónico
                    </label>
                    <input
                      className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      id="email"
                      placeholder="nombre@millcars.com"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between gap-3">
                      <label className="block text-xs font-bold uppercase tracking-[0.3em] text-outline" htmlFor="password">
                        Contraseña
                      </label>
                      <a className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary transition-colors hover:text-slate-900" href="#">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <input
                      className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  <button
                    className="mt-2 w-full rounded-2xl bg-primary px-4 py-3.5 font-bold text-on-primary transition-transform hover:scale-[1.01] active:scale-[0.98]"
                    type="submit"
                  >
                    Continuar acceso
                  </button>
                </form>
              </div>

              <div className="mt-8 rounded-2xl bg-primary-fixed/20 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-primary-fixed-variant">¿Eres nuevo en MILLCARS?</p>
                <p className="mt-2 text-sm leading-relaxed text-on-primary-fixed-variant">
                  Si no tienes acceso, contacta al equipo de administración para la activación de tu cuenta.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
