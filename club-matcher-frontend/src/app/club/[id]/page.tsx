'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SocialMediaLinks from '@/components/SocialMediaLinks';

interface Club {
  id: number;
  name: string;
  description: string;
  profile_picture: string | null;
  interests: string[];
}

export default function ClubProfile(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClub = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/clubs/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch club');
        }
        const data = await response.json();
        setClub(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the club');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchClub();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading club information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Club not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6">
        <img
          src={club.profile_picture || '/default-club.png'}
          alt={club.name}
          className="w-32 h-32 rounded-full object-cover"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
          <p className="text-gray-600 mb-4">{club.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {club.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Social Media</h2>
            <SocialMediaLinks clubId={club.id} />
          </div>
        </div>
      </div>
    </div>
  );
} 