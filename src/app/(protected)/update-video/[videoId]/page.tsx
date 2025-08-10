"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { useParams, useRouter } from "next/navigation"
import { getVideoById, updateVideo } from "@/actions/videosActions"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Models } from "appwrite"
import Loader from "@/components/shared/Loader"
import { Progress } from "@/components/ui/progress"

const videoTypes = ["video/mp4", "video/webm", "video/ogg"]
const thumbnailTypes = ["image/jpeg", "image/png", "image/webp"]

export const videoSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters long").max(256),
    description: z.string().max(1024),
    video: z
        .custom<FileList>(
            (data) => data instanceof FileList && data.length > 0,
            "Video is required"
        )
        .refine((fileList) => videoTypes.includes(fileList[0].type), "Invalid video format")
        .optional(),
    thumbnail: z
        .custom<FileList>(
            (data) => data instanceof FileList && data.length > 0,
            "Thumbnail is required"
        )
        .refine((fileList) => thumbnailTypes.includes(fileList[0].type), "Invalid image format")
        .optional(),
    tags: z.string().optional(),
    visibility: z.enum(["public", "private"]),
})

function UpdateVideo() {
    const { videoId } = useParams<{ videoId: string }>()
    const [progress,setProgress]=useState<number>()
    const [loading, setLoading] = useState(false)
    const [video, setVideo] = useState<Models.Document>()
    const router = useRouter()

    const form = useForm<z.infer<typeof videoSchema>>({
        resolver: zodResolver(videoSchema),
        defaultValues: {
            title: "",
            description: "",
            tags: "",
            visibility: "public",
        },
    })
    useEffect(() => {
        getVideoById(videoId)
            .then((data) => {
                setVideo(data)
                form.reset({
                    title: data?.title || "",
                    description: data?.description || "",
                    tags: data?.tags.toString() || "",
                    visibility: data?.visibility || "public",
                })
            })
            .catch((error) => {
                toast("Video not found")
                router.push("/not-found")
            })
    }, [])
    const onSubmit = (values: z.infer<typeof videoSchema>) => {
        setLoading(true)
        updateVideo(values,video,setProgress)
            .then(() => {
                toast.success("Video updated successfully")
                router.push("/")
            })
            .catch((error) => {
                toast.error(error?.message || "Failed to update the video")
            })
            .finally(() => setLoading(false))
    }
    if(!video) return <Loader />
    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-primary">Update Video</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter video title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Brief description (optional)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-center items-center">
                                <video poster={video?.thumbnailUrl} controls>
                                    <source src={video?.videoUrl} />
                                </video>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="video"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Upload Video</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept={videoTypes.join(",")}
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    ref={field.ref}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="thumbnail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Thumbnail Image</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept={thumbnailTypes.join(",")}
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    ref={field.ref}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Comma-separated tags (e.g. music, vlog, travel)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visibility</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                className="flex items-center gap-6"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="public" id="public" />
                                                    <Label htmlFor="public">Public</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="private" id="private" />
                                                    <Label htmlFor="private">Private</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-2">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Spinner /> : "Update Video"}
                                </Button>
                                {loading && <Progress value={progress} />}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default UpdateVideo
