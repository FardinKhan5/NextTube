import { Account, Avatars, Client, Databases, Storage } from "appwrite"

export const appwriteConfig={
    appwriteEndpoint:process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string,
    appwriteProjectId:process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string,
    appwwriteDatabaseId:process.env.NEXT_PUBLIC_DATABASE_ID as string,
    appwriteBucketId:process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID as string,
    appwriteVideosCollectionId:process.env.NEXT_PUBLIC_APPWRITE_VIDEOS_COLLECTION_ID as string,
    appwriteProfilesCollectionId:process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID as string,
    appwriteCommentsCollectionId:process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
    appwriteLikesCollectionId:process.env.NEXT_PUBLIC_APPWRITE_LIKES_COLLECTION_ID as string,
    appwriteBookmarksCollectionId:process.env.NEXT_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID as string,
    appwriteSubscriptionsCollectionId:process.env.NEXT_PUBLIC_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID as string,
}

const client=new Client()
                .setEndpoint(appwriteConfig.appwriteEndpoint)
                .setProject(appwriteConfig.appwriteProjectId)

const account=new Account(client)
const database=new Databases(client)
const avatars=new Avatars(client)
const storage=new Storage(client)

export {client,account,database,avatars,storage}