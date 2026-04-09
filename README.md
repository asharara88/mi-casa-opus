# Mi Casa Opus

Mi Casa Real Estate — Internal Operations Platform

## Structure

```
├── crm/              Internal CRM (Ahmed & team)
│   └── index.html
├── portfolio/        Read-only dashboard (Mubarak / partners)
│   └── index.html
├── scripts/          Utilities
│   └── upload-photos.sh
└── supabase/
    └── migrations/   Database schema
```

## Deployment

**Portfolio** auto-deploys to GitHub Pages on every push to `main`.

**CRM** — open `crm/index.html` in any browser. Connects live to Supabase.

## Upload Photos

```bash
cd scripts
bash upload-photos.sh
```

Requires: `curl`, photos in same folder.

## Supabase

Project: `dhwppkevuquwtavvqaan`  
Region: ap-south-1
