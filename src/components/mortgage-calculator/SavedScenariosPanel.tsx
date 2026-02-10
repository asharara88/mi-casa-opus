import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import { formatAed } from '@/lib/money';
import {
  useMortgageScenarios,
  useSaveMortgageScenario,
  useDeleteMortgageScenario,
  type MortgageScenarioInputs,
  type MortgageScenarioResults,
} from '@/hooks/useMortgageScenarios';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  currentInputs: MortgageScenarioInputs;
  currentResults: MortgageScenarioResults;
  dealId?: string;
  onLoadScenario: (inputs: MortgageScenarioInputs) => void;
}

export function SavedScenariosPanel({ currentInputs, currentResults, dealId, onLoadScenario }: Props) {
  const { user } = useAuth();
  const [scenarioName, setScenarioName] = useState('');
  const { data: scenarios, isLoading } = useMortgageScenarios(dealId);
  const saveMutation = useSaveMortgageScenario();
  const deleteMutation = useDeleteMortgageScenario();

  const handleSave = () => {
    if (!scenarioName.trim()) return;
    saveMutation.mutate(
      { name: scenarioName.trim(), inputs: currentInputs, results: currentResults, dealId },
      { onSuccess: () => setScenarioName('') }
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          Sign in to save and load mortgage scenarios.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-primary" />
          Saved Scenarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save current */}
        <div className="flex gap-2">
          <Input
            placeholder="Scenario name…"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!scenarioName.trim() || saveMutation.isPending}
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : scenarios && scenarios.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {scenarios.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2 rounded-md border bg-secondary/20 text-sm"
              >
                <button
                  className="flex-1 text-left hover:text-primary transition-colors"
                  onClick={() => onLoadScenario(s.inputs)}
                >
                  <span className="font-medium">{s.name}</span>
                  <div className="flex gap-2 mt-0.5">
                    {s.results.monthlyPayment && (
                      <Badge variant="outline" className="text-xs">
                        {formatAed(s.results.monthlyPayment)}/mo
                      </Badge>
                    )}
                    {s.results.totalInterest && (
                      <Badge variant="outline" className="text-xs text-destructive">
                        {formatAed(s.results.totalInterest)} interest
                      </Badge>
                    )}
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(s.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">No saved scenarios yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
