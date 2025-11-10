import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get the token from cookies or headers
    const token = req.cookies.get("token")?.value || "";

    if (!token) {
      return NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
    }

    // Call backend verify-token endpoint
    const response = await fetch(
      "https://ai-therepist-agent-backend-api.onrender.com/auth/verify-token",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ isAuthenticated: false, user: null }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      isAuthenticated: data.isAuthenticated,
      user: data.user || null,
    });
  } catch (error) {
    console.error("Error getting auth session:", error);
    return NextResponse.json(
      { isAuthenticated: false, user: null, error: "Failed to get auth session" },
      { status: 500 }
    );
  }
}
