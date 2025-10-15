# MILLCARS — Desarrollo local con Cloudflare Pages (instrucciones cortas)

Este documento contiene solamente los pasos necesarios para instalar y ejecutar el proyecto en un entorno local, incluyendo la emulación de Cloudflare Pages.

## Requisitos
- Node.js 16+ (recomendado)
- npm (o yarn/pnpm)
- Acceso a `npx` (wrangler se usa vía npx para evitar instalaciones globales)

## Instalación
1. Clona el repositorio e instala dependencias:

```bash
git clone <repo-url>
cd millcars-web
npm install
```

## Ejecución local (desarrollo)

- Desarrollo normal (UI, componentes):

```bash
npm run dev
# abre http://localhost:3000
```

- Compilar SCSS en modo watch (si trabajas estilos):

```bash
npm run sass
```

## Emulación de Cloudflare Pages (solo si necesitas probar Pages Functions / bindings)

Usar wrangler para emular Pages y ejecutar Next.js dentro de la emulación:

```bash
npm run dev:pages
```

Esto ejecuta internamente:

```bash
npx wrangler pages dev --compatibility-flag=nodejs_compat -- npx next dev
```

Si ejecutas `wrangler pages dev` directamente debes pasarle el comando a ejecutar después del `--`. Si lo llamas sin comando obtendrás el error:

```
[ERROR] Must specify a directory of static assets to serve, or a command to run, or a proxy port, or configure `pages_build_output_dir` in your Wrangler configuration file.
```

## Build y ejecución en modo producción (local)

```bash
npm run build
npm run start
```

## Limpieza y notas sobre configuración

- No subas `wrangler.toml` con `account_id` o configuraciones sensibles al repo. Usa `wrangler.example.toml` como plantilla.
- `.gitignore` ya excluye `.wrangler/` y `wrangler.toml` locales; mantén esa práctica.
- Para eliminar artefactos de wrangler generados durante pruebas:

```bash
rm -rf .wrangler
```

### Limpieza y validación (comandos exactos)

Estos son los comandos que se usan para dejar el proyecto en un estado limpio y validar los pasos del README.

- Eliminar artefactos de build, temporales de wrangler y dependencias instaladas:

```bash
rm -rf .next .wrangler node_modules
```

- (Opcional) limpiar cache de npm si hay problemas:

```bash
npm cache clean --force
```

- Reinstalar dependencias:

```bash
npm install
```

- Validación rápida (en ventanas/terminales separadas o secuencialmente):

1) Levantar desarrollo normal y comprobar UI:

```bash
npm run dev
# abrir http://localhost:3000
```

2) Probar emulación de Cloudflare Pages (si la necesitas):

```bash
npm run dev:pages
# espera que wrangler inicie y que next corra dentro de la emulación
```

3) Probar build y servidor de producción local:

```bash
npm run build
npm run start
```


