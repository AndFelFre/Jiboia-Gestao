import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Interface para colunas do PDF (jsPDF Autotable)
 */
export interface PDFColumn {
    header: string
    dataKey: string
}

/**
 * Exporta dados para PDF com cabeçalho institucional
 */
export function exportToPDF(
    filename: string,
    title: string,
    columns: PDFColumn[],
    data: any[]
) {
    const doc = new jsPDF() as any
    const date = new Date().toLocaleDateString('pt-BR')

    // Cabeçalho Institucional
    doc.setFontSize(18)
    doc.setTextColor(40)
    doc.text('RG DIGITAL - GENTE & GESTÃO', 14, 22)

    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(title, 14, 30)
    doc.text(`Data de Emissão: ${date}`, 14, 37)

    // Linha divisória
    doc.setLineWidth(0.5)
    doc.line(14, 40, 196, 40)

    // Tabela de Dados
    doc.autoTable({
        startY: 45,
        columns: columns,
        body: data,
        theme: 'striped',
        headStyles: {
            fillColor: [63, 81, 181], // Cor primária (indigo)
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 45 },
    })

    // Rodapé
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
            `Página ${i} de ${pageCount} | Documento Identificado e Auditado`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        )
    }

    doc.save(`${filename}.pdf`)
}

/**
 * Exporta dados para Excel (XLSX)
 */
export function exportToXLSX(filename: string, data: any[]) {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Dados')
    XLSX.writeFile(wb, `${filename}.xlsx`)
}
