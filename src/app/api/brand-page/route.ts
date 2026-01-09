import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getVendorBrandPage, updateVendorBrandPage } from "@/lib/payload"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const brandPage = await getVendorBrandPage(String(session.user.id))
    
    if (!brandPage) {
      return NextResponse.json({ error: "Brand page not found" }, { status: 404 })
    }

    return NextResponse.json({ brandPage })
  } catch (error) {
    console.error("Failed to fetch brand page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Validate the layout blocks
    if (body.layout && !Array.isArray(body.layout)) {
      return NextResponse.json({ error: "Invalid layout format" }, { status: 400 })
    }

    // Sanitize social links - only allow Instagram and YouTube
    if (body.layout) {
      for (const block of body.layout) {
        if (block.blockType === 'brand-hero' && block.socialLinks) {
          const { instagram, youtube } = block.socialLinks
          
          // Validate Instagram URL
          if (instagram && !instagram.includes('instagram.com')) {
            return NextResponse.json({ error: "Invalid Instagram URL" }, { status: 400 })
          }
          
          // Validate YouTube URL
          if (youtube && !youtube.includes('youtube.com') && !youtube.includes('youtu.be')) {
            return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
          }
          
          // Remove any other social links
          block.socialLinks = { instagram, youtube }
        }
      }
    }

    const brandPage = await updateVendorBrandPage(String(session.user.id), {
      layout: body.layout,
    })

    if (!brandPage) {
      return NextResponse.json({ error: "Brand page not found" }, { status: 404 })
    }

    return NextResponse.json({ brandPage })
  } catch (error) {
    console.error("Failed to update brand page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
