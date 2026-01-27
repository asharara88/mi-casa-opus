import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Calendar,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScrapedArticle } from '@/lib/api/firecrawl';

interface BlogArticleCardProps {
  article: ScrapedArticle;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Market Trend': 'bg-blue-500/20 text-blue-600',
  'Investment': 'bg-emerald-500/20 text-emerald-600',
  'Development': 'bg-amber-500/20 text-amber-600',
  'Regulatory': 'bg-purple-500/20 text-purple-600',
  'Community': 'bg-cyan-500/20 text-cyan-600',
  'General': 'bg-muted text-muted-foreground',
};

const SENTIMENT_CONFIG = {
  bullish: { icon: TrendingUp, color: 'text-emerald-500', label: 'Bullish' },
  bearish: { icon: TrendingDown, color: 'text-destructive', label: 'Bearish' },
  neutral: { icon: Minus, color: 'text-muted-foreground', label: 'Neutral' },
};

export function BlogArticleCard({ article }: BlogArticleCardProps) {
  const sentimentConfig = SENTIMENT_CONFIG[article.sentiment] || SENTIMENT_CONFIG.neutral;
  const SentimentIcon = sentimentConfig.icon;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="h-36 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={cn(
          "flex items-center justify-center w-full h-full",
          article.imageUrl && "hidden"
        )}>
          <Newspaper className="h-10 w-10 text-muted-foreground/50" />
        </div>
      </div>

      <CardContent className="p-4">
        {/* Category & Sentiment */}
        <div className="flex items-center justify-between mb-2">
          <Badge className={cn('text-xs', CATEGORY_COLORS[article.category] || CATEGORY_COLORS.General)}>
            {article.category}
          </Badge>
          <div className={cn('flex items-center gap-1 text-xs', sentimentConfig.color)}>
            <SentimentIcon className="h-3.5 w-3.5" />
            <span>{sentimentConfig.label}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-sm line-clamp-2 mb-2">{article.title}</h4>

        {/* Summary */}
        <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{article.summary}</p>

        {/* Key Insights */}
        {article.keyInsights && article.keyInsights.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium mb-1">Key Insights:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {article.keyInsights.slice(0, 2).map((insight, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="line-clamp-1">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Communities */}
        {article.relevantCommunities && article.relevantCommunities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.relevantCommunities.slice(0, 3).map((community, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0">
                {community}
              </Badge>
            ))}
          </div>
        )}

        {/* Meta & Link */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {article.publishDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(article.publishDate).toLocaleDateString()}</span>
              </div>
            )}
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[80px]">{article.author}</span>
              </div>
            )}
          </div>
          {article.sourceUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => window.open(article.sourceUrl!, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Read
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
