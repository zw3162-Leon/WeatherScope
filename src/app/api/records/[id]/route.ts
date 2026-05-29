import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/records/[id] — update a record
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const existing = db.getById(id);
    if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    const body = await req.json();
    const allowedFields = ['notes', 'description'] as const;
    type AllowedField = typeof allowedFields[number];
    const updates: Record<AllowedField, string> = {} as Record<AllowedField, string>;

    for (const field of allowedFields) {
      if (field in body && typeof body[field] === 'string') {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update. Allowed: notes, description' }, { status: 400 });
    }

    db.update(id, updates);
    const updated = db.getById(id);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/records/[id] — delete a record
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const existing = db.getById(id);
    if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    db.delete(id);
    return NextResponse.json({ success: true, deleted_id: id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
