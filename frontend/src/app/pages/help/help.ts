import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help',
  imports: [CommonModule],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class Help {
  faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse our collection, select your desired items, add them to cart, and proceed to checkout. You can pay securely using our payment options.',
      icon: '🛒'
    },
    {
      question: 'What are the delivery options?',
      answer: 'We offer standard delivery (5-7 business days) and express delivery (2-3 business days) across India. International shipping is also available.',
      icon: '🚚'
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 7 days of delivery. Items must be unused, unwashed, and in original packaging with all tags intact.',
      icon: '↩️'
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email. You can use this to track your package in real-time.',
      icon: '📦'
    },
    {
      question: 'Are the products authentic?',
      answer: 'Yes! All our products are 100% authentic and sourced from trusted manufacturers. We guarantee quality and authenticity.',
      icon: '✓'
    },
    {
      question: 'How do I choose the right size?',
      answer: 'Each product page includes a detailed size chart. You can also contact our customer support for personalized sizing assistance.',
      icon: '📏'
    }
  ];

  contactMethods = [
    {
      icon: '📧',
      title: 'Email Support',
      detail: 'support@vrboutique.com',
      description: 'We respond within 24 hours'
    },
    {
      icon: '📱',
      title: 'Phone Support',
      detail: '+91 1234567890',
      description: 'Mon-Sat, 10 AM - 7 PM IST'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      detail: 'Chat with us',
      description: 'Available on our website'
    }
  ];
}
