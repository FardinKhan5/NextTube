import Link from 'next/link'

function NotFound() {
  return (
    <div className='flex-1 flex flex-col justify-center items-center'>
      <h2 className='text-xl'>Not Found</h2>
      <p className=''>Could not find requested resource</p>
      <Link href="/" className='font-bold underline'>Return Home</Link>
    </div>
  )
}

export default NotFound