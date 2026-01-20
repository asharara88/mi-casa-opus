import { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Handshake, Building2, Clock } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string, entityId?: string) => void;
}

type SearchResultType = 'lead' | 'deal' | 'listing';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  section: string;
}

const TYPE_CONFIG: Record<SearchResultType, { icon: typeof Users; label: string; color: string }> = {
  lead: { icon: Users, label: 'Lead', color: 'bg-blue-500/10 text-blue-500' },
  deal: { icon: Handshake, label: 'Deal', color: 'bg-emerald-500/10 text-emerald-500' },
  listing: { icon: Building2, label: 'Listing', color: 'bg-amber-500/10 text-amber-500' },
};

export function MobileSearchSheet({ isOpen, onClose, onNavigate }: MobileSearchSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('bos-recent-searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    // Mock search results - in real app, this would query Supabase
    const allResults: SearchResult[] = [
      { id: '1', type: 'lead' as SearchResultType, title: 'Ahmed Al Rashid', subtitle: 'New • Portal', section: 'leads' },
      { id: '2', type: 'deal' as SearchResultType, title: 'D-001 • Villa Sale', subtitle: 'Viewing • 2.5M AED', section: 'deals' },
      { id: '3', type: 'listing' as SearchResultType, title: 'L-001 • Marina Apt', subtitle: 'Active • 1.8M AED', section: 'listings' },
    ];
    
    const filteredResults = allResults.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(filteredResults);
  };

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('bos-recent-searches', JSON.stringify(updated));

    onNavigate(result.section, result.id);
    onClose();
    setQuery('');
  };

  const handleRecentClick = (search: string) => {
    handleSearch(search);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('bos-recent-searches');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="top" className="h-[85vh] p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Search</SheetTitle>
        </SheetHeader>
        
        {/* Search Input */}
        <div className="sticky top-0 bg-background border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search leads, deals, listings..."
              className="pl-10 pr-10 h-12 text-base"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => { setQuery(''); setResults([]); }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {(['lead', 'deal', 'listing'] as SearchResultType[]).map((type) => {
              const config = TYPE_CONFIG[type];
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-8"
                  onClick={() => handleSearch(`type:${type}`)}
                >
                  <config.icon className="w-3.5 h-3.5 mr-1.5" />
                  {config.label}s
                </Button>
              );
            })}
          </div>
        </div>

        {/* Results / Recent Searches */}
        <div className="overflow-y-auto flex-1 p-4">
          {query.length >= 2 ? (
            <>
              {results.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
                    Results ({results.length})
                  </p>
                  {results.map((result) => {
                    const config = TYPE_CONFIG[result.type];
                    const Icon = config.icon;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left touch-manipulation"
                      >
                        <div className={cn("p-2 rounded-lg", config.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{result.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {config.label}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No results found for "{query}"</p>
                </div>
              )}
            </>
          ) : (
            <>
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Recent Searches
                    </p>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearRecent}>
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRecentClick(search)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left touch-manipulation"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recentSearches.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>Start typing to search</p>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
