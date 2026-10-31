import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Receipt,
  ArrowUpRight
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { StudentFee, Payment } from '@/types';
import { dataService, subscribeToDataChanges } from '@/services/dataService';
import { formatCurrency } from '@/lib/utils';
import { RecordPaymentModal } from './RecordPaymentModal';
import { ReceiptModal } from './ReceiptModal';

export const FeesPage: React.FC = () => {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal states
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<StudentFee | null>(null);
  const [receiptModalData, setReceiptModalData] = useState<{ fee: StudentFee; payment: Payment } | null>(null);

  useEffect(() => {
    const update = () => {
      setFees(dataService.getStudentFees());
    };
    update();
    return subscribeToDataChanges(update);
  }, []);

  // Filter
  const filteredFees = fees.filter(f => {
    const matchesSearch =
      f.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.course_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || f.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalBilled = fees.reduce((sum, f) => sum + f.net_payable, 0);
  const totalCollected = fees.reduce((sum, f) => sum + f.paid_amount, 0);
  const totalOutstanding = fees.reduce((sum, f) => sum + f.balance_amount, 0);
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '85.4';

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Degree Course', 'Academic Year', 'Semester', 'Net Payable', 'Paid Amount', 'Outstanding Balance', 'Due Date', 'Status'];
    const rows = filteredFees.map(f => [
      f.student_code,
      `"${f.student_name}"`,
      `"${f.course_name}"`,
      f.academic_year,
      f.semester,
      f.net_payable,
      f.paid_amount,
      f.balance_amount,
      f.due_date,
      f.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aurelia_financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-3xl font-bold text-forest">Fees, Tuition & Payments</h2>
            <span className="text-xs bg-sand/60 text-[#785429] px-2.5 py-0.5 rounded-full font-semibold">
              {collectionRate}% Collection Rate
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Institutional fee structures, student ledger statements, installments, and receipts.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-forest hover:bg-black/5 transition-colors shadow-warm-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Financial Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="editorial-card p-4 bg-surface">
          <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Total Billed Net</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">
            {formatCurrency(totalBilled)}
          </div>
          <span className="text-[11px] text-ink-muted">Fall 2025 semester aggregate</span>
        </div>

        <div className="editorial-card p-4 bg-surface">
          <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Cleared Receipts</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-botanical-green mt-1">
            {formatCurrency(totalCollected)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-botanical-green font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>{collectionRate}% deposited</span>
          </div>
        </div>

        <div className="editorial-card p-4 bg-surface">
          <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Outstanding Arrears</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-botanical-terracotta mt-1">
            {formatCurrency(totalOutstanding)}
          </div>
          <span className="text-[11px] text-botanical-terracotta font-medium">Due Nov 02, 2025</span>
        </div>

        <div className="editorial-card p-4 bg-surface">
          <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Accounts in Good Standing</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">
            {fees.filter(f => f.status === 'Paid').length} / {fees.length}
          </div>
          <span className="text-[11px] text-botanical-green font-medium">Zero holds active</span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-border shadow-warm-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search scholar name, student ID, or degree program..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-1 focus:ring-forest outline-none"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="Paid">Fully Paid (Cleared)</option>
              <option value="Partial">Partial Installment</option>
              <option value="Pending">Pending Clearance</option>
              <option value="Overdue">Overdue Arrears</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <div className="editorial-card overflow-hidden bg-[#FBF9F4]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EE] border-b border-border text-[#72776F] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Scholar</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Course Program</th>
                <th className="py-3 px-4">Total Net</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-ink-muted">
                    No tuition fee accounts matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFees.map(fee => (
                  <tr key={fee.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-ink">{fee.student_name}</td>
                    <td className="py-3 px-4 font-mono text-ink-muted">{fee.student_code}</td>
                    <td className="py-3 px-4 text-forest">{fee.course_name}</td>
                    <td className="py-3 px-4 font-mono font-medium">{formatCurrency(fee.net_payable)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-botanical-green">{formatCurrency(fee.paid_amount)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-botanical-terracotta">
                      {formatCurrency(fee.balance_amount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-muted">{fee.due_date}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          fee.status === 'Paid'
                            ? 'sage'
                            : fee.status === 'Partial'
                            ? 'sand'
                            : 'terracotta'
                        }
                      >
                        {fee.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {fee.balance_amount > 0 ? (
                          <button
                            onClick={() => setSelectedFeeForPayment(fee)}
                            className="btn-forest px-3 py-1.5 rounded-lg text-xs font-semibold shadow-warm-sm flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Deposit</span>
                          </button>
                        ) : (
                          fee.payments.length > 0 && (
                            <button
                              onClick={() => setReceiptModalData({ fee, payment: fee.payments[0] })}
                              className="px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-porcelain text-forest text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!selectedFeeForPayment}
        onClose={() => setSelectedFeeForPayment(null)}
        feeAccount={selectedFeeForPayment}
        onSuccess={payment => {
          if (selectedFeeForPayment) {
            setReceiptModalData({ fee: selectedFeeForPayment, payment });
          }
        }}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!receiptModalData}
        onClose={() => setReceiptModalData(null)}
        feeAccount={receiptModalData?.fee || null}
        payment={receiptModalData?.payment || null}
      />
    </div>
  );
};

