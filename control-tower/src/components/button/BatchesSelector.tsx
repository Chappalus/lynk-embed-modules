import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useBatches, useUpdateBatch } from '@/hooks';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface BatchesSelectorProps {
  academyId: string;
}

export function BatchesSelector({ academyId }: BatchesSelectorProps) {
  const { data: batches, isLoading } = useBatches(academyId, { active: true });
  const updateBatch = useUpdateBatch();

  const handleToggleEmbed = async (batchId: string, currentValue: boolean) => {
    try {
      await updateBatch.mutateAsync({
        academyId,
        batchId,
        updates: { allowEmbedBooking: !currentValue },
      });
      toast.success(`Batch ${currentValue ? 'hidden from' : 'shown on'} embed`);
    } catch (error) {
      toast.error('Failed to update batch');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading batches...</div>;
  }

  if (!batches || batches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Batches</CardTitle>
          <CardDescription>
            Create batches in the Batches section to make them available for booking
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Batches for Embed</CardTitle>
          <CardDescription>
            Choose which batches appear in the "Get in Touch" button on external websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{batch.name}</h3>
                    {batch.allowEmbedBooking && (
                      <Badge variant="secondary">Visible on Embed</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {batch.schedule}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {batch.currency} {batch.price}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {batch.enrolledCount}/{batch.capacity} enrolled
                    </span>
                    {batch.coachName && (
                      <span>Coach: {batch.coachName}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {batch.availableSpots} spots left
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((batch.enrolledCount / batch.capacity) * 100)}% full
                    </div>
                  </div>
                  <Switch
                    checked={batch.allowEmbedBooking}
                    onCheckedChange={() => handleToggleEmbed(batch.id, batch.allowEmbedBooking)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto-show New Batches</div>
              <div className="text-sm text-muted-foreground">
                Automatically make new batches visible on embed
              </div>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Hide Full Batches</div>
              <div className="text-sm text-muted-foreground">
                Don't show batches with 0 available spots
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}