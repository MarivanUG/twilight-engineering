import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from './Navbar';
import { MemoryRouter } from 'react-router-dom';
import type { AppSettings } from '../../types';

// Mock settings
const mockSettings: AppSettings = {
  siteName: "Test Site",
  contactFormUrl: "/api/contact",
  enableStore: true,
  supportEmail: "test@test.com",
  socialLinks: {
    facebook: "http://fb.com",
    twitter: "http://twitter.com",
    linkedin: "http://linkedin.com",
    instagram: "http://insta.com"
  },
  mission: "Mission",
  vision: "Vision",
  phoneNumber: "123",
  address: "Address",
  tagline: "Tagline"
};

describe('Navbar', () => {
  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <Navbar settings={mockSettings} />
      </MemoryRouter>
    );
    
    // Check for logo (by alt text)
    expect(screen.getByAltText('TECL Engineering')).toBeInTheDocument();
    
    // Check for main links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('toggles mobile menu when clicking menu button', () => {
    // Resize window to mobile size (conceptually, though jsdom doesn't fully simulate layout reflows, 
    // the code uses hidden classes which might still be in the DOM, but we interact with the button).
    // The component uses `md:hidden` classes. Tailwind classes don't apply styles in JSDOM, 
    // but the Logic `isOpen` is what we test.
    
    render(
      <MemoryRouter>
        <Navbar settings={mockSettings} />
      </MemoryRouter>
    );

    // Find the hamburger menu button (it has the Menu icon)
    // Since we don't have aria-labels, we might look for the button wrapping the Menu icon.
    // However, simpler is to just querySelector or add a test-id. 
    // Let's rely on the fact that the Menu icon is rendered when closed.
    
    // Note: In the code: {isOpen ? <X /> : <Menu />}
    // We can assume the button is present.
    // Let's trigger the click on the button that contains the Menu icon.
    const menuIcon = document.querySelector('.lucide-menu');
    const button = menuIcon?.closest('button');
    
    expect(button).toBeDefined();
    if (button) {
      fireEvent.click(button);
      
      // Now the mobile menu should be open.
      // The mobile menu contains the same links, but let's check for the "absolute" container or similar.
      // Alternatively, check if the X icon is now present.
      expect(document.querySelector('.lucide-x')).toBeInTheDocument();
    }
  });
});
