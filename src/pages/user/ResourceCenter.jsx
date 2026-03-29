import React from 'react';
import { useData } from '../../context/DataContext';
import { BookOpen, Award, Compass, Search } from 'lucide-react';

export default function ResourceCenter() {
  const { currentUser } = useData();

  if (!currentUser) return <div style={{ padding: '2rem', textAlign: 'center' }}>Please login first.</div>;

  const data = currentUser.roadmap ? JSON.parse(currentUser.roadmap) : {
    resources: 'No resources prescribed by Admin yet.',
    certifications: 'No certifications prescribed yet.',
    domains: 'No domains prescribed yet.',
    nextSteps: 'No specific next steps prescribed.'
  };

  return (
    <div className="card glass-panel" style={{ maxWidth: '900px', margin: '0 auto', animateFadeIn: 'true' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
          <Compass size={28} color="var(--accent-primary)" />
          {currentUser.name}'s Personal Roadmap & Resources
        </h2>
        <div style={{ color: 'var(--accent-warning)', fontSize: '0.875rem', fontWeight: 600 }}>
          Assigned by Administrator
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Resources */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>
            <BookOpen size={20} color="var(--accent-primary)" /> Resources to Study
          </h3>
          <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{data.resources}</div>
        </div>

        {/* Certifications */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>
            <Award size={20} color="var(--accent-warning)" /> Required Certification Details
          </h3>
          <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{data.certifications}</div>
        </div>

        {/* Domains */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>
            <Compass size={20} color="var(--accent-success)" /> IT Domains Overview
          </h3>
          <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{data.domains}</div>
        </div>

        {/* Next Steps */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>
            <Search size={20} color="var(--accent-danger)" /> What to Read Next
          </h3>
          <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{data.nextSteps}</div>
        </div>
      </div>
    </div>
  );
}
