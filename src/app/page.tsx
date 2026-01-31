
"use client"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

export default function Home() {

  const {isAuthenticated} = useAuth()
  if(!isAuthenticated) window.location.href = "/login";
  return (
    <>
    
    
    </>
  );
}
