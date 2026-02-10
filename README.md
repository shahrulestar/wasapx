# WasapX — Chat Export Viewer

> Read and display your WhatsApp chat exports locally. Drop a `.zip` or `.txt` file to view conversations in a familiar chat layout. Nothing uploads. Everything runs in your browser.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fwasapx)

**Live Demo** — [wasapx.vercel.app](https://wasapx.vercel.app)

## Features

- **100% Client-Side** — All parsing and rendering happens in your browser. No data leaves your device.
- **ZIP & TXT Support** — Drop a `.zip` (with media) or plain `.txt` file exported from WhatsApp.
- **Media Preview** — Images, videos, audio, and PDFs from ZIP exports are displayed inline.
- **Date Range Filter** — Filter conversations by date or date range with a calendar picker.
- **Dark Mode** — Supports light, dark, and system themes.
- **Large File Support** — Handles exports up to 5 GB (with zip-bomb protection).
- **Responsive** — Works on desktop, tablet, and mobile browsers.
- **iOS & Android** — Supports both WhatsApp export formats.

## How It Works

1. Export a chat from WhatsApp (Settings → Chats → Export Chat).
2. Open [WasapX](https://wasapx.vercel.app) in your browser.
3. Drag and drop (or browse) the `.zip` or `.txt` file.
4. View your conversation in a familiar chat layout.

## Privacy

- No data is uploaded to any server.
- No cookies, no accounts, no sign-in.
- All parsing and rendering happens locally in your browser.
- Media files from ZIP exports are loaded as in-memory blob URLs.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| Icons | [Lucide](https://lucide.dev) |
| ZIP Extraction | [JSZip](https://stuk.github.io/jszip/) |
| Date Utilities | [date-fns](https://date-fns.org), [react-day-picker](https://react-day-picker.js.org) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18.18+
- [pnpm](https://pnpm.io) (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/shahrulestar/wasapx.git
cd wasapx

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
wasapx/
├── app/
│   ├── layout.tsx          # Root layout, metadata, fonts
│   ├── page.tsx            # Home page (upload + chat viewer)
│   ├── globals.css         # Global styles
│   ├── robots.ts           # robots.txt generation
│   └── sitemap.ts          # Sitemap generation
├── components/
│   ├── chat-bubble.tsx     # Individual message bubble
│   ├── chat-header.tsx     # Chat view header
│   ├── chat-viewer.tsx     # Main chat display
│   ├── date-range-filter.tsx # Date filtering UI
│   ├── file-upload.tsx     # Drag-and-drop file upload
│   ├── theme-provider.tsx  # Theme context provider
│   ├── theme-toggle.tsx    # Light/dark/system toggle
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── parse-chat.ts       # Chat parsing & ZIP extraction
│   └── utils.ts            # Utility helpers
└── public/
    ├── llms.txt            # LLM-friendly project description
    └── og.png              # Open Graph image
```

## Supported Export Formats

| Platform | `.txt` | `.zip` (with media) |
|----------|--------|---------------------|
| WhatsApp iOS | Yes | Yes |
| WhatsApp Android | Yes | Yes |

## Deploy

The easiest way to deploy WasapX is with [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fwasapx)

## License

This project is open source. See the [LICENSE](LICENSE) file for details.
