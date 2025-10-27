import { NextRequest, NextResponse } from 'next/server'

// Proxy route for remote WebGPU clustering service
// This allows the frontend to communicate with the clustering service
// even when running in a remote browser environment

const REMOTE_WEBGPU_SERVICE_URL = process.env.REMOTE_WEBGPU_SERVICE_URL || 'http://txt2kg-remote-webgpu:8083'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${REMOTE_WEBGPU_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`
    
    console.log(`Proxying GET request to: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Remote WebGPU service responded with ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Remote WebGPU proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to communicate with remote WebGPU service', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const body = await request.json()
    const url = `${REMOTE_WEBGPU_SERVICE_URL}/${path}`
    
    console.log(`Proxying POST request to: ${url}`)
    console.log(`Request body:`, JSON.stringify(body, null, 2))
    console.log(`Using service URL: ${REMOTE_WEBGPU_SERVICE_URL}`)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Remote WebGPU service responded with ${response.status}: ${response.statusText} - ${errorText}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Remote WebGPU proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to communicate with remote WebGPU service', details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const url = `${REMOTE_WEBGPU_SERVICE_URL}/${path}`
    
    console.log(`Proxying DELETE request to: ${url}`)
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Remote WebGPU service responded with ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Remote WebGPU proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to communicate with remote WebGPU service', details: String(error) },
      { status: 500 }
    )
  }
}
