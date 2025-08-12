# Markdown Converter

A secure, client-side markdown converter that transforms `.md`, `.markdown`, and `.txt` files into HTML, JSON, and plain text formats. Built with Next.js and designed for privacy-first file processing.

## 🌟 Features

- **🔒 Privacy-First**: All processing happens in your browser - files never leave your device
- **⚡ Fast Conversion**: Instant conversion to multiple formats
- **🛡️ Security-Focused**: Built-in XSS protection, content sanitization, and rate limiting
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🎨 Multiple Formats**: Export to HTML, JSON, and plain text
- **📂 Easy File Handling**: Drag & drop or click to upload

## 🚀 Supported Formats

### Input
- `.md` - Markdown files
- `.markdown` - Markdown files
- `.txt` - Plain text files

### Output
- **HTML** - Styled web pages with embedded CSS
- **JSON** - Structured data with metadata
- **Plain Text** - Clean, formatted text

## 🔧 Technical Features

- **Security**: XSS protection, content sanitization, rate limiting
- **File Validation**: Type checking, size limits (10MB max)
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Client-Side Processing**: No server uploads, maximum privacy
- **Responsive Design**: Navy blue and dark theme

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd markdown-converter
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 🌐 Deployment

This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with zero configuration

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 🔒 Security Features

- **Content Sanitization**: Uses DOMPurify to clean HTML output
- **XSS Protection**: Filters malicious content patterns
- **Rate Limiting**: Client-side request throttling
- **File Validation**: Strict type and size checking
- **CSP Headers**: Content Security Policy implementation
- **Safe Downloads**: Sanitized filenames and secure blob handling

## 📊 Markdown Features Supported

- Headers (H1-H6)
- Bold and italic text
- Lists (ordered and unordered)
- Code blocks and inline code
- Links and images
- Tables
- Blockquotes
- Horizontal rules

## 🎨 Theming

The application uses a navy blue and dark color scheme:
- Primary: Navy blue variants
- Background: Dark grays and blacks
- Accent: White and light grays
- Status: Green (success), Red (error), Yellow (warning)

## 📁 Project Structure

\`\`\`
├── app/                  # Next.js app directory
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/          # React components
│   ├── FileUpload.tsx   # File upload component
│   ├── ConversionPanel.tsx # Conversion interface
│   └── MarkdownPreview.tsx # Preview component
├── lib/                 # Utility libraries
│   ├── security.ts      # Security utilities
│   ├── markdown-parser.ts # Markdown parsing
│   ├── converters.ts    # Format converters
│   └── file-handler.ts  # File operations
└── public/              # Static assets
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- PDF export functionality
- DOCX format support
- Batch file processing
- Custom CSS themes
- Advanced markdown extensions
- File compression options

## 🐛 Issues & Support

If you encounter any issues or have questions, please [open an issue](https://github.com/your-username/markdown-converter/issues) on GitHub.

---

Built with ❤️ using Next.js and deployed on Vercel.
