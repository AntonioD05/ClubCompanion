import React, { useState, useEffect } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGlobe } from 'react-icons/fa';

interface SocialMediaLink {
  id: number;
  platform: string;
  url: string;
}

interface SocialMediaLinksProps {
  clubId: number;
  isEditable?: boolean;
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <FaFacebook />,
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  linkedin: <FaLinkedin />,
  website: <FaGlobe />,
};

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ clubId, isEditable = false }) => {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [newPlatform, setNewPlatform] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSocialMediaLinks();
  }, [clubId]);

  const fetchSocialMediaLinks = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/social-media/club/${clubId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch social media links');
      }
      const data = await response.json();
      setLinks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching social media links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch('/api/social-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          club_id: clubId,
          platform: newPlatform,
          url: newUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add social media link');
      }

      setNewPlatform('');
      setNewUrl('');
      await fetchSocialMediaLinks();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the social media link');
    }
  };

  const handleDeleteLink = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/social-media/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete social media link');
      }

      await fetchSocialMediaLinks();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the social media link');
    }
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading social media links...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-wrap gap-4">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {platformIcons[link.platform.toLowerCase()] || <FaGlobe />}
            <span className="text-sm">{link.platform}</span>
            {isEditable && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteLink(link.id);
                }}
                className="text-red-500 hover:text-red-700 ml-2"
                aria-label={`Delete ${link.platform} link`}
              >
                ×
              </button>
            )}
          </a>
        ))}
      </div>

      {isEditable && (
        <form onSubmit={handleAddLink} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Platform (e.g., Facebook)"
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            className="px-3 py-2 border rounded flex-1"
            required
          />
          <input
            type="url"
            placeholder="URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="px-3 py-2 border rounded flex-1"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Link
          </button>
        </form>
      )}
    </div>
  );
};

export default SocialMediaLinks; 