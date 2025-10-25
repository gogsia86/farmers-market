/**
 * SOCIAL SHARE BUTTONS
 * Divine social media sharing component
 */

'use client';

import { useState } from 'react';
import { Facebook, Twitter, Instagram, Share2, MessageCircle, Link2, Check } from 'lucide-react';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  imageUrl?: string;
}

export function SocialShareButtons({
  url,
  title,
  description,
  hashtags = [],
  imageUrl,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');
  const hashtagsString = hashtags.join(',');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtagsString}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (platform: string) => {
    // Track social share event
    trackSocialShare(platform, url, title);

    // Open share link
    window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Facebook */}
      <button
        onClick={() => handleShare('facebook')}
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title="Share on Facebook"
      >
        <Facebook className="h-5 w-5" />
      </button>

      {/* Twitter */}
      <button
        onClick={() => handleShare('twitter')}
        className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="h-5 w-5" />
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => handleShare('whatsapp')}
        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        title="Copy Link"
      >
        {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
      </button>

      {/* More Options */}
      <button
        onClick={() => setShowShareModal(true)}
        className="p-2 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors"
        title="More Share Options"
      >
        <Share2 className="h-5 w-5" />
      </button>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          url={url}
          title={title}
          description={description}
          imageUrl={imageUrl}
          onClose={() => setShowShareModal(false)}
          shareLinks={shareLinks}
        />
      )}
    </div>
  );
}

function ShareModal({ url, title, description, imageUrl, onClose, shareLinks }: any) {
  const [customMessage, setCustomMessage] = useState(title);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Share This</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          {imageUrl && (
            <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" />
          )}
          <h4 className="font-bold text-lg mb-2">{title}</h4>
          {description && <p className="text-gray-600 text-sm">{description}</p>}
        </div>

        {/* Custom Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customize Your Message
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-4">
          <ShareOption
            icon={<Facebook />}
            label="Facebook"
            color="bg-blue-600"
            onClick={() => window.open(shareLinks.facebook, '_blank')}
          />
          <ShareOption
            icon={<Twitter />}
            label="Twitter"
            color="bg-sky-500"
            onClick={() => window.open(shareLinks.twitter, '_blank')}
          />
          <ShareOption
            icon={<MessageCircle />}
            label="WhatsApp"
            color="bg-green-500"
            onClick={() => window.open(shareLinks.whatsapp, '_blank')}
          />
          <ShareOption
            icon={<Instagram />}
            label="Email"
            color="bg-red-500"
            onClick={() => window.open(shareLinks.email, '_blank')}
          />
        </div>
      </div>
    </div>
  );
}

function ShareOption({ icon, label, color, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
    >
      <span className="h-6 w-6">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

/**
 * Track social share event
 */
function trackSocialShare(platform: string, url: string, title: string) {
  // In production, send to analytics (Mixpanel, Google Analytics, etc.)
  console.log('Social share:', { platform, url, title });

  // Example: Send to backend
  fetch('/api/marketing/social/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform,
      url,
      title,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    // Silent fail for tracking
  });
}

/**
 * Product Share Component (specialized)
 */
export function ProductShareButtons({
  productId,
  productName,
  productImage,
  farmName,
}: {
  productId: string;
  productName: string;
  productImage: string;
  farmName: string;
}) {
  const url = `${window.location.origin}/products/${productId}`;
  const title = `Check out ${productName} from ${farmName} on Farmers Market!`;
  const description = `Fresh ${productName} available now. Support local farmers!`;
  const hashtags = ['LocalFood', 'FarmersMarket', 'SupportLocal'];

  return (
    <SocialShareButtons
      url={url}
      title={title}
      description={description}
      hashtags={hashtags}
      imageUrl={productImage}
    />
  );
}

/**
 * Farm Share Component (specialized)
 */
export function FarmShareButtons({
  farmId,
  farmName,
  farmImage,
}: {
  farmId: string;
  farmName: string;
  farmImage: string;
}) {
  const url = `${window.location.origin}/farms/${farmId}`;
  const title = `Discover ${farmName} on Farmers Market!`;
  const description = `Fresh, local produce from ${farmName}. Shop now and support your local farmers!`;
  const hashtags = ['LocalFarm', 'FarmersMarket', 'FarmToTable'];

  return (
    <SocialShareButtons
      url={url}
      title={title}
      description={description}
      hashtags={hashtags}
      imageUrl={farmImage}
    />
  );
}
