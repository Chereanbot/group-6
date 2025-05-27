"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Clock, Printer, Download, FileText, CreditCard, Package, Info } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentDetail {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  transactionId: string;
  description: string;
  createdAt: string;
  paidAt: string | null;
  refundStatus?: string | null;
  refundAmount?: number | null;
  refundReason?: string | null;
  metadata?: any;
  serviceRequest?: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    status: string;
    package?: {
      name: string;
      serviceType: string;
      price: number;
      features: string[];
    } | null;
  } | null;
}

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paymentId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/payment/history/${paymentId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to fetch payment detail");
        setPayment(data.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [paymentId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                <CheckCircle2 className="w-4 h-4" />
              </motion.span>
              Completed
            </Badge>
          </motion.span>
        );
      case "FAILED":
        return (
          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
              <motion.span animate={{ rotate: [0, -20, 20, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                <XCircle className="w-4 h-4" />
              </motion.span>
              Failed
            </Badge>
          </motion.span>
        );
      case "PENDING":
        return (
          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                <Clock className="w-4 h-4" />
              </motion.span>
              Pending
            </Badge>
          </motion.span>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">{status}</Badge>;
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContents = receiptRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=700,width=900');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Payment Receipt</title>');
      printWindow.document.write('<style>body{font-family:sans-serif;padding:2rem;}@media print{.no-print{display:none;}}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleDownloadPDF = () => {
    // Placeholder for PDF download logic
    alert("PDF download coming soon!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading payment details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle className="w-8 h-8 mb-4 text-red-500" />
        <div className="text-lg font-medium text-red-600">{error}</div>
        <Button className="mt-6" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle className="w-8 h-8 mb-4 text-red-500" />
        <div className="text-lg font-medium text-red-600">Payment not found</div>
        <Button className="mt-6" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="flex flex-wrap gap-3 mb-6">
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint}>
            <motion.span initial={{ rotate: 0 }} whileHover={{ rotate: -10 }} transition={{ type: "spring", stiffness: 300 }}>
              <Printer className="w-4 h-4" />
            </motion.span>
            Print Receipt
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadPDF}>
            <motion.span initial={{ y: 0 }} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
              <Download className="w-4 h-4" />
            </motion.span>
            Download PDF
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" className="flex items-center gap-2" onClick={() => router.back()}>
            <motion.span initial={{ x: 0 }} whileHover={{ x: -4 }} transition={{ type: "spring", stiffness: 300 }}>
              <ArrowLeft className="w-4 h-4" />
            </motion.span>
            Back to History
          </Button>
        </motion.div>
      </div>
      <Card className="shadow-lg print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Payment Receipt
          </CardTitle>
          <CardDescription>Transaction ID: <span className="font-mono text-sm">{payment.transactionId || payment.id}</span></CardDescription>
        </CardHeader>
        <CardContent ref={receiptRef} className="space-y-8 print:space-y-4">
          {/* Payment Summary */}
          <section className="border-b pb-6 print:border-none">
            <div className="flex items-center gap-4 mb-2">
              <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                <CreditCard className="w-8 h-8 text-primary" />
              </motion.span>
              <div className="text-3xl font-bold text-primary">{payment.currency} {payment.amount.toLocaleString()}</div>
              {getStatusBadge(payment.status)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">Payment Method</div>
                <div className="font-medium">{payment.method}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">Date</div>
                <div className="font-medium">{format(new Date(payment.createdAt), "PPP p")}</div>
              </div>
              {payment.paidAt && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Paid At</div>
                  <div className="font-medium">{format(new Date(payment.paidAt), "PPP p")}</div>
                </div>
              )}
              {payment.refundStatus && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Refund Status</div>
                  <div className="font-medium">{payment.refundStatus}</div>
                </div>
              )}
              {payment.refundAmount && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Refund Amount</div>
                  <div className="font-medium">{payment.currency} {payment.refundAmount}</div>
                </div>
              )}
              {payment.refundReason && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Refund Reason</div>
                  <div className="font-medium">{payment.refundReason}</div>
                </div>
              )}
            </div>
            {payment.description && (
              <div className="mt-2">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Description</div>
                <div className="font-medium">{payment.description}</div>
              </div>
            )}
          </section>
          {/* Service Request Details */}
          {payment.serviceRequest && (
            <section className="border-b pb-6 print:border-none">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-blue-500" />
                <div className="text-lg font-semibold">Service Request</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Title</div>
                  <div className="font-medium">{payment.serviceRequest.title}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Status</div>
                  <div className="font-medium">{payment.serviceRequest.status}</div>
                </div>
                {payment.serviceRequest.description && (
                  <div className="md:col-span-2">
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Description</div>
                    <div className="font-medium">{payment.serviceRequest.description}</div>
                  </div>
                )}
                {payment.serviceRequest.requirements && payment.serviceRequest.requirements.length > 0 && (
                  <div className="md:col-span-2">
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Requirements</div>
                    <ul className="list-disc ml-6 text-sm text-gray-700 dark:text-gray-300">
                      {payment.serviceRequest.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
          {/* Package Details */}
          {payment.serviceRequest?.package && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-purple-500" />
                <div className="text-lg font-semibold">Service Package</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Name</div>
                  <div className="font-medium">{payment.serviceRequest.package.name}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Type</div>
                  <div className="font-medium">{payment.serviceRequest.package.serviceType}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Price</div>
                  <div className="font-medium">{payment.currency} {payment.serviceRequest.package.price}</div>
                </div>
                {payment.serviceRequest.package.features && payment.serviceRequest.package.features.length > 0 && (
                  <div className="md:col-span-2">
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Features</div>
                    <ul className="list-disc ml-6 text-sm text-gray-700 dark:text-gray-300">
                      {payment.serviceRequest.package.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 