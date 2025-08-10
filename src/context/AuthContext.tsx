"use client"
import { createUser, getCurrentUser, loginUser, logoutUser } from "@/actions/authActions";
import { Spinner } from "@/components/ui/spinner";
import { Models } from "appwrite";
import { usePathname, useRouter } from "next/navigation";
import { createContext, SetStateAction, useContext, useEffect, useState } from "react"

interface Iuser {
    name?: string;
    email: string;
    password: string;
}
interface IinitialState {
    isAuthenticated:boolean;
    loading:boolean;
    userProfile:Models.Document | null;
    setUserProfile: (value: SetStateAction<Models.Document | null>) => void;
    signUp:(user:Iuser)=>Promise<boolean>;
    signIn:(user:Iuser)=>Promise<boolean>;
    signOut:()=>Promise<boolean>;
}

const initialState = {
    isAuthenticated: false,
    loading: false,
    userProfile: null,
    setUserProfile:()=> undefined,
    signUp: async () => false,
    signIn: async () => false,
    signOut: async () => true
}


const AuthContext = createContext<IinitialState>(initialState)

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userProfile, setUserProfile] = useState<Models.Document | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(false)
    const pathname=usePathname()
    const router = useRouter()
    const signUp = async (user: Iuser) => {
        try {
            setLoading(true)
            const profile = await createUser(user)
            setUserProfile(profile)
            setIsAuthenticated(true)
            return true
        } catch (error) {
            return false
        } finally {
            setLoading(false)
        }
    }
    const signIn = async (user: Iuser) => {
        try {
            setLoading(true)
            const profile = await loginUser(user)
            setUserProfile(profile)
            setIsAuthenticated(true)
            return true
        } catch (error) {
            return false
        } finally {
            setLoading(false)
        }
    }
    const signOut = async () => {
        try {
            setLoading(true)
            await logoutUser()
            setUserProfile(null)
            setIsAuthenticated(false)
            return true
        } catch (error) {
            return false
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        setLoading(true)
        getCurrentUser()
            .then((profile) => {
                setUserProfile(profile)
                setIsAuthenticated(true)
                if(["/sign-in","/sign-up"].includes(pathname)){
                    router.push("/")
                }
            })
            .catch((error) => {
                router.push("/sign-in")
            })
            .finally(()=>setLoading(false))
    }, [])
    return <AuthContext.Provider value={{ isAuthenticated, userProfile,setUserProfile, loading, signUp, signIn,signOut }}>{children}</AuthContext.Provider>
}

const useAuth = ()=>useContext(AuthContext)

export { AuthProvider, useAuth }
