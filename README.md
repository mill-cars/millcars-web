# Millcars Web

## Releases automaticos con Semantic Release

El proyecto usa GitHub Actions + semantic-release para versionado profesional en produccion.

### Que se genera automaticamente al hacer merge a main

- Nueva version SemVer segun Conventional Commits.
- Tag git con formato `vX.Y.Z`.
- GitHub Release con notas de cambios.
- Actualizacion de `CHANGELOG.md`.

### Reglas de commit

Usar Conventional Commits:

- `feat:` para nuevas funcionalidades (minor).
- `fix:` para correcciones (patch).
- `feat!:` o footer `BREAKING CHANGE:` para cambios incompatibles (major).

No usar commits genericos.

### Estructura de mensajes de commit

Formato recomendado:

- tipo(alcance)!: descripcion corta

Ejemplos validos:

- feat(auth): agregar login con Google
- fix(cart): corregir calculo de impuestos
- perf(search): optimizar consulta de vehiculos
- feat(api)!: cambiar contrato de respuesta

Footer para cambios incompatibles:

- BREAKING CHANGE: descripcion del impacto

Tipos que generan version automaticamente:

- feat -> minor
- fix -> patch
- perf -> patch
- BREAKING CHANGE o ! -> major

Tipos que normalmente no generan version:

- docs
- chore
- style
- test
- refactor

### Convenciones de ramas

Para mantener un flujo ordenado y trazable, usar los siguientes prefijos de ramas:

- feature/... -> nuevas funcionalidades
- fix/... -> bugs
- hotfix/... -> urgencias en produccion
- release/... -> preparacion de version

### Convencion de releases del equipo

Objetivo:
Mantener trazabilidad y predecibilidad en cada release.

Reglas de versionado automatico (semantic-release):

- feat: genera version minor.
- fix: genera version patch.
- BREAKING CHANGE o feat!: genera version major.
- docs, chore, style, test y refactor: no generan version por si solos.

Reglas de trabajo:

- Hacer merge a main solo mediante Pull Request.
- Evitar commits genericos como "update" o "changes".
- Cada PR debe incluir contexto funcional y alcance tecnico.
- Si el cambio afecta produccion, incluir plan de rollback en la descripcion del PR.

Checklist minimo antes de merge a main:

1. Commits en formato Conventional Commits.
2. Build local exitoso.
3. PR aprobado.
4. Sin conflictos con main.

### Flujo configurado

- Workflow de release: `.github/workflows/release.yml`.
- Config semantic-release: `.release.config.js`.
- Rama de release: `main`.

### Deploy en Cloudflare Pages

El workflow de deploy publica desde `develop`:

- `.github/workflows/deploy-pages.yml`

### Escenario de prueba

1. Crear rama de trabajo y hacer commit con prefijo `feat:`.
2. Abrir Pull Request y mergear a `main`.
3. Verificar en Actions que corra el workflow `Release`.
4. Confirmar nuevo tag en GitHub (`vX.Y.Z`).
5. Confirmar GitHub Release creado.
6. Confirmar `CHANGELOG.md` actualizado.
7. Confirmar deploy de Cloudflare Pages desde `main`.

### Permisos requeridos en GitHub Actions

El workflow de release usa:

- `contents: write`
- `issues: write`
- `pull-requests: write`

Asegurar que el repositorio permita escritura con `GITHUB_TOKEN` para workflows.
