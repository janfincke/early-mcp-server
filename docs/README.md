# EARLY MCP Server Documentation

This directory contains the complete documentation for the EARLY MCP Server, built with [MkDocs](https://www.mkdocs.org/) and the [Material theme](https://squidfunk.github.io/mkdocs-material/).

## 📚 Documentation Structure

```
docs/
├── index.md                     # Landing page with project overview
├── getting-started.md           # Installation and setup guide  
├── tools/
│   ├── index.md                # Tools overview and reference
│   ├── create_time_entry.md    # Complete tool documentation
│   ├── edit_time_entry.md      # (6 tools total)
│   ├── get_time_entries.md
│   ├── list_activities.md
│   ├── start_timer.md
│   └── stop_timer.md
├── assets/
│   └── extra.css               # Custom styling
├── _work/                      # Working files (ignored by MkDocs)
│   └── artifacts/
│       └── tool-audit.md       # Documentation audit results
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## 🚀 Local Development

### Prerequisites

- Python 3.8+
- pip

### Setup

1. **Install dependencies:**
   ```bash
   pip install -r docs/requirements.txt
   ```

2. **Serve locally:**
   ```bash
   mkdocs serve
   ```

3. **Open in browser:**
   - Local site: http://localhost:8000
   - Auto-reload when files change

### Build Static Site

```bash
mkdocs build
```

Generated site appears in `site/` directory.

## 🌐 GitHub Pages Deployment

Documentation is automatically deployed to GitHub Pages via GitHub Actions:

- **Workflow**: `.github/workflows/docs.yml`
- **Trigger**: Push to `main` branch
- **URL**: https://janfincke.github.io/early-mcp-server/
- **Build**: Automated via GitHub Actions

### Manual Deployment

If needed, you can deploy manually:

```bash
mkdocs gh-deploy
```

## 📝 Writing Documentation

### Adding New Pages

1. Create `.md` file in appropriate directory
2. Add to navigation in `mkdocs.yml`
3. Use consistent formatting and anchors

### Formatting Standards

- **Headers**: Always include anchor links (`{#anchor-name}`)
- **Code blocks**: Use language identifiers for syntax highlighting
- **Links**: Use relative paths for internal links
- **Tables**: Use the `schema-table` class for parameter tables
- **Admonitions**: Use for tips, warnings, and info boxes

### Custom CSS Classes

- `.param-required` - Red styling for required parameters
- `.param-optional` - Gray styling for optional parameters  
- `.tool-status-implemented` - Green badge for completed tools
- `.schema-table` - Enhanced styling for parameter tables

## 🔄 Workflow

### Documentation Updates

1. **Edit content** in `docs/` directory
2. **Test locally** with `mkdocs serve`
3. **Commit changes** to repository
4. **Push to main** - triggers automatic deployment
5. **Verify deployment** at GitHub Pages URL

### Adding New Tools

When implementing new MCP tools:

1. Create tool documentation file: `docs/tools/new_tool.md`
2. Follow existing tool documentation template
3. Add to navigation in `mkdocs.yml`
4. Update tools index page: `docs/tools/index.md`
5. Cross-reference in related tool pages

## 🎨 Customization

### Theme Configuration

Configured in `mkdocs.yml`:
- Material theme with blue color scheme
- Dark/light mode toggle
- Navigation features (tabs, sections, search)
- Code highlighting and copy buttons

### Custom Styling

Additional styles in `docs/assets/extra.css`:
- Tool parameter styling
- Enhanced table formatting  
- Status badges and indicators
- Responsive design improvements

## 📊 Quality Checklist

Before publishing documentation updates:

- [ ] All internal links work correctly
- [ ] Code examples include language identifiers
- [ ] Headers include anchor links (`{#anchor}`)
- [ ] Parameter tables use consistent formatting
- [ ] Screenshots and examples are current
- [ ] Cross-references between tools are accurate
- [ ] Local build succeeds without warnings

## 🛠️ Troubleshooting

### Common Issues

**Build fails:**
- Check `mkdocs.yml` syntax
- Verify all linked files exist
- Ensure Python dependencies are installed

**Links broken:**
- Use relative paths for internal links
- Check file paths are correct
- Verify anchor links match headers

**Styling issues:**  
- Check `extra.css` syntax
- Verify CSS class names in markdown
- Test in both light and dark modes

### Getting Help

- [MkDocs Documentation](https://www.mkdocs.org/)
- [Material Theme Guide](https://squidfunk.github.io/mkdocs-material/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

**Documentation Status**: ✅ Complete - All 6 tools documented  
**Last Updated**: 2025-10-14  
**Deployment**: Automated via GitHub Actions