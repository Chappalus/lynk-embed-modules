import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSendTestPixelEvent } from '@/hooks';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PixelTestPanelProps {
  academyId: string;
}

const TEST_EVENTS = [
  { name: 'page_view', label: 'Page View', description: 'Someone views a page' },
  { name: 'begin_checkout', label: 'Begin Checkout', description: 'User starts booking process' },
  { name: 'purchase', label: 'Purchase', description: 'Booking completed' },
  { name: 'generate_lead', label: 'Lead Generated', description: 'Form submitted' },
  { name: 'contact', label: 'Contact', description: 'Phone/email clicked' },
];

export function PixelTestPanel({ academyId }: PixelTestPanelProps) {
  const sendTestEvent = useSendTestPixelEvent();
  const [testing, setTesting] = useState<string | null>(null);
  const [tested, setTested] = useState<string[]>([]);
  const [customEvent, setCustomEvent] = useState('');

  const handleTest = async (eventName: string, eventData?: any) => {
    setTesting(eventName);
    try {
      await sendTestEvent.mutateAsync({
        academyId,
        event: { eventName, eventData },
      });
      setTested([...tested, eventName]);
      toast.success(`Event "${eventName}" sent successfully`);
    } catch (error) {
      toast.error(`Failed to send event: ${eventName}`);
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test Events
          </CardTitle>
          <CardDescription>
            Send test events to verify your pixel is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TEST_EVENTS.map((event) => (
              <div
                key={event.name}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{event.label}</span>
                    {tested.includes(event.name) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={tested.includes(event.name) ? "outline" : "default"}
                  onClick={() => handleTest(event.name)}
                  disabled={testing === event.name}
                >
                  {testing === event.name ? 'Sending...' : tested.includes(event.name) ? 'Test Again' : 'Test'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Event</CardTitle>
          <CardDescription>
            Test a custom event name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter event name (e.g., trial_booked)"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
            />
            <Button
              onClick={() => customEvent && handleTest(customEvent)}
              disabled={!customEvent || testing === customEvent}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Testing Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {[
              'Pixel code is installed on your website',
              'Test events are received in Lynk dashboard',
              'Google Ads shows conversions (if configured)',
              'Facebook Pixel shows activity (if configured)',
              'Events appear in real-time analytics',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border flex items-center justify-center">
                  {i < tested.length && <CheckCircle className="h-3 w-3" />}
                </div>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}