import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { uploadMedia } from "@/lib/payload"

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const alt = formData.get('alt') as string
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const media = await uploadMedia(file, String(session.user.id), alt)
    
    return NextResponse.json({ media })
  } catch (error) {
    console.error("Failed to upload media:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
