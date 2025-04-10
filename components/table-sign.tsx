'use client'

import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

interface TableSignProps {
  establishmentName: string
  tableNumber: number
  qrCodeUrl: string
  logoUrl?: string
  className?: string
}

export function TableSign({
  establishmentName,
  tableNumber,
  qrCodeUrl,
  logoUrl,
  className,
}: TableSignProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[300px] bg-white rounded-2xl shadow-lg p-6 space-y-6 mx-auto',
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-white">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${establishmentName} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Logo</span>
            </div>
          )}
        </div>
      </div>

      {/* Establishment Name */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{establishmentName}</h2>
        <p className="text-sm text-gray-500 mt-1">Mesa {tableNumber}</p>
      </div>

      {/* QR Code Section */}
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <QRCodeSVG
            value={qrCodeUrl}
            size={160}
            level="H"
            includeMargin
            className="rounded-lg"
          />
        </div>
      </div>

      {/* MenuMaster Info */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Escaneie o QR Code para acessar nosso cardápio digital
        </p>
        <p className="text-xs text-gray-500">
          Faça seu pedido diretamente pelo celular
        </p>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          Powered by MenuMaster
        </p>
      </div>
    </div>
  )
} 