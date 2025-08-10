"use client"

import Loader from "@/components/shared/Loader"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { Edit2, Play, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteVideo } from "@/actions/videosActions"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/actions/authActions"

function Videos() {
  const { userProfile, setUserProfile } = useAuth()
  const [refetch, setRefetch] = useState(false)
  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        setUserProfile(data)
      })
      .catch((error) => {
        toast("Failed to retrive user data,please refresh the page")
      })
      .finally(() => setRefetch(false))
  }, [refetch])
  const handleDelete = (videoId: string, videoUrl: string, thumbnailUrl: string) => {
    deleteVideo(videoId, videoUrl, thumbnailUrl)
      .then((data) => {
        toast("Video deleted successfully")
        setRefetch(true)
      })
      .catch((error) => toast("Failed to delete video"))
  }
  const hasVideos = userProfile && userProfile.videos && userProfile.videos.length > 0
  if (!userProfile) return <Loader />
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Your Videos</h1>

      {!hasVideos ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No video found. Start creating and publishing videos!
          </p>
        </div>
      ) : (
        <div className="w-full rounded-md p-4">

          <div className="space-y-4">
            {userProfile.videos.map((video: any) => (
              <div key={video.$id} className="flex items-center justify-between p-4 bg-secondary shadow-lg rounded">
                <div className="flex items-center gap-4">
                  <Image
                    src={video?.thumbnailUrl}
                    alt="thumbnail"
                    height={60}
                    width={60}
                    className="rounded"
                  />
                  <p className="font-medium">{video.title}</p>
                </div>
                <div className="flex gap-4">
                  <Link href={`/watch/${video.$id}`}>
                    <Button size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/update-video/${video.$id}`}>
                    <Button size="sm">
                      <Edit2 />
                    </Button>
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild><Button size="sm"><X /></Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your video
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button onClick={() => handleDelete(video.$id, video.videoUrl, video.thumbnailUrl)}>Delete</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Videos