import { Fragment, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useInvoiceStore } from "../store/useInvoiceStore";
import StatusBadge from "../components/StatusBadge";
import DeleteModal from "../components/DeleteModal";
import InvoiceForm from "../components/InvoiceForm";
import ActionMenu from "../components/ActionMenu";
import type { MenuItem } from "../components/ActionMenu";
import { formatDate, formatCurrency } from "../lib/utils";
import { downloadPdf, viewPdf, api } from "../lib/api";
import { useAsyncAction } from "../hooks/useAsyncAction";

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
  } = useInvoiceStore();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const invoice = invoices.find((inv) => inv.id === id);

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
      if (invoice) await api.post(`/invoices/${invoice.id}/send-email`);
    },
    { ...errorHandlers, context: "send email" },
  );
  const [handleMarkAsPaid] = useAsyncAction(
    async () => {
      if (invoice) await markAsPaid(invoice.id);
    },
    { ...errorHandlers, context: "mark as paid" },
  );

  // Fetch if not in store (e.g. direct navigation)
  useEffect(() => {
    if (!invoice && id) fetchInvoice(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading && !invoice) {
    return (
      <div className="mx-auto max-w-[730px] px-6 py-8 md:py-[72px]">
        <div className="h-[88px] animate-pulse rounded-md bg-card dark:bg-card-dark" />
        <div className="mt-6 h-[400px] animate-pulse rounded-md bg-card dark:bg-card-dark" />
      </div>
    );
  }

  if (!invoice) return null;

  async function handleDelete() {
    await deleteInvoice(invoice!.id);
    navigate("/");
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
        onClick={() => setIsEditOpen(true)}
        className="cursor-pointer rounded-full bg-surface px-6 py-4 text-sm font-bold text-label transition-colors hover:bg-border dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar"
      >
        Edit
      </button>
      <button
        onClick={() => setIsDeleteOpen(true)}
        className="cursor-pointer rounded-full bg-delete px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-delete-hover"
      >
        Delete
      </button>
      {invoice.status === "pending" && (
        <button
          onClick={handleMarkAsPaid}
          className="cursor-pointer rounded-full bg-purple px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-purple-light"
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

      {/* Action error */}
      {actionError && (
        <div className="mt-4 rounded-sm bg-delete/10 px-4 py-3 text-sm font-bold text-delete">
          {actionError}
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
          <div className="bg-surface p-8 dark:bg-input-dark">
            {/* Header */}
            <div className="grid grid-cols-[1fr_60px_100px_100px] gap-x-4">
              <span className="text-sm text-label">Item Name</span>
              <span className="text-right text-sm text-label">QTY.</span>
              <span className="text-right text-sm text-label">Price</span>
              <span className="text-right text-sm text-label">Total</span>
            </div>

            {/* Rows */}
            {invoice.items.map((item, i) => (
              <Fragment key={i}>
                <div className="mt-8 grid grid-cols-[1fr_60px_100px_100px] items-center gap-x-4">
                  <span className="text-sm font-bold text-ink dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-right text-sm font-bold text-label">
                    {item.quantity}
                  </span>
                  <span className="text-right text-sm font-bold text-label">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-right text-sm font-bold text-ink dark:text-white">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>

          {/* Totals footer */}
          <div className="bg-[#1E2139] px-8 py-6">
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

      <InvoiceForm
        mode="edit"
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        invoice={invoice}
      />
    </div>
  );
}
