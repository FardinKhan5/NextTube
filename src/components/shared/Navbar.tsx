"use client"
import { useAuth } from '@/context/AuthContext'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { MoveLeft, Search } from 'lucide-react'
import {ModeToggle} from '@/components/shared/ToggleTheme'
function Navbar() {
    const { isAuthenticated, signOut } = useAuth()
    const [mobileSearch,setMobileSearch]=useState(false)
    const [search,setSearch]=useState("")
    const router = useRouter()
    const handleSignOut = () => {
        signOut()
            .then((result) => {
                if (result) {
                    toast("Signed out successfully")
                    router.push("/sign-in")
                } else {
                    toast("Sign out failed")
                }
            })
    }
    const handleSearch=()=>{
        router.push(`/search/${search}`)
        setSearch("")
    }
    return (
        <div className='grid grid-cols-2 border-2 border-border p-2'>
                <Link href="/" className='font-bold text-xl mb-2 text-primary'>NextTube</Link>
            {
                isAuthenticated ?
                    <div className="flex gap-4">

                        <div className="hidden sm:flex flex-1 gap-4 items-center ">
                            <Input placeholder='Search' value={search} onChange={(e)=>setSearch(e.target.value)} />
                            <Search className='cursor-pointer' onClick={handleSearch} />
                        </div>
                    {mobileSearch?
                            <div className='sm:hidden flex flex-1 py-2 px-4 gap-4 items-center absolute left-0 w-full bg-background z-10'>
                                <MoveLeft onClick={()=>setMobileSearch(false)} />
                                <Input placeholder='Search' value={search} onChange={(e)=>setSearch(e.target.value)} />
                                <Search onClick={handleSearch} />
                            </div>:null
                    }
                        <div className="flex flex-1 items-center justify-end gap-4 sm:hidden">
                        <Search className='' onClick={(e)=>setMobileSearch(true)} />
                        </div>
                        <ModeToggle />
                        <Button onClick={handleSignOut}>Sign Out</Button>
                    </div>
                    : <div className='flex justify-end items-center gap-1'>
                        <ModeToggle />
                        <Link href="/sign-in"><Button>Sign In</Button></Link>
                        <Link href="/sign-up"><Button>Sign Up</Button></Link>
                    </div>
            }
        </div>
        
    )
}

export default Navbar