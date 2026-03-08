'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintButton() {
    return (
        <Button
            onClick={() => window.print()}
            className="bg-primary text-white rounded-2xl h-11 px-8 font-bold flex items-center gap-2 hover:scale-105 transition-transform"
        >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
        </Button>
    )
}
