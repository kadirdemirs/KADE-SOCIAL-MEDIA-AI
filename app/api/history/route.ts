import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { data, error } = await supabase
      .from('content_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return NextResponse.json({ history: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Hata'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const body = await req.json()
    const { tool, model, input_data, output } = body

    if (!tool || !model || !output) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('content_history')
      .insert({ user_id: user.id, tool, model, input_data, output })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ entry: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Hata'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { id } = await req.json()
    const { error } = await supabase
      .from('content_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Hata'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
