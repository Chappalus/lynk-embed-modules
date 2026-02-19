import { useState } from 'react';
import { useButtonConfig, useUpdateButtonConfig, useBatches, useAppointmentSettings } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Slider } from '@/components/ui/Slider';
import { ButtonPreview } from './ButtonPreview';
import { ButtonAnalyticsPanel } from './ButtonAnalyticsPanel';
import { EmbedCodePanel } from '../pixel/EmbedCodePanel';
import { BatchesSelector } from './BatchesSelector';
import { AppointmentSettingsPanel } from './AppointmentSettingsPanel';
import { 
  Type, 
  Palette, 
  Settings,
  BarChart3,
  Code2,
  Calendar,
  Users,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ButtonBuilderProps {
  academyId: string;
}

const FONT_OPTIONS = [
  { value: 'system-ui', label: 'System Default' },
  { value: 'Inter, sans-serif', label: 'Inter (Modern)' },
  { value: 'Georgia, serif', label: 'Georgia (Classic)' },
  { value: 'Poppins, sans-serif', label: 'Poppins (Rounded)' },
  { value: 'Roboto, sans-serif', label: 'Roboto (Clean)' },
];

const SIZE_OPTIONS = [
  { value: 'small', label: 'Small', description: 'Compact button for tight spaces' },
  { value: 'medium', label: 'Medium', description: 'Standard size (recommended)' },
  { value: 'large', label: 'Large', description: 'Prominent call-to-action' },
];

export function ButtonBuilder({ academyId }: ButtonBuilderProps) {
  const { data: config, isLoading } = useButtonConfig(academyId);
  const { data: batches } = useBatches(academyId, { active: true });
  const { data: appointmentConfig } = useAppointmentSettings(academyId);
  const updateConfig = useUpdateButtonConfig();

  const [formData, setFormData] = useState({
    type: 'both' as const,
    buttonText: 'Get in Touch',
    buttonStyle: 'default' as const,
    buttonSize: 'medium' as const,
    primaryColor: '#3b6eff',
    textColor: '#ffffff',
    backgroundColor: '#3b6eff',
    borderRadius: '8',
    fontFamily: 'system-ui',
    showShadow: true,
    modalTitle: 'Book with Us',
    successMessage: 'Thank you! We will contact you shortly.',
    defaultTab: 'batches' as const,
    showPrices: true,
    showAvailability: true,
    requirePhone: true,
    requireEmail: true,
    isActive: true,
  });

  // Update form when config loads
  useState(() => {
    if (config) {
      setFormData({
        type: config.type,
        buttonText: config.buttonText,
        buttonStyle: config.buttonStyle,
        buttonSize: config.buttonSize,
        primaryColor: config.primaryColor,
        textColor: config.textColor,
        backgroundColor: config.backgroundColor,
        borderRadius: config.borderRadius,
        fontFamily: config.fontFamily,
        showShadow: config.showShadow,
        modalTitle: config.modalTitle,
        successMessage: config.successMessage,
        defaultTab: config.defaultTab,
        showPrices: config.showPrices,
        showAvailability: config.showAvailability,
        requirePhone: config.requirePhone,
        requireEmail: config.requireEmail,
        isActive: config.isActive,
      });
    }
  });

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        academyId,
        config: formData,
      });
      toast.success('Button settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Get in Touch Button</h1>
          <p className="text-muted-foreground">
            Add a booking widget to your existing website
          </p>
        </div>
        <div className="flex items-center gap-2">
          {formData.isActive && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Button active
            </div>
          )}
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="design" className="space-y-6">
        <TabsList>
          <TabsTrigger value="design" className="gap-2">
            <Palette className="h-4 w-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <Type className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="batches" className="gap-2">
            <Users className="h-4 w-4" />
            Batches
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="embed" className="gap-2">
            <Code2 className="h-4 w-4" />
            Embed Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Settings */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Button Status
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Button Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Button Type</CardTitle>
                  <CardDescription>
                    What should the button allow visitors to book?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.type}
                    onValueChange={(value: typeof formData.type) => setFormData({ ...formData, type: value })}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="booking" id="type-booking" />
                      <Label htmlFor="type-booking" className="flex-1 cursor-pointer">
                        <div className="font-medium">Batch Enrollment Only</div>
                        <div className="text-sm text-muted-foreground">Visitors can join your training batches</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="appointment" id="type-appointment" />
                      <Label htmlFor="type-appointment" className="flex-1 cursor-pointer">
                        <div className="font-medium">Appointments Only</div>
                        <div className="text-sm text-muted-foreground">Visitors can book consultation calls</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="both" id="type-both" />
                      <Label htmlFor="type-both" className="flex-1 cursor-pointer">
                        <div className="font-medium">Both Options</div>
                        <div className="text-sm text-muted-foreground">Let visitors choose between batches or appointments</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Style */}
                  <div className="space-y-3">
                    <Label>Button Style</Label>
                    <RadioGroup
                      value={formData.buttonStyle}
                      onValueChange={(value: typeof formData.buttonStyle) => setFormData({ ...formData, buttonStyle: value })}
                      className="grid grid-cols-3 gap-3"
                    >
                      {['default', 'outline', 'minimal'].map((style) => (
                        <div key={style}>
                          <RadioGroupItem
                            value={style}
                            id={`style-${style}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`style-${style}`}
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted peer-data-[state=checked]:border-lynk-500 cursor-pointer"
                          >
                            <span className="capitalize">{style}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Size */}
                  <div className="space-y-3">
                    <Label>Button Size</Label>
                    <RadioGroup
                      value={formData.buttonSize}
                      onValueChange={(value: typeof formData.buttonSize) => setFormData({ ...formData, buttonSize: value })}
                      className="space-y-2"
                    >
                      {SIZE_OPTIONS.map((size) => (
                        <div key={size.value} className="flex items-center space-x-3">
                          <RadioGroupItem value={size.value} id={`size-${size.value}`} />
                          <Label htmlFor={`size-${size.value}`} className="flex-1">
                            <span className="font-medium">{size.label}</span>
                            <span className="text-sm text-muted-foreground ml-2">— {size.description}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Colors */}
                  <div className="space-y-4">
                    <Label>Colors</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary-color" className="text-xs">Primary Color</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            id="primary-color"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              primaryColor: e.target.value,
                              backgroundColor: e.target.value 
                            })}
                            className="h-9 w-9 rounded border cursor-pointer"
                          />
                          <Input
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              primaryColor: e.target.value,
                              backgroundColor: e.target.value 
                            })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="text-color" className="text-xs">Text Color</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            id="text-color"
                            value={formData.textColor}
                            onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                            className="h-9 w-9 rounded border cursor-pointer"
                          />
                          <Input
                            value={formData.textColor}
                            onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Corner Roundness</Label>
                      <span className="text-sm text-muted-foreground">{formData.borderRadius}px</span>
                    </div>
                    <Slider
                      value={[parseInt(formData.borderRadius)]}
                      onValueChange={([value]) => setFormData({ ...formData, borderRadius: value.toString() })}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>

                  {/* Font */}
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <select
                      value={formData.fontFamily}
                      onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Shadow */}
                  <div className="flex items-center justify-between">
                    <Label>Show Shadow</Label>
                    <Switch
                      checked={formData.showShadow}
                      onCheckedChange={(checked) => setFormData({ ...formData, showShadow: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Live Preview */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <ButtonPreview config={formData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="button-text">Button Label</Label>
                <Input
                  id="button-text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Get in Touch"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modal Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-title">Modal Title</Label>
                <Input
                  id="modal-title"
                  value={formData.modalTitle}
                  onChange={(e) => setFormData({ ...formData, modalTitle: e.target.value })}
                  placeholder="Book with Us"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="success-message">Success Message</Label>
                <textarea
                  id="success-message"
                  value={formData.successMessage}
                  onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
                  placeholder="Thank you! We will contact you shortly."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Phone Number</Label>
                  <p className="text-sm text-muted-foreground">Make phone number mandatory</p>
                </div>
                <Switch
                  checked={formData.requirePhone}
                  onCheckedChange={(checked) => setFormData({ ...formData, requirePhone: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Email</Label>
                  <p className="text-sm text-muted-foreground">Make email mandatory</p>
                </div>
                <Switch
                  checked={formData.requireEmail}
                  onCheckedChange={(checked) => setFormData({ ...formData, requireEmail: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Prices</Label>
                  <p className="text-sm text-muted-foreground">Display batch prices in the list</p>
                </div>
                <Switch
                  checked={formData.showPrices}
                  onCheckedChange={(checked) => setFormData({ ...formData, showPrices: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Availability</Label>
                  <p className="text-sm text-muted-foreground">Show "X spots left" indicator</p>
                </div>
                <Switch
                  checked={formData.showAvailability}
                  onCheckedChange={(checked) => setFormData({ ...formData, showAvailability: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches">
          <BatchesSelector academyId={academyId} />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentSettingsPanel academyId={academyId} />
        </TabsContent>

        <TabsContent value="analytics">
          <ButtonAnalyticsPanel academyId={academyId} />
        </TabsContent>

        <TabsContent value="embed">
          <EmbedCodePanel academyId={academyId} type="button" />
        </TabsContent>
      </Tabs>
    </div>
  );
}