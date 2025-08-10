"use client"
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import Link from 'next/link'
import Loader from '@/components/shared/Loader'

function Bookmarks() {
  const { userProfile } = useAuth()

  // Check if userProfile and bookmarks exist and are not empty
  const hasBookmarks = userProfile && userProfile.bookmarks && userProfile.bookmarks.length > 0;

  if (!userProfile) return <Loader />

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Your Bookmarks</h1>

      {!hasBookmarks ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No bookmarks found. Start exploring and bookmarking videos!
          </p>
        </div>
      ) : (
        <div className="w-full rounded-md p-4">
          <div className="space-y-4">
            {userProfile.bookmarks.map((bookmark: any) => (
              <div key={bookmark.$id} className="flex items-center justify-between p-4 bg-secondary shadow-lg rounded">
                <div className="flex items-center gap-4">
                  <Image
                    src={bookmark.video.thumbnailUrl}
                    alt="thumbnail"
                    height={60}
                    width={60}
                    className="rounded"
                  />
                  <p className="font-medium">{bookmark.video.title}</p>
                </div>
                <Link href={`/watch/${bookmark.video.$id}`}>
                  <Button size="sm">
                    <Play className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookmarks
