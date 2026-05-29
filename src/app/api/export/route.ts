import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { WeatherRecord } from '@/types';

function toCSV(records: WeatherRecord[]): string {
  const headers = [
    'id', 'location', 'latitude', 'longitude', 'date_from', 'date_to',
    'temperature_min', 'temperature_max', 'temperature_avg',
    'description', 'weather_icon', 'notes', 'created_at',
  ];
  const escape = (v: unknown) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = records.map(r =>
    headers.map(h => escape(r[h as keyof WeatherRecord])).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function toXML(records: WeatherRecord[]): string {
  const escape = (s: unknown) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const items = records.map(r => `
  <record>
    <id>${r.id}</id>
    <location>${escape(r.location)}</location>
    <latitude>${r.latitude ?? ''}</latitude>
    <longitude>${r.longitude ?? ''}</longitude>
    <date_from>${r.date_from}</date_from>
    <date_to>${r.date_to}</date_to>
    <temperature_min>${r.temperature_min ?? ''}</temperature_min>
    <temperature_max>${r.temperature_max ?? ''}</temperature_max>
    <temperature_avg>${r.temperature_avg ?? ''}</temperature_avg>
    <description>${escape(r.description)}</description>
    <weather_icon>${escape(r.weather_icon)}</weather_icon>
    <notes>${escape(r.notes)}</notes>
    <created_at>${r.created_at}</created_at>
  </record>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<weather_records>${items}\n</weather_records>`;
}

function toMarkdown(records: WeatherRecord[]): string {
  const lines = [
    '# Weather Records Export',
    `Generated: ${new Date().toISOString()}`,
    '',
    '| ID | Location | Date From | Date To | Temp Min | Temp Max | Temp Avg | Description | Notes |',
    '|----|----------|-----------|---------|----------|----------|----------|-------------|-------|',
    ...records.map(r =>
      `| ${r.id} | ${r.location} | ${r.date_from} | ${r.date_to} | ${r.temperature_min ?? '-'}°C | ${r.temperature_max ?? '-'}°C | ${r.temperature_avg ?? '-'}°C | ${r.description} | ${r.notes} |`
    ),
  ];
  return lines.join('\n');
}

async function toPDF(records: WeatherRecord[]): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default;
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(20).fillColor('#1e40af').text('Weather Records Export', { align: 'center' });
    doc.fontSize(10).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.5);

    if (records.length === 0) {
      doc.fontSize(12).fillColor('#374151').text('No records found.', { align: 'center' });
    }

    records.forEach((r, idx) => {
      if (idx > 0) doc.moveDown(0.8);
      doc.fontSize(13).fillColor('#1e40af').text(`${r.weather_icon} ${r.location}`, { continued: false });
      doc.fontSize(10).fillColor('#374151');
      doc.text(`ID: ${r.id}  |  Date Range: ${r.date_from} → ${r.date_to}`);
      doc.text(`Temperature: Min ${r.temperature_min ?? '-'}°C  /  Max ${r.temperature_max ?? '-'}°C  /  Avg ${r.temperature_avg ?? '-'}°C`);
      doc.text(`Conditions: ${r.description}`);
      if (r.notes) doc.text(`Notes: ${r.notes}`);
      doc.text(`Recorded: ${r.created_at}`, { color: '#9ca3af' } as Parameters<typeof doc.text>[1]);
      doc.moveTo(40, doc.y + 4).lineTo(555, doc.y + 4).stroke('#e5e7eb');
    });

    doc.end();
  });
}

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format') ?? 'json';
  const records = db.getAll();

  switch (format) {
    case 'json':
      return new Response(JSON.stringify(records, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="weather-records.json"',
        },
      });

    case 'csv': {
      const csv = toCSV(records);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="weather-records.csv"',
        },
      });
    }

    case 'xml': {
      const xml = toXML(records);
      return new Response(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': 'attachment; filename="weather-records.xml"',
        },
      });
    }

    case 'markdown': {
      const md = toMarkdown(records);
      return new Response(md, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': 'attachment; filename="weather-records.md"',
        },
      });
    }

    case 'pdf': {
      try {
        const pdfBuffer = await toPDF(records);
        return new Response(new Uint8Array(pdfBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="weather-records.pdf"',
          },
        });
      } catch {
        return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
      }
    }

    default:
      return NextResponse.json({ error: 'Unknown format. Use: json, csv, xml, markdown, pdf' }, { status: 400 });
  }
}
