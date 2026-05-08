import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

export async function generatePDF({
  period, periodLabel, revenue, cashRevenue, momoRevenue,
  eggsSold, eggsReceived, eggsBroken, sales, topCreditors,
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const amber = [217, 119, 6]
  const dark = [28, 25, 23]
  const grey = [120, 113, 108]
  const white = [255, 255, 255]

  const pageW = doc.internal.pageSize.getWidth()

  // Header bar
  doc.setFillColor(...amber)
  doc.rect(0, 0, pageW, 28, 'F')

  doc.setTextColor(...white)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Eggies', 14, 12)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${period} Report · ${periodLabel}`, 14, 20)

  doc.setTextColor(...grey)
  doc.setFontSize(9)
  doc.text(`Generated ${format(new Date(), 'MMM d, yyyy h:mm a')}`, pageW - 14, 20, { align: 'right' })

  let y = 38

  // Revenue summary box
  doc.setFillColor(255, 251, 235)
  doc.roundedRect(14, y, pageW - 28, 28, 3, 3, 'F')
  doc.setTextColor(...dark)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Total Revenue', 20, y + 8)
  doc.setFontSize(18)
  doc.setTextColor(...amber)
  doc.text(`GH₵ ${revenue.toFixed(2)}`, 20, y + 20)

  doc.setFontSize(10)
  doc.setTextColor(22, 163, 74)
  doc.text(`Cash: GH₵ ${cashRevenue.toFixed(2)}`, pageW - 80, y + 12)
  doc.setTextColor(124, 58, 237)
  doc.text(`MoMo: GH₵ ${momoRevenue.toFixed(2)}`, pageW - 80, y + 22)

  y += 36

  // Egg stats
  const statCols = ['Eggs Sold', 'Eggs Received', 'Eggs Broken/Discarded']
  const statVals = [String(eggsSold), String(eggsReceived), String(eggsBroken)]
  const colW = (pageW - 28) / 3

  statCols.forEach((label, i) => {
    const x = 14 + i * colW
    doc.setFillColor(245, 245, 244)
    doc.roundedRect(x, y, colW - 3, 20, 2, 2, 'F')
    doc.setTextColor(...grey)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(label, x + (colW - 3) / 2, y + 7, { align: 'center' })
    doc.setTextColor(...dark)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(statVals[i], x + (colW - 3) / 2, y + 16, { align: 'center' })
  })

  y += 28

  // Sales table
  if (sales.length > 0) {
    doc.setTextColor(...dark)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Sales Transactions', 14, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Date & Time', 'Qty', 'Price/Egg', 'Total', 'Method', 'Note']],
      body: sales.map(s => [
        format(new Date(s.created_at), 'MMM d · h:mm a'),
        s.quantity,
        `GH₵ ${Number(s.price_per_egg).toFixed(2)}`,
        `GH₵ ${Number(s.total).toFixed(2)}`,
        s.payment_method === 'momo' ? 'MoMo' : 'Cash',
        s.note || '',
      ]),
      headStyles: { fillColor: amber, textColor: white, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: dark },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      columnStyles: { 3: { fontStyle: 'bold' } },
      margin: { left: 14, right: 14 },
    })

    y = doc.lastAutoTable.finalY + 10
  }

  // Outstanding credit table
  if (topCreditors.length > 0) {
    doc.setTextColor(...dark)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Outstanding Credit', 14, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Customer', 'Type', 'Balance']],
      body: topCreditors.map(c => [
        c.name,
        c.type === 'business' ? 'Business' : 'Individual',
        `GH₵ ${c.balance.toFixed(2)}`,
      ]),
      headStyles: { fillColor: [220, 38, 38], textColor: white, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: dark },
      alternateRowStyles: { fillColor: [254, 226, 226] },
      columnStyles: { 2: { fontStyle: 'bold', textColor: [220, 38, 38] } },
      margin: { left: 14, right: 14 },
    })
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...grey)
    doc.text(`Eggies · Page ${i} of ${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' })
  }

  const filename = `eggies-${period.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
  doc.save(filename)
}
