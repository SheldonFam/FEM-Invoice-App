import { lazy, Suspense, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useInvoiceStore } from "../store/useInvoiceStore";
import { useShallow } from "zustand/react/shallow";
import StatusBadge from "../components/StatusBadge";
import DeleteModal from "../components/DeleteModal";
const InvoiceForm = lazy(() => import("../components/InvoiceForm"));
import ActionMenu from "../components/ActionMenu";
import type { MenuItem } from "../components/ActionMenu";
import { formatDate, formatCurrency } from "../lib/utils";
import { downloadPdf, viewPdf } from "../lib/api";
import { btnCx, getErrorMessage } from "../lib/ui";
import { useAsyncAction } from "../hooks/useAsyncAction";
import ErrorBanner from "../components/ErrorBanner";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    invoices,
    isLoading,
    fetchInvoice,
    deleteInvoice,
    markAsPaid,
    duplicateInvoice,
    sendEmail,
  } = useInvoiceStore(
    useShallow((s) => ({
      invoices: s.invoices,
      isLoading: s.isLoading,
      fetchInvoice: s.fetchInvoice,
      deleteInvoice: s.deleteInvoice,
      markAsPaid: s.markAsPaid,
      duplicateInvoice: s.duplicateInvoice,
      sendEmail: s.sendEmail,
    })),
  );

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const invoice = invoices.find((inv) => inv.id === id);
  useDocumentTitle(invoice ? `Invoice #${invoice.id}` : 'Invoice');

  const errorHandlers = {
    onStart: () => setActionError(null),
    onError: (err: Error) => setActionError(err.message),
  };

  const [handleViewPdf, isViewingPdf] = useAsyncAction(
    async () => {
      if (invoice) await viewPdf(invoice.id);
    },
    { ...errorHandlers, context: "open PDF" },
  );
  const [handleDownloadPdf, isPdfLoading] = useAsyncAction(
    async () => {
      if (invoice) await downloadPdf(invoice.id);
    },
    { ...errorHandlers, context: "download PDF" },
  );
  const [handleDuplicate, isDuplicating] = useAsyncAction(
    async () => {
      if (!invoice) return;
      const inv = await duplicateInvoice(invoice.id);
      navigate(`/${inv.id}`);
    },
    { ...errorHandlers, context: "duplicate invoice" },
  );
  const [handleSendEmail, isSendingEmail] = useAsyncAction(
    async () => {
      if (invoice) await sendEmail(invoice.id);
    },
    { ...errorHandlers, context: "send email" },
  );
  const [handleMarkAsPaid] = useAsyncAction(
    async () => {
      if (invoice) await markAsPaid(invoice.id);
    },
    { ...errorHandlers, context: "mark as paid" },
  );

  useEffect(() => {
    if (!invoice && id) {
      fetchInvoice(id).catch(err => setFetchError(getErrorMessage(err, 'Failed to load invoice')))
    }
  }, [id, invoice, fetchInvoice]);

  if (isLoading && !invoice) {
    return (
      <div className="mx-auto max-w-[730px] px-6 py-8 md:py-[72px]">
        <div className="h-[88px] animate-pulse rounded-md bg-card dark:bg-card-dark" />
        <div className="mt-6 h-[400px] animate-pulse rounded-md bg-card dark:bg-card-dark" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="mx-auto max-w-[730px] px-6 py-8 md:py-[72px]">
        <Link
          to="/"
          className="inline-flex items-center gap-6 text-sm font-bold text-ink transition-colors hover:text-muted dark:text-white dark:hover:text-muted"
        >
          <img src="/assets/icon-arrow-left.svg" alt="" width={7} height={10} />
          Go back
        </Link>
        {fetchError ? (
          <div className="mt-8">
            <ErrorBanner message={fetchError} />
          </div>
        ) : (
          <p className="mt-8 text-center text-muted">Invoice not found.</p>
        )}
      </div>
    );
  }

  async function handleDelete() {
    if (!invoice) return;
    try {
      await deleteInvoice(invoice.id);
      navigate("/");
    } catch (err) {
      setIsDeleteOpen(false);
      setActionError(getErrorMessage(err, "Failed to delete invoice"));
    }
  }

  const moreMenuItems: MenuItem[] = [
    {
      label: "View PDF",
      onClick: handleViewPdf,
      disabled: isViewingPdf,
      loadingLabel: "Loading…",
    },
    {
      label: "Download PDF",
      onClick: handleDownloadPdf,
      disabled: isPdfLoading,
      loadingLabel: "Downloading…",
    },
    {
      label: "Duplicate",
      onClick: handleDuplicate,
      disabled: isDuplicating,
      loadingLabel: "Duplicating…",
    },
    ...(invoice.status === "pending"
      ? [
          {
            label: "Send Email",
            onClick: handleSendEmail,
            disabled: isSendingEmail,
            loadingLabel: "Sending…",
          },
        ]
      : []),
  ];

  const actionButtons = (
    <>
      <button
        type="button"
        onClick={() => setIsEditOpen(true)}
        className={btnCx.secondary}
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => setIsDeleteOpen(true)}
        className={btnCx.destructive}
      >
        Delete
      </button>
      {invoice.status === "pending" && (
        <button
          type="button"
          onClick={handleMarkAsPaid}
          className={btnCx.primary}
        >
          Mark as Paid
        </button>
      )}
      <ActionMenu items={moreMenuItems} />
    </>
  );

  return (
    <div className="mx-auto max-w-[730px] px-6 py-8 pb-28 md:py-[72px] md:pb-[72px]">
      {/* Go back */}
      <Link
        to="/"
        className="inline-flex items-center gap-6 text-sm font-bold text-ink transition-colors hover:text-muted dark:text-white dark:hover:text-muted"
      >
        <img src="/assets/icon-arrow-left.svg" alt="" width={7} height={10} />
        Go back
      </Link>

      <h1 className="sr-only">Invoice #{invoice.id}</h1>

      {/* Action error */}
      {actionError && (
        <div className="mt-4">
          <ErrorBanner message={actionError} />
        </div>
      )}

      {/* Action bar */}
      <div className="mt-8 flex items-center justify-between rounded-md bg-card px-8 py-5 shadow-sm dark:bg-card-dark">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">Status</span>
          <StatusBadge status={invoice.status} />
        </div>
        {/* Desktop action buttons */}
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {actionButtons}
        </div>
      </div>

      {/* Detail card */}
      <div className="mt-6 rounded-md bg-card p-12 shadow-sm dark:bg-card-dark">
        {/* Top: ID/description + sender address */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-ink dark:text-white">
              <span className="text-label">#</span>
              {invoice.id}
            </p>
            <p className="mt-2 text-sm text-label">{invoice.description}</p>
          </div>
          <address className="text-right text-sm not-italic leading-loose text-label">
            <p>{invoice.senderAddress.street}</p>
            <p>{invoice.senderAddress.city}</p>
            <p>{invoice.senderAddress.postCode}</p>
            <p>{invoice.senderAddress.country}</p>
          </address>
        </div>

        {/* Middle: dates / bill to / sent to */}
        <div className="mt-10 flex justify-between gap-4">
          {/* Dates */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-sm text-label">Invoice Date</p>
              <p className="mt-3 font-bold text-ink dark:text-white">
                {formatDate(invoice.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-label">Payment Due</p>
              <p className="mt-3 font-bold text-ink dark:text-white">
                {formatDate(invoice.paymentDue)}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div>
            <p className="text-sm text-label">Bill To</p>
            <p className="mt-3 font-bold text-ink dark:text-white">
              {invoice.clientName}
            </p>
            <address className="mt-2 text-sm not-italic leading-loose text-label">
              <p>{invoice.clientAddress.street}</p>
              <p>{invoice.clientAddress.city}</p>
              <p>{invoice.clientAddress.postCode}</p>
              <p>{invoice.clientAddress.country}</p>
            </address>
          </div>

          {/* Sent To */}
          <div>
            <p className="text-sm text-label">Sent to</p>
            <p className="mt-3 font-bold text-ink dark:text-white">
              {invoice.clientEmail || "—"}
            </p>
          </div>
        </div>

        {/* Item table */}
        <div className="mt-10 overflow-hidden rounded-lg">
          <table className="w-full bg-surface dark:bg-input-dark">
            <thead>
              <tr>
                <th className="px-8 pt-8 pb-4 text-left text-sm font-normal text-label">Item Name</th>
                <th className="pt-8 pb-4 text-right text-sm font-normal text-label w-[60px]">QTY.</th>
                <th className="pt-8 pb-4 text-right text-sm font-normal text-label w-[100px]">Price</th>
                <th className="px-8 pt-8 pb-4 text-right text-sm font-normal text-label w-[100px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-8 py-4 text-sm font-bold text-ink dark:text-white">
                    {item.name}
                  </td>
                  <td className="py-4 text-right text-sm font-bold text-label">
                    {item.quantity}
                  </td>
                  <td className="py-4 text-right text-sm font-bold text-label">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-8 py-4 text-right text-sm font-bold text-ink dark:text-white">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals footer */}
          <div className="bg-sidebar px-8 py-6">
            {invoice.taxRate > 0 && (
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-fog">Subtotal</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
            )}
            {invoice.taxRate > 0 && (
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-fog">
                  Tax ({invoice.taxRate}%)
                </span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(invoice.taxAmount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-fog">Amount Due</span>
              <span className="text-xl font-bold text-white">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile action footer */}
      <div className="fixed bottom-0 left-0 right-0 flex flex-wrap items-center justify-end gap-2 bg-card px-6 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] dark:bg-card-dark md:hidden">
        {actionButtons}
      </div>

      {/* Delete modal */}
      {isDeleteOpen && (
        <DeleteModal
          invoiceId={invoice.id}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}

      {isEditOpen && (
        <Suspense fallback={null}>
          <InvoiceForm
            mode="edit"
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            invoice={invoice}
          />
        </Suspense>
      )}
    </div>
  );
}
