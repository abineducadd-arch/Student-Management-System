import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { StudentFee, Payment } from '@/types';
import { dataService } from '@/services/dataService';
import { formatCurrency } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeAccount: StudentFee | null;
  onSuccess?: (payment: Payment) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  feeAccount,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<'Cash' | 'Card' | 'Bank Transfer' | 'Online Gateway'>('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && feeAccount) {
      setAmount(feeAccount.balance_amount);
      setMethod('Bank Transfer');
      setNotes('Fall 2025 term installment payment');
      setDate(new Date().toISOString().split('T')[0]);
      setError(null);
    }
  }, [isOpen, feeAccount]);

  if (!feeAccount) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    if (amount > feeAccount.balance_amount) {
      setError(`Payment amount cannot exceed outstanding balance of ${formatCurrency(feeAccount.balance_amount)}.`);
      return;
    }

    const payment = dataService.recordPayment(feeAccount.id, {
      student_fee_id: feeAccount.id,
      amount,
      payment_date: date,
      payment_method: method,
      notes,
      recorded_by: 'Bursar & Accounts Office',
    });

    if (payment) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4F7757', '#263329', '#E9D3B5'],
      });
      onSuccess?.(payment);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Tuition Fee Settlement"
      subtitle={`Scholar: ${feeAccount.student_name} (${feeAccount.student_code}) • Course: ${feeAccount.course_name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account balance overview */}
        <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-porcelain/60 border border-border text-xs">
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold block">Net Payable</span>
            <span className="font-serif text-lg font-bold text-forest">{formatCurrency(feeAccount.net_payable)}</span>
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold block">Paid To Date</span>
            <span className="font-serif text-lg font-bold text-botanical-green">{formatCurrency(feeAccount.paid_amount)}</span>
          </div>
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold block">Remaining Due</span>
            <span className="font-serif text-lg font-bold text-botanical-terracotta">{formatCurrency(feeAccount.balance_amount)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
            Deposit Amount ($) <span className="text-botanical-terracotta">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={feeAccount.balance_amount}
            value={amount}
            onChange={e => {
              setAmount(Number(e.target.value));
              setError(null);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm font-mono font-bold text-forest focus:ring-1 focus:ring-forest outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            >
              <option value="Bank Transfer">Bank Wire Transfer</option>
              <option value="Online Gateway">Online Gateway</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Cash">Cash Deposit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
            Accounting Notes / Reference Number
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Bank transfer ref #TX9910482"
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
          />
        </div>

        {error && (
          <p className="text-xs text-botanical-terracotta font-medium bg-[#FCECE9] p-2.5 rounded-lg border border-[#F2C7C1]">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-ink hover:bg-black/5 transition-colors border border-border"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-forest px-6 py-2 rounded-xl text-sm font-medium shadow-warm-sm"
          >
            Confirm & Issue Receipt
          </button>
        </div>
      </form>
    </Modal>
  );
};
