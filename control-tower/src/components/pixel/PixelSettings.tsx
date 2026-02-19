import { useState } from 'react';
import { usePixelConfig, useUpdatePixelConfig } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { PixelTestPanel } from './PixelTestPanel';
import { PixelAnalyticsPanel } from './PixelAnalyticsPanel';
import { EmbedCodePanel } from './EmbedCodePanel';
import { 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Settings,
  BarChart3,
  Code2,
  TestTube
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PixelSettingsProps {
  academyId: string;
}

export function PixelSettings({ academyId }: PixelSettingsProps) {
  const { data: config, isLoading } = usePixelConfig(academyId);
  const updateConfig = useUpdatePixelConfig();
  
  const [formData, setFormData] = useState({
    googleAdsId: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    tiktokPixelId: '',
    linkedinInsightId: '',
    consentRequired: true,
    consentMessage: '',
    isActive: true,
  });

  // Update form when config loads
  useState(() => {
    if (config) {
      setFormData({
        googleAdsId: config.googleAdsId || '',
        googleAnalyticsId: config.googleAnalyticsId || '',
        facebookPixelId: config.facebookPixelId || '',
        tiktokPixelId: config.tiktokPixelId || '',
        linkedinInsightId: config.linkedinInsightId || '',
        consentRequired: config.consentRequired,
        consentMessage: config.consentMessage || '',
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
      toast.success('Pixel settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const activePixels = [
    formData.googleAdsId && 'Google Ads',
    formData.googleAnalyticsId && 'Google Analytics',
    formData.facebookPixelId && 'Facebook',
    formData.tiktokPixelId && 'TikTok',
    formData.linkedinInsightId && 'LinkedIn',
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing Pixel</h1>
          <p className="text-muted-foreground">
            Track conversions and attribution from your academy website
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activePixels.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {activePixels.length} pixel{activePixels.length > 1 ? 's' : ''} active
            </Badge>
          )}
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="embed" className="gap-2">
            <Code2 className="h-4 w-4" />
            Embed Code
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-2">
            <TestTube className="h-4 w-4" />
            Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pixel Status
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </CardTitle>
              <CardDescription>
                Enable or disable pixel tracking across all your pages
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Google Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Ads & Analytics
              </CardTitle>
              <CardDescription>
                Track conversions and website analytics with Google
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-ads">Google Ads Conversion ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="google-ads"
                    placeholder="AW-XXXXXXXXX"
                    value={formData.googleAdsId}
                    onChange={(e) => setFormData({ ...formData, googleAdsId: e.target.value })}
                  />
                  {formData.googleAdsId && (
                    <Button variant="outline" size="icon" onClick={() => handleCopyId(formData.googleAdsId)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Find this in your Google Ads account → Tools → Conversions
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="ga4">Google Analytics 4 Measurement ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="ga4"
                    placeholder="G-XXXXXXXXXX"
                    value={formData.googleAnalyticsId}
                    onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                  />
                  {formData.googleAnalyticsId && (
                    <Button variant="outline" size="icon" onClick={() => handleCopyId(formData.googleAnalyticsId)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  From GA4 Admin → Data Streams → Web
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Meta Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Meta (Facebook) Pixel
              </CardTitle>
              <CardDescription>
                Track conversions and build custom audiences on Facebook & Instagram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook Pixel ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="facebook"
                    placeholder="XXXXXXXXXX"
                    value={formData.facebookPixelId}
                    onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                  />
                  {formData.facebookPixelId && (
                    <Button variant="outline" size="icon" onClick={() => handleCopyId(formData.facebookPixelId)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Events Manager → Data Sources → Pixel ID
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Platforms */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Platforms</CardTitle>
              <CardDescription>
                Connect more marketing platforms (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok Pixel ID</Label>
                <Input
                  id="tiktok"
                  placeholder="XXXXXXXXXX"
                  value={formData.tiktokPixelId}
                  onChange={(e) => setFormData({ ...formData, tiktokPixelId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Insight Tag</Label>
                <Input
                  id="linkedin"
                  placeholder="XXXXXX"
                  value={formData.linkedinInsightId}
                  onChange={(e) => setFormData({ ...formData, linkedinInsightId: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Consent</CardTitle>
              <CardDescription>
                Configure GDPR/CCPA compliance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Consent</Label>
                  <p className="text-sm text-muted-foreground">
                    Show consent banner before tracking (recommended for EU visitors)
                  </p>
                </div>
                <Switch
                  checked={formData.consentRequired}
                  onCheckedChange={(checked) => setFormData({ ...formData, consentRequired: checked })}
                />
              </div>

              {formData.consentRequired && (
                <div className="space-y-2">
                  <Label htmlFor="consent-message">Consent Message</Label>
                  <textarea
                    id="consent-message"
                    className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
                    placeholder="We use cookies to improve your experience and track conversions..."
                    value={formData.consentMessage}
                    onChange={(e) => setFormData({ ...formData, consentMessage: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              Need help finding your pixel IDs?
              <a href="#" className="text-lynk-600 hover:underline inline-flex items-center gap-1">
                View documentation <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="analytics">
          <PixelAnalyticsPanel academyId={academyId} />
        </TabsContent>

        <TabsContent value="embed">
          <EmbedCodePanel academyId={academyId} type="pixel" />
        </TabsContent>

        <TabsContent value="test">
          <PixelTestPanel academyId={academyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}