"use client"

import { 
    getVideoById, 
    getAllVideos, 
    commentOnVideo, 
    likeVideo, 
    removeLike, 
    removeBookmarkVideo, 
    bookmarkVideo, 
    subscribe, 
    incrementViews } from "@/actions/videosActions"
import { Models } from "appwrite"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import ReactPlayer from 'react-player'
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    Bookmark,
    ChevronDown,
    ChevronUp,
    UserRound, 
    MessageCircle,
    ThumbsUpIcon, 
} from "lucide-react"
import Loader from "@/components/shared/Loader"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { getCurrentUser } from "@/actions/authActions"

// Helper function to format views (e.g., 1.2M, 50K)
const formatViews = (views: number) => {
    if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)}M views`;
    }
    if (views >= 1000) {
        return `${(views / 1000).toFixed(0)}K views`;
    }
    return `${views} views`;
};

// Helper function to calculate time ago (simple version)
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

// Helper function to format subscriber count (placeholder)
const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M subscribers`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(0)}K subscribers`;
    }
    return `${count} subscribers`;
};


function Watch() {
    const { videoId } = useParams<{ videoId: string }>();
    const [video, setVideo] = useState<Models.Document | undefined>(undefined);
    const [recommendedVideos, setRecommendedVideos] = useState<Models.Document[] | undefined>(undefined);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");
    const commentInputRef = useRef<HTMLTextAreaElement>(null)
    const [refetch, setRefetch] = useState(false)
    const [views,setViews]=useState(0)
    const { userProfile,setUserProfile } = useAuth()
    const router = useRouter()
    useEffect(() => {
        // Fetch main video
        getVideoById(videoId)
            .then((data) => {
                getCurrentUser()
                .then((data)=>{
                    setUserProfile(data)
                })
                .catch((error)=>{
                    toast("Failed to update profile,please refresh page")
                })
                setVideo(data);
                setViews(data.views)
            })
            .catch((error) => {
                router.push("/not-found")
            })
            .finally(()=>setRefetch(false));

    }, [videoId, refetch]); // Re-fetch if videoId changes
    useEffect(() => {
        // Fetch all videos for recommendations, filtering out the current one
        getAllVideos()
            .then((data) => {
                const filteredVideos = data.documents.filter(v => v.$id !== videoId);
                // Shuffle and take a few for "Up Next"
                const shuffled = filteredVideos.sort(() => 0.5 - Math.random());
                setRecommendedVideos(shuffled.slice(0, 10)); // Show up to 10 recommendations
            })
            .catch(error => {
                router.push("/not-found")
            });
    }, [])
    // Handle comment submission (placeholder)
    const handleCommentSubmit = () => {
        commentOnVideo({ text: newCommentText, videoId: videoId })
            .then((newVideo) => {
                toast("Commented Successfully")
                setRefetch(true)
                setNewCommentText("")
            })
            .catch((error) => {
                toast("Please sign-in to comment")
            })
    };

    const handleViews=async ()=>{
        try {
            const updatedVideo=await incrementViews(videoId,video?.views)
            setViews(updatedVideo.views)
        } catch (error) {
        }
    }

    const handleLike = async () => {
        try {
            const isAlreadyLiked = video?.likes.find((like: any) => like?.user?.$id == userProfile?.$id)
            if (isAlreadyLiked) {
                const newVideo = await removeLike(isAlreadyLiked.$id, videoId)
                setRefetch(true)
            } else {
                const newVideo = await likeVideo(videoId)
                setRefetch(true)
            }
        } catch (error) {
            toast("Something went wrong!")
        }
    }

    const handleSave = async () => {
        try {
            const isSaved = video?.bookmarks.find((bookmark: any) => bookmark?.user?.$id == userProfile?.$id)
            if (isSaved) {
                const newVideo = await removeBookmarkVideo(isSaved.$id, videoId)
                setRefetch(true)
                toast("Video unsaved successfully")
            } else {
                const newVideo = await bookmarkVideo(videoId)
                setRefetch(true)
                toast("Video saved successfully")
            }
        } catch (error) {
            toast("Something went wrong")
        }
    }
    const handleSubscribe = async () => {
        try {
                const isSubscribed=await subscribe(video?.channel?.$id)
                if(isSubscribed){
                    toast("Subscribed to the channel successfully")
                    setRefetch(true)
                }else{
                    toast("Unsubscribed to the channel successfully")
                    setRefetch(true)
                }
            
        } catch (error) {
            toast("Something went wrong")
        }
    }
    if (!video) {
        return <Loader />
    }

    // Extracting data for clarity and fallbacks
    const videoTitle = video.title || "Untitled Video";
    const videoUrl = video.videoUrl;
    const thumbnailUrl = video.thumbnailUrl || "https://placehold.co/400";
    const channelName = video.channel?.name || "Unknown Channel";
    const channelAvatarUrl = video.channel?.avatar_url || "https://placehold.co/80x80";
    // const views = video.views || 0;
    const uploadTimestamp = video.$createdAt || new Date().toISOString();
    const description = video.description || "No description available.";
    const likesCount = video.likes?.length || 0; // Assuming 'likes' is an array
    const commentsCount = video.comments?.length || 0; // Assuming 'comments' is an array
    const subscribersCount = video.channel?.subscribers?.length || 0; // Placeholder for subscribers
    const isSubscribed=userProfile?.subscriptions.some((subscription:any)=>subscription.channel.$id==video?.channel.$id)
    const isSaved=video?.bookmarks.some((bookmark: any) => bookmark?.user?.$id == userProfile?.$id) 
    const isLiked=video.likes.some((like: any) => like.user.$id == userProfile?.$id)
    return (
        <div className="container mx-auto p-4 lg:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content Area (Video Player + Details) */}
                {video &&
                    <div className="flex-1 min-w-0">
                        {/* Video Player */}
                        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                            {videoUrl ? (
                                <ReactPlayer
                                    src={videoUrl}
                                    controls
                                    width="100%"
                                    height="100%"
                                    playing={true} // Auto-play
                                    light={thumbnailUrl} // Show thumbnail before playing
                                    onPlay={handleViews}
                                    
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-white">
                                    Video URL not available.
                                </div>
                            )}
                        </div>

                        {/* Video Title */}
                        <h1 className="text-xl sm:text-2xl font-bold mt-4 line-clamp-2">
                            {videoTitle}
                        </h1>

                        {/* Channel Info & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-3">
                            <div className="flex items-center gap-3">
                                {/* Channel Avatar */}
                                <Link href={`/channel/${video.channel.$id}`}>
                                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                    {channelAvatarUrl ? (
                                        <Image
                                            src={channelAvatarUrl}
                                            alt={`${channelName} avatar`}
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <UserRound className="w-full h-full text-gray-400 bg-gray-200 p-1 rounded-full" />
                                    )}
                                </div>
                                    </Link>
                                <Link href={`/channel/${video.channel.$id}`}>
                                    <h2 className="text-base font-semibold">{channelName}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatSubscribers(subscribersCount)}
                                    </p>
                                </Link>
                  
                                {/* Subscribe Button (Placeholder) */}
                                <Button onClick={handleSubscribe} variant="default" className="ml-4 px-4 py-2 rounded-full">
                                    {isSubscribed?"Subscribed":"Subscribe"}
                                </Button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                                <Button onClick={handleLike} variant="ghost" size="sm" className="rounded-full flex items-center gap-1">
                                    <ThumbsUpIcon className={`h-5 w-5 ${isLiked ? "fill-accent-foreground" : ""}`} /> {likesCount}
                                </Button>
                                <Separator orientation="vertical" className="h-6 bg-gray-300 dark:bg-gray-700" />
                                <Button onClick={() => commentInputRef?.current?.focus()} variant="ghost" size="sm" className="rounded-full flex items-center gap-1">
                                    <MessageCircle className="h-5 w-5" /> {commentsCount}
                                </Button>
                                <Button onClick={handleSave} variant="ghost" size="sm" className="rounded-full flex items-center gap-1">
                                    <Bookmark className={`h-5 w-5 ${isSaved ? "fill-accent-foreground" : ""}`} />
                                    {isSaved? "Saved" : "Save"}
                                </Button>
                            </div>
                        </div>

                        {/* Video Description */}
                        <Collapsible
                            open={isDescriptionOpen}
                            onOpenChange={setIsDescriptionOpen}
                            className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
                        >
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between cursor-pointer">
                                    <div className="font-semibold">
                                        {formatViews(views)} • {timeAgo(uploadTimestamp)}
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        {isDescriptionOpen ? (
                                            <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                                        ) : (
                                            <>Show More <ChevronDown className="h-4 w-4 ml-1" /></>
                                        )}
                                    </Button>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {description}
                            </CollapsibleContent>
                        </Collapsible>

                        <Separator className="my-6" />

                        {/* Comments Section */}
                        <div className="comments-section">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                {commentsCount} Comments <MessageCircle className="h-5 w-5" />
                            </h3>

                            {/* New Comment Input */}
                            <div className="flex items-start gap-3 mt-4">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                    <Image
                                        src={userProfile?.avatar_url || "https://placehold.co/600x400"}
                                        alt="Your avatar"
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="comment-input" className="sr-only">Add a comment</Label>
                                    <Textarea
                                        ref={commentInputRef}
                                        id="comment-input"
                                        placeholder="Add a comment..."
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        className="resize-none"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button variant="ghost" onClick={() => setNewCommentText("")}>Cancel</Button>
                                        <Button onClick={handleCommentSubmit} disabled={!newCommentText.trim()}>Comment</Button>
                                    </div>
                                </div>
                            </div>

                            {/* Existing Comments List */}
                            <ScrollArea className="h-[300px] mt-6 pr-4"> {/* Fixed height for scrollable comments */}
                                {video.comments.length > 0 ? (
                                    video.comments.map((comment: any) => (
                                        <div key={comment.$id} className="flex items-start gap-3 mb-4">
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                {/* Commenter's avatar */}
                                                {comment.user?.avatar_url ? (
                                                    <Image
                                                        src={comment.user.avatar_url}
                                                        alt={`${comment.user.name} avatar`}
                                                        fill
                                                        sizes="32px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <UserRound className="w-full h-full text-gray-400 bg-gray-200 p-1 rounded-full" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-semibold">{comment.user?.name || "Anonymous"}</span>
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        {timeAgo(comment.$createdAt || new Date().toISOString())}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No comments yet. Be the first to comment!</p>
                                )}
                                <ScrollBar orientation="vertical" />
                            </ScrollArea>
                        </div>
                    </div>
                }
                {/* Sidebar (Recommended Videos) */}
                <div className="w-full bg-sidebar lg:w-80 xl:w-96 lg:flex-shrink-0 overflow-hidden">
                    <h3 className="text-lg font-semibold mb-4">Up Next</h3>
                    <div className="flex flex-col gap-4">
                        {recommendedVideos && recommendedVideos.length > 0 ? (
                            recommendedVideos.map((recVideo: any) => (
                                <Link href={`/watch/${recVideo.$id}`} key={recVideo.$id} className="flex gap-3 group">
                                    {/* Thumbnail */}
                                    <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                        <Image
                                            src={recVideo.thumbnailUrl || "/placeholder-thumbnail.jpg"}
                                            alt={recVideo.title || "Recommended Video"}
                                            fill
                                            sizes="160px"
                                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                                        />
                                    </div>
                                    {/* Video Info */}
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold leading-tight line-clamp-2">
                                            {recVideo.title || "Untitled Recommended Video"}
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {recVideo.channel?.name || "Unknown Channel"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {formatViews(recVideo.views || 0)} • {timeAgo(recVideo.$createdAt || new Date().toISOString())}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No recommended videos found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Watch;