# DevUtils - Developer Tools & Utilities

A comprehensive suite of developer tools built with **Next.js 14** for optimal SEO and performance. All tools work offline and respect your privacy - no data is sent to any server.

![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🚀 **30+ Developer Tools** - Format, convert, encode, decode, and generate
- 🎯 **SEO Optimized** - Built with Next.js App Router for excellent search visibility
- 🌙 **Dark Mode** - Beautiful dark/light theme with system preference detection
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Blazing Fast** - Server-side rendering with automatic code splitting
- 🔒 **Privacy First** - All processing happens in your browser
- 🎨 **Modern UI** - Clean interface with Tailwind CSS and Lucide icons
- ♿ **Accessible** - Keyboard navigation and screen reader support

## 🛠️ Available Tools

### Format & Transform
- **JSON Tools** - Format, minify, validate, fix, visualize as graph, convert
- **YAML Converter** - Convert between YAML and JSON
- **CSV Converter** - Convert between CSV and JSON
- **SQL Formatter** - Format and beautify SQL queries
- **Code Formatter** - Format JavaScript, TypeScript, HTML, CSS, and more
- **Code Minifier** - Minify code to reduce file size

### Encode & Decode
- **Base64** - Encode and decode Base64 strings
- **URL Tools** - Parse, encode, and decode URLs
- **Hash Generator** - Generate MD5, SHA-1, SHA-256, SHA-512 hashes

### Generate & Test
- **UUID Generator** - Generate v4 UUIDs
- **Regex Tester** - Test and debug regular expressions
- **Cron Expression** - Build and understand cron expressions
- **Password Generator** - Generate secure random passwords
- **Fake Data Generator** - Generate test data for development
- **QR Code** - Generate QR codes from text

### Utilities
- **Diff Viewer** - Compare text differences side-by-side
- **String Inspector** - Analyze string properties and encoding
- **Color Tools** - Convert between color formats (HEX, RGB, HSL)
- **World Clock** - View time across different timezones
- **Unix Timestamp** - Convert between Unix timestamps and dates
- **JWT Debugger** - Decode and verify JSON Web Tokens
- **HTTP Builder** - Build and test HTTP requests
- **Markdown Preview** - Preview Markdown in real-time

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ponnamkarthik/devutils
cd devutils

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
devutils/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with SEO metadata
│   ├── page.tsx           # Home page
│   ├── sitemap.ts         # Dynamic sitemap
│   ├── robots.ts          # Robots.txt
│   └── [tool]/            # Individual tool routes
├── components/            # React components
│   ├── LayoutNext.tsx    # Navigation and layout
│   ├── MonacoEditor.tsx  # Code editor component
│   └── UI.tsx            # Reusable UI components
├── pages/                # Tool implementations
├── hooks/                # Custom React hooks
├── styles/              # Global styles and Tailwind config
├── public/              # Static assets
└── next.config.js       # Next.js configuration
```

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.4
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React
- **Code Editor:** Monaco Editor (VS Code's editor)
- **State Management:** React Hooks
- **Data Parsing:** PapaParse, js-yaml, Prism.js
- **Utilities:** sql-formatter, cronstrue, qrcode, Dagre

## 🔧 Configuration

### Next.js Config

Edit `next.config.js` to customize:
- Image optimization
- Security headers
- Webpack configuration
- Compression settings

## 📊 SEO Features

- ✅ Server-side rendering (SSR)
- ✅ Dynamic metadata API
- ✅ OpenGraph tags
- ✅ Twitter cards
- ✅ Structured data
- ✅ XML sitemap
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ PWA manifest

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Lucide](https://lucide.dev/) - Beautiful icon set

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/ponnamkarthik/devutils/issues)

---

Made with ❤️ by developers, for developers.

**[View Live Demo](https://devutils.karthikponnam.dev/)** 
