import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ButtonPreviewProps {
  config: {
    buttonText: string;
    buttonStyle: 'default' | 'outline' | 'minimal';
    buttonSize: 'small' | 'medium' | 'large';
    primaryColor: string;
    textColor: string;
    borderRadius: string;
    fontFamily: string;
    showShadow: boolean;
    modalTitle: string;
    type: 'booking' | 'appointment' | 'both';
  };
}

export function ButtonPreview({ config }: ButtonPreviewProps) {
  const [showModal, setShowModal] = useState(false);

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const getButtonStyles = () => {
    const baseStyles: React.CSSProperties = {
      fontFamily: config.fontFamily,
      borderRadius: `${config.borderRadius}px`,
      boxShadow: config.showShadow ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
      transition: 'all 0.2s ease',
    };

    if (config.buttonStyle === 'default') {
      return {
        ...baseStyles,
        backgroundColor: config.primaryColor,
        color: config.textColor,
        border: 'none',
      };
    } else if (config.buttonStyle === 'outline') {
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: config.primaryColor,
        border: `2px solid ${config.primaryColor}`,
      };
    } else {
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: config.primaryColor,
        border: 'none',
        textDecoration: 'underline',
        boxShadow: 'none',
      };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview Container */}
        <div 
          className="min-h-[200px] flex items-center justify-center rounded-lg border-2 border-dashed p-8"
          style={{ backgroundColor: '#f8f9fa' }}
        >
          <button
            onClick={() => setShowModal(true)}
            className={`font-medium cursor-pointer ${sizeClasses[config.buttonSize]}`}
            style={getButtonStyles()}
            onMouseEnter={(e) => {
              if (config.buttonStyle === 'default') {
                e.currentTarget.style.filter = 'brightness(0.9)';
              } else {
                e.currentTarget.style.backgroundColor = config.buttonStyle === 'outline' ? config.primaryColor : 'transparent';
                e.currentTarget.style.color = config.buttonStyle === 'outline' ? config.textColor : config.primaryColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
              if (config.buttonStyle === 'outline') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = config.primaryColor;
              }
            }}
          >
            {config.buttonText}
          </button>
        </div>

        {/* Modal Preview */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">{config.modalTitle}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
              
              <div className="p-4">
                {config.type === 'both' && (
                  <div className="flex gap-2 mb-4 border-b">
                    <button className="px-4 py-2 text-lynk-600 border-b-2 border-lynk-600 font-medium">
                      Join a Batch
                    </button>
                    <button className="px-4 py-2 text-gray-500">
                      Book Appointment
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="p-3 border rounded-lg hover:border-lynk-500 cursor-pointer transition-colors">
                    <div className="font-medium">Beginner Tennis Camp</div>
                    <div className="text-sm text-gray-500">Mon, Wed, Fri • 4:00 PM</div>
                    <div className="text-lynk-600 font-semibold mt-1">₹2,999</div>
                  </div>
                  <div className="p-3 border rounded-lg hover:border-lynk-500 cursor-pointer transition-colors">
                    <div className="font-medium">Weekend Intensive</div>
                    <div className="text-sm text-gray-500">Sat, Sun • 9:00 AM</div>
                    <div className="text-lynk-600 font-semibold mt-1">₹4,999</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-500">
                Powered by Lynk
              </div>
            </div>
          </div>
        )}

        {/* Style Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Style:</span>
            <span className="font-medium capitalize">{config.buttonStyle}</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="font-medium capitalize">{config.buttonSize}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-medium capitalize">{config.type === 'both' ? 'Batch + Appointment' : config.type}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}