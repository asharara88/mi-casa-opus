

# Fix Developer Catalog: Rename to Market Search and Fix Import Flow

## Issues Identified

| Issue | Location | Problem |
|-------|----------|---------|
| Tab naming | `DeveloperCatalog.tsx` | Uses "Scrape" instead of "Market Search" |
| Loading text | `DeveloperCatalog.tsx` | Says "Scraping developer website..." |
| Toast messages | `DeveloperCatalog.tsx` | References "Scrape Complete" / "Scrape Failed" |
| How it works | `DeveloperCatalog.tsx` | Uses "scrape the website" terminology |
| Developer ID mismatch | `handleImportProject()` | `developer_projects.developer_id` expects `uuid`, code uses string `developerId` correctly but the developer lookup may fail |
| Null safety | `DeveloperProjectCard.tsx` | Need additional null guards for edge cases |

---

## Solution

### 1. Rename "Scrape" to "Market Search"

Update all user-facing labels:

| Current | New |
|---------|-----|
| Tab: "Scrape" | Tab: "Market Search" |
| "Scraping developer website..." | "Searching developer catalog..." |
| "Scrape Complete" | "Search Complete" |
| "Scrape Failed" | "Search Failed" |
| "We scrape the website" | "We search the website" |

### 2. Fix Import Functionality

The import flow has these issues:

1. **State initialization**: `activeTab` starts as `'scrape'` - needs to be `'search'`
2. **Developer lookup**: Currently case-insensitive which is good, but should handle edge cases
3. **Error handling**: Import errors should be more descriptive

### 3. Add Defensive Null Checks

Both components need additional guards:

```typescript
// DeveloperProjectCard - add guards for all optional fields
{project.community || 'Unknown'}, {project.location || 'Unknown'}

// Handle undefined projectType
{TYPE_ICONS[project.projectType] || TYPE_ICONS['Mixed'] || '🏠'}
```

---

## Files to Modify

### `src/components/listings/DeveloperCatalog.tsx`

1. **Line 153**: Change state initialization
   ```typescript
   const [activeTab, setActiveTab] = useState('search');
   ```

2. **Line 209-211**: Update toast title
   ```typescript
   toast({
     title: 'Search Complete',
     description: `Found ${extractResponse.data.projects.length} projects from ${extractResponse.data.developerInfo.name}`,
   });
   ```

3. **Line 215-218**: Update error toast
   ```typescript
   toast({
     title: 'Search Failed',
     description: error instanceof Error ? error.message : 'Unknown error',
     variant: 'destructive',
   });
   ```

4. **Lines 345-349**: Rename tabs
   ```typescript
   <TabsList className="mx-6 mt-4">
     <TabsTrigger value="search">Market Search</TabsTrigger>
     <TabsTrigger value="results" disabled={!scrapeResult}>
       Results {scrapeResult && `(${scrapeResult.projects.length})`}
     </TabsTrigger>
   </TabsList>
   ```

5. **Line 352**: Update TabsContent value
   ```typescript
   <TabsContent value="search" className="flex-1 p-6 pt-4">
   ```

6. **Lines 398-401**: Update loading text
   ```typescript
   <p className="text-sm">Searching developer catalog...</p>
   <p className="text-xs mt-1">This may take 15-30 seconds</p>
   ```

7. **Lines 409-413**: Update "How it works" text
   ```typescript
   <li>We search the website for project information</li>
   ```

### `src/components/listings/DeveloperProjectCard.tsx`

1. **Add null safety throughout**:
   - Line 74: Guard for `projectType`
   - Line 80: Guard for `community` and `location`
   - Line 84: Guard for `status`

2. **Improve STATUS_COLORS fallback**:
   ```typescript
   const statusClass = STATUS_COLORS[project.status || ''] || 'bg-muted text-muted-foreground';
   ```

---

## Summary of Changes

| File | Changes |
|------|---------|
| `DeveloperCatalog.tsx` | 8 text changes, 1 state variable update |
| `DeveloperProjectCard.tsx` | 5 null-safety guards |

These changes will:
- Rename "Scrape" to "Market Search" for professional terminology
- Ensure stable rendering with proper null guards
- Maintain the existing import functionality while making it more robust

