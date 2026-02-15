import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  features = [
    {
      icon: '👗',
      title: 'Quality Craftsmanship',
      description: 'Every piece is crafted with attention to detail and superior quality materials'
    },
    {
      icon: '🎨',
      title: 'Traditional Meets Modern',
      description: 'Designs that blend rich cultural heritage with contemporary fashion trends'
    },
    {
      icon: '✨',
      title: 'Curated Collection',
      description: 'Thoughtfully selected sarees, salwar suits, lehengas, and ethnic wear'
    },
    {
      icon: '💝',
      title: 'Special Occasions',
      description: 'Perfect for weddings, festivals, and celebrations of all kinds'
    }
  ];
}
