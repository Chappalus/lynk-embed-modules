import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useEmbedCode } from '@/hooks';
import { Check, Copy, Code, FileCode, Globe, ShoppingBag, Wordpress } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmbedCodePanelProps {
  academyId: string;
  type: 'pixel' | 'button';
}

export function EmbedCodePanel({ academyId, type }: EmbedCodePanelProps) {
  const { data: embedCode } = useEmbedCode(academyId);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const pixelCode = `<!-- Lynk Marketing Pixel -->
<script 
  src="https://cdn.lynk.coach/lynk-pixel.min.js"
  data-academy-id="${academyId}"
  data-api-key="YOUR_API_KEY"
  data-google-pixel="AW-XXXXXXXXX"
  data-facebook-pixel="XXXXXXXXXX">
</script>`;

  const buttonCode = `<!-- Lynk Get In Touch Button -->
<div id="lynk-button"></div>
<script 
  src="https://cdn.lynk.coach/lynk-button.min.js"
  data-academy-id="${academyId}"
  data-api-key="YOUR_API_KEY"
  data-type="both"
  data-button-text="Book Now">
</script>`;

  const reactCode = `import { LynkButton } from '@lynk/embed-sdk';

function App() {
  return (
    <LynkButton
      academyId="${academyId}"
      apiKey="YOUR_API_KEY"
      type="both"
      buttonText="Book Now"
    />
  );
}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            HTML Embed (Simplest)
          </CardTitle>
          <CardDescription>
            Copy and paste this code into your website's HTML, just before the closing &lt;/body&gt; tag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{type === 'pixel' ? pixelCode : buttonCode}</code>
            </pre>
            <Button
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(type === 'pixel' ? pixelCode : buttonCode, 'HTML Code')}
            >
              {copied === 'HTML Code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {type === 'button' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                React Component
              </CardTitle>
              <CardDescription>
                For React-based websites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{reactCode}</code>
                </pre>
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(reactCode, 'React Code')}
                >
                  {copied === 'React Code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wordpress className="h-5 w-5" />
                WordPress
              </CardTitle>
              <CardDescription>
                For WordPress sites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to Appearance → Theme Editor</li>
                <li>Open footer.php (or use a plugin like "Insert Headers and Footers")</li>
                <li>Paste the HTML embed code before &lt;/body&gt;</li>
                <li>Save changes</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Shopify
              </CardTitle>
              <CardDescription>
                For Shopify stores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to Online Store → Themes</li>
                <li>Click "Edit code" on your active theme</li>
                <li>Open theme.liquid</li>
                <li>Paste the HTML embed code before &lt;/body&gt;</li>
                <li>Save</li>
              </ol>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Installation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              'Copy the code above',
              'Paste it on every page where you want the button/pixel',
              'Replace YOUR_API_KEY with your actual API key',
              'Test by visiting your website',
              'Check the analytics dashboard to confirm data is flowing',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs">
                  {i + 1}
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