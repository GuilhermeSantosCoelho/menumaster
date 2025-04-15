'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TableSign } from '@/components/table-sign';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Table {
  id: string;
  number: number;
  establishment_id: string;
}

interface Establishment {
  id: string;
  name: string;
  logo_url?: string;
}

export default function TableSignsPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [establishment, setEstablishment] = useState<{
    id: string;
    name: string;
    logo?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch establishment
        const { data: establishment, error: establishmentError } = await supabase
          .from('establishments')
          .select('id, name, logo')
          .eq('owner_id', user.id)
          .single();

        console.log('establishmentData', establishment);

        if (establishmentError) throw establishmentError;
        setEstablishment(establishment);

        // Fetch tables
        const { data: tablesData, error: tablesError } = await supabase
          .from('tables')
          .select('*')
          .eq('establishment_id', establishment.id);

        if (tablesError) throw tablesError;
        setTables(tablesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Estabelecimento não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Plaquinhas das Mesas</h1>
        <Button onClick={handlePrint}>Imprimir</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tables.map((table) => (
          <div key={table.id} className="print:break-inside-avoid">
            <TableSign
              establishmentName={establishment.name}
              tableNumber={table.number}
              qrCodeUrl={`${window.location.origin}/cliente/${table.id}/session`}
              logoUrl={establishment.logo}
            />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\:break-inside-avoid,
          .print\:break-inside-avoid * {
            visibility: visible;
          }
          .print\:break-inside-avoid {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
