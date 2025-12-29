// Helper to combine class names (simple version of clsx/tailwind-merge)
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Mock API sender
export const sendMessage = async (data: any, endpoint?: string) => {
  // In a real app, this would use fetch()
  console.log(`[Mock API] Sending to ${endpoint || 'default'}:`, data);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: true, 
        message: 'Message sent successfully',
        timestamp: new Date().toISOString()
      });
    }, 1000);
  });
};

// Currency formatter
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};