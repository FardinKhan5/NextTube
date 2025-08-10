'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getAllVideos } from '@/actions/videosActions';
import { getProfiles } from '@/actions/authActions';
import { Models } from 'appwrite';
import { Spinner } from '@/components/ui/spinner';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchPage() {
    const { search } = useParams<{ search: string }>();
    const query = search;

    const [videos, setVideos] = useState<Models.Document[]>([]);
    const [channels, setChannels] = useState<Models.Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('videos');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            const fetchedVideos = await getAllVideos(query);
            const fetchedChannels = await getProfiles(query);

            setVideos(fetchedVideos.documents);
            setChannels(fetchedChannels.documents);
            setLoading(false);
        }

        if (query) fetchData();
    }, [query]);

    return (
        <div className="p-6 container max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Search results for &quot;{query}&quot;</h1>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="w-full mb-4 flex">
                    <TabsTrigger value="videos" className="flex-1">Videos</TabsTrigger>
                    <TabsTrigger value="channels" className="flex-1">Channels</TabsTrigger>
                </TabsList>

                {/* Videos Tab */}
                <TabsContent value="videos">
                    {loading ? (
                        <Spinner />
                    ) : videos.length ? (
                        <div className="space-y-6">
                            {videos.map((video) => (
                                <Link href={`/watch/${video.$id}`} key={video.$id}>
                                    <div className="flex gap-4">
                                        {/* Thumbnail */}
                                        <div className="relative w-48 h-28 flex-shrink-0">
                                            <Image
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>

                                        {/* Video Info */}
                                        <div className="flex flex-col gap-2">
                                            <div>
                                                <h2 className="text-md font-semibold line-clamp-2">{video.title}</h2>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-2">
                                                <span>{video.channel?.name || 'Unknown Channel'}</span> •{' '}
                                                <span>{video.views ?? 0} views</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No videos found.</p>
                    )}
                </TabsContent>

                {/* Channels Tab */}
                <TabsContent value="channels">
                    {loading ? (
                        <Spinner />
                    ) : channels.length ? (
                        <div className="grid gap-4">
                            {channels.map((channel) => (
                                <Link href={`/channel/${channel.$id}`} key={channel.$id}>
                                <Card  className="p-4 flex flex-row">

                                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                        src={channel.avatar_url}
                                        alt={`${channel.name} avatar`}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                    />
                                    </div>
                                    <div>
                                     <p className="font-medium">{channel.name}</p>
                                    <p className="text-sm text-muted-foreground">{channel?.subscribers.length} subscribers</p>
                                    </div>
                                
                                </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No channels found.</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}


