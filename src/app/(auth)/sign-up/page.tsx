"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
const formSchema = z.object({
  name: z.string("Name is required").min(2).max(32),
  email: z.email("Email is required"),
  password: z.string("Password is required").min(8, "Password must be atleast 8 characters long")
})
function SignUp() {
  const router=useRouter()
  const {signUp,signIn,loading}=useAuth()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    signUp(values)
    .then((result)=>{
      if(result){
        signIn(values)
        .then((result)=>{
          if(result){
            toast("Signed up successfully")
            router.push("/")
          }else{
            toast("Sign in to continue")
            router.push("/sign-in")
          }
        })
      }else{
        toast("Sign up failed")
      }
    })
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">{loading?<Spinner />:"Sign Up"}</Button>
        </form>
      </Form>
    </div>
  )
}

export default SignUp