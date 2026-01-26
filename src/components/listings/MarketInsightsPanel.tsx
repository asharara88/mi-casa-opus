import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Lightbulb, BarChart3, Building2 } from 'lucide-react';
import type { MarketInsight } from '@/lib/api/firecrawl';

interface MarketInsightsPanelProps {
  insights: MarketInsight;
  summary: string;
}

export function MarketInsightsPanel({ insights, summary }: MarketInsightsPanelProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `AED ${(price / 1000000).toFixed(1)}M`;
    }
    return `AED ${(price / 1000).toFixed(0)}K`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDemandBadge = (level: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-emerald/20 text-emerald',
      medium: 'bg-amber-500/20 text-amber-600',
      low: 'bg-destructive/20 text-destructive',
    };
    return <Badge className={colors[level]}>{level.charAt(0).toUpperCase() + level.slice(1)} Demand</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            AI Market Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Average Price</div>
            <div className="text-lg font-bold text-foreground flex items-center gap-2">
              {formatPrice(insights.averagePrice)}
              {getTrendIcon(insights.priceTrend)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Market Demand</div>
            <div className="mt-1">
              {getDemandBadge(insights.demandLevel)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Price Range</div>
            <div className="text-sm font-medium text-foreground">
              {formatPrice(insights.priceRange.min)} - {formatPrice(insights.priceRange.max)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Competitors</div>
            <div className="text-lg font-bold text-foreground">
              {insights.competitorCount} listings
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Breakdown */}
      {insights.communityBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Community Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.communityBreakdown.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground">{item.community}</span>
                  <Badge variant="outline" className="text-xs">{item.count}</Badge>
                </div>
                <span className="font-medium text-primary">{formatPrice(item.avgPrice)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
