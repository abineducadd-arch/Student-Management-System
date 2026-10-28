import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Payment, StudentFee } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { AureliaLogoIcon } from '@/components/ui/BotanicalDecorations';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeAccount: StudentFee | null;
  payment: Payment | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  feeAccount,
  payment,
}) => {
  if (!feeAccount || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Payment Receipt"
      subtitle={`Receipt Identifier: ${payment.receipt_number}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Printable Receipt Paper Sheet */}
        <div className="p-8 rounded-2xl bg-surface border-2 border-border shadow-warm-lg space-y-6 text-ink print:p-0 print:border-none print:shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-forest pb-4">
            <div className="flex items-center gap-3">
              <AureliaLogoIcon className="w-10 h-10 text-forest" />
              <div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-forest leading-none">
                  Aurelia Institute
                </h3>
                <p className="text-[10px] text-ink-muted mt-1 font-sans">
                  Office of the Bursar & Financial Management
                </p>
                <p className="text-[10px] text-ink-muted">400 Chancellor Walk, Cambridge, MA 02138</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted block">Transaction Receipt</span>
              <span className="font-mono text-base font-bold text-forest">{payment.receipt_number}</span>
              <span className="text-[10px] text-ink-muted block mt-0.5">{payment.payment_date}</span>
            </div>
          </div>

          {/* Student metadata */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-porcelain/60 border border-border text-xs">
            <div>
              <span className="text-[10px] text-ink-muted uppercase font-bold block">Received From Scholar</span>
              <span className="font-bold text-forest text-sm">{feeAccount.student_name}</span>
              <span className="text-[10px] font-mono text-ink-muted block">ID: {feeAccount.student_code}</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-muted uppercase font-bold block">Academic Billing Program</span>
              <span className="font-medium text-ink">{feeAccount.course_name}</span>
              <span className="text-[10px] text-ink-muted block">Academic Year {feeAccount.academic_year} • Semester {feeAccount.semester}</span>
            </div>
          </div>

          {/* Payment Detail Box */}
          <div className="p-4 rounded-xl bg-porcelain border border-border space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-ink-muted">Payment Category:</span>
              <span className="font-semibold text-forest">Tuition & Campus Services Surcharge</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-ink-muted">Settlement Method:</span>
              <span className="font-semibold text-forest">{payment.payment_method}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-ink-muted">Transaction Reference:</span>
              <span className="font-mono text-ink">{payment.notes || 'Direct Clearance'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-ink-muted">Remaining Balance After Settlement:</span>
              <span className="font-mono font-bold text-botanical-terracotta">{formatCurrency(feeAccount.balance_amount)}</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-bold">
              <span className="text-forest">Amount Paid:</span>
              <span className="font-serif text-2xl text-botanical-green">{formatCurrency(payment.amount)}</span>
            </div>
          </div>

          {/* Cashier endorsement */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border text-xs">
            <div className="flex items-center gap-2 text-botanical-green">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight">Payment verified and posted to general institutional ledger.</span>
            </div>
            <div className="text-center">
              <div className="w-28 border-b border-ink-muted/60 mx-auto mb-1 h-5" />
              <span className="text-[10px] font-semibold text-forest block">Authorized Bursar Cashier</span>
              <span className="text-[9px] text-ink-muted">{payment.recorded_by}</span>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-ink hover:bg-black/5 transition-colors border border-border"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="btn-forest px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-warm-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
