import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, ArrowLeft, Shield } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function PrivacyPolicy() {
  const [privacyPolicy, setPrivacyPolicy] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrivacyPolicy();
  }, []);

  const loadPrivacyPolicy = async () => {
    try {
      const policy = await apiClient.getPrivacyPolicy();
      setPrivacyPolicy(policy);
    } catch (error) {
      console.error('Failed to load privacy policy:', error);
      setPrivacyPolicy('Failed to load privacy policy. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Convert markdown-like content to HTML
  const formatPrivacyPolicy = (content: string) => {
    let html = content;
    // Remove leading spaces before hashes for headings
    html = html.replace(/^\s*# (.*)$/gm, '<h1 class="text-4xl font-extrabold text-gray-900 mb-8">$1</h1>');
    html = html.replace(/^\s*## (.*)$/gm, '<h2 class="text-2xl font-bold text-gray-800 mt-10 mb-5">$1</h2>');
    html = html.replace(/^\s*### (.*)$/gm, '<h3 class="text-xl font-semibold text-gray-700 mt-7 mb-3">$1</h3>');
    html = html.replace(/^\s*#### (.*)$/gm, '<h4 class="text-lg font-semibold text-gray-600 mt-5 mb-2">$1</h4>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    // Lists (group consecutive - lines into a single <ul>)
    html = html.replace(/((?:^- .*(?:\n|$))+)/gm, match => {
      const items = match.trim().split(/\n/).filter(Boolean).map(line => line.replace(/^- /, '').trim());
      if (items.length) {
        return '<ul class="list-disc ml-8 mb-4">' + items.map(item => `<li>${item}</li>`).join('') + '</ul>';
      }
      return match;
    });
    // Paragraphs (wrap text blocks not already in tags)
    html = html.replace(/(^|\n)(?!<h\d|<ul|<li|<strong|<p)([^\n<][^\n]*)/g, (m, p1, p2) => {
      if (p2 && p2.trim() !== '') {
        return `${p1}<p class="mb-4">${p2.trim()}</p>`;
      }
      return m;
    });
    // Remove double <p> around <ul>
    html = html.replace(/<p class="mb-4">(\s*)<ul/g, '<ul');
    html = html.replace(/<\/ul>(\s*)<\/p>/g, '</ul>');
    // Remove any stray hashes left in the output
    html = html.replace(/#+/g, '');
    return html;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Amazon Pinterest Bot</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            We take your privacy seriously. Learn how we protect and handle your data.
          </p>
        </div>

        {/* Privacy Policy Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading privacy policy...</p>
            </div>
          ) : (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatPrivacyPolicy(privacyPolicy) 
              }}
            />
          )}
        </div>

        {/* Key Points Highlight */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Shield className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-800">End-to-End Encrypted</h3>
            </div>
            <p className="text-green-700">
              All your credentials are encrypted using industry-standard encryption and never stored in plain text.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Bot className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-800">Session-Based</h3>
            </div>
            <p className="text-blue-700">
              Your data is only stored temporarily during your session and automatically deleted when you're done.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <ArrowLeft className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-purple-800">No Third-Party Sharing</h3>
            </div>
            <p className="text-purple-700">
              We never share, sell, or rent your personal information to third parties for marketing purposes.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Questions about Privacy?</h3>
          <p className="text-gray-700 mb-4">
            If you have any questions about this privacy policy or our data practices, we're here to help.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Email:</strong> privacy@amazonpinterestbot.com</p>
            <p><strong>Response Time:</strong> Within 48 hours</p>
            <p><strong>Last Updated:</strong> July 5, 2025</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link href="/" className="btn-primary">
            🚀 Start Using the Bot
          </Link>
        </div>
      </div>
    </div>
  );
}
