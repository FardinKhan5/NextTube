'use client';

import { useEffect, useState } from "react";
import { getAllVideos } from "@/actions/videosActions"; // Your Appwrite action
import { Models } from "appwrite";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import InfiniteScroll from 'react-infinite-scroll-component';

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import SkeletonCard from "@/components/shared/SkeletonCard";

export default function Home() {
  const [videos, setVideos] = useState<Models.Document[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const limit = 10;

  const fetchVideos = async (reset = false) => {
    try {
      const currentCursor = reset ? null : cursor;
      const data = await getAllVideos("", limit, currentCursor || undefined);

      const newDocs = data.documents;

      if (newDocs.length === 0) {
        setHasMore(false);
        if (reset) {
          setVideos([]);
        }
        setIsInitialLoading(false);
        return;
      }

      setVideos(prev => reset ? newDocs : [...prev, ...newDocs]);
      setCursor(newDocs[newDocs.length - 1].$id);

      if (newDocs.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setIsInitialLoading(false);
    } catch (err) {
      toast.error("Failed to load videos.");
      setHasMore(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    // Reset state and fetch videos on initial mount
    const resetAndFetch = async () => {
      setVideos([]);
      setCursor(null);
      setHasMore(true);
      setIsInitialLoading(true);
      await fetchVideos(true);
    };

    resetAndFetch();
  }, []);

  const formatViews = (views: number) => {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K views`;
    return `${views} views`;
  };

  const timeAgo = (timestamp: string | number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(months / 12);
    return `${years} years ago`;
  };

  return (
    <div className="flex-1 min-h-screen px-4 pt-6">
      {isInitialLoading && videos.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={videos.length}
          next={() => fetchVideos()}
          hasMore={hasMore}
          loader={<Spinner className="mx-auto mt-6" />}
          endMessage={
            <p className="text-center text-muted-foreground mt-4">
              <b>Yay! You have seen it all</b>
            </p>
          }
          scrollThreshold={0.95}
          style={{ overflow: "unset" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((video: any) => {
              const videoTitle = video.title || "Untitled Video";
              const thumbnailUrl = video.thumbnailUrl || "https://placehold.co/400x225";
              const channelName = video.channel?.name || "Unknown Channel";
              const views = video.views || 0;
              const uploadTimestamp = video.$createdAt || new Date().toISOString();
              const avatarUrl = video.channel?.avatar_url || "https://placehold.co/80x80";

              return (
                <Link
                  href={`/watch/${video.$id}`}
                  key={video.$id}
                  className="block group"
                >
                  <Card className="w-full rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="relative w-full aspect-video">
                      <Image
                        src={thumbnailUrl}
                        alt={videoTitle}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>

                    <CardContent className="p-3 flex items-start space-x-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={avatarUrl}
                          alt={`${channelName} avatar`}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-grow">
                        <CardTitle className="text-sm font-semibold leading-tight line-clamp-2 mt-0">
                          {videoTitle}
                        </CardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {channelName}
                        </p>
                        <CardDescription className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatViews(views)} • {timeAgo(uploadTimestamp)}
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}