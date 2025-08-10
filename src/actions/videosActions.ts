"use client"

import { videoSchema } from "@/app/(protected)/publish/page"
import { account, appwriteConfig, database, storage } from "@/appwrite/config"
import { ID, Models, Query, UploadProgress } from "appwrite"
import z from "zod"

interface Icomment {
    text: string,
    videoId: string
}

interface Ilike {
    reaction: string,
    videoId: string,
}
interface IVideo extends z.infer<typeof videoSchema> {
    likes?: [],
    comments?: [],
    bookmarks?: []
}
const publishVideo = async (data: IVideo, onProgress: (progress: number) => void) => {
    try {
        const isExist = await database.listDocuments(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteVideosCollectionId,
            [
                Query.equal("title", data.title)
            ]
        )
        if (isExist.total != 0) {
            throw Error("Title must be unique")
        }
        const user = await account.get()
        const video = await storage.createFile(
            appwriteConfig.appwriteBucketId,
            ID.unique(),
            data.video[0],
            [],
            (progress) => {
                onProgress(progress.progress)
            }
        )
        const videoUrl = storage.getFileView(
            appwriteConfig.appwriteBucketId,
            video.$id
        )
        const thumbnail = await storage.createFile(
            appwriteConfig.appwriteBucketId,
            ID.unique(),
            data.thumbnail[0]
        )
        const thumbnailUrl = storage.getFileView(
            appwriteConfig.appwriteBucketId,
            thumbnail.$id
        )
        const videoDoc = await database.createDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteVideosCollectionId,
            ID.unique(),
            {
                title: data.title,
                description: data.description,
                videoUrl,
                thumbnailUrl,
                tags: data.tags?.split(","),
                visibility: data.visibility,
                channel: user.$id,
                likes: data?.likes,
                comments: data?.comments,
                bookmarks: data?.bookmarks
            }
        )
        return videoDoc
    } catch (error: any) {
        console.log(error)
        throw error
    }
}
const updateVideo = async (newVideo: any, oldVideo: any,onProgress: (progress: number) => void) => {
    try {
        if (newVideo.title != oldVideo.title) {
            const isExist = await database.listDocuments(
                appwriteConfig.appwwriteDatabaseId,
                appwriteConfig.appwriteVideosCollectionId,
                [
                    Query.equal("title", newVideo?.title)
                ]
            )
            if (isExist.total != 0) {
                throw Error("Title must be unique")
            }
        }

        let videoUrl = undefined
        let thumbnailUrl = undefined
        if (newVideo?.video?.[0]) {
            const video = await storage.createFile(
                appwriteConfig.appwriteBucketId,
                ID.unique(),
                newVideo.video[0],
                [],
                (progress)=>{
                    onProgress(progress.progress)
                }
            )
            videoUrl = storage.getFileView(
                appwriteConfig.appwriteBucketId,
                video.$id
            )
            await deleteVideoFile(oldVideo.videoUrl)
        }
        if (newVideo?.thumbnail?.[0]) {
            const thumbnail = await storage.createFile(
                appwriteConfig.appwriteBucketId,
                ID.unique(),
                newVideo.thumbnail[0]
            )
            thumbnailUrl = storage.getFileView(
                appwriteConfig.appwriteBucketId,
                thumbnail.$id
            )
            await deleteThumbnailFile(oldVideo.thumbnailUrl)
        }
        // await deleteVideo(oldVideo.$id, oldVideo.videoUrl, oldVideo.thumbnailUrl)
        const videoDoc = await database.updateDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteVideosCollectionId,
            oldVideo.$id,
            {
                title: newVideo.title,
                description: newVideo.description,
                videoUrl: videoUrl ? videoUrl : oldVideo.videoUrl,
                thumbnailUrl: thumbnailUrl ? thumbnailUrl : oldVideo.thumbnailUrl,
                tags: newVideo.tags?.split(","),
                visibility: newVideo.visibility,
            }
        )
        return videoDoc
    } catch (error) {
        console.log(error)
        throw error
    }
}
const getAllVideos = async (search = "", limit = 25, cursor = "") => {
    try {
        if (search) {
            const videos = await database.listDocuments(
                appwriteConfig.appwwriteDatabaseId,
                appwriteConfig.appwriteVideosCollectionId,
                [
                    Query.and(
                        [
                            Query.search("title", search),
                            Query.equal("visibility", "public")
                        ]
                    )
                ]
            )
            return videos
        }
        const queries: any[] = [Query.equal("visibility", "public"), Query.limit(limit),];

        if (cursor) {
            queries.push(Query.cursorAfter(cursor));
        }
        const videos = await database.listDocuments(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteVideosCollectionId,
            queries
        )
        return videos
    } catch (error) {
        console.log(error)
        throw error
    }
}

const getVideoById = async (videoId: string) => {
    try {
        const video = await database.getDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteVideosCollectionId,
            videoId
        )
        return video
    } catch (error) {
        console.log(error)
        throw error
    }
}

const commentOnVideo = async (data: Icomment) => {
    try {
        const user = await account.get()
        const comment = await database.createDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteCommentsCollectionId,
            ID.unique(),
            {
                text: data.text,
                video: data.videoId,
                user: user.$id
            }
        )
        return comment
    } catch (error) {
        console.log(error)
        throw error
    }
}

const likeVideo = async (videoId: string) => {
    try {
        const user = await account.get()
        const like = await database.createDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteLikesCollectionId,
            ID.unique(),
            {
                reaction: "like",
                video: videoId,
                user: user.$id
            }
        )
        return like
    } catch (error) {
        console.log(error)
        throw error
    }
}

const removeLike = async (likeId: string, videoId: string) => {
    try {
        const like = await database.deleteDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteLikesCollectionId,
            likeId
        )
        return like
    } catch (error) {
        console.log(error)
        throw error
    }
}

const bookmarkVideo = async (videoId: string) => {
    try {
        const user = await account.get()
        const bookmark = await database.createDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteBookmarksCollectionId,
            ID.unique(),
            {
                type: "bookmark",
                user: user.$id,
                video: videoId
            }
        )
        return bookmark
    } catch (error) {
        console.log(error)
        throw error
    }
}

const removeBookmarkVideo = async (bookmarkId: string, videoId: string) => {
    try {
        const bookmark = await database.deleteDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteBookmarksCollectionId,
            bookmarkId
        )
        return bookmark
    } catch (error) {
        console.log(error)
        throw error
    }
}
const deleteVideoFile = async (videoUrl: string) => {
    try {
        if (videoUrl.includes("/storage/buckets/")) {
            const videoFileId = videoUrl.slice(videoUrl.lastIndexOf("files/") + 6, videoUrl.indexOf("/view"))
            await storage.deleteFile(
                appwriteConfig.appwriteBucketId,
                videoFileId
            )
        }
    } catch (error) {
        console.log(error)
        throw error
    }
}
const deleteThumbnailFile = async (thumbnailUrl: string) => {
    try {
        if (thumbnailUrl.includes("/storage/buckets/")) {
            const thumbnailFileId = thumbnailUrl.slice(thumbnailUrl.lastIndexOf("files/") + 6, thumbnailUrl.indexOf("/view"))
            await storage.deleteFile(
                appwriteConfig.appwriteBucketId,
                thumbnailFileId
            )
        }
    } catch (error) {
        console.log(error)
        throw error
    }
}
const deleteVideo = async (videoId: string, videoUrl: string, thumbnailUrl: string) => {
    try {
        if (videoUrl.includes("/storage/buckets/")) {
            const videoFileId = videoUrl.slice(videoUrl.lastIndexOf("files/") + 6, videoUrl.indexOf("/view"))
            await storage.deleteFile(
                appwriteConfig.appwriteBucketId,
                videoFileId
            )
        }
        if (thumbnailUrl.includes("/storage/buckets/")) {
            const thumbnailFileId = thumbnailUrl.slice(thumbnailUrl.lastIndexOf("files/") + 6, thumbnailUrl.indexOf("/view"))
            await storage.deleteFile(
                appwriteConfig.appwriteBucketId,
                thumbnailFileId
            )
        }
        const video = await database.deleteDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteVideosCollectionId,
            videoId
        )
        return video
    } catch (error) {
        console.log(error)
        throw error
    }
}

const subscribe = async (channelId: string) => {
    try {
        const user = await account.get()
        const isSubscribed = await database.listDocuments(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteSubscriptionsCollectionId,
            [
                Query.and([
                    Query.equal("channel", channelId),
                    Query.equal("subscriber", user.$id)
                ])
            ]
        )
        if (isSubscribed.documents.length == 1) {
            await unsubscribe(isSubscribed.documents[0].$id)
            return false
        } else {
            await database.createDocument(
                appwriteConfig.appwwriteDatabaseId,
                appwriteConfig.appwriteSubscriptionsCollectionId,
                ID.unique(),
                {
                    channel: channelId,
                    subscriber: user.$id
                }
            )
            return true
        }
    } catch (error) {
        console.log(error)
        throw error
    }
}

const unsubscribe = async (subscriptionId: string) => {
    try {
        const deletedSubscription = await database.deleteDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteSubscriptionsCollectionId,
            subscriptionId
        )
        return deletedSubscription
    } catch (error) {
        console.log(error)
        throw error
    }
}

const incrementViews = async (videoId: string, views: number) => {
    try {
        const updatedVideo = await database.updateDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteVideosCollectionId,
            videoId,
            {
                views: views + 1
            }
        )
        return updatedVideo
    } catch (error) {
        console.log(error)
        throw error
    }
}

export {
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    likeVideo,
    commentOnVideo,
    removeLike,
    bookmarkVideo,
    removeBookmarkVideo,
    deleteVideo,
    subscribe,
    unsubscribe,
    incrementViews
}