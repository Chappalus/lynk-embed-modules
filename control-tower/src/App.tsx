import { Routes, Route, NavLink } from 'react-router-dom'
import { PixelSettings } from './components/pixel/PixelSettings'
import { ButtonBuilder } from './components/button/ButtonBuilder'
import { BarChart3, MousePointer, Settings } from 'lucide-react'

// Mock academy ID for demo
const ACADEMY_ID = 'demo-academy-123'

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-lynk-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-xl">Lynk Control Tower</span>
          </div>
          <nav className="flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-lynk-600' : 'text-muted-foreground hover:text-foreground'
                }`
              }
              end
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/pixel"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-lynk-600' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <BarChart3 className="h-4 w-4" />
              Marketing Pixel
            </NavLink>
            <NavLink
              to="/button"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-lynk-600' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <MousePointer className="h-4 w-4" />
              Get in Touch Button
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pixel" element={<PixelSettings academyId={ACADEMY_ID} />} />
          <Route path="/button" element={<ButtonBuilder academyId={ACADEMY_ID} />} />
        </Routes>
      </main>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your embed modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg hover:border-lynk-500 transition-colors cursor-pointer" onClick={() => window.location.href = '/pixel'}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Marketing Pixel</h2>
              <p className="text-sm text-muted-foreground">Google Ads, Facebook, Analytics</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 font-medium">● Active</span>
            <span className="text-muted-foreground">3 pixels connected</span>
          </div>
        </div>

        <div className="p-6 border rounded-lg hover:border-lynk-500 transition-colors cursor-pointer" onClick={() => window.location.href = '/button'}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MousePointer className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Get in Touch Button</h2>
              <p className="text-sm text-muted-foreground">Booking widget for your website</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 font-medium">● Active</span>
            <span className="text-muted-foreground">5 batches available</span>
          </div>
        </div>
      </div>

      <div className="p-6 border rounded-lg bg-muted/50">
        <h3 className="font-semibold mb-2">Quick Setup</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Configure your Marketing Pixel settings</li>
          <li>2. Design your Get in Touch Button</li>
          <li>3. Select which batches to show</li>
          <li>4. Copy the embed code to your website</li>
        </ol>
      </div>
    </div>
  )
}

export default App
