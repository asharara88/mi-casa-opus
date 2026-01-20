import { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MobilePipelineCard } from './MobilePipelineCard';

export type PipelineType = 'lead' | 'deal' | 'offplan' | 'secondary';

interface MobilePipelineViewProps<T> {
  type: PipelineType;
  items: T[];
  states: string[];
  stateLabels?: Record<string, string>;
  getItemState: (item: T) => string;
  getItemId: (item: T) => string;
  getItemTitle: (item: T) => string;
  getItemSubtitle: (item: T) => string;
  getItemValue?: (item: T) => number | undefined;
  getItemNextAction?: (item: T) => { type: string; due?: string } | null;
  onItemClick: (item: T) => void;
  onStateTransition?: (itemId: string, newState: string) => void;
  onSetNextAction?: (item: T) => void;
}

export function MobilePipelineView<T>({
  type,
  items,
  states,
  stateLabels,
  getItemState,
  getItemId,
  getItemTitle,
  getItemSubtitle,
  getItemValue,
  getItemNextAction,
  onItemClick,
  onStateTransition,
  onSetNextAction,
}: MobilePipelineViewProps<T>) {
  const [selectedState, setSelectedState] = useState<string>('all');

  const filteredItems = selectedState === 'all' 
    ? items 
    : items.filter(item => getItemState(item) === selectedState);

  const getStateCount = (state: string) => 
    items.filter(item => getItemState(item) === state).length;

  const totalCount = items.length;
  const activeCount = selectedState === 'all' ? totalCount : getStateCount(selectedState);

  const getStateLabel = (state: string) => stateLabels?.[state] || state;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const totalValue = filteredItems.reduce((sum, item) => {
    const value = getItemValue?.(item);
    return sum + (value || 0);
  }, 0);

  return (
    <div className="flex flex-col h-full">
      {/* State Filter Bar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 justify-between h-10">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">
                    {selectedState === 'all' ? 'All States' : getStateLabel(selectedState)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-5">
                    {activeCount}
                  </Badge>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem 
                onClick={() => setSelectedState('all')}
                className={cn(selectedState === 'all' && "bg-accent")}
              >
                <span className="flex-1">All States</span>
                <Badge variant="outline">{totalCount}</Badge>
              </DropdownMenuItem>
              {states.map(state => (
                <DropdownMenuItem 
                  key={state}
                  onClick={() => setSelectedState(state)}
                  className={cn(selectedState === state && "bg-accent")}
                >
                  <span className="flex-1">{getStateLabel(state)}</span>
                  <Badge variant="outline">{getStateCount(state)}</Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {totalValue > 0 && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-semibold text-primary">{formatCurrency(totalValue)} AED</p>
            </div>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <MobilePipelineCard
              key={getItemId(item)}
              id={getItemId(item)}
              type={type}
              title={getItemTitle(item)}
              subtitle={getItemSubtitle(item)}
              state={getItemState(item)}
              stateLabel={getStateLabel(getItemState(item))}
              value={getItemValue?.(item)}
              nextAction={getItemNextAction?.(item)}
              onClick={() => onItemClick(item)}
              onStateTransition={onStateTransition ? (newState) => onStateTransition(getItemId(item), newState) : undefined}
              onSetNextAction={onSetNextAction ? () => onSetNextAction(item) : undefined}
              availableStates={states}
              stateLabels={stateLabels}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No {type === 'lead' ? 'leads' : 'deals'} in this state
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
