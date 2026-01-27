
# Add Project Images to Developer Catalog Cards

## Overview

Enhance the Market Search feature to capture and display project images on each developer project card. The images will be extracted from the developer websites during the scraping process.

## Architecture

The solution leverages Firecrawl's ability to extract links (including image URLs) from pages, combined with AI-powered matching to associate the right image with each project.

```text
+------------------+     +-----------------+     +--------------------+
|  Firecrawl API   | --> | Edge Function   | --> | DeveloperProject   |
|  (markdown +     |     | (AI extracts    |     | Card with Image    |
|   links format)  |     |  imageUrl)      |     |                    |
+------------------+     +-----------------+     +--------------------+
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/api/firecrawl.ts` | Add `imageUrl` field to `ScrapedProject` type |
| `src/components/listings/DeveloperCatalog.tsx` | Request `links` format, pass to AI |
| `supabase/functions/developer-project-scrape/index.ts` | Extract `imageUrl` in AI prompt |
| `src/components/listings/DeveloperProjectCard.tsx` | Display image at top of card |
| Demo data | Add sample image URLs |

---

## Detailed Changes

### 1. Update `ScrapedProject` Type

Add optional `imageUrl` field:

```typescript
export type ScrapedProject = {
  name: string;
  // ... existing fields
  imageUrl: string | null;  // NEW: Project hero image URL
};
```

### 2. Modify Firecrawl Scrape Request

Update `DeveloperCatalog.tsx` to request both markdown and links:

```typescript
const scrapeResponse = await firecrawlApi.scrape(url, {
  formats: ['markdown', 'links'],  // Add 'links' format
  onlyMainContent: false,  // Get full page for more images
  waitFor: 5000,
});
```

Pass the links array to the AI extraction function so it can match images to projects.

### 3. Update AI Extraction Prompt

Modify the `developer-project-scrape` edge function to:

1. Accept image links in the request body
2. Add `imageUrl` to the extraction schema
3. Update the system prompt to instruct AI to match project names with relevant image URLs

```typescript
// In extraction schema
imageUrl: { 
  type: 'string', 
  nullable: true, 
  description: 'Direct URL to project hero/thumbnail image' 
}

// Enhanced prompt
"- Match each project with its hero image URL from the provided links"
"- Prefer high-quality render images over logos or icons"
```

### 4. Update Card Component

Add image display at the top of each card:

```typescript
<Card>
  <CardContent>
    {/* NEW: Project Image */}
    {project.imageUrl ? (
      <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-muted">
        <img 
          src={project.imageUrl} 
          alt={project.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    ) : (
      <div className="aspect-video rounded-lg mb-3 bg-muted flex items-center justify-center">
        <Building2 className="h-12 w-12 text-muted-foreground/50" />
      </div>
    )}
    {/* Existing content */}
  </CardContent>
</Card>
```

### 5. Update Demo Data

Add sample image URLs to the demo projects for testing:

```typescript
{
  name: 'Saadiyat Lagoons',
  imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  // ...
}
```

---

## Technical Details

### Image Extraction Strategy

The AI will receive:
1. **Markdown content** - Contains project names and descriptions
2. **Links array** - All URLs from the page including images

The AI will match images to projects by:
- Looking for image URLs containing project name keywords
- Identifying render/hero images (typically larger, .jpg/.webp)
- Avoiding logos, icons, and UI elements

### Fallback Behavior

- If no image is found: Show a placeholder with Building2 icon
- If image fails to load: Hide the broken image gracefully
- Demo mode: Use high-quality Unsplash real estate images

### Performance Considerations

- Images are loaded lazily by the browser
- Failed images don't break the card layout
- Placeholder maintains aspect ratio for consistent grid

---

## Summary

This enhancement will make the Developer Catalog more visually appealing and professional by showing actual project renders alongside the extracted data. The implementation leverages existing Firecrawl capabilities and adds minimal overhead to the scraping process.
