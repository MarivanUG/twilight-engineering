import React from 'react';
import { HeroSlider } from '../sections/HeroSlider';
import { ServicesCarousel } from '../sections/ServicesCarousel';
import { FeaturedProducts } from '../sections/FeaturedProducts';
import { RecentProjects } from '../sections/RecentProjects';
import { PartnersStrip } from '../sections/PartnersStrip';
import { TestimonialsSection } from '../sections/TestimonialsSection';

export const HomeContent: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <HeroSlider />
      <ServicesCarousel />
      <FeaturedProducts />
      <RecentProjects />
      <PartnersStrip />
      <TestimonialsSection />
    </div>
  );
};