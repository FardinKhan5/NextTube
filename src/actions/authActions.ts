"use client"
import { account, appwriteConfig, avatars, database, storage } from "@/appwrite/config"
import { ID, Models, Query } from "appwrite"

interface Iuser {
    name?: string;
    email: string;
    password: string;
}
const createUser = async (user: Iuser): Promise<Models.Document> => {
    try {
        const userAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        )
        if (!userAccount) throw Error
        const avatar = avatars.getInitials(user.name)
        const profile = await database.createDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteProfilesCollectionId,
            userAccount.$id,
            {
                name: userAccount.name,
                email: userAccount.email,
                avatar_url: avatar
            }
        )
        return profile

    } catch (error: any) {
        console.log(error)
        throw error
    }
}

const loginUser = async (user: Iuser): Promise<Models.Document> => {
    try {
        const session = await account.createEmailPasswordSession(user.email, user.password)
        if (!session) throw Error
        const profile = await getCurrentUser()
        return profile
    } catch (error: any) {
        console.log(error)
        throw error
    }
}

const getCurrentUser = async (): Promise<Models.Document> => {
    try {
        const userAccount = await account.get()
        if (!userAccount) throw Error
        const profile = await database.getDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteProfilesCollectionId,
            userAccount.$id
        )
        return profile
    } catch (error: any) {
        console.log(error)
        throw error
    }
}

const logoutUser = async () => {
    try {
        await account.deleteSession("current")
        return true
    } catch (error) {
        console.log(error)
        throw error
    }
}

const updateUserName = async (name: string) => {
    try {
        await account.updateName(name)
        const profile = await updateProfile({ name })
        return profile
    } catch (error) {
        console.log(error)
        throw error
    }

}

const updateUserEmail = async (email: string, password: string) => {
    try {
        await account.updateEmail(email, password)
        const profile = await updateProfile({ email })
        return profile
    } catch (error) {
        console.log(error)
        throw error
    }
}

const updateAvatar = async (avatarFile: File, oldAvatarUrl: string) => {
    try {
        if (oldAvatarUrl.includes("/storage/buckets/")) {
            const fileId = oldAvatarUrl.slice(oldAvatarUrl.lastIndexOf("files/") + 6, oldAvatarUrl.indexOf("/view"))
            await storage.deleteFile(
                appwriteConfig.appwriteBucketId,
                fileId
            )
        }
        const avatar = await storage.createFile(
            appwriteConfig.appwriteBucketId,
            ID.unique(),
            avatarFile
        )
        const avatar_url = storage.getFileView(
            appwriteConfig.appwriteBucketId,
            avatar.$id
        )
        const profile = await updateProfile({ avatar_url })
        return profile
    } catch (error) {
        console.log(error)
        throw error
    }
}

const updateProfile = async (data: object) => {
    try {
        const user = await account.get()
        const profile = await database.updateDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteProfilesCollectionId,
            user.$id,
            data
        )
        return profile
    } catch (error) {
        console.log(error)
        throw error
    }
}

const getProfiles = async (query: string, id = "") => {
    try {
        const profiles = await database.listDocuments(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteProfilesCollectionId,
            [
                Query.search("name", query)
            ]
        )
        return profiles
    } catch (error) {
        console.log(error)
        throw error
    }
}

const getProfile = async (id: string) => {
    try {
        const profile = await database.getDocument(
            appwriteConfig.appwwriteDatabaseId,
            appwriteConfig.appwriteProfilesCollectionId,
            id
        )
        return profile
    } catch (error) {
        console.log(error)
        throw error
    }
}

export {
    createUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    updateUserName,
    updateUserEmail,
    updateAvatar,
    updateProfile,
    getProfiles,
    getProfile
}