'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getProfile } from '@/actions/authActions';
import { Models } from 'appwrite';
import Loader from '@/components/shared/Loader';
import { toast } from 'sonner';
import { subscribe } from '@/actions/videosActions';

export default function StaticChannelPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [channel, setChannel] = useState<Models.Document>()
  const [isSubscribed, setIsSubscribed] = useState(false);
  useEffect(() => {
    getProfile(id)
      .then((data) => {
        setChannel(data)
      })
      .catch((error) => {
        router.push("/not-found")
      })
  }, [isSubscribed])


  const toggleSubscribe = async () => {
    try {
      const isSubscribed = await subscribe(id)
      if (isSubscribed) {
        toast("Subscribed to the channel successfully")
        setIsSubscribed(true)
      } else {
        toast("Unsubscribed to the channel successfully")
        setIsSubscribed(false)
      }

    } catch (error) {
      toast("Something went wrong")
    }
  }
  if (!channel) return <Loader />
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Channel Header */}
      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20">
          <AvatarImage src={channel.avatar_url} />
          <AvatarFallback>{channel.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold">{channel.name}</h1>
          <p className="text-muted-foreground">{channel.bio}</p>
          <p className="text-sm text-gray-500">
            {channel.subscribers.length.toLocaleString()} subscribers
          </p>
        </div>

        <div className="ml-auto">
          <Button onClick={toggleSubscribe} variant={isSubscribed ? 'outline' : 'default'}>
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {channel.videos.map((video:any) => (
            <Link
              key={video.$id}
              href={`/watch/${video.$id}`}
              className="block rounded-lg overflow-hidden border hover:shadow-lg transition"
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <h3 className="font-medium text-base truncate">{video.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
