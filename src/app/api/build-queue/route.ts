/**
 * Screen Build Queue API
 * GET  /api/build-queue         — fetch all screens
 * POST /api/build-queue         — claim next screen atomically
 * PATCH /api/build-queue        — update status (done, in_progress, todo)
 */

import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET — fetch all screens ordered by phase/priority
export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('screen_build_queue')
    .select('*')
    .order('phase', { ascending: true })
    .order('priority', { ascending: false })
    .order('id', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// POST — atomic claim: find + lock the next 'todo' screen as 'in_progress'
export async function POST() {
  const supabase = createClient()

  // Find highest priority todo screen in earliest phase
  const { data: candidates, error: findError } = await supabase
    .from('screen_build_queue')
    .select('*')
    .eq('status', 'todo')
    .order('phase', { ascending: true })
    .order('priority', { ascending: false })
    .order('id', { ascending: true })
    .limit(5)

  if (findError || !candidates?.length) {
    return NextResponse.json({ error: 'Queue empty or all done' }, { status: 404 })
  }

  // Try to claim the first one atomically
  const nextScreen = candidates[0]
  const { data, error } = await supabase
    .from('screen_build_queue')
    .update({ status: 'in_progress', updated_at: new Date().toISOString() })
    .eq('id', nextScreen.id)
    .eq('status', 'todo')
    .select()
    .single()

  if (error || !data) {
    // Race condition — someone else grabbed it. Return 409 to signal retry.
    return NextResponse.json({ conflict: true }, { status: 409 })
  }

  return NextResponse.json(data)
}

// PATCH — update a screen's status
export async function PATCH(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  const { id, status, notes } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const update: Record<string, string> = { updated_at: new Date().toISOString() }
  if (status) update.status = status
  if (notes !== undefined) update.notes = notes
  if (status === 'done') update.built_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('screen_build_queue')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 })
  return NextResponse.json(data)
}