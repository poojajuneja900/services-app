# SERVICE-APP — Claude Project Memory

## Project Overview
A Python-based service application. This file is read automatically by Claude Code at the start of every session to provide project context.

## Tech Stack
- **Language**: Python 3
- **Environment**: Virtual environment (`.venv/`)
- **Package Manager**: pip (or uv if available)

## Project Structure
```
SERVICE-APP/
├── .claude/          # Claude Code configuration & memory
│   ├── CLAUDE.md     # This file — project context for Claude
│   └── settings.json # Claude Code settings
├── .venv/            # Virtual environment (git-ignored)
├── .env              # Environment variables (git-ignored)
├── .env.example      # Example env vars (committed)
└── .gitignore
```

## Common Commands

### Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Run
```bash
# Run the application (update path as needed)
python main.py
```

### Testing
```bash
pytest
```

## Environment Variables
Copy `.env.example` to `.env` and fill in values. Never commit `.env`.

## Conventions
- Follow PEP 8 for Python code style
- Use type hints where practical
- Keep secrets in `.env`, never hard-coded
- All new dependencies must be added to `requirements.txt`

## Notes
<!-- Add project-specific notes, gotchas, and context here as the project grows -->
