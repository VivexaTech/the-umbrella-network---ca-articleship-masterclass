'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustStats } from './components/TrustStats';
import { CurrentBatchBanner } from './components/CurrentBatchBanner';
import { WhyArticleshipDifficult } from './components/WhyArticleshipDifficult';
import { WhatYouWillLearn } from './components/WhatYouWillLearn';
import { Roadmap } from './components/Roadmap';
import { WhyThisMasterclass } from './components/WhyThisMasterclass';
import { MentorSection } from './components/MentorSection';
import { StudentSpeakers } from './components/StudentSpeakers';
import { SocialProofResults } from './components/SocialProofResults';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { FinalCta } from './components/FinalCta';
import { Footer } from './components/Footer';
import { MobileStickyCta } from './components/MobileStickyCta';
import { RegistrationModal } from './components/RegistrationModal';
import { SuccessPageModal } from './components/SuccessPageModal';
import { AdminDashboard } from './components/AdminDashboard';
import type { Batch, WebsiteSettings, Speaker, Testimonial, PaymentSuccessResponse } from './types';
import {
  DEFAULT_BATCHES,
  DEFAULT_SETTINGS,
  DEFAULT_SPEAKERS,
  DEFAULT_TESTIMONIALS,
} from './data/defaultData';

export default function App() {
  const [batches, setBatches] = useState<Batch[]>(DEFAULT_BATCHES);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(DEFAULT_BATCHES[0] || null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(DEFAULT_SETTINGS);
  const [speakers, setSpeakers] = useState<Speaker[]>(DEFAULT_SPEAKERS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);

  // Modals
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedBatchForReg, setSelectedBatchForReg] = useState<Batch | null>(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState<PaymentSuccessResponse | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Load Initial Public Data from Express Backend
  const loadPublicData = async () => {
    try {
      // 1. Batches
      const bRes = await fetch('/api/batches');
      if (bRes.ok) {
        const bData = await bRes.json();
        setBatches(bData.batches || []);
      }

      // 2. Current Active Batch
      const curRes = await fetch('/api/batches/current');
      if (curRes.ok) {
        const curData = await curRes.json();
        setCurrentBatch(curData.batch || null);
      }

      // 3. Settings (stats, mentor, pricing, faqs, contact)
      const sRes = await fetch('/api/settings');
      if (sRes.ok) {
        const sData = await sRes.json();
        setSettings(sData.settings || null);
      }

      // 4. Speakers
      const spkRes = await fetch('/api/speakers');
      if (spkRes.ok) {
        const spkData = await spkRes.json();
        setSpeakers(spkData.speakers || []);
      }

      // 5. Testimonials
      const tRes = await fetch('/api/testimonials');
      if (tRes.ok) {
        const tData = await tRes.json();
        setTestimonials(tData.testimonials || []);
      }
    } catch (err) {
      console.error('Error loading initial data from API:', err);
    }
  };

  useEffect(() => {
    loadPublicData();
  }, []);

  const handleOpenRegistration = (batch?: Batch) => {
    setSelectedBatchForReg(batch || currentBatch || (batches.length > 0 ? batches[0] : null));
    setIsRegModalOpen(true);
  };

  const handlePaymentSuccess = (result: PaymentSuccessResponse) => {
    setIsRegModalOpen(false);
    setPaymentSuccessData(result);
    // Refresh batch seat counts
    loadPublicData();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* 1. Sticky Navigation Bar */}
      <Navbar
        onJoinClick={handleOpenRegistration}
        onAdminClick={() => setIsAdminOpen(true)}
      />

      {/* Main Page Layout */}
      <main>
        {/* 2. Hero Section */}
        <Hero
          onJoinClick={handleOpenRegistration}
          activeBatch={currentBatch}
        />

        {/* 3. Trust Statistics Strip */}
        <TrustStats statistics={settings?.statistics} />

        {/* 4. Current Batch Announcement & Scheduling */}
        <CurrentBatchBanner
          batches={batches}
          activeBatch={currentBatch}
          onSelectBatchToJoin={handleOpenRegistration}
        />

        {/* 5. Problem Statement: Why Getting an Articleship Is So Stressful */}
        <WhyArticleshipDifficult />

        {/* 6. What You Will Learn (6 Core Learning Modules) */}
        <WhatYouWillLearn />

        {/* 7. 6-Day Roadmap (Day 1 to Day 6 Detailed Framework) */}
        <Roadmap />

        {/* 8. Why This Masterclass (Not Just Another Webinar - 5 Pillars) */}
        <WhyThisMasterclass />

        {/* 9. Mentor Profile Section: CA Harsh Kaushik */}
        <MentorSection
          onLearnWithMeClick={() => handleOpenRegistration(currentBatch || undefined)}
          mentorData={settings?.mentor}
        />

        {/* 10. Student Speakers (7 Verified Student Mentors) */}
        <StudentSpeakers speakers={speakers} />

        {/* 11. Social Proof Results & Historical Benchmark */}
        <SocialProofResults />

        {/* 12. Testimonials Carousel / Zero-Fake Feedback State */}
        <Testimonials testimonials={testimonials} />

        {/* 13. Transparent Pricing & Feature Checklist */}
        <Pricing
          onReserveClick={handleOpenRegistration}
          activeBatch={currentBatch}
          pricingSettings={settings?.pricing}
        />

        {/* 14. Frequently Asked Questions (Accordion) */}
        <FaqSection faqs={settings?.faqs} />

        {/* 15. Contact Section & Pre-Registration WhatsApp */}
        <ContactSection contactSettings={settings?.contact} />

        {/* 16. Final Strong Call to Action */}
        <FinalCta
          onJoinClick={handleOpenRegistration}
          activeBatch={currentBatch}
        />
      </main>

      {/* 17. Comprehensive Footer & Legal Policies */}
      <Footer onAdminClick={() => setIsAdminOpen(true)} />

      {/* 18. Mobile Sticky Bottom CTA */}
      <MobileStickyCta
        onJoinClick={handleOpenRegistration}
        activeBatch={currentBatch}
      />

      {/* 19. Registration & Payment Flow Modal */}
      <RegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        batches={batches}
        selectedBatch={selectedBatchForReg}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 20. Payment Success & Batch WhatsApp Access Modal */}
      <SuccessPageModal
        data={paymentSuccessData}
        onClose={() => setPaymentSuccessData(null)}
      />

      {/* 21. Admin Dashboard (Batches, Students, WhatsApp Links, Content) */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onBatchesUpdated={loadPublicData}
      />
    </div>
  );
}
