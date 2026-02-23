# PROJECT_LOCKS (Takhmino)

## Global Locks
1) Global Font: Vazirmatn is enforced via app/layout.tsx
   - Root <body> uses vazirmatn.className
   - <html> sets dir="rtl" lang="fa"

## Academy Locks
1) Academy data module filename is: app/(light)/academy/_data/academy.data.tsx
   - Do NOT rename back to .ts
   - All Academy UI imports data via: ./_data/academy.data

## Change Protocol
- Any structural change (path/filename/route group/auth contract) MUST be recorded here immediately.
- Once recorded, do not revert unless a new lock entry explicitly supersedes it.