import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("carefund")

    const profile = await db.collection("profiles").findOne({ userId: session.user.id })

    if (!profile) {
      return NextResponse.json({ profileCompleted: false }, { status: 200 })
    }

    return NextResponse.json(profile, { status: 200 })
  } catch (error) {
    console.error("[v0] Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileData = await request.json()

    const client = await clientPromise
    const db = client.db("carefund")

    // Upsert profile
    const result = await db.collection("profiles").updateOne(
      { userId: session.user.id },
      {
        $set: {
          ...profileData,
          userId: session.user.id,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    // Update user's profileCompleted status
    await db.collection("users").updateOne({ _id: new ObjectId(session.user.id) }, { $set: { profileCompleted: true } })

    return NextResponse.json({ message: "Profile saved successfully", result }, { status: 200 })
  } catch (error) {
    console.error("[v0] Save profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
