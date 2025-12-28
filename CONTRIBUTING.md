# Contributing to Trust Scan

Thank you for your interest in contributing to Trust Scan! We're excited to have you here.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

When filing a bug report, include:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment (browser, OS, etc.)

### Suggesting Enhancements

We welcome feature suggestions! Please:
- Check existing issues first
- Describe the use case
- Explain why this would be valuable to users
- Consider the scope (is it broadly useful?)

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** with clear, focused commits
4. **Test your changes**: `npm run build && npm run lint`
5. **Submit a PR** with a clear description

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/trust-scan.git
cd trust-scan

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Set up database
npx prisma db push

# Start dev server
npm run dev
```

### Code Style

- Use TypeScript
- Follow existing code patterns
- Write meaningful commit messages
- Keep changes focused and atomic

### What We're Looking For

- Bug fixes
- Documentation improvements
- Performance optimizations
- New pattern detection rules
- Accessibility improvements
- UI/UX enhancements

### What We Probably Won't Accept

- Breaking changes without discussion
- Features that add significant complexity
- Changes that compromise security
- Additions that conflict with our minimalist philosophy

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Questions?

Feel free to open an issue for questions or reach out at contact@undeadlist.com.

---

Thank you for helping make Trust Scan better!
