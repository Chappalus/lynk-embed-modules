import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAppointmentSettings, useUpdateAppointmentSettings } from '@/hooks';
import { Clock, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface AppointmentSettingsPanelProps {
  academyId: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AppointmentSettingsPanel({ academyId }: AppointmentSettingsPanelProps) {
  const { data: settings, isLoading } = useAppointmentSettings(academyId);
  const updateSettings = useUpdateAppointmentSettings();

  const [formData, setFormData] = useState({
    enabled: true,
    slotDuration: 30,
    bufferMinutes: 15,
    maxAdvanceDays: 30,
    minAdvanceHours: 24,
    workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    allowEmbedBooking: true,
  });

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        academyId,
        settings: formData,
      });
      toast.success('Appointment settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Appointment Booking
          </CardTitle>
          <CardDescription>
            Let visitors book consultation calls or trial sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Appointments</div>
              <div className="text-sm text-muted-foreground">
                Allow visitors to book appointments through the embed button
              </div>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Show on Embed</div>
              <div className="text-sm text-muted-foreground">
                Make appointments available via the "Get in Touch" button
              </div>
            </div>
            <Switch
              checked={formData.allowEmbedBooking}
              onCheckedChange={(checked) => setFormData({ ...formData, allowEmbedBooking: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {formData.enabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Slot Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slot Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.slotDuration}
                    onChange={(e) => setFormData({ ...formData, slotDuration: parseInt(e.target.value) })}
                    min={15}
                    step={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Buffer Between Slots (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.bufferMinutes}
                    onChange={(e) => setFormData({ ...formData, bufferMinutes: parseInt(e.target.value) })}
                    min={0}
                    step={5}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Advance Notice (hours)</Label>
                  <Input
                    type="number"
                    value={formData.minAdvanceHours}
                    onChange={(e) => setFormData({ ...formData, minAdvanceHours: parseInt(e.target.value) })}
                    min={0}
                  />
                  <p className="text-xs text-muted-foreground">
                    How far in advance someone must book
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Max Advance Booking (days)</Label>
                  <Input
                    type="number"
                    value={formData.maxAdvanceDays}
                    onChange={(e) => setFormData({ ...formData, maxAdvanceDays: parseInt(e.target.value) })}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    How far ahead someone can book
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Working Days</Label>
                <div className="flex gap-2">
                  {DAYS.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = formData.workingDays.includes(index)
                          ? formData.workingDays.filter(d => d !== index)
                          : [...formData.workingDays, index];
                        setFormData({ ...formData, workingDays: newDays });
                      }}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        formData.workingDays.includes(index)
                          ? 'bg-lynk-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {day[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.workingHoursStart}
                    onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.workingHoursEnd}
                    onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Coach Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Appointments can be assigned to specific coaches or left unassigned for manual allocation.
              </p>
              <Button variant="outline" className="mt-4">
                Manage Coach Availability
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Appointment Settings
        </Button>
      </div>
    </div>
  );
}