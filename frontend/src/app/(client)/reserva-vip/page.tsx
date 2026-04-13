'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api-client';
import { cn } from '@/lib/utils';

// Horários disponíveis
const TIME_SLOTS = [
  '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00',
];

export default function ReservaVIPPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Gerar próximos 14 dias disponíveis
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1); // Começa de amanhã
    // Não incluir domingos (dia de descanso)
    if (date.getDay() === 0) return null;
    // Não incluir sábados
    if (date.getDay() === 6) return null;
    return date;
  }).filter(Boolean) as Date[];

  function formatDateInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function formatDateDisplay(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  async function handleSubmit() {
    if (!selectedDate || !selectedTime) {
      toast.error('Selecione data e horário');
      return;
    }

    setLoading(true);

    try {
      const dateTime = new Date(`${selectedDate}T${selectedTime}:00`);

      await api.post('/api/v1/reservations', {
        date: dateTime.toISOString(),
        notes: notes.trim() || undefined,
      });

      toast.success('Reserva VIP agendada com sucesso!');
      setStep(3); // Sucesso
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao agendar reserva';

      if (message.includes('autenticado') || message.includes('Token')) {
        toast.error('Faça login para agendar uma reserva');
        router.push('/login?redirect=/reserva-vip');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)] py-16 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-accent-400 mb-4">
            Experiência Exclusiva
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-800 dark:text-primary-600">
            Reserva VIP
          </h1>
          <p className="mt-4 text-[var(--text-secondary)] max-w-lg mx-auto">
            Agende um atendimento presencial exclusivo. Nossos artesãos ajudarão você
            a escolher materiais, forros e tamanhos perfeitos.
          </p>
        </motion.div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                s === step
                  ? 'bg-accent-400 text-white'
                  : s < step
                  ? 'bg-green-500 text-white'
                  : 'bg-[var(--border-color)] text-[var(--text-secondary)]'
              )}
            >
              {s < step ? '✓' : s}
            </div>
          ))}
        </div>

        {/* Step 1: Escolher Data */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-luxury p-6 lg:p-8"
          >
            <h2 className="text-xl font-serif font-semibold mb-6">Escolha a Data</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {availableDates.map((date) => (
                <button
                  key={formatDateInput(date)}
                  onClick={() => {
                    setSelectedDate(formatDateInput(date));
                    setStep(2);
                  }}
                  className={cn(
                    'p-4 text-left rounded-sm border transition-all hover:border-accent-400',
                    selectedDate === formatDateInput(date)
                      ? 'border-accent-400 bg-accent-400/10'
                      : 'border-[var(--border-color)]'
                  )}
                >
                  <p className="font-medium capitalize text-[var(--text-primary)]">
                    {formatDateDisplay(date)}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Escolher Horário e Detalhes */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-luxury p-6 lg:p-8 space-y-6"
          >
            <div>
              <h2 className="text-xl font-serif font-semibold mb-2">Escolha o Horário</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {formatDateDisplay(new Date(selectedDate + 'T00:00:00'))}
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      'p-3 text-center rounded-sm border transition-all text-sm',
                      selectedTime === time
                        ? 'border-accent-400 bg-accent-400 text-white'
                        : 'border-[var(--border-color)] hover:border-accent-400'
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Observações (opcional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-luxury resize-none"
                rows={3}
                placeholder="Ex: Gostaria de experimentar luvas de couro de veado..."
                maxLength={500}
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {notes.length}/500 caracteres
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedTime || loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Agendando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Sucesso */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-luxury p-8 text-center"
          >
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-2xl font-serif font-bold text-green-600 mb-4">
              Reserva Confirmada!
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              Sua Reserva VIP foi agendada. Você receberá uma confirmação por WhatsApp
              em breve.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="btn-primary w-full"
              >
                Voltar ao Início
              </button>
              <p className="text-xs text-[var(--text-secondary)]">
                Dúvidas? <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">Fale pelo WhatsApp</a>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
