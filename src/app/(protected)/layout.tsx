"use client"
import AppSidebar from '@/components/shared/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

function ProtectedLayout({children}:{children:React.ReactNode}) {
  return <>
  <SidebarProvider className='flex-1 flex gap-2'>
    <AppSidebar />
      <SidebarTrigger className='sm:hidden' />
      {children}
  </SidebarProvider>
  </>
}

export default ProtectedLayout