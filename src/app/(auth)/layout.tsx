"use client"
import Loader from '@/components/shared/Loader'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function AuthLayout({children}:{children:React.ReactNode}) {
  const router=useRouter()
  const {isAuthenticated,loading}=useAuth()
  useEffect(()=>{
    if(isAuthenticated) router.push("/")
  },[isAuthenticated,router])
  if(loading) return <Loader />
  return children
}

export default AuthLayout