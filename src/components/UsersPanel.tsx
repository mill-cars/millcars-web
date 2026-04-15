import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'administrador' | 'vendedor' | 'cliente';
type TabFilter = 'todos' | Role;

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
  last_sign_in: string | null;
}

interface UsersPanelProps {
  /** Search query driven from AdminHeader */
  searchQuery?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string | null, email: string): string {
  if (name) {
    const p = name.trim().split(' ');
    return (p[0]?.[0] ?? '') + (p[1]?.[0] ?? p[0]?.[1] ?? '');
  }
  return email.slice(0, 2).toUpperCase();
}

const ROLE_STYLES: Record<Role, string> = {
  administrador: 'bg-primary/10 text-primary',
  vendedor: 'bg-surface-container-high text-on-surface-variant',
  cliente: 'bg-surface-container-low text-on-surface-variant',
};
const ROLE_LABELS: Record<Role, string> = {
  administrador: 'Administrador',
  vendedor: 'Vendedor',
  cliente: 'Cliente',
};
const AVATAR_BG: Record<Role, string> = {
  administrador: 'bg-primary-fixed text-primary',
  vendedor: 'bg-secondary-fixed text-secondary',
  cliente: 'bg-surface-variant text-on-surface-variant',
};

function fmt(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ITEMS_PER_PAGE = 10;

// ─── Add User Modal ───────────────────────────────────────────────────────────
interface AddUserModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function AddUserModal({ onClose, onCreated }: AddUserModalProps) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'vendedor' as 'administrador' | 'vendedor' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // 1. Create the auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSaving(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError('No se pudo obtener el ID del usuario.');
      setSaving(false);
      return;
    }

    // 2. Upsert profile with the chosen role (trigger may run first, this override wins)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: userId, email: form.email, full_name: form.full_name, role: form.role }, { onConflict: 'id' });

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    onCreated();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <span className="material-symbols-outlined text-primary text-xl">person_add</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Añadir usuario</h2>
              <p className="text-xs text-slate-500">Solo administradores y vendedores</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-slate-500 text-xl">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nombre completo</label>
            <input
              required
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Ej: María González"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Correo electrónico</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="nombre@millcars.com"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Contraseña temporal</label>
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Rol</label>
            <div className="flex gap-3">
              {(['administrador', 'vendedor'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    form.role === r
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function UsersPanel({ searchQuery = '' }: UsersPanelProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabFilter>('todos');
  const [page, setPage] = useState(1);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setProfiles((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [searchQuery]);

  // Derived list: apply external search + tab filter
  const filtered = profiles.filter(p => {
    const matchTab = tab === 'todos' || p.role === tab;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || (p.full_name ?? '').toLowerCase().includes(q)
      || p.email.toLowerCase().includes(q)
      || p.role.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const changeRole = async (id: string, role: Role) => {
    setActionMenuId(null);
    await supabase.from('profiles').update({ role }).eq('id', id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role } : p));
  };

  const toggleActive = async (id: string, current: boolean) => {
    setActionMenuId(null);
    await supabase.from('profiles').update({ is_active: !current }).eq('id', id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
  };

  const count = (t: TabFilter) =>
    t === 'todos' ? profiles.length : profiles.filter(p => p.role === t).length;

  const TABS: { key: TabFilter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'administrador', label: 'Administradores' },
    { key: 'vendedor', label: 'Vendedores' },
    { key: 'cliente', label: 'Clientes' },
  ];

  useEffect(() => {
    const close = () => setActionMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <div className="p-6 sm:p-8 min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 mb-2">
            Gestión de Usuarios
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed text-sm sm:text-base">
            Administra los permisos, roles y estados de los usuarios en la plataforma MILLCARS.
          </p>
        </div>
        {/* Only button: Add User (admins & sellers only) */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          Añadir usuario
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); }}
            className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors tracking-wide ${
              tab === t.key
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              tab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {count(t.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl mr-3">progress_activity</span>
            <span className="text-sm font-medium">Cargando usuarios…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
            <span className="material-symbols-outlined text-5xl">error</span>
            <p className="text-sm font-medium">{error}</p>
            <button onClick={fetchProfiles} className="text-xs text-blue-600 hover:underline">Reintentar</button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <span className="material-symbols-outlined text-5xl">person_off</span>
            <p className="text-sm font-medium">
              {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No se encontraron usuarios'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Nombre</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Rol</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Último acceso</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Registro</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginated.map(profile => (
                <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name ?? profile.email}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${AVATAR_BG[profile.role]}`}>
                          {initials(profile.full_name, profile.email)}
                        </div>
                      )}
                      <span className="font-semibold text-slate-900 dark:text-slate-50 text-sm">
                        {profile.full_name ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">{profile.email}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${ROLE_STYLES[profile.role]}`}>
                      {ROLE_LABELS[profile.role]}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${profile.is_active ? 'bg-green-400' : 'bg-slate-300'}`} />
                      <span className={`text-xs font-medium ${profile.is_active ? 'text-green-700 dark:text-green-400' : 'text-slate-400'}`}>
                        {profile.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">{fmt(profile.last_sign_in)}</td>
                  <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">{fmt(profile.created_at)}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActionMenuId(actionMenuId === profile.id ? null : profile.id)}
                        className="material-symbols-outlined text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        more_vert
                      </button>
                      {actionMenuId === profile.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden">
                          <div className="p-1">
                            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cambiar rol</p>
                            {(['administrador', 'vendedor', 'cliente'] as Role[]).map(r => (
                              <button
                                key={r}
                                onClick={() => changeRole(profile.id, r)}
                                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                  profile.role === r
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                              >
                                {profile.role === r && <span className="material-symbols-outlined text-sm">check</span>}
                                {ROLE_LABELS[r]}
                              </button>
                            ))}
                            <hr className="my-1 border-slate-200 dark:border-slate-700" />
                            <button
                              onClick={() => toggleActive(profile.id, profile.is_active)}
                              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                profile.is_active
                                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                  : 'text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {profile.is_active ? 'person_off' : 'person_check'}
                              </span>
                              {profile.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Pagination */}
      {!loading && !error && filtered.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
          <p>
            Mostrando {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                  n === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => { setShowAddModal(false); fetchProfiles(); }}
        />
      )}
    </div>
  );
}
