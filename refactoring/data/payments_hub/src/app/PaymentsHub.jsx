"use client";

import { useState } from "react";
import { usePaymentsData } from "@/hooks/usePaymentsData";
import { usePaymentTotals } from "@/hooks/usePaymentTotals";
import { usePaymentMutations } from "@/hooks/usePaymentMutations";
import { useRecurringMutations } from "@/hooks/useRecurringMutations";
import { PaymentsHeader } from "./PaymentsHub/PaymentsHeader";
import { AlertBanner } from "./PaymentsHub/AlertBanner";
import { SummaryCards } from "./PaymentsHub/SummaryCards";
import { OverdueSection } from "./PaymentsHub/OverdueSection";
import { RecurringPaymentsSection } from "./PaymentsHub/RecurringPaymentsSection";
import { PaymentHistorySection } from "./PaymentsHub/PaymentHistorySection";
import { OneOffPaymentModal } from "./PaymentsHub/OneOffPaymentModal";
import { RecurringPaymentModal } from "./PaymentsHub/RecurringPaymentModal";
import { EditRecurringModal } from "./PaymentsHub/EditRecurringModal";
import { ExportModal } from "./PaymentsHub/ExportModal";

export default function PaymentsHub({
  instructors = [],
  currentUserId,
  isOwner,
}) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modals
  const [oneOffModalOpen, setOneOffModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [editRecurringModalOpen, setEditRecurringModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // One-off payment form
  const [oneOffForm, setOneOffForm] = useState({
    toUserId: "",
    amount: "",
    paymentType: "payroll",
    description: "",
  });

  // Recurring payment form
  const [recurringForm, setRecurringForm] = useState({
    toUserId: "",
    label: "",
    amount: "",
    frequency: "monthly",
    dayOfPeriod: "1",
    paymentType: "franchise_fee",
    notes: "",
  });

  // Edit recurring state
  const [editingRecurring, setEditingRecurring] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRecurringSection, setShowRecurringSection] = useState(true);

  // Fetch data
  const { payments, recurring, overduePayments, upcomingPayments, isLoading } =
    usePaymentsData(isOwner, statusFilter);

  // Computed totals
  const totals = usePaymentTotals(payments, currentUserId);

  // Helper functions
  function showSuccess(msg) {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 4000);
  }

  function resetOneOffForm() {
    setOneOffForm({
      toUserId: "",
      amount: "",
      paymentType: "payroll",
      description: "",
    });
  }

  function resetRecurringForm() {
    setRecurringForm({
      toUserId: "",
      label: "",
      amount: "",
      frequency: "monthly",
      dayOfPeriod: "1",
      paymentType: "franchise_fee",
      notes: "",
    });
  }

  function openEditRecurring(item) {
    setEditingRecurring({
      id: item.id,
      label: item.label,
      amount: String(item.amount),
      frequency: item.frequency,
      dayOfPeriod: String(item.day_of_period),
      isActive: item.is_active,
      notes: item.notes || "",
    });
    setEditRecurringModalOpen(true);
  }

  // Mutations
  const {
    createPaymentMutation,
    updatePaymentStatusMutation,
    deletePaymentMutation,
    sendRemindersMutation,
  } = usePaymentMutations({ showSuccess, setError });

  const {
    createRecurringMutation,
    updateRecurringMutation,
    deleteRecurringMutation,
  } = useRecurringMutations({ showSuccess, setError });

  // Handlers
  const handleCreatePayment = (e) => {
    e.preventDefault();
    createPaymentMutation.mutate(oneOffForm, {
      onSuccess: () => {
        setOneOffModalOpen(false);
        resetOneOffForm();
      },
    });
  };

  const handleCreateRecurring = (e) => {
    e.preventDefault();
    createRecurringMutation.mutate(recurringForm, {
      onSuccess: () => {
        setRecurringModalOpen(false);
        resetRecurringForm();
      },
    });
  };

  const handleUpdateRecurring = (e) => {
    e.preventDefault();
    updateRecurringMutation.mutate(
      {
        id: editingRecurring.id,
        data: {
          label: editingRecurring.label,
          amount: editingRecurring.amount,
          frequency: editingRecurring.frequency,
          dayOfPeriod: Number(editingRecurring.dayOfPeriod),
          isActive: editingRecurring.isActive,
          notes: editingRecurring.notes || null,
        },
      },
      {
        onSuccess: () => {
          setEditRecurringModalOpen(false);
          setEditingRecurring(null);
        },
      },
    );
  };

  // Pay Now handler for overdue/upcoming items
  function handlePayNow(item) {
    setOneOffForm({
      toUserId: String(item.toUserId),
      amount: String(item.amount),
      paymentType: item.paymentType,
      description: `${item.label} - ${item.frequency}`,
    });
    setOneOffModalOpen(true);
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <PaymentsHeader
        onMakePayment={() => {
          resetOneOffForm();
          setOneOffModalOpen(true);
        }}
        onSetupRecurring={() => {
          resetRecurringForm();
          setRecurringModalOpen(true);
        }}
        onSendReminders={() => sendRemindersMutation.mutate()}
        isSendingReminders={sendRemindersMutation.isPending}
        onExport={() => setExportModalOpen(true)}
      />

      <AlertBanner
        type="error"
        message={error}
        onClose={() => setError(null)}
      />
      <AlertBanner type="success" message={success} />

      <OverdueSection
        overduePayments={overduePayments}
        upcomingPayments={upcomingPayments}
        currentUserId={currentUserId}
        onPayNow={handlePayNow}
        onSendReminders={() => sendRemindersMutation.mutate()}
        isSendingReminders={sendRemindersMutation.isPending}
      />

      <SummaryCards totals={totals} isLoading={isLoading} />

      <RecurringPaymentsSection
        recurring={recurring}
        isLoading={isLoading}
        showSection={showRecurringSection}
        onToggleSection={() => setShowRecurringSection(!showRecurringSection)}
        currentUserId={currentUserId}
        onEdit={openEditRecurring}
        onDelete={(id) => deleteRecurringMutation.mutate(id)}
        isDeleting={deleteRecurringMutation.isPending}
      />

      <PaymentHistorySection
        payments={payments}
        isLoading={isLoading}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        currentUserId={currentUserId}
        onUpdateStatus={(data) => updatePaymentStatusMutation.mutate(data)}
        onDelete={(id) => deletePaymentMutation.mutate(id)}
        isUpdating={updatePaymentStatusMutation.isPending}
        isDeleting={deletePaymentMutation.isPending}
      />

      <OneOffPaymentModal
        open={oneOffModalOpen}
        onClose={() => setOneOffModalOpen(false)}
        instructors={instructors}
        currentUserId={currentUserId}
        formData={oneOffForm}
        onFormChange={(field, value) =>
          setOneOffForm({ ...oneOffForm, [field]: value })
        }
        onSubmit={handleCreatePayment}
        isSubmitting={createPaymentMutation.isPending}
      />

      <RecurringPaymentModal
        open={recurringModalOpen}
        onClose={() => setRecurringModalOpen(false)}
        instructors={instructors}
        currentUserId={currentUserId}
        formData={recurringForm}
        onFormChange={(field, value) =>
          setRecurringForm({ ...recurringForm, [field]: value })
        }
        onSubmit={handleCreateRecurring}
        isSubmitting={createRecurringMutation.isPending}
      />

      <EditRecurringModal
        open={editRecurringModalOpen}
        onClose={() => {
          setEditRecurringModalOpen(false);
          setEditingRecurring(null);
        }}
        formData={editingRecurring}
        onFormChange={(field, value) =>
          setEditingRecurring({ ...editingRecurring, [field]: value })
        }
        onSubmit={handleUpdateRecurring}
        isSubmitting={updateRecurringMutation.isPending}
      />

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        isOwner={isOwner}
      />
    </div>
  );
}
