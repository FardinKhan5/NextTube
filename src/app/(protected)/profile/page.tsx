"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import { Edit, PencilLine, PlusCircle, Upload, User } from "lucide-react";
import CustomDialog from "@/components/shared/CustomDialog";
import { DialogClose } from "@/components/ui/dialog";
import { updateAvatar, updateProfile, updateUserEmail, updateUserName } from "@/actions/authActions";
import { Spinner } from "@/components/ui/spinner";


export default function Profile() {
  const { userProfile, setUserProfile } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState<File | null>()
  const [error, setError] = useState("")
  const [loading,setLoading]=useState(false)
  const [openNameDialog, setOpenNameDialog] = useState(false)
  const [openEmailDialog, setOpenEmailDialog] = useState(false)
  const [openBioDialog, setOpenBioDialog] = useState(false)
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false)
  const handleNameUpdate = () => {
    if (name.length < 2) {
      setError("Name must be atleast 2 characters long")
      return
    } else {
      updateUserName(name)
        .then((data) => {
          setUserProfile(data)
          setOpenNameDialog(false)
          setName("")
          toast("Name updated successfully")
        })
        .catch((error) => {
          toast("Failed to update name")
        })
    }
  }
  const handleEmailUpdate = () => {
    if (!email || !password) {
      setError("Email and Password are required")
      return
    }
    updateUserEmail(email, password)
      .then((data) => {
        setUserProfile(data)
        toast("Email updated successfully")
        setOpenEmailDialog(false)
        setEmail("")
        setPassword("")
      })
      .catch((error) => {
        toast("Failed to update email")
      })
      .finally(() => setError(""))
  }
  const handleBioUpdate = () => {
    updateProfile({ bio })
      .then((data) => {
        setUserProfile(data)
        toast("Bio updated successfully")
        setOpenBioDialog(false)
      })
      .catch((error) => {
        toast("Failed to update bio")
      })
      .finally(() => setBio(""))
  }
  const handleAvatarUpdate = () => {
    if(!avatar){
      setError("Avatar is required")
      return
    }
    if(!["image/jpeg", "image/png", "image/webp"].includes(avatar.type)){
      setError("Invalid image format")
      return
    }
    setLoading(true)
    updateAvatar(avatar,userProfile?.avatar_url)
    .then((data)=>{
      setUserProfile(data)
      setOpenAvatarDialog(false)
      toast("Avatar updated successfully")
    })
    .catch((error)=>{
      toast("Failed to update avatar")
    })
    .finally(()=>{
      setError("")
      setLoading(false)
    })
  }

  if (!userProfile) return <Loader />
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary font-bold">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Avatar */}
          <div className="flex justify-center items-center">
            <Avatar className="h-30 w-30">
              <AvatarImage src={userProfile.avatar_url} />
              <AvatarFallback><User /></AvatarFallback>

            </Avatar>
            <div className="relative -bottom-14 -left-8 bg-secondary rounded-2xl">
              <CustomDialog open={openAvatarDialog} setOpen={setOpenAvatarDialog} icon={<Upload />} title="Update avatar" description="Upload new avatar">
                <Input type="file" accept={["image/jpeg", "image/png", "image/webp"].join(",")} onChange={(e) => setAvatar(e.target?.files?.[0])}  className="border-1 border-accent-foreground"/>
                {error && <p className="text-red-600">{error}</p>}
                <div className="flex justify-end gap-4">
                  <DialogClose asChild><Button>Close</Button></DialogClose>
                  <Button onClick={handleAvatarUpdate}>{loading?<Spinner />:"Update"}</Button>
                </div>
              </CustomDialog>
            </div>
          </div>
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="flex gap-2">
              <Input
                className="border-1 border-accent-foreground"
                id="name"
                disabled
                value={userProfile.name}
              />
              <CustomDialog open={openNameDialog} setOpen={setOpenNameDialog} icon={<PencilLine />} title="Update Name" description="Enter new name">
                <Input value={name} onChange={(e) => setName(e.target.value)} className="border-1 border-accent-foreground" placeholder="Enter new name" />
                {error && <p className="text-red-600">{error}</p>}
                <div className="flex justify-end gap-4">
                  <DialogClose asChild><Button>Close</Button></DialogClose>
                  <Button onClick={handleNameUpdate}>Update</Button>
                </div>
              </CustomDialog>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                className="border-1 border-accent-foreground"
                id="email"
                type="email"
                disabled
                value={userProfile.email}
              />
              <CustomDialog open={openEmailDialog} setOpen={setOpenEmailDialog} icon={<PencilLine />} title="Update Email" description="Enter new email and password">
                <label htmlFor="newEmail">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="newEmail" className="border-1 border-accent-foreground" placeholder="Enter new email" />
                <label htmlFor="currPassword">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} id="currPassword" className="border-1 border-accent-foreground" placeholder="Enter you password" />
                {error && <p className="text-red-600">{error}</p>}
                <div className="flex justify-end gap-4">
                  <DialogClose asChild><Button>Close</Button></DialogClose>
                  <Button onClick={handleEmailUpdate}>Update</Button>
                </div>
              </CustomDialog>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <div className="flex gap-2">
              <Textarea
                className="border-1 border-accent-foreground"
                id="bio"
                disabled
                value={userProfile.bio || ""}
              />
              <CustomDialog open={openBioDialog} setOpen={setOpenBioDialog} icon={<PencilLine />} title="Update Bio" description="Enter new bio">
                <Textarea
                  className="border-1 border-accent-foreground"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <div className="flex justify-end gap-4">
                  <DialogClose asChild><Button>Close</Button></DialogClose>
                  <Button onClick={handleBioUpdate}>Update</Button>
                </div>
              </CustomDialog>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
